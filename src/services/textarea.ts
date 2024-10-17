/*********************************************
 * Manage the MathQuill instance's textarea
 * (as owned by the Controller)
 ********************************************/
Options.prototype.substituteTextarea = function (tabbable?: boolean) {
  return h('textarea', {
    autocapitalize: 'off',
    autocomplete: 'off',
    autocorrect: 'off',
    spellcheck: false,
    'x-palm-disable-ste-all': true,
    tabindex: tabbable ? undefined : '-1'
  });
};

/* A light-weight function to generate a UUID */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function defaultSubstituteKeyboardEvents(jq: $, controller: Controller) {
  return saneKeyboardEvents(jq[0] as HTMLTextAreaElement, controller);
}
Options.prototype.substituteKeyboardEvents = defaultSubstituteKeyboardEvents;

class Controller extends Controller_scrollHoriz {
  selectFn: (text: string) => void = noop;

  createTextarea() {
    this.textareaSpan = h('span', { class: 'mq-textarea' });

    const tabbable =
      this.options.tabbable !== undefined
        ? this.options.tabbable
        : this.KIND_OF_MQ !== 'StaticMath';

    const textarea = this.options.substituteTextarea(tabbable);
    if (!textarea.nodeType) {
      throw 'substituteTextarea() must return a DOM element, got ' + textarea;
    }
    if (!this.options.tabbable && this.KIND_OF_MQ === 'StaticMath') {
      // aria-hide noninteractive textarea element for static math
      textarea.setAttribute('aria-hidden', 'true');
    }
    this.textarea = domFrag(textarea)
      .appendTo(this.textareaSpan)
      .oneElement() as HTMLTextAreaElement;
    this.mathspeakId = generateUUID();
    this.mathspeakSpan = h('span', {
      class: 'mq-mathspeak',
      id: this.mathspeakId
    });
    textarea?.setAttribute('aria-labelledby', this.mathspeakId);
    domFrag(this.textareaSpan).prepend(domFrag(this.mathspeakSpan));

    var ctrlr = this;
    ctrlr.cursor.selectionChanged = function () {
      ctrlr.selectionChanged();
    };
  }

  selectionChanged() {
    var ctrlr = this;

    // throttle calls to setTextareaSelection(), because setting textarea.value
    // and/or calling textarea.select() can have anomalously bad performance:
    // https://github.com/mathquill/mathquill/issues/43#issuecomment-1399080
    //
    // Note, this timeout may be cleared by the blur handler in focusBlur.js
    if (!ctrlr.textareaSelectionTimeout) {
      ctrlr.textareaSelectionTimeout = setTimeout(function () {
        ctrlr.setTextareaSelection();
      });
    }
  }

  setTextareaSelection() {
    this.textareaSelectionTimeout = 0;
    var latex = '';
    if (this.cursor.selection) {
      //cleanLatex prunes unnecessary spaces. defined in latex.js
      latex = this.cleanLatex(this.cursor.selection.join('latex'));
      if (this.options.statelessClipboard) {
        // FIXME: like paste, only this works for math fields; should ask parent
        latex = '$' + latex + '$';
      }
    }
    this.selectFn(latex);
  }

  /** Requires `this.textarea` to be initialized. */
  staticMathTextareaEvents() {
    var ctrlr = this;
    this.removeTextareaEventListener('cut');
    this.removeTextareaEventListener('paste');
    if (ctrlr.options.disableCopyPaste) {
      this.removeTextareaEventListener('copy');
    } else {
      this.addTextareaEventListeners({
        copy: function () {
          ctrlr.setTextareaSelection();
        }
      });
    }

    this.addStaticFocusBlurListeners();

    const textarea = this.getTextarea();
    const { select } = saneKeyboardEvents(textarea, this);
    this.selectFn = select;
    const textareaSpan = this.getTextareaSpan();
    domFrag(this.container).prepend(domFrag(textareaSpan));
  }

  /** Requires `this.textarea` to be initialized. */
  editablesTextareaEvents() {
    var ctrlr = this;
    const textarea = ctrlr.getTextarea();
    const textareaSpan = ctrlr.getTextareaSpan();

    if (this.options.version < 3) {
      const $ = this.options.assertJquery();
      var keyboardEventsShim = this.options.substituteKeyboardEvents(
        $(textarea),
        this
      );
      this.selectFn = function (text: string) {
        keyboardEventsShim.select(text);
      };
    } else {
      const { select } = saneKeyboardEvents(textarea, this);
      this.selectFn = select;
    }

    domFrag(this.container).prepend(domFrag(textareaSpan));
    this.addEditableFocusBlurListeners();
    this.updateMathspeak();
  }

  unbindEditablesEvents() {
    var ctrlr = this;
    const textarea = ctrlr.getTextarea();
    const textareaSpan = ctrlr.getTextareaSpan();

    this.selectFn = function (text: string) {
      if (!(textarea instanceof HTMLTextAreaElement)) return;
      textarea.value = text;
      if (text) textarea.select();
    };
    domFrag(textareaSpan).remove();

    this.removeTextareaEventListener('focus');
    this.removeTextareaEventListener('blur');

    ctrlr.blurred = true;
    this.removeTextareaEventListener('cut');
    this.removeTextareaEventListener('paste');
  }
  typedText(ch: string) {
    if (ch === '\n') return this.handle('enter');
    var cursor = this.notify(undefined).cursor;
    cursor.parent.write(cursor, ch);
    this.scrollHoriz();
  }
  cut() {
    var ctrlr = this,
      cursor = ctrlr.cursor;
    if (cursor.selection) {
      setTimeout(function () {
        ctrlr.notify('edit'); // deletes selection if present
        cursor.parent.bubble(function (node) {
          (node as MQNode).reflow();
          return undefined;
        });
        if (ctrlr.options && ctrlr.options.onCut) {
          ctrlr.options.onCut();
        }
      });
    }
  }
  copy() {
    this.setTextareaSelection();
  }
  paste(text: string) {
    // TODO: document `statelessClipboard` config option in README, after
    // making it work like it should, that is, in both text and math mode
    // (currently only works in math fields, so worse than pointless, it
    //  only gets in the way by \text{}-ifying pasted stuff and $-ifying
    //  cut/copied LaTeX)
    if (this.options.statelessClipboard) {
      if (text.slice(0, 1) === '$' && text.slice(-1) === '$') {
        text = text.slice(1, -1);
      } else {
        text = '\\text{' + text + '}';
      }
    }
    // FIXME: this always inserts math or a TextBlock, even in a RootTextBlock
    this.writeLatex(text).cursor.show();
    this.scrollHoriz();
    if (this.options && this.options.onPaste) {
      this.options.onPaste();
    }
  }

  /** Set up for a static MQ field (i.e., initialize the focus state to blurred) */
  setupStaticField() {
    this.updateMathspeak();
    this.blurred = true;
    this.cursor.hide().parent.blur(this.cursor);
  }

  updateMathspeak() {
    var ctrlr = this;
    // If the controller's ARIA label doesn't end with a punctuation mark, add a colon by default to better separate it from mathspeak.
    var ariaLabel = ctrlr.getAriaLabel();
    var labelWithSuffix = /[A-Za-z0-9]$/.test(ariaLabel)
      ? ariaLabel + ':'
      : ariaLabel;
    var mathspeak = ctrlr.root.mathspeak().trim();
    this.aria.clear();

    if (!!ctrlr.mathspeakSpan) {
      ctrlr.mathspeakSpan.textContent = (
        labelWithSuffix +
        ' ' +
        mathspeak +
        ' ' +
        ctrlr.ariaPostLabel
      ).trim();
    }
  }
}
