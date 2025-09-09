/*************************************************
 * Speech-to-Text Input Service for MathQuill
 ************************************************/

/**
 * Speech recognition grammar for mathematical expressions
 * Maps spoken words/phrases to LaTeX commands and constructs
 */
const SPEECH_GRAMMAR = {
  // Numbers
  numbers: {
    zero: '0',
    one: '1',
    two: '2',
    three: '3',
    four: '4',
    five: '5',
    six: '6',
    seven: '7',
    eight: '8',
    nine: '9',
    ten: '10',
    eleven: '11',
    twelve: '12',
    thirteen: '13',
    fourteen: '14',
    fifteen: '15',
    sixteen: '16',
    seventeen: '17',
    eighteen: '18',
    nineteen: '19',
    twenty: '20',
    thirty: '30',
    forty: '40',
    fifty: '50',
    sixty: '60',
    seventy: '70',
    eighty: '80',
    ninety: '90',
    hundred: '100',
    thousand: '1000',
    million: '1000000',
    billion: '1000000000'
  },

  // Basic operations
  operations: {
    plus: '+',
    add: '+',
    '+': '+', // Handle actual plus symbol
    positive: '+',
    minus: '-',
    subtract: '-',
    negative: '-',
    '-': '-', // Handle actual minus symbol
    times: '\\times',
    multiply: '\\times',
    'multiplied by': '\\times',
    '*': '\\times', // Handle asterisk
    'divided by': '\\div',
    divide: '\\div',
    '/': '\\div', // Handle forward slash
    equals: '=',
    'is equal to': '=',
    '=': '=', // Handle actual equals symbol
    'not equal to': '\\ne',
    'not equals': '\\ne',
    'less than': '<',
    '<': '<', // Handle actual less than symbol
    'greater than': '>',
    '>': '>', // Handle actual greater than symbol
    'less than or equal to': '\\le',
    'greater than or equal to': '\\ge',
    'approximately equal': '\\approx',
    congruent: '\\cong',
    similar: '\\sim'
  },

  // Fractions, exponents, and brackets
  structures: {
    fraction: { type: 'fraction', latex: '\\frac{}{}' },
    'start fraction': { type: 'fraction', latex: '\\frac{}{}' },
    'begin fraction': { type: 'fraction', latex: '\\frac{}{}' },
    'open fraction': { type: 'fraction', latex: '\\frac{}{}' },
    over: { type: 'fraction', latex: '\\frac{}{}' },
    squared: { type: 'superscript', latex: '^2' },
    cubed: { type: 'superscript', latex: '^3' },
    'to the power of': { type: 'superscript', latex: '^{}' },
    superscript: { type: 'superscript', latex: '^{}' },
    subscript: { type: 'subscript', latex: '_{}' },
    'square root': { type: 'sqrt', latex: '\\sqrt{}' },
    'square root of': { type: 'sqrt', latex: '\\sqrt{}' },
    'nth root': { type: 'nthroot', latex: '\\sqrt[{}]{}' },
    'cube root': { type: 'nthroot', latex: '\\sqrt[3]{}' },
    'absolute value': { type: 'abs', latex: '|{}|' },
    parentheses: { type: 'parens', latex: '({})' },
    brackets: { type: 'brackets', latex: '[{}]' },
    braces: { type: 'braces', latex: '\\{{}\\}' }
  },

  // Greek letters
  greekLetters: {
    alpha: '\\alpha',
    beta: '\\beta',
    gamma: '\\gamma',
    delta: '\\delta',
    epsilon: '\\epsilon',
    zeta: '\\zeta',
    eta: '\\eta',
    theta: '\\theta',
    iota: '\\iota',
    kappa: '\\kappa',
    lambda: '\\lambda',
    mu: '\\mu',
    nu: '\\nu',
    xi: '\\xi',
    omicron: 'o',
    pi: '\\pi',
    rho: '\\rho',
    sigma: '\\sigma',
    tau: '\\tau',
    upsilon: '\\upsilon',
    phi: '\\phi',
    chi: '\\chi',
    psi: '\\psi',
    omega: '\\omega'
  },

  // Functions and operators
  functions: {
    sine: '\\sin',
    'sine of': '\\sin',
    cosine: '\\cos',
    'cosine of': '\\cos',
    tangent: '\\tan',
    'tangent of': '\\tan',
    secant: '\\sec',
    'secant of': '\\sec',
    cosecant: '\\csc',
    'cosecant of': '\\csc',
    cotangent: '\\cot',
    'cotangent of': '\\cot',
    arcsine: '\\arcsin',
    'arcsine of': '\\arcsin',
    arccosine: '\\arccos',
    'arccosine of': '\\arccos',
    arctangent: '\\arctan',
    'arctangent of': '\\arctan',
    'hyperbolic sine': '\\sinh',
    'hyperbolic sine of': '\\sinh',
    'hyperbolic cosine': '\\cosh',
    'hyperbolic cosine of': '\\cosh',
    'hyperbolic tangent': '\\tanh',
    'hyperbolic tangent of': '\\tanh',
    log: '\\log',
    'log of': '\\log',
    logarithm: '\\log',
    'logarithm of': '\\log',
    'natural log': '\\ln',
    'natural log of': '\\ln',
    exponential: 'e^{}',
    limit: '\\lim',
    sum: '\\sum',
    summation: '\\sum',
    product: '\\prod',
    integral: '\\int',
    derivative: '\\frac{d}{dx}',
    'partial derivative': '\\frac{\\partial}{\\partial x}'
  },

  // Sets and logic
  sets: {
    union: '\\cup',
    intersection: '\\cap',
    'element of': '\\in',
    'not element of': '\\notin',
    subset: '\\subset',
    superset: '\\supset',
    'empty set': '\\emptyset',
    'for all': '\\forall',
    'there exists': '\\exists',
    infinity: '\\infty',
    and: '\\wedge',
    or: '\\vee',
    not: '\\neg'
  },

  // Symbols
  symbols: {
    degree: '^\\circ',
    percent: '\\%',
    'percent of': '\\percentof',
    dollar: '\\$',
    prime: "'",
    'double prime': "''",
    angle: '\\angle',
    triangle: '\\triangle',
    parallel: '\\parallel',
    perpendicular: '\\perp'
  },

  // Control words (these should be ignored in most contexts)
  control: {
    end: '',
    start: '',
    begin: ''
  },

  // Navigation commands
  navigation: {
    'go left': 'left',
    'move left': 'left',
    left: 'left',
    'go right': 'right',
    'move right': 'right',
    right: 'right',
    'go up': 'up',
    'move up': 'up',
    up: 'up',
    'go down': 'down',
    'move down': 'down',
    down: 'down',
    'select left': 'shift+left',
    'select right': 'shift+right',
    'select up': 'shift+up',
    'select down': 'shift+down',
    'select all': 'ctrl+a',
    backspace: 'backspace',
    delete: 'delete',
    undo: 'ctrl+z',
    redo: 'ctrl+y'
  }
};

interface SpeechInputOptions {
  enabled: boolean;
  language: string;
  continuous: boolean;
  interimResults: boolean;
  silenceTimeout: number; // milliseconds
}

class SpeechInputService {
  private recognition: any = null;
  private isListening: boolean = false;
  private silenceTimer: number | null = null;
  private controller: Controller;
  private options: SpeechInputOptions;
  private button: HTMLButtonElement | null = null;

  constructor(
    controller: Controller,
    options: Partial<SpeechInputOptions> = {}
  ) {
    this.controller = controller;
    this.options = {
      enabled: true,
      language: 'en-US',
      continuous: true,
      interimResults: false,
      silenceTimeout: 5000,
      ...options
    };

    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition(): void {
    // Check for browser support
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      this.options.enabled = false;
      return;
    }

    // Check for HTTPS requirement
    const isSecureContext =
      window.location.protocol === 'https:' || window.isSecureContext;

    if (!isSecureContext) {
      console.warn('Speech recognition requires a secure context (HTTPS)');
      this.options.enabled = false;
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = this.options.continuous;
    this.recognition.interimResults = this.options.interimResults;
    this.recognition.lang = this.options.language;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.updateButtonState();
      this.resetSilenceTimer();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.updateButtonState();
      this.clearSilenceTimer();
    };

    this.recognition.onresult = (event: any) => {
      this.resetSilenceTimer();

      const transcript = event.results[event.results.length - 1][0].transcript
        .toLowerCase()
        .trim();
      if (transcript) {
        this.processVoiceInput(transcript);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      this.handleSpeechError(event.error);
      this.stopListening();
    };
  }

  createVoiceInputButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'mq-voice-input-button';
    button.setAttribute('type', 'button');

    // Check if speech recognition is actually available
    if (!this.options.enabled || !this.recognition) {
      button.setAttribute('aria-label', '🎤');
      button.disabled = true;
      button.title = this.getUnavailabilityReason();
      button.innerHTML = '🎤';
      button.style.color = '#999';
    } else {
      button.setAttribute('aria-label', '🎤');
      button.title = '🎤';
      button.innerHTML = '🎤';
    }

    button.onclick = (e) => {
      e.preventDefault();
      if (this.options.enabled && this.recognition) {
        this.toggleListening();
      } else {
        this.showPermissionHelp();
      }
    };

    this.button = button;
    this.updateButtonState();

    return button;
  }

  private updateButtonState(): void {
    if (!this.button) return;

    if (this.isListening) {
      this.button.classList.add('mq-listening');
      this.button.setAttribute('aria-label', '🎤');
    } else {
      this.button.classList.remove('mq-listening');
      this.button.setAttribute('aria-label', '🎤');
    }
  }

  private toggleListening(): void {
    if (!this.options.enabled || !this.recognition) {
      return;
    }

    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  private startListening(): void {
    if (!this.recognition || this.isListening) return;

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
    }
  }

  private stopListening(): void {
    if (!this.recognition || !this.isListening) return;

    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
    }
  }

  private resetSilenceTimer(): void {
    this.clearSilenceTimer();
    this.silenceTimer = window.setTimeout(() => {
      this.stopListening();
    }, this.options.silenceTimeout);
  }

  private clearSilenceTimer(): void {
    if (this.silenceTimer !== null) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }

  public processVoiceInput(transcript: string): void {
    // Check for navigation commands first
    if (this.handleNavigationCommand(transcript)) {
      return;
    }

    // Process mathematical input
    const latex = this.convertSpeechToLatex(transcript);
    if (latex) {
      this.insertMathExpression(latex);
    }
  }

  private handleNavigationCommand(transcript: string): boolean {
    const command = (SPEECH_GRAMMAR.navigation as any)[transcript];
    if (!command) return false;

    // Handle different types of navigation commands
    if (command.includes('+')) {
      // Handle key combinations like shift+left, ctrl+z
      const parts = command.split('+');
      const modifiers = parts.slice(0, -1);
      const key = parts[parts.length - 1];

      const event = new KeyboardEvent('keydown', {
        key: this.getKeyFromString(key),
        code: this.getCodeFromString(key),
        ctrlKey: modifiers.includes('ctrl'),
        shiftKey: modifiers.includes('shift'),
        altKey: modifiers.includes('alt'),
        metaKey: modifiers.includes('meta')
      });

      this.controller.keystroke(command.replace('+', ' '), event);
    } else {
      // Handle simple navigation
      this.controller.keystroke(command);
    }

    return true;
  }

  private getKeyFromString(keyString: string): string {
    const keyMap: { [key: string]: string } = {
      left: 'ArrowLeft',
      right: 'ArrowRight',
      up: 'ArrowUp',
      down: 'ArrowDown',
      backspace: 'Backspace',
      delete: 'Delete',
      a: 'a',
      z: 'z',
      y: 'y'
    };
    return keyMap[keyString] || keyString;
  }

  private getCodeFromString(keyString: string): string {
    const codeMap: { [key: string]: string } = {
      left: 'ArrowLeft',
      right: 'ArrowRight',
      up: 'ArrowUp',
      down: 'ArrowDown',
      backspace: 'Backspace',
      delete: 'Delete',
      a: 'KeyA',
      z: 'KeyZ',
      y: 'KeyY'
    };
    return codeMap[keyString] || keyString;
  }

  public convertSpeechToLatex(transcript: string): string {
    // Clean up transcript
    const cleaned = transcript
      .toLowerCase()
      .replace(/[.,!?]/g, '') // Remove punctuation
      .trim();

    // Handle special patterns first
    let latex = this.handleSpecialPatterns(cleaned);
    if (latex) {
      return latex;
    }

    // Fall back to token-by-token parsing
    const words = cleaned.split(/\s+/);
    let result = '';
    let i = 0;

    while (i < words.length) {
      const { latex: tokenLatex, consumed } = this.parseNextToken(words, i);
      result += tokenLatex;
      i += consumed;
    }

    return result;
  }

  private handleSpecialPatterns(transcript: string): string | null {
    // Handle what speech recognition actually produces: "start fraction 1/2 in fraction"
    const speechFractionPattern =
      /^(?:start\s+|begin\s+)?fraction\s+(.+?)\s+(?:in|end)\s+fraction(?:\s+(.+))?$/i;
    const speechMatch = transcript.match(speechFractionPattern);

    if (speechMatch) {
      // Parse the content - could be "1/2" or "1 over 2"
      const content = speechMatch[1];
      let numerator = '',
        denominator = '';

      // Check if it's in "X/Y" format
      const slashMatch = content.match(/^(.+?)\/(.+)$/);
      if (slashMatch) {
        numerator = this.convertSimpleExpression(slashMatch[1].trim());
        denominator = this.convertSimpleExpression(slashMatch[2].trim());
      } else {
        // Check if it's "X over Y" format
        const overMatch = content.match(/^(.+?)\s+over\s+(.+)$/i);
        if (overMatch) {
          numerator = this.convertSimpleExpression(overMatch[1]);
          denominator = this.convertSimpleExpression(overMatch[2]);
        } else {
          // Fallback: treat whole content as numerator
          numerator = this.convertSimpleExpression(content);
          denominator = '';
        }
      }

      const trailing = speechMatch[2]
        ? this.convertSimpleExpression(speechMatch[2])
        : '';
      return `\\frac{${numerator}}{${denominator}}${trailing}`;
    }

    // Handle "start fraction X over Y end fraction" patterns with optional trailing expressions
    const fullFractionPattern =
      /^(?:start\s+|begin\s+)?fraction\s+(.+?)\s+over\s+(.+?)\s+end\s+fraction(?:\s+(.+))?$/i;
    const fullMatch = transcript.match(fullFractionPattern);

    if (fullMatch) {
      const numerator = this.convertSimpleExpression(fullMatch[1]);
      const denominator = this.convertSimpleExpression(fullMatch[2]);
      const trailing = fullMatch[3]
        ? this.convertSimpleExpression(fullMatch[3])
        : '';
      return `\\frac{${numerator}}{${denominator}}${trailing}`;
    }

    // Handle "start fraction X over Y" patterns (without "end fraction")
    const fractionPattern =
      /^(?:start\s+|begin\s+)?fraction\s+(.+?)\s+over\s+(.+)$/i;
    const match = transcript.match(fractionPattern);

    if (match) {
      const numerator = this.convertSimpleExpression(match[1]);
      const denominator = this.convertSimpleExpression(match[2]);
      return `\\frac{${numerator}}{${denominator}}`;
    }

    // Handle "X over Y" for fractions without "fraction" keyword
    const simpleOverPattern = /^(.+?)\s+over\s+(.+)$/i;
    const overMatch = transcript.match(simpleOverPattern);

    if (overMatch && overMatch[1].indexOf('fraction') === -1) {
      const numerator = this.convertSimpleExpression(overMatch[1]);
      const denominator = this.convertSimpleExpression(overMatch[2]);
      return `\\frac{${numerator}}{${denominator}}`;
    }

    // Handle "X to the power of Y" patterns
    const powerPattern = /^(.+?)\s+to\s+the\s+power\s+of\s+(.+)$/i;
    const powerMatch = transcript.match(powerPattern);

    if (powerMatch) {
      const base = this.convertSimpleExpression(powerMatch[1]);
      const exponent = this.convertSimpleExpression(powerMatch[2]);
      return `${base}^{${exponent}}`;
    }

    // Handle "X superscript Y" patterns
    const superscriptPattern = /^(.+?)\s+superscript\s+(.+)$/i;
    const superscriptMatch = transcript.match(superscriptPattern);

    if (superscriptMatch) {
      const base = this.convertSimpleExpression(superscriptMatch[1]);
      const exponent = this.convertSimpleExpression(superscriptMatch[2]);
      return `${base}^{${exponent}}`;
    }

    // Handle "X subscript Y" patterns
    const subscriptPattern = /^(.+?)\s+subscript\s+(.+)$/i;
    const subscriptMatch = transcript.match(subscriptPattern);

    if (subscriptMatch) {
      const base = this.convertSimpleExpression(subscriptMatch[1]);
      const subscript = this.convertSimpleExpression(subscriptMatch[2]);
      return `${base}_{${subscript}}`;
    }

    // Handle function "of" patterns like "sine of x", "log of 2"
    const functionOfPattern =
      /^(sine|cosine|tangent|logarithm|natural\s+log|log)\s+of\s+(.+)$/i;
    const funcMatch = transcript.match(functionOfPattern);

    if (funcMatch) {
      let funcName = funcMatch[1].toLowerCase().replace(/\s+/g, ' ');
      // Map function names to LaTeX
      const funcMap: { [key: string]: string } = {
        sine: '\\sin',
        cosine: '\\cos',
        tangent: '\\tan',
        logarithm: '\\log',
        'natural log': '\\ln',
        log: '\\log'
      };

      const latexFunc = funcMap[funcName];
      if (latexFunc) {
        const argument = this.convertSimpleExpression(funcMatch[2]);
        return `${latexFunc} ${argument}`;
      }
    }

    // Handle parenthetical expressions
    const parenPattern1 =
      /^(.*)left\s+parenthesis\s+(.+?)\s+right\s+parenthesis(.*)$/i;
    const parenMatch1 = transcript.match(parenPattern1);

    const parenPattern2 =
      /^(.*)left\s+parenthes[ei]s\s+(.+?)\s+right\s+parenthes[ei]s(.*)$/i;
    const parenMatch2 = transcript.match(parenPattern2);

    const parenPattern3 =
      /^(.*)(?:left\s+|open\s+)(?:parenthes[ei]s|paren)\s+(.+?)\s+(?:right\s+|close\s+)(?:parenthes[ei]s|paren)(.*)$/i;
    const parenMatch3 = transcript.match(parenPattern3);

    const parenMatch = parenMatch1 || parenMatch2 || parenMatch3;

    if (parenMatch) {
      const before = parenMatch[1]
        ? this.convertSimpleExpression(parenMatch[1].trim())
        : '';
      const content = this.convertSimpleExpression(parenMatch[2]);
      const after = parenMatch[3]
        ? this.convertSimpleExpression(parenMatch[3].trim())
        : '';
      return `${before}\\left(${content}\\right)${after}`;
    }

    // Handle square brackets: "left bracket X right bracket"
    const bracketPattern =
      /^(.*)(?:left\s+|open\s+)(?:bracket|square\s+bracket)\s+(.+?)\s+(?:right\s+|close\s+)(?:bracket|square\s+bracket)(.*)$/i;
    const bracketMatch = transcript.match(bracketPattern);

    if (bracketMatch) {
      const before = bracketMatch[1]
        ? this.convertSimpleExpression(bracketMatch[1].trim())
        : '';
      const content = this.convertSimpleExpression(bracketMatch[2]);
      const after = bracketMatch[3]
        ? this.convertSimpleExpression(bracketMatch[3].trim())
        : '';
      return `${before}\\left[${content}\\right]${after}`;
    }

    // Handle curly braces: "left brace X right brace"
    const bracePattern =
      /^(.*)(?:left\s+|open\s+)(?:brace|curly\s+brace)\s+(.+?)\s+(?:right\s+|close\s+)(?:brace|curly\s+brace)(.*)$/i;
    const braceMatch = transcript.match(bracePattern);

    if (braceMatch) {
      const before = braceMatch[1]
        ? this.convertSimpleExpression(braceMatch[1].trim())
        : '';
      const content = this.convertSimpleExpression(braceMatch[2]);
      const after = braceMatch[3]
        ? this.convertSimpleExpression(braceMatch[3].trim())
        : '';
      return `${before}\\left\\{${content}\\right\\}${after}`;
    }

    return null;
  }

  private convertSimpleExpression(expr: string): string {
    // Convert simple expressions like "1", "x", "x plus 2" to LaTeX
    const words = expr.toLowerCase().trim().split(/\s+/);
    let result = '';
    let i = 0;

    while (i < words.length) {
      const { latex, consumed } = this.parseNextToken(words, i);
      result += latex;
      i += consumed;
    }

    return result || expr.trim();
  }

  private parseNextToken(
    words: string[],
    startIndex: number
  ): { latex: string; consumed: number } {
    // Try to match multi-word phrases first, then single words
    for (
      let length = Math.min(words.length - startIndex, 5);
      length >= 1;
      length--
    ) {
      const phrase = words.slice(startIndex, startIndex + length).join(' ');

      // Check each grammar category
      for (const [category, grammar] of (Object as any).entries(
        SPEECH_GRAMMAR
      )) {
        if (category === 'navigation') continue; // Skip navigation commands

        const match = (grammar as any)[phrase];
        if (match) {
          if (typeof match === 'string') {
            // Add spacing after functions that need it
            let result = match;
            if (
              category === 'functions' &&
              match.indexOf('\\') === 0 &&
              startIndex + length < words.length &&
              match.indexOf('{}') !== match.length - 2
            ) {
              result = match + ' ';
            }
            return { latex: result, consumed: length };
          } else if (typeof match === 'object' && match.latex) {
            return { latex: match.latex, consumed: length };
          }
        }
      }
    }

    // If no match found, treat as variable, number, symbol, or skip
    const word = words[startIndex];
    if (word) {
      // Check if it's a number
      if (/^\d+$/.test(word)) {
        return { latex: word, consumed: 1 };
      }

      // Check if it's a single letter (treat as variable)
      if (word.length === 1 && /[a-z]/.test(word)) {
        return { latex: word, consumed: 1 };
      }

      // Handle mathematical symbols directly (fallback if grammar lookup failed)
      const symbolMap: { [key: string]: string } = {
        '+': '+',
        '-': '-',
        '*': '\\times',
        '/': '\\div',
        '=': '=',
        '<': '<',
        '>': '>',
        '(': '(',
        ')': ')',
        '[': '[',
        ']': ']',
        '{': '{',
        '}': '}'
      };

      if (symbolMap[word]) {
        return { latex: symbolMap[word], consumed: 1 };
      }

      // Handle compound expressions like "6/7", "2+3", etc.
      const compoundMatch = word.match(/^(\d+|[a-z])([+\-*/=<>])(\d+|[a-z])$/i);
      if (compoundMatch) {
        const [, left, op, right] = compoundMatch;
        const opMap: { [key: string]: string } = {
          '+': '+',
          '-': '-',
          '*': '\\times ',
          '/': '\\div ',
          '=': '=',
          '<': '<',
          '>': '>'
        };
        const latexOp = opMap[op] || op;
        const result = `${left}${latexOp}${right}`;
        return { latex: result, consumed: 1 };
      }

      // Skip unknown words rather than wrapping in \text{}
      // This prevents unwanted \text{} blocks for unrecognized speech
      return { latex: '', consumed: 1 };
    }

    return { latex: '', consumed: 1 };
  }

  private insertMathExpression(latex: string): void {
    if (!latex) return;

    // Store cursor position before insertion to identify what was inserted
    const cursorBefore = this.controller.cursor;
    const leftBefore = (cursorBefore as any)[-1]; // cursorBefore[L]

    // Use the controller to insert the LaTeX
    this.controller.writeLatex(latex);

    // Generate mathspeak for accessibility announcement using MathQuill's built-in functionality
    if (this.controller.aria) {
      // Get the mathspeak for what was just inserted
      // If we can identify the inserted content, use its mathspeak; otherwise use the whole expression
      let mathspeakText: string;

      try {
        // Try to get mathspeak from the newly inserted content
        const cursorAfter = this.controller.cursor;
        const leftBefore_R = leftBefore && (leftBefore as any)[1]; // leftBefore[R]
        const cursorAfter_L = (cursorAfter as any)[-1]; // cursorAfter[L]

        if (leftBefore && leftBefore_R) {
          // Get mathspeak from the node that was inserted
          mathspeakText = `Inserted: ${leftBefore_R.mathspeak()}`;
        } else if (cursorAfter_L) {
          // Fallback: get mathspeak from the node to the left of cursor
          mathspeakText = `Inserted: ${cursorAfter_L.mathspeak()}`;
        } else {
          // Final fallback: get mathspeak of the entire expression
          mathspeakText = `Inserted: ${this.controller.root.mathspeak()}`;
        }
      } catch (error) {
        // If mathspeak generation fails, use the original LaTeX as fallback
        mathspeakText = `Inserted: ${latex}`;
      }

      this.controller.aria.alert(mathspeakText);
    }
  }

  destroy(): void {
    this.stopListening();
    this.clearSilenceTimer();

    if (this.button && this.button.parentNode) {
      this.button.parentNode.removeChild(this.button);
    }

    this.recognition = null;
    this.button = null;
  }

  private getUnavailabilityReason(): string {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return 'Speech recognition not supported in this browser. Try Chrome, Edge, or Safari.';
    }

    const isSecureContext =
      window.location.protocol === 'https:' || window.isSecureContext;

    if (!isSecureContext) {
      return 'Speech recognition requires a secure context (HTTPS).';
    }

    return 'Speech recognition is not available.';
  }

  private handleSpeechError(error: string): void {
    let userMessage = '';

    switch (error) {
      case 'not-allowed':
        userMessage =
          'Microphone access denied. Please allow microphone permissions and try again.';
        break;
      case 'no-speech':
        userMessage = 'No speech detected. Please try speaking again.';
        break;
      case 'audio-capture':
        userMessage =
          'No microphone found. Please check your microphone connection.';
        break;
      case 'network':
        userMessage = 'Network error. Please check your internet connection.';
        break;
      case 'service-not-allowed':
        userMessage =
          'Speech service not allowed. This may be due to security restrictions.';
        break;
      default:
        userMessage = `Speech recognition error: ${error}`;
    }

    console.warn('Speech recognition error:', userMessage);

    // Show user-friendly error message
    if (this.controller.aria) {
      this.controller.aria.alert(userMessage);
    }
  }

  private showPermissionHelp(): void {
    const reason = this.getUnavailabilityReason();
    alert(
      `Voice Input Not Available\n\n${reason}\n\nTo enable voice input:\n\n1. For secure context: Use HTTPS\n2. For permissions: Click the microphone icon in your browser's address bar\n3. For browser support: Use Chrome, Edge, or Safari`
    );
  }
}

// SpeechInputService is available to other MathQuill components via the class declaration above
