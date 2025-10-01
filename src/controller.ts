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
  readonly cursor: Cursor;
  editable: boolean | undefined;
  _ariaAlertTimeout: number;
  KIND_OF_MQ: KIND_OF_MQ;
  isMouseSelecting: boolean = false;

  textarea: HTMLElement | undefined;
  private textareaEventListeners: Partial<{
    [K in keyof HTMLElementEventMap]: (event: HTMLElementEventMap[K]) => any;
  }> = {};

  textareaSpan: HTMLElement | undefined;
  mathspeakSpan: HTMLElement | undefined;
  mathspeakId: string | undefined;

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
    this.ariaLabel = 'Math Input';
    this.ariaPostLabel = '';

    root.controller = this.getControllerSelf();

    this.cursor = root.cursor = new Cursor(
      root,
      options,
      this.getControllerSelf()
    );
    // TODO: stop depending on root.cursor, and rm it
  }

  static isControllerRoot(node: NodeBase): node is ControllerRoot {
    const ctrlr: Controller | undefined = (node as ControllerRoot).controller;
    return ctrlr && ctrlr.root === node;
  }

  getControllerSelf() {
    // dance we have to do to tell this thing it's a full controller
    return this as any as Controller;
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
      this.ariaLabel = 'Math Input';
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
    if (this.ariaLabel !== 'Math Input') {
      return this.ariaLabel;
    } else if (this.editable) {
      return 'Math Input';
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
    return this.root.mathspeak();
  }

  // overridden
  updateMathspeak(_opts?: { emptyContent: boolean }) {}
  scrollHoriz() {}
  selectionChanged() {}
  setOverflowClasses() {}
}
