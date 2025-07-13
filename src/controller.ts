type TextareaKeyboardEventListeners = Partial<{
  [K in keyof HTMLElementEventMap]: (event: HTMLElementEventMap[K]) => any;
}>;

// Note: getLocalization function is available globally from services/localization.ts

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
    // Initialize language from options, defaulting to 'en'
    // Start with explicitLanguage = false, will be set to true if language is explicitly configured
    this.explicitLanguage = false;
    this.language = options.language || 'en';
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
    this.unregisterLanguageChange = getLocalization().onLanguageChange(() => {
      // Only update language for controllers that don't have an explicit language set
      if (!this.explicitLanguage) {
        // Update this controller's language to match the new global language
        this.language = getLocalization().getCurrentLanguage();

        // Update the default aria label if it hasn't been customized
        const currentLocalization = getLocalization();
        if (
          this.ariaLabel ===
            currentLocalization.formatMessage('default-aria-label') ||
          this.ariaLabel === 'Math Input' ||
          this.ariaLabel === 'Entrada Matemática'
        ) {
          this.ariaLabel =
            currentLocalization.formatMessage('default-aria-label');
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
    this.language = getLocalization().getCurrentLanguage();
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
    // Create a temporary localization instance for this controller's language
    // We need to import the MathQuillLocalization class to instantiate it
    const tempLocalization = new (getLocalization().constructor as any)(
      this.language
    );
    return tempLocalization.formatMessage('default-aria-label');
  }

  // Public method to get a localization instance for this controller's language
  // This can be used by math elements for mathspeak generation
  getLocalizationForController() {
    const globalLocalization = getLocalization();

    // For controllers with explicit languages, create isolated localization instances
    if (this.explicitLanguage) {
      return new (globalLocalization.constructor as any)(this.language);
    }

    // For controllers without explicit languages, just use the global localization
    // This ensures they follow global language changes automatically
    return globalLocalization;
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
  updateMathspeak(_opts?: { emptyContent: boolean }) {}
  scrollHoriz() {}
  selectionChanged() {}
  setOverflowClasses() {}
}

// Helper function for math elements to get their controller's localization
// instead of the global localization
function getControllerLocalization(node: any) {
  // Walk up the tree to find the controller
  let current = node;
  while (current && !current.controller) {
    current = current.parent;
  }

  if (
    current &&
    current.controller &&
    current.controller.getLocalizationForController
  ) {
    return current.controller.getLocalizationForController();
  }

  // Fallback to global localization if controller not found
  return getLocalization();
}
