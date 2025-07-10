/**
 * Fluent-based localization service for MathQuill screen reader announcements
 * Provides centralized internationalization for mathematical expression descriptions
 */

// Note: FluentBundle and parseResource are provided by fluent-bundle.js
// which is included in the build before this file
declare var FluentBundle: any;
declare var parseResource: any;
declare var FluentResource: any;

// Note: These functions are provided by locale-imports.ts
declare var loadLocaleMessages: (language: string) => string | null;
declare var getResolvedLanguage: (language: string) => string;
declare var hasLanguageSupport: (language: string) => boolean;

class MathQuillLocalization {
  private bundle: FluentBundle | null = null;
  private requestedLanguage: string = 'en';
  private resolvedLanguage: string = 'en';
  private bundleCache: Map<string, FluentBundle> = new Map();

  constructor(language: string = 'en') {
    this.setLanguage(language);
  }

  setLanguage(language: string): void {
    this.requestedLanguage = language;

    // Resolve the language to the actual language that will be loaded
    const resolvedLanguage = getResolvedLanguage(language);
    this.resolvedLanguage = resolvedLanguage;

    // Check cache first (use resolved language for caching)
    if (this.bundleCache.has(resolvedLanguage)) {
      this.bundle = this.bundleCache.get(resolvedLanguage)!;
      if (resolvedLanguage !== language) {
        console.info(
          `Language '${language}' resolved to '${resolvedLanguage}' (cached)`
        );
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
    const bundle = new FluentBundle([language]);

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

  formatMessage(id: string, args?: Record<string, any>): string {
    if (!this.bundle) {
      console.warn('Localization not initialized');
      return id;
    }

    const message = this.bundle.getMessage(id);
    if (!message || !message.value) {
      console.warn(`Missing localization message: ${id}`);
      return id;
    }

    const formatted = this.bundle.formatPattern(message.value, args);
    return formatted;
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

  formatPowerExpression(number: number): string {
    if (number === 2) {
      return this.formatMessage('power-squared');
    } else if (number === 3) {
      return this.formatMessage('power-cubed');
    } else if (number === 0) {
      return this.formatMessage('power-zero');
    } else {
      return this.formatMessage('power-ordinal', { number });
    }
  }

  formatDirectional(
    direction: 'before' | 'after' | 'beginning-of' | 'end-of'
  ): string {
    return this.formatMessage(direction);
  }

  // Auto operator localization
  formatAutoOperator(operatorName: string): string {
    const key = `auto-operator-${operatorName}`;
    if (this.bundle?.getMessage(key)) {
      return this.formatMessage(key);
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

// Global instance
let mathQuillLocalization: MathQuillLocalization;

// Get or create the global instance
function getLocalization(): MathQuillLocalization {
  if (!mathQuillLocalization) {
    mathQuillLocalization = new MathQuillLocalization();
  }
  return mathQuillLocalization;
}

// Make getLocalization available globally
declare global {
  var getLocalization: typeof getLocalization;
}

// @ts-ignore - Make function globally available
if (typeof window !== 'undefined') {
  (window as any).getLocalization = getLocalization;
} else if (typeof global !== 'undefined') {
  (global as any).getLocalization = getLocalization;
}
