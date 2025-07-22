type TextareaKeyboardEventListeners = Partial<{
  [K in keyof HTMLElementEventMap]: (event: HTMLElementEventMap[K]) => any;
}>;

/*********************************************
 * Controller for a MathQuill instance
 ********************************************/

type HandlerWithDirectionFunction = NonNullable<
  HandlerOptions[HandlersWithDirection]
>;
type HandlerWithoutDirectionFunction = NonNullable<
  HandlerOptions[HandlersWithoutDirection]
>;

class ControllerBase {
  id: number;
  data: ControllerData;
  readonly root: ControllerRoot;
  readonly container: HTMLElement;
  options: CursorOptions;
  aria: Aria;
  ariaLabel: string;
  ariaPostLabel: string;
  language: string; // Store this controller's language
  private explicitLanguage: boolean; // Track if language was explicitly set
  private localization: MathQuillLocalization; // This controller's localization instance
  readonly cursor: Cursor;
  editable: boolean | undefined;
  _ariaAlertTimeout: TimeoutId;
  KIND_OF_MQ: KIND_OF_MQ;
  isMouseSelecting: boolean = false;

  textarea: HTMLElement | undefined;
  private textareaEventListeners: Partial<{
    [K in keyof HTMLElementEventMap]: (event: HTMLElementEventMap[K]) => any;
  }> = {};

  textareaSpan: HTMLElement | undefined;
  mathspeakSpan: HTMLElement | undefined;
  mathspeakId: string | undefined;
  unregisterLanguageChange: (() => void) | undefined;

  constructor(
    root: ControllerRoot,
    container: HTMLElement,
    options: CursorOptions
  ) {
    this.id = root.id;
    this.data = {};

    this.root = root;
    this.container = container;
    this.options = options;

    this.aria = new Aria(this.getControllerSelf());
    // Initialize language from options, defaulting to global language
    // Start with explicitLanguage = false, will be set to true if language is explicitly configured
    this.explicitLanguage = false;
    this.language = options.language || getCurrentGlobalLanguage();
    // Create this controller's localization instance
    this.localization = new MathQuillLocalization(this.language);
    // Set the initial ARIA label based on this controller's language using Fluent
    // We'll set this after the method is defined, for now use a placeholder
    this.ariaLabel = '';
    this.ariaPostLabel = '';

    root.controller = this.getControllerSelf();

    this.cursor = root.cursor = new Cursor(
      root,
      options,
      this.getControllerSelf()
    );
    // TODO: stop depending on root.cursor, and rm it

    // Register for language change notifications to update mathspeak and aria label
    this.unregisterLanguageChange = onGlobalLanguageChange(() => {
      // Only update language for controllers that don't have an explicit language set
      if (!this.explicitLanguage) {
        // Update this controller's language to match the new global language
        this.language = getCurrentGlobalLanguage();
        // Update this controller's localization instance
        this.localization = new MathQuillLocalization(this.language);

        // Update the default aria label if it hasn't been customized
        if (
          this.ariaLabel ===
            this.localization.formatMessage('default-aria-label') ||
          this.ariaLabel === 'Math Input' ||
          this.ariaLabel === 'Entrada Matemática'
        ) {
          this.ariaLabel =
            this.localization.formatMessage('default-aria-label');
        }
        this.updateMathspeak();
      }
    });

    // Now that all methods are defined, set the initial ARIA label using Fluent
    this.ariaLabel = this.getDefaultAriaLabel();
  }

  getControllerSelf() {
    // dance we have to do to tell this thing it's a full controller
    return this as any as Controller;
  }

  updateAriaLabel() {
    // Update this controller's language to match the current global language
    this.language = getCurrentGlobalLanguage();
    // Update this controller's localization instance
    this.localization = new MathQuillLocalization(this.language);
    // Update ARIA label if it's still the default (hasn't been customized)
    const newDefaultLabel = this.getDefaultAriaLabel();
    if (
      this.ariaLabel === 'Math Input' ||
      this.ariaLabel === 'Entrada Matemática'
    ) {
      this.ariaLabel = newDefaultLabel;
    }
  }

  // Helper method to get the default ARIA label for this controller's language
  private getDefaultAriaLabel(): string {
    return this.localization.formatMessage('default-aria-label');
  }

  // Public method to get a localization instance for this controller's language
  // This can be used by math elements for mathspeak generation
  getLocalizationForController() {
    return this.localization;
  }

  // Method to update the controller's language (called when explicitly set)
  setLanguage(language: string) {
    this.language = language;
    this.localization = new MathQuillLocalization(language);
    this.explicitLanguage = true;
    // Update mathspeak templates with new language
    this.updateMathspeak();
  }

  handle(name: HandlersWithDirection, dir: Direction): void;
  handle(name: HandlersWithoutDirection): void;
  handle(
    name: HandlersWithDirection | HandlersWithoutDirection,
    dir?: Direction
  ) {
    var handlers = this.options.handlers;
    const handler = this.options.handlers?.fns[name];
    if (handler) {
      const APIClass = handlers?.APIClasses[this.KIND_OF_MQ];
      pray('APIClass is defined', APIClass);
      var mq = new APIClass(this as any); // cast to any bedcause APIClass needs the final Controller subclass.
      if (dir === L || dir === R)
        (handler as HandlerWithDirectionFunction)(dir, mq);
      else (handler as HandlerWithoutDirectionFunction)(mq);
    }
  }

  static notifyees: ((cursor: Cursor, e: ControllerEvent) => void)[] = [];
  static onNotify(f: (cursor: Cursor, e: ControllerEvent) => void) {
    ControllerBase.notifyees.push(f);
  }
  notify(e: ControllerEvent) {
    for (var i = 0; i < ControllerBase.notifyees.length; i += 1) {
      ControllerBase.notifyees[i](this.cursor, e);
    }
    return this;
  }
  setAriaLabel(ariaLabel: string) {
    const oldAriaLabel = this.getAriaLabel();
    if (!ariaLabel && this.editable) {
      this.ariaLabel = this.getDefaultAriaLabel();
    } else {
      this.ariaLabel = ariaLabel;
    }
    // If this field doesn't have focus, update its computed mathspeak value.
    // We check for focus because updating the aria-label attribute of a focused element will cause most screen readers to announce the new value (in our case, label along with the expression's mathspeak).
    // If the field does have focus at the time, it will be updated once a blur event occurs.
    // Unless we stop using fake text inputs and emulating screen reader behavior, this is going to remain a problem.
    if (ariaLabel !== oldAriaLabel && !this.containerHasFocus()) {
      this.updateMathspeak();
    }
    return this;
  }
  getAriaLabel() {
    const defaultLabel = this.getDefaultAriaLabel();

    // Check if it's a custom label (not one of the default labels in any language)
    if (
      this.ariaLabel !== defaultLabel &&
      this.ariaLabel !== 'Math Input' &&
      this.ariaLabel !== 'Entrada Matemática'
    ) {
      return this.ariaLabel;
    } else if (this.editable) {
      return defaultLabel;
    } else {
      return '';
    }
  }
  setAriaPostLabel(ariaPostLabel: string, timeout?: number) {
    if (
      ariaPostLabel &&
      typeof ariaPostLabel === 'string' &&
      ariaPostLabel !== ''
    ) {
      if (ariaPostLabel !== this.ariaPostLabel && typeof timeout === 'number') {
        if (this._ariaAlertTimeout) clearTimeout(this._ariaAlertTimeout);
        this._ariaAlertTimeout = setTimeout(() => {
          if (this.containerHasFocus()) {
            // Voice the new label, but do not update content mathspeak to prevent double-speech.
            this.aria.alert(
              this.root.mathspeak().trim() + ' ' + ariaPostLabel.trim()
            );
          } else {
            // This mathquill does not have focus, so update its mathspeak.
            this.updateMathspeak();
          }
        }, timeout);
      }
      this.ariaPostLabel = ariaPostLabel;
    } else {
      if (this._ariaAlertTimeout) clearTimeout(this._ariaAlertTimeout);
      this.ariaPostLabel = '';
    }
    return this;
  }
  getAriaPostLabel() {
    return this.ariaPostLabel || '';
  }
  containerHasFocus() {
    return (
      document.activeElement && this.container.contains(document.activeElement)
    );
  }

  getTextarea() {
    const textarea = this.textarea;
    pray('textarea initialized', textarea);
    return textarea;
  }

  getTextareaSpan() {
    const textareaSpan = this.textareaSpan;
    pray('textareaSpan initialized', textareaSpan);
    return textareaSpan;
  }

  /** Add the given event listeners on this.textarea, replacing the existing listener for that event if it exists. */
  addTextareaEventListeners(listeners: TextareaKeyboardEventListeners) {
    if (!this.textarea) return;
    for (const key in listeners) {
      const event = key as keyof typeof listeners;
      this.removeTextareaEventListener(event);
      this.textarea.addEventListener(event, listeners[event] as EventListener);
    }
  }

  protected removeTextareaEventListener(event: keyof HTMLElementEventMap) {
    if (!this.textarea) return;
    const listener = this.textareaEventListeners[event];
    if (!listener) return;
    this.textarea.removeEventListener(event, listener as EventListener);
  }

  // based on http://www.gh-mathspeak.com/examples/quick-tutorial/
  // and http://www.gh-mathspeak.com/examples/grammar-rules/
  exportMathSpeak() {
    return this.root.mathspeak().trim();
  }

  // overridden
  updateMathspeak(_opts?: { emptyContent: boolean }) {
    // Most templates are now dynamic and will update automatically when mathspeak() is called
    // Only update the remaining static templates here
    this.root.postOrder((node: MQNode) => {
      const localization = this.localization;
      if (node.ariaLabel === 'binomial') {
        node.mathspeakTemplate = [
          localization.formatMessage('start-binomial') + ',',
          ' ' + localization.formatMessage('choose') + ' ',
          ', ' + localization.formatMessage('end-binomial')
        ];
      } else if ('isTextBlock' in node && node.isTextBlock?.()) {
        node.mathspeakTemplate = localization.createMathspeakTemplate(
          'start-text',
          'end-text'
        );
      } else if ('isStyleBlock' in node && node.isStyleBlock?.()) {
        if (node.ariaLabel) {
          node.mathspeakTemplate = [
            localization.formatStartBlock(node.ariaLabel) + ',',
            ', ' + localization.formatEndBlock(node.ariaLabel)
          ];
        }
      }
    });
  }
  scrollHoriz() {}
  selectionChanged() {}
  setOverflowClasses() {}
}

/**
 * Helper function for math elements to get their controller's localization
 *
 * This function traverses up the MQ node tree to find a controller with localization,
 * providing a fallback to global localization if no controller is found.
 *
 * @param node - The MQNode to start the search from
 * @returns A MathQuillLocalization instance for the found controller or global fallback
 */
function getControllerLocalization(node: MQNode) {
  // Walk up the tree to find the controller
  let current: MQNode | undefined = node;
  while (current && !('controller' in current)) {
    current = current.parent;
  }

  // Try to get controller's localization using safe property access
  if (
    current &&
    'controller' in current &&
    current.controller &&
    typeof current.controller === 'object' &&
    'getLocalizationForController' in current.controller &&
    typeof current.controller.getLocalizationForController === 'function'
  ) {
    return current.controller.getLocalizationForController();
  }

  // Fallback: create a localization instance with the current global language
  // This can happen in tests or when math elements are created in isolation
  // Always create a new instance to ensure we get the latest global language
  return new MathQuillLocalization(getCurrentGlobalLanguage());
}
