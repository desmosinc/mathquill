/**
 * Fluent-based localization service for MathQuill screen reader announcements
 * Provides centralized internationalization for mathematical expression descriptions
 */

// TypeScript interfaces for Fluent types
// Note: FluentBundle and parseResource are provided by fluent-bundle.js
// which is included in the build before this file

// FluentVariable represents the types that can be passed as arguments to Fluent messages
type FluentVariable = string | number | Date | boolean;

interface FluentMessage {
  value?: any; // Pattern from Fluent AST
  attributes?: Record<string, any>;
}

interface FluentBundle {
  locales: Array<string>;
  hasMessage(id: string): boolean;
  getMessage(id: string): FluentMessage | undefined;
  addResource(resource: FluentResource): Array<Error>;
  formatPattern(
    pattern: any,
    args?: Record<string, FluentVariable> | null,
    errors?: Array<Error> | null
  ): string;
}

interface FluentResource {
  body: Array<any>;
}

interface FluentBundleConstructor {
  new (locales: string | Array<string>, options?: any): FluentBundle;
}

interface FluentResourceConstructor {
  new (source: string): FluentResource;
}

declare var FluentBundle: FluentBundleConstructor;
declare var FluentResource: FluentResourceConstructor;
declare var parseResource: any;

// Note: These functions are provided by locale-imports.ts
// They are included in the build before this file

class MathQuillLocalization {
  private bundle: FluentBundle | null = null;
  private requestedLanguage: string = 'en';
  private resolvedLanguage: string = 'en';
  private bundleCache: Map<string, FluentBundle> = new Map();
  private languageChangeCallbacks: Set<() => void> = new Set();

  constructor(language: string = 'en') {
    this.setLanguage(language);
  }

  setLanguage(language: string, throwOnInvalid: boolean = false) {
    this.requestedLanguage = language;

    // Check if the language is completely invalid (not a valid language code format)
    if (throwOnInvalid && !isValidLanguageCode(language)) {
      throw new Error(
        `Unsupported language code: ${language}. Supported languages: en, es`
      );
    }

    // Resolve the language to the actual language that will be loaded
    const resolvedLanguage = getResolvedLanguage(language);
    const previousLanguage = this.resolvedLanguage;
    this.resolvedLanguage = resolvedLanguage;

    // Check cache first (use resolved language for caching)
    if (this.bundleCache.has(resolvedLanguage)) {
      this.bundle = this.bundleCache.get(resolvedLanguage)!;
      if (resolvedLanguage !== language) {
        console.info(
          `Language '${language}' resolved to '${resolvedLanguage}' (cached)`
        );
      }
      // Trigger callbacks if language actually changed
      if (previousLanguage !== resolvedLanguage) {
        this.triggerLanguageChangeCallbacks();
      }
      return;
    }

    try {
      // Try to load the resolved language file
      const messages = this.loadMessages(resolvedLanguage);
      this.bundle = this.createFluentBundle(resolvedLanguage, messages);
      this.bundleCache.set(resolvedLanguage, this.bundle);

      if (resolvedLanguage !== language) {
        console.info(
          `Language '${language}' resolved to '${resolvedLanguage}'`
        );
      }

      // Trigger callbacks if language actually changed
      if (previousLanguage !== resolvedLanguage) {
        this.triggerLanguageChangeCallbacks();
      }
    } catch (error) {
      console.warn(
        `Failed to load language ${resolvedLanguage}, falling back to English`
      );
      if (resolvedLanguage !== 'en') {
        this.setLanguage('en');
      } else {
        // If even English fails, we have a serious problem
        throw new Error('Failed to load fallback English language');
      }
    }
  }

  private createFluentBundle(
    language: string,
    ftlContent: string
  ): FluentBundle {
    // FluentBundle constructor expects a locale or array of locales
    // Disable Unicode isolation marks (⁩) for cleaner screen reader output
    const bundle = new FluentBundle([language], { useIsolating: false });

    // Create a FluentResource from the raw FTL content
    // FluentResource constructor takes the raw string content, not parsed AST
    const fluentResource = new FluentResource(ftlContent);

    const errors = bundle.addResource(fluentResource);
    if (errors.length > 0) {
      console.warn(`Fluent bundle errors for ${language}:`, errors);
    }

    return bundle;
  }

  private loadMessages(language: string): string {
    // Load messages using the fallback-aware loader
    const messages = loadLocaleMessages(language);
    if (!messages) {
      throw new Error(`No messages found for language: ${language}`);
    }
    return messages;
  }

  formatMessage(id: string, args?: Record<string, FluentVariable>): string {
    if (!this.bundle) {
      console.warn('Localization not initialized');
      return id;
    }

    const message = this.bundle.getMessage(id);
    if (!message || !message.value) {
      console.warn(`Missing localization message: ${id}`);
      return id;
    }

    const errors: Error[] = [];
    const formatted = this.bundle.formatPattern(message.value, args, errors);

    if (errors.length > 0) {
      console.warn(`Formatting errors for message '${id}':`, errors);
    }

    // Trim whitespace to ensure clean mathspeak output
    return formatted.trim();
  }

  // Convenience methods for common mathematical structures
  formatStartBlock(blockType: string): string {
    return this.formatMessage('start-block', { blockType });
  }

  formatEndBlock(blockType: string): string {
    return this.formatMessage('end-block', { blockType });
  }

  formatFractionShortcut(numerator: number, denominator: number): string {
    const key = `fraction-shortcut-${numerator}-${denominator}`;
    const shortcut = this.formatMessage(key);

    // If the specific key exists, use it; otherwise return empty string to fall back to full form
    if (shortcut !== key) {
      return shortcut;
    }
    return '';
  }

  formatFractionDenominator(numerator: number, denominator: number): string {
    // Use singular form for |numerator| = 1, plural for |numerator| > 1
    const form = Math.abs(numerator) === 1 ? 'singular' : 'plural';
    const key = `fraction-denom-${denominator}-${form}`;
    const result = this.formatMessage(key);

    // If the specific key exists, use it; otherwise return empty string to fall back to full form
    if (result !== key) {
      return result;
    }
    return '';
  }

  formatPowerExpression(number: number): string {
    if (number === 2) {
      return this.formatMessage('power-squared');
    } else if (number === 3) {
      return this.formatMessage('power-cubed');
    } else if (number === 0) {
      return this.formatMessage('power-zero');
    } else if (number < 0) {
      // Handle negative exponents: "to the negative 5th power" instead of "to the -5th power"
      const positiveNumber = Math.abs(number);

      // First try with number to get proper ordinal translations
      const resultWithNumber = this.formatMessage('power-negative', {
        number: positiveNumber
      });

      // Check if Fluent applied unwanted formatting (commas, spaces, etc.)
      const numberStr = positiveNumber.toString();
      const hasNumberFormatting = !resultWithNumber.includes(numberStr);

      if (hasNumberFormatting && numberStr.length > 3) {
        // Fall back to string format to prevent unwanted formatting
        return this.formatMessage('power-negative', { number: numberStr });
      }

      return resultWithNumber;
    } else {
      // First try with number to get proper ordinal translations
      const resultWithNumber = this.formatMessage('power-ordinal', { number });

      // Check if Fluent applied unwanted formatting (commas, spaces, etc.)
      const numberStr = number.toString();
      const hasNumberFormatting = !resultWithNumber.includes(numberStr);

      if (hasNumberFormatting && numberStr.length > 3) {
        // Fall back to string format to prevent unwanted formatting
        return this.formatMessage('power-ordinal', { number: numberStr });
      }

      return resultWithNumber;
    }
  }

  formatDirectional(
    direction: 'before' | 'after' | 'beginning-of' | 'end-of'
  ): string {
    return this.formatMessage(direction);
  }

  // Auto operator localization
  formatAutoOperator(operatorName: string): string {
    // First, try to find a localized version
    const key = `auto-operator-${operatorName}`;
    if (this.bundle?.getMessage(key)) {
      return this.formatMessage(key);
    }

    // If no localization exists, check if the operator contains | syntax
    // This supports user-defined operators like "sin|sine"
    if (operatorName.includes('|')) {
      const parts = operatorName.split('|');
      return parts[1] || parts[0]; // Return spoken part (after |) or fall back to visual part
    }

    // Fallback to original name if no localization exists
    return operatorName;
  }

  /**
   * Creates a mathspeak template for start/end delimited structures
   * @param startKey - The localization key for the start delimiter
   * @param endKey - The localization key for the end delimiter
   * @returns Array of template strings with commas for screen reader pauses
   */
  createMathspeakTemplate(startKey: string, endKey: string): string[] {
    return [
      this.formatMessage(startKey) + ',',
      ', ' + this.formatMessage(endKey)
    ];
  }

  getCurrentLanguage(): string {
    return this.requestedLanguage;
  }

  getResolvedLanguage(): string {
    return this.resolvedLanguage;
  }

  /**
   * Register a callback to be called when the language changes
   * @param callback Function to call when language changes
   * @returns Function to unregister the callback
   */
  onLanguageChange(callback: () => void): () => void {
    this.languageChangeCallbacks.add(callback);
    return () => {
      this.languageChangeCallbacks.delete(callback);
    };
  }

  /**
   * Trigger all registered language change callbacks
   */
  private triggerLanguageChangeCallbacks() {
    this.languageChangeCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.warn('Error in language change callback:', error);
      }
    });
  }

  /**
   * Check if a language is supported (with fallback resolution)
   */
  static isLanguageSupported(language: string): boolean {
    return hasLanguageSupport(language);
  }

  /**
   * Get the language that would actually be loaded for a given request
   */
  static resolveLanguage(language: string): string {
    return getResolvedLanguage(language);
  }
}

/**
 * Validates if a language code has a reasonable format.
 * Only rejects completely invalid language codes, not unsupported ones.
 */
function isValidLanguageCode(language: string): boolean {
  if (!language || typeof language !== 'string') {
    return false;
  }

  // Basic language code format validation (ISO 639-1 and variants)
  // Accept: en, es, fr, fr-CA, en-US, zh-CN, etc.
  // Reject: xx, 123, empty string, special characters, etc.
  const languagePattern = /^[a-z]{2,3}(-[A-Z]{2})?$/i;

  // Additional check: reject obviously made-up codes like 'xx'
  const normalizedLanguage = language.toLowerCase();
  const invalidCodes = ['xx', 'xyz', '123', 'test', 'invalid', 'bogus'];

  if (invalidCodes.includes(normalizedLanguage)) {
    return false;
  }

  return languagePattern.test(language);
}

// Global instance
let mathQuillLocalization: MathQuillLocalization;

// Get or create the global instance
function getLocalization(): MathQuillLocalization {
  if (!mathQuillLocalization) {
    mathQuillLocalization = new MathQuillLocalization();
  }
  return mathQuillLocalization;
}

// getLocalization is made globally available below

// @ts-ignore - Make function globally available
if (typeof window !== 'undefined') {
  (window as any).getLocalization = getLocalization;
} else if (typeof global !== 'undefined') {
  (global as any).getLocalization = getLocalization;
}
