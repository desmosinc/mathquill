var FluentLib;
/******/ (() => {
  // webpackBootstrap
  /******/ var __webpack_modules__ = {
    /***/ 559: /***/ (
      __unused_webpack___webpack_module__,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict';
      // ESM COMPAT FLAG
      __webpack_require__.r(__webpack_exports__);

      // EXPORTS
      __webpack_require__.d(__webpack_exports__, {
        FluentBundle: () => /* reexport */ FluentBundle,
        FluentDateTime: () => /* reexport */ FluentDateTime,
        FluentNone: () => /* reexport */ FluentNone,
        FluentNumber: () => /* reexport */ FluentNumber,
        FluentResource: () => /* reexport */ FluentResource,
        FluentType: () => /* reexport */ FluentType
      }); // ./node_modules/@fluent/bundle/esm/types.js

      /**
       * The `FluentType` class is the base of Fluent's type system.
       *
       * Fluent types wrap JavaScript values and store additional configuration for
       * them, which can then be used in the `toString` method together with a proper
       * `Intl` formatter.
       */
      class FluentType {
        /**
         * Create a `FluentType` instance.
         *
         * @param value The JavaScript value to wrap.
         */
        constructor(value) {
          this.value = value;
        }
        /**
         * Unwrap the raw value stored by this `FluentType`.
         */
        valueOf() {
          return this.value;
        }
      }
      /**
       * A {@link FluentType} representing no correct value.
       */
      class FluentNone extends FluentType {
        /**
         * Create an instance of `FluentNone` with an optional fallback value.
         * @param value The fallback value of this `FluentNone`.
         */
        constructor(value = '???') {
          super(value);
        }
        /**
         * Format this `FluentNone` to the fallback string.
         */
        toString(scope) {
          return `{${this.value}}`;
        }
      }
      /**
       * A {@link FluentType} representing a number.
       *
       * A `FluentNumber` instance stores the number value of the number it
       * represents. It may also store an option bag of options which will be passed
       * to `Intl.NumerFormat` when the `FluentNumber` is formatted to a string.
       */
      class FluentNumber extends FluentType {
        /**
         * Create an instance of `FluentNumber` with options to the
         * `Intl.NumberFormat` constructor.
         *
         * @param value The number value of this `FluentNumber`.
         * @param opts Options which will be passed to `Intl.NumberFormat`.
         */
        constructor(value, opts = {}) {
          super(value);
          this.opts = opts;
        }
        /**
         * Format this `FluentNumber` to a string.
         */
        toString(scope) {
          if (scope) {
            try {
              const nf = scope.memoizeIntlObject(Intl.NumberFormat, this.opts);
              return nf.format(this.value);
            } catch (err) {
              scope.reportError(err);
            }
          }
          return this.value.toString(10);
        }
      }
      /**
       * A {@link FluentType} representing a date and time.
       *
       * A `FluentDateTime` instance stores a Date object, Temporal object, or a number
       * as a numerical timestamp in milliseconds. It may also store an
       * option bag of options which will be passed to `Intl.DateTimeFormat` when the
       * `FluentDateTime` is formatted to a string.
       */
      class FluentDateTime extends FluentType {
        static supportsValue(value) {
          if (typeof value === 'number') return true;
          if (value instanceof Date) return true;
          if (value instanceof FluentType)
            return FluentDateTime.supportsValue(value.valueOf());
          // Temporary workaround to support environments without Temporal
          if ('Temporal' in globalThis) {
            // for TypeScript, which doesn't know about Temporal yet
            const _Temporal = globalThis.Temporal;
            if (
              value instanceof _Temporal.Instant ||
              value instanceof _Temporal.PlainDateTime ||
              value instanceof _Temporal.PlainDate ||
              value instanceof _Temporal.PlainMonthDay ||
              value instanceof _Temporal.PlainTime ||
              value instanceof _Temporal.PlainYearMonth
            ) {
              return true;
            }
          }
          return false;
        }
        /**
         * Create an instance of `FluentDateTime` with options to the
         * `Intl.DateTimeFormat` constructor.
         *
         * @param value The number value of this `FluentDateTime`, in milliseconds.
         * @param opts Options which will be passed to `Intl.DateTimeFormat`.
         */
        constructor(value, opts = {}) {
          // unwrap any FluentType value, but only retain the opts from FluentDateTime
          if (value instanceof FluentDateTime) {
            opts = { ...value.opts, ...opts };
            value = value.value;
          } else if (value instanceof FluentType) {
            value = value.valueOf();
          }
          // Intl.DateTimeFormat defaults to gregorian calendar, but Temporal defaults to iso8601
          if (
            typeof value === 'object' &&
            'calendarId' in value &&
            opts.calendar === undefined
          ) {
            opts = { ...opts, calendar: value.calendarId };
          }
          super(value);
          this.opts = opts;
        }
        [Symbol.toPrimitive](hint) {
          return hint === 'string' ? this.toString() : this.toNumber();
        }
        /**
         * Convert this `FluentDateTime` to a number.
         * Note that this isn't always possible due to the nature of Temporal objects.
         * In such cases, a TypeError will be thrown.
         */
        toNumber() {
          const value = this.value;
          if (typeof value === 'number') return value;
          if (value instanceof Date) return value.getTime();
          if ('epochMilliseconds' in value) {
            return value.epochMilliseconds;
          }
          if ('toZonedDateTime' in value) {
            return value.toZonedDateTime('UTC').epochMilliseconds;
          }
          throw new TypeError('Unwrapping a non-number value as a number');
        }
        /**
         * Format this `FluentDateTime` to a string.
         */
        toString(scope) {
          if (scope) {
            try {
              const dtf = scope.memoizeIntlObject(
                Intl.DateTimeFormat,
                this.opts
              );
              return dtf.format(this.value);
            } catch (err) {
              scope.reportError(err);
            }
          }
          if (typeof this.value === 'number' || this.value instanceof Date) {
            return new Date(this.value).toISOString();
          }
          return this.value.toString();
        }
      } // ./node_modules/@fluent/bundle/esm/resolver.js

      /**
       * The role of the Fluent resolver is to format a `Pattern` to an instance of
       * `FluentValue`. For performance reasons, primitive strings are considered
       * such instances, too.
       *
       * Translations can contain references to other messages or variables,
       * conditional logic in form of select expressions, traits which describe their
       * grammatical features, and can use Fluent builtins which make use of the
       * `Intl` formatters to format numbers and dates into the bundle's languages.
       * See the documentation of the Fluent syntax for more information.
       *
       * In case of errors the resolver will try to salvage as much of the
       * translation as possible. In rare situations where the resolver didn't know
       * how to recover from an error it will return an instance of `FluentNone`.
       *
       * All expressions resolve to an instance of `FluentValue`. The caller should
       * use the `toString` method to convert the instance to a native value.
       *
       * Functions in this file pass around an instance of the `Scope` class, which
       * stores the data required for successful resolution and error recovery.
       */

      /**
       * The maximum number of placeables which can be expanded in a single call to
       * `formatPattern`. The limit protects against the Billion Laughs and Quadratic
       * Blowup attacks. See https://msdn.microsoft.com/en-us/magazine/ee335713.aspx.
       */
      const MAX_PLACEABLES = 100;
      /** Unicode bidi isolation characters. */
      const FSI = '\u2068';
      const PDI = '\u2069';
      /** Helper: match a variant key to the given selector. */
      function match(scope, selector, key) {
        if (key === selector) {
          // Both are strings.
          return true;
        }
        // XXX Consider comparing options too, e.g. minimumFractionDigits.
        if (
          key instanceof FluentNumber &&
          selector instanceof FluentNumber &&
          key.value === selector.value
        ) {
          return true;
        }
        if (selector instanceof FluentNumber && typeof key === 'string') {
          let category = scope
            .memoizeIntlObject(Intl.PluralRules, selector.opts)
            .select(selector.value);
          if (key === category) {
            return true;
          }
        }
        return false;
      }
      /** Helper: resolve the default variant from a list of variants. */
      function getDefault(scope, variants, star) {
        if (variants[star]) {
          return resolvePattern(scope, variants[star].value);
        }
        scope.reportError(new RangeError('No default'));
        return new FluentNone();
      }
      /** Helper: resolve arguments to a call expression. */
      function getArguments(scope, args) {
        const positional = [];
        const named = Object.create(null);
        for (const arg of args) {
          if (arg.type === 'narg') {
            named[arg.name] = resolveExpression(scope, arg.value);
          } else {
            positional.push(resolveExpression(scope, arg));
          }
        }
        return { positional, named };
      }
      /** Resolve an expression to a Fluent type. */
      function resolveExpression(scope, expr) {
        switch (expr.type) {
          case 'str':
            return expr.value;
          case 'num':
            return new FluentNumber(expr.value, {
              minimumFractionDigits: expr.precision
            });
          case 'var':
            return resolveVariableReference(scope, expr);
          case 'mesg':
            return resolveMessageReference(scope, expr);
          case 'term':
            return resolveTermReference(scope, expr);
          case 'func':
            return resolveFunctionReference(scope, expr);
          case 'select':
            return resolveSelectExpression(scope, expr);
          default:
            return new FluentNone();
        }
      }
      /** Resolve a reference to a variable. */
      function resolveVariableReference(scope, { name }) {
        let arg;
        if (scope.params) {
          // We're inside a TermReference. It's OK to reference undefined parameters.
          if (Object.prototype.hasOwnProperty.call(scope.params, name)) {
            arg = scope.params[name];
          } else {
            return new FluentNone(`$${name}`);
          }
        } else if (
          scope.args &&
          Object.prototype.hasOwnProperty.call(scope.args, name)
        ) {
          // We're in the top-level Pattern or inside a MessageReference. Missing
          // variables references produce ReferenceErrors.
          arg = scope.args[name];
        } else {
          scope.reportError(new ReferenceError(`Unknown variable: $${name}`));
          return new FluentNone(`$${name}`);
        }
        // Return early if the argument already is an instance of FluentType.
        if (arg instanceof FluentType) {
          return arg;
        }
        // Convert the argument to a Fluent type.
        switch (typeof arg) {
          case 'string':
            return arg;
          case 'number':
            return new FluentNumber(arg);
          case 'object':
            if (FluentDateTime.supportsValue(arg)) {
              return new FluentDateTime(arg);
            }
          // eslint-disable-next-line no-fallthrough
          default:
            scope.reportError(
              new TypeError(
                `Variable type not supported: $${name}, ${typeof arg}`
              )
            );
            return new FluentNone(`$${name}`);
        }
      }
      /** Resolve a reference to another message. */
      function resolveMessageReference(scope, { name, attr }) {
        const message = scope.bundle._messages.get(name);
        if (!message) {
          scope.reportError(new ReferenceError(`Unknown message: ${name}`));
          return new FluentNone(name);
        }
        if (attr) {
          const attribute = message.attributes[attr];
          if (attribute) {
            return resolvePattern(scope, attribute);
          }
          scope.reportError(new ReferenceError(`Unknown attribute: ${attr}`));
          return new FluentNone(`${name}.${attr}`);
        }
        if (message.value) {
          return resolvePattern(scope, message.value);
        }
        scope.reportError(new ReferenceError(`No value: ${name}`));
        return new FluentNone(name);
      }
      /** Resolve a call to a Term with key-value arguments. */
      function resolveTermReference(scope, { name, attr, args }) {
        const id = `-${name}`;
        const term = scope.bundle._terms.get(id);
        if (!term) {
          scope.reportError(new ReferenceError(`Unknown term: ${id}`));
          return new FluentNone(id);
        }
        if (attr) {
          const attribute = term.attributes[attr];
          if (attribute) {
            // Every TermReference has its own variables.
            scope.params = getArguments(scope, args).named;
            const resolved = resolvePattern(scope, attribute);
            scope.params = null;
            return resolved;
          }
          scope.reportError(new ReferenceError(`Unknown attribute: ${attr}`));
          return new FluentNone(`${id}.${attr}`);
        }
        scope.params = getArguments(scope, args).named;
        const resolved = resolvePattern(scope, term.value);
        scope.params = null;
        return resolved;
      }
      /** Resolve a call to a Function with positional and key-value arguments. */
      function resolveFunctionReference(scope, { name, args }) {
        // Some functions are built-in. Others may be provided by the runtime via
        // the `FluentBundle` constructor.
        let func = scope.bundle._functions[name];
        if (!func) {
          scope.reportError(new ReferenceError(`Unknown function: ${name}()`));
          return new FluentNone(`${name}()`);
        }
        if (typeof func !== 'function') {
          scope.reportError(
            new TypeError(`Function ${name}() is not callable`)
          );
          return new FluentNone(`${name}()`);
        }
        try {
          let resolved = getArguments(scope, args);
          return func(resolved.positional, resolved.named);
        } catch (err) {
          scope.reportError(err);
          return new FluentNone(`${name}()`);
        }
      }
      /** Resolve a select expression to the member object. */
      function resolveSelectExpression(scope, { selector, variants, star }) {
        let sel = resolveExpression(scope, selector);
        if (sel instanceof FluentNone) {
          return getDefault(scope, variants, star);
        }
        // Match the selector against keys of each variant, in order.
        for (const variant of variants) {
          const key = resolveExpression(scope, variant.key);
          if (match(scope, sel, key)) {
            return resolvePattern(scope, variant.value);
          }
        }
        return getDefault(scope, variants, star);
      }
      /** Resolve a pattern (a complex string with placeables). */
      function resolveComplexPattern(scope, ptn) {
        if (scope.dirty.has(ptn)) {
          scope.reportError(new RangeError('Cyclic reference'));
          return new FluentNone();
        }
        // Tag the pattern as dirty for the purpose of the current resolution.
        scope.dirty.add(ptn);
        const result = [];
        // Wrap interpolations with Directional Isolate Formatting characters
        // only when the pattern has more than one element.
        const useIsolating = scope.bundle._useIsolating && ptn.length > 1;
        for (const elem of ptn) {
          if (typeof elem === 'string') {
            result.push(scope.bundle._transform(elem));
            continue;
          }
          scope.placeables++;
          if (scope.placeables > MAX_PLACEABLES) {
            scope.dirty.delete(ptn);
            // This is a fatal error which causes the resolver to instantly bail out
            // on this pattern. The length check protects against excessive memory
            // usage, and throwing protects against eating up the CPU when long
            // placeables are deeply nested.
            throw new RangeError(
              `Too many placeables expanded: ${scope.placeables}, ` +
                `max allowed is ${MAX_PLACEABLES}`
            );
          }
          if (useIsolating) {
            result.push(FSI);
          }
          result.push(resolveExpression(scope, elem).toString(scope));
          if (useIsolating) {
            result.push(PDI);
          }
        }
        scope.dirty.delete(ptn);
        return result.join('');
      }
      /**
       * Resolve a simple or a complex Pattern to a FluentString
       * (which is really the string primitive).
       */
      function resolvePattern(scope, value) {
        // Resolve a simple pattern.
        if (typeof value === 'string') {
          return scope.bundle._transform(value);
        }
        return resolveComplexPattern(scope, value);
      } // ./node_modules/@fluent/bundle/esm/scope.js

      class Scope {
        constructor(bundle, errors, args) {
          /**
           * The Set of patterns already encountered during this resolution.
           * Used to detect and prevent cyclic resolutions.
           * @ignore
           */
          this.dirty = new WeakSet();
          /** A dict of parameters passed to a TermReference. */
          this.params = null;
          /**
           * The running count of placeables resolved so far.
           * Used to detect the Billion Laughs and Quadratic Blowup attacks.
           * @ignore
           */
          this.placeables = 0;
          this.bundle = bundle;
          this.errors = errors;
          this.args = args;
        }
        reportError(error) {
          if (!this.errors || !(error instanceof Error)) {
            throw error;
          }
          this.errors.push(error);
        }
        memoizeIntlObject(ctor, opts) {
          let cache = this.bundle._intls.get(ctor);
          if (!cache) {
            cache = {};
            this.bundle._intls.set(ctor, cache);
          }
          let id = JSON.stringify(opts);
          if (!cache[id]) {
            // @ts-expect-error This is fine.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            cache[id] = new ctor(this.bundle.locales, opts);
          }
          return cache[id];
        }
      } // ./node_modules/@fluent/bundle/esm/builtins.js

      /**
       * @overview
       *
       * The FTL resolver ships with a number of functions built-in.
       *
       * Each function take two arguments:
       *   - args - an array of positional args
       *   - opts - an object of key-value args
       *
       * Arguments to functions are guaranteed to already be instances of
       * `FluentValue`.  Functions must return `FluentValues` as well.
       */

      function values(opts, allowed) {
        const unwrapped = Object.create(null);
        for (const [name, opt] of Object.entries(opts)) {
          if (allowed.includes(name)) {
            unwrapped[name] = opt.valueOf();
          }
        }
        return unwrapped;
      }
      const NUMBER_ALLOWED = [
        'unitDisplay',
        'currencyDisplay',
        'useGrouping',
        'minimumIntegerDigits',
        'minimumFractionDigits',
        'maximumFractionDigits',
        'minimumSignificantDigits',
        'maximumSignificantDigits'
      ];
      /**
       * The implementation of the `NUMBER()` builtin available to translations.
       *
       * Translations may call the `NUMBER()` builtin in order to specify formatting
       * options of a number. For example:
       *
       *     pi = The value of π is {NUMBER($pi, maximumFractionDigits: 2)}.
       *
       * The implementation expects an array of {@link FluentValue | FluentValues} representing the
       * positional arguments, and an object of named {@link FluentValue | FluentValues} representing the
       * named parameters.
       *
       * The following options are recognized:
       *
       *     unitDisplay
       *     currencyDisplay
       *     useGrouping
       *     minimumIntegerDigits
       *     minimumFractionDigits
       *     maximumFractionDigits
       *     minimumSignificantDigits
       *     maximumSignificantDigits
       *
       * Other options are ignored.
       *
       * @param args The positional arguments passed to this `NUMBER()`.
       * @param opts The named argments passed to this `NUMBER()`.
       */
      function NUMBER(args, opts) {
        let arg = args[0];
        if (arg instanceof FluentNone) {
          return new FluentNone(`NUMBER(${arg.valueOf()})`);
        }
        if (arg instanceof FluentNumber) {
          return new FluentNumber(arg.valueOf(), {
            ...arg.opts,
            ...values(opts, NUMBER_ALLOWED)
          });
        }
        if (arg instanceof FluentDateTime) {
          return new FluentNumber(arg.toNumber(), {
            ...values(opts, NUMBER_ALLOWED)
          });
        }
        throw new TypeError('Invalid argument to NUMBER');
      }
      const DATETIME_ALLOWED = [
        'dateStyle',
        'timeStyle',
        'fractionalSecondDigits',
        'dayPeriod',
        'hour12',
        'weekday',
        'era',
        'year',
        'month',
        'day',
        'hour',
        'minute',
        'second',
        'timeZoneName'
      ];
      /**
       * The implementation of the `DATETIME()` builtin available to translations.
       *
       * Translations may call the `DATETIME()` builtin in order to specify
       * formatting options of a number. For example:
       *
       *     now = It's {DATETIME($today, month: "long")}.
       *
       * The implementation expects an array of {@link FluentValue | FluentValues} representing the
       * positional arguments, and an object of named {@link FluentValue | FluentValues} representing the
       * named parameters.
       *
       * The following options are recognized:
       *
       *     dateStyle
       *     timeStyle
       *     fractionalSecondDigits
       *     dayPeriod
       *     hour12
       *     weekday
       *     era
       *     year
       *     month
       *     day
       *     hour
       *     minute
       *     second
       *     timeZoneName
       *
       * Other options are ignored.
       *
       * @param args The positional arguments passed to this `DATETIME()`.
       * @param opts The named argments passed to this `DATETIME()`.
       */
      function DATETIME(args, opts) {
        let arg = args[0];
        if (arg instanceof FluentNone) {
          return new FluentNone(`DATETIME(${arg.valueOf()})`);
        }
        if (arg instanceof FluentDateTime || arg instanceof FluentNumber) {
          return new FluentDateTime(arg, values(opts, DATETIME_ALLOWED));
        }
        throw new TypeError('Invalid argument to DATETIME');
      } // ./node_modules/@fluent/bundle/esm/memoizer.js

      const cache = new Map();
      function getMemoizerForLocale(locales) {
        const stringLocale = Array.isArray(locales)
          ? locales.join(' ')
          : locales;
        let memoizer = cache.get(stringLocale);
        if (memoizer === undefined) {
          memoizer = new Map();
          cache.set(stringLocale, memoizer);
        }
        return memoizer;
      } // ./node_modules/@fluent/bundle/esm/bundle.js

      /**
       * Message bundles are single-language stores of translation resources. They are
       * responsible for formatting message values and attributes to strings.
       */
      class FluentBundle {
        /**
         * Create an instance of `FluentBundle`.
         *
         * @example
         * ```js
         * let bundle = new FluentBundle(["en-US", "en"]);
         *
         * let bundle = new FluentBundle(locales, {useIsolating: false});
         *
         * let bundle = new FluentBundle(locales, {
         *   useIsolating: true,
         *   functions: {
         *     NODE_ENV: () => process.env.NODE_ENV
         *   }
         * });
         * ```
         *
         * @param locales - Used to instantiate `Intl` formatters used by translations.
         * @param options - Optional configuration for the bundle.
         */
        constructor(
          locales,
          { functions, useIsolating = true, transform = (v) => v } = {}
        ) {
          /** @ignore */
          this._terms = new Map();
          /** @ignore */
          this._messages = new Map();
          this.locales = Array.isArray(locales) ? locales : [locales];
          this._functions = {
            NUMBER: NUMBER,
            DATETIME: DATETIME,
            ...functions
          };
          this._useIsolating = useIsolating;
          this._transform = transform;
          this._intls = getMemoizerForLocale(locales);
        }
        /**
         * Check if a message is present in the bundle.
         *
         * @param id - The identifier of the message to check.
         */
        hasMessage(id) {
          return this._messages.has(id);
        }
        /**
         * Return a raw unformatted message object from the bundle.
         *
         * Raw messages are `{value, attributes}` shapes containing translation units
         * called `Patterns`. `Patterns` are implementation-specific; they should be
         * treated as black boxes and formatted with `FluentBundle.formatPattern`.
         *
         * @param id - The identifier of the message to check.
         */
        getMessage(id) {
          return this._messages.get(id);
        }
        /**
         * Add a translation resource to the bundle.
         *
         * @example
         * ```js
         * let res = new FluentResource("foo = Foo");
         * bundle.addResource(res);
         * bundle.getMessage("foo");
         * // → {value: .., attributes: {..}}
         * ```
         *
         * @param res
         * @param options
         */
        addResource(res, { allowOverrides = false } = {}) {
          const errors = [];
          for (let i = 0; i < res.body.length; i++) {
            let entry = res.body[i];
            if (entry.id.startsWith('-')) {
              // Identifiers starting with a dash (-) define terms. Terms are private
              // and cannot be retrieved from FluentBundle.
              if (allowOverrides === false && this._terms.has(entry.id)) {
                errors.push(
                  new Error(
                    `Attempt to override an existing term: "${entry.id}"`
                  )
                );
                continue;
              }
              this._terms.set(entry.id, entry);
            } else {
              if (allowOverrides === false && this._messages.has(entry.id)) {
                errors.push(
                  new Error(
                    `Attempt to override an existing message: "${entry.id}"`
                  )
                );
                continue;
              }
              this._messages.set(entry.id, entry);
            }
          }
          return errors;
        }
        /**
         * Format a `Pattern` to a string.
         *
         * Format a raw `Pattern` into a string. `args` will be used to resolve
         * references to variables passed as arguments to the translation.
         *
         * In case of errors `formatPattern` will try to salvage as much of the
         * translation as possible and will still return a string. For performance
         * reasons, the encountered errors are not returned but instead are appended
         * to the `errors` array passed as the third argument.
         *
         * If `errors` is omitted, the first encountered error will be thrown.
         *
         * @example
         * ```js
         * let errors = [];
         * bundle.addResource(
         *     new FluentResource("hello = Hello, {$name}!"));
         *
         * let hello = bundle.getMessage("hello");
         * if (hello.value) {
         *     bundle.formatPattern(hello.value, {name: "Jane"}, errors);
         *     // Returns "Hello, Jane!" and `errors` is empty.
         *
         *     bundle.formatPattern(hello.value, undefined, errors);
         *     // Returns "Hello, {$name}!" and `errors` is now:
         *     // [<ReferenceError: Unknown variable: name>]
         * }
         * ```
         */
        formatPattern(pattern, args = null, errors = null) {
          // Resolve a simple pattern without creating a scope. No error handling is
          // required; by definition simple patterns don't have placeables.
          if (typeof pattern === 'string') {
            return this._transform(pattern);
          }
          // Resolve a complex pattern.
          let scope = new Scope(this, errors, args);
          try {
            let value = resolveComplexPattern(scope, pattern);
            return value.toString(scope);
          } catch (err) {
            if (scope.errors && err instanceof Error) {
              scope.errors.push(err);
              return new FluentNone().toString(scope);
            }
            throw err;
          }
        }
      } // ./node_modules/@fluent/bundle/esm/resource.js

      // This regex is used to iterate through the beginnings of messages and terms.
      // With the /m flag, the ^ matches at the beginning of every line.
      const RE_MESSAGE_START = /^(-?[a-zA-Z][\w-]*) *= */gm;
      // Both Attributes and Variants are parsed in while loops. These regexes are
      // used to break out of them.
      const RE_ATTRIBUTE_START = /\.([a-zA-Z][\w-]*) *= */y;
      const RE_VARIANT_START = /\*?\[/y;
      const RE_NUMBER_LITERAL = /(-?[0-9]+(?:\.([0-9]+))?)/y;
      const RE_IDENTIFIER = /([a-zA-Z][\w-]*)/y;
      const RE_REFERENCE = /([$-])?([a-zA-Z][\w-]*)(?:\.([a-zA-Z][\w-]*))?/y;
      const RE_FUNCTION_NAME = /^[A-Z][A-Z0-9_-]*$/;
      // A "run" is a sequence of text or string literal characters which don't
      // require any special handling. For TextElements such special characters are: {
      // (starts a placeable), and line breaks which require additional logic to check
      // if the next line is indented. For StringLiterals they are: \ (starts an
      // escape sequence), " (ends the literal), and line breaks which are not allowed
      // in StringLiterals. Note that string runs may be empty; text runs may not.
      const RE_TEXT_RUN = /([^{}\n\r]+)/y;
      const RE_STRING_RUN = /([^\\"\n\r]*)/y;
      // Escape sequences.
      const RE_STRING_ESCAPE = /\\([\\"])/y;
      const RE_UNICODE_ESCAPE = /\\u([a-fA-F0-9]{4})|\\U([a-fA-F0-9]{6})/y;
      // Used for trimming TextElements and indents.
      const RE_LEADING_NEWLINES = /^\n+/;
      const RE_TRAILING_SPACES = / +$/;
      // Used in makeIndent to strip spaces from blank lines and normalize CRLF to LF.
      const RE_BLANK_LINES = / *\r?\n/g;
      // Used in makeIndent to measure the indentation.
      const RE_INDENT = /( *)$/;
      // Common tokens.
      const TOKEN_BRACE_OPEN = /{\s*/y;
      const TOKEN_BRACE_CLOSE = /\s*}/y;
      const TOKEN_BRACKET_OPEN = /\[\s*/y;
      const TOKEN_BRACKET_CLOSE = /\s*] */y;
      const TOKEN_PAREN_OPEN = /\s*\(\s*/y;
      const TOKEN_ARROW = /\s*->\s*/y;
      const TOKEN_COLON = /\s*:\s*/y;
      // Note the optional comma. As a deviation from the Fluent EBNF, the parser
      // doesn't enforce commas between call arguments.
      const TOKEN_COMMA = /\s*,?\s*/y;
      const TOKEN_BLANK = /\s+/y;
      /**
       * Fluent Resource is a structure storing parsed localization entries.
       */
      class FluentResource {
        constructor(source) {
          this.body = [];
          RE_MESSAGE_START.lastIndex = 0;
          let cursor = 0;
          // Iterate over the beginnings of messages and terms to efficiently skip
          // comments and recover from errors.
          while (true) {
            let next = RE_MESSAGE_START.exec(source);
            if (next === null) {
              break;
            }
            cursor = RE_MESSAGE_START.lastIndex;
            try {
              this.body.push(parseMessage(next[1]));
            } catch (err) {
              if (err instanceof SyntaxError) {
                // Don't report any Fluent syntax errors. Skip directly to the
                // beginning of the next message or term.
                continue;
              }
              throw err;
            }
          }
          // The parser implementation is inlined below for performance reasons,
          // as well as for convenience of accessing `source` and `cursor`.
          // The parser focuses on minimizing the number of false negatives at the
          // expense of increasing the risk of false positives. In other words, it
          // aims at parsing valid Fluent messages with a success rate of 100%, but it
          // may also parse a few invalid messages which the reference parser would
          // reject. The parser doesn't perform any validation and may produce entries
          // which wouldn't make sense in the real world. For best results users are
          // advised to validate translations with the fluent-syntax parser
          // pre-runtime.
          // The parser makes an extensive use of sticky regexes which can be anchored
          // to any offset of the source string without slicing it. Errors are thrown
          // to bail out of parsing of ill-formed messages.
          function test(re) {
            re.lastIndex = cursor;
            return re.test(source);
          }
          // Advance the cursor by the char if it matches. May be used as a predicate
          // (was the match found?) or, if errorClass is passed, as an assertion.
          function consumeChar(char, errorClass) {
            if (source[cursor] === char) {
              cursor++;
              return true;
            }
            if (errorClass) {
              throw new errorClass(`Expected ${char}`);
            }
            return false;
          }
          // Advance the cursor by the token if it matches. May be used as a predicate
          // (was the match found?) or, if errorClass is passed, as an assertion.
          function consumeToken(re, errorClass) {
            if (test(re)) {
              cursor = re.lastIndex;
              return true;
            }
            if (errorClass) {
              throw new errorClass(`Expected ${re.toString()}`);
            }
            return false;
          }
          // Execute a regex, advance the cursor, and return all capture groups.
          function match(re) {
            re.lastIndex = cursor;
            let result = re.exec(source);
            if (result === null) {
              throw new SyntaxError(`Expected ${re.toString()}`);
            }
            cursor = re.lastIndex;
            return result;
          }
          // Execute a regex, advance the cursor, and return the capture group.
          function match1(re) {
            return match(re)[1];
          }
          function parseMessage(id) {
            let value = parsePattern();
            let attributes = parseAttributes();
            if (value === null && Object.keys(attributes).length === 0) {
              throw new SyntaxError('Expected message value or attributes');
            }
            return { id, value, attributes };
          }
          function parseAttributes() {
            let attrs = Object.create(null);
            while (test(RE_ATTRIBUTE_START)) {
              let name = match1(RE_ATTRIBUTE_START);
              let value = parsePattern();
              if (value === null) {
                throw new SyntaxError('Expected attribute value');
              }
              attrs[name] = value;
            }
            return attrs;
          }
          function parsePattern() {
            let first;
            // First try to parse any simple text on the same line as the id.
            if (test(RE_TEXT_RUN)) {
              first = match1(RE_TEXT_RUN);
            }
            // If there's a placeable on the first line, parse a complex pattern.
            if (source[cursor] === '{' || source[cursor] === '}') {
              // Re-use the text parsed above, if possible.
              return parsePatternElements(first ? [first] : [], Infinity);
            }
            // RE_TEXT_VALUE stops at newlines. Only continue parsing the pattern if
            // what comes after the newline is indented.
            let indent = parseIndent();
            if (indent) {
              if (first) {
                // If there's text on the first line, the blank block is part of the
                // translation content in its entirety.
                return parsePatternElements([first, indent], indent.length);
              }
              // Otherwise, we're dealing with a block pattern, i.e. a pattern which
              // starts on a new line. Discrad the leading newlines but keep the
              // inline indent; it will be used by the dedentation logic.
              indent.value = trim(indent.value, RE_LEADING_NEWLINES);
              return parsePatternElements([indent], indent.length);
            }
            if (first) {
              // It was just a simple inline text after all.
              return trim(first, RE_TRAILING_SPACES);
            }
            return null;
          }
          // Parse a complex pattern as an array of elements.
          function parsePatternElements(elements = [], commonIndent) {
            while (true) {
              if (test(RE_TEXT_RUN)) {
                elements.push(match1(RE_TEXT_RUN));
                continue;
              }
              if (source[cursor] === '{') {
                elements.push(parsePlaceable());
                continue;
              }
              if (source[cursor] === '}') {
                throw new SyntaxError('Unbalanced closing brace');
              }
              let indent = parseIndent();
              if (indent) {
                elements.push(indent);
                commonIndent = Math.min(commonIndent, indent.length);
                continue;
              }
              break;
            }
            let lastIndex = elements.length - 1;
            let lastElement = elements[lastIndex];
            // Trim the trailing spaces in the last element if it's a TextElement.
            if (typeof lastElement === 'string') {
              elements[lastIndex] = trim(lastElement, RE_TRAILING_SPACES);
            }
            let baked = [];
            for (let element of elements) {
              if (element instanceof Indent) {
                // Dedent indented lines by the maximum common indent.
                element = element.value.slice(
                  0,
                  element.value.length - commonIndent
                );
              }
              if (element) {
                baked.push(element);
              }
            }
            return baked;
          }
          function parsePlaceable() {
            consumeToken(TOKEN_BRACE_OPEN, SyntaxError);
            let selector = parseInlineExpression();
            if (consumeToken(TOKEN_BRACE_CLOSE)) {
              return selector;
            }
            if (consumeToken(TOKEN_ARROW)) {
              let variants = parseVariants();
              consumeToken(TOKEN_BRACE_CLOSE, SyntaxError);
              return {
                type: 'select',
                selector,
                ...variants
              };
            }
            throw new SyntaxError('Unclosed placeable');
          }
          function parseInlineExpression() {
            if (source[cursor] === '{') {
              // It's a nested placeable.
              return parsePlaceable();
            }
            if (test(RE_REFERENCE)) {
              let [, sigil, name, attr = null] = match(RE_REFERENCE);
              if (sigil === '$') {
                return { type: 'var', name };
              }
              if (consumeToken(TOKEN_PAREN_OPEN)) {
                let args = parseArguments();
                if (sigil === '-') {
                  // A parameterized term: -term(...).
                  return { type: 'term', name, attr, args };
                }
                if (RE_FUNCTION_NAME.test(name)) {
                  return { type: 'func', name, args };
                }
                throw new SyntaxError('Function names must be all upper-case');
              }
              if (sigil === '-') {
                // A non-parameterized term: -term.
                return {
                  type: 'term',
                  name,
                  attr,
                  args: []
                };
              }
              return { type: 'mesg', name, attr };
            }
            return parseLiteral();
          }
          function parseArguments() {
            let args = [];
            while (true) {
              switch (source[cursor]) {
                case ')': // End of the argument list.
                  cursor++;
                  return args;
                case undefined: // EOF
                  throw new SyntaxError('Unclosed argument list');
              }
              args.push(parseArgument());
              // Commas between arguments are treated as whitespace.
              consumeToken(TOKEN_COMMA);
            }
          }
          function parseArgument() {
            let expr = parseInlineExpression();
            if (expr.type !== 'mesg') {
              return expr;
            }
            if (consumeToken(TOKEN_COLON)) {
              // The reference is the beginning of a named argument.
              return {
                type: 'narg',
                name: expr.name,
                value: parseLiteral()
              };
            }
            // It's a regular message reference.
            return expr;
          }
          function parseVariants() {
            let variants = [];
            let count = 0;
            let star;
            while (test(RE_VARIANT_START)) {
              if (consumeChar('*')) {
                star = count;
              }
              let key = parseVariantKey();
              let value = parsePattern();
              if (value === null) {
                throw new SyntaxError('Expected variant value');
              }
              variants[count++] = { key, value };
            }
            if (count === 0) {
              return null;
            }
            if (star === undefined) {
              throw new SyntaxError('Expected default variant');
            }
            return { variants, star };
          }
          function parseVariantKey() {
            consumeToken(TOKEN_BRACKET_OPEN, SyntaxError);
            let key;
            if (test(RE_NUMBER_LITERAL)) {
              key = parseNumberLiteral();
            } else {
              key = {
                type: 'str',
                value: match1(RE_IDENTIFIER)
              };
            }
            consumeToken(TOKEN_BRACKET_CLOSE, SyntaxError);
            return key;
          }
          function parseLiteral() {
            if (test(RE_NUMBER_LITERAL)) {
              return parseNumberLiteral();
            }
            if (source[cursor] === '"') {
              return parseStringLiteral();
            }
            throw new SyntaxError('Invalid expression');
          }
          function parseNumberLiteral() {
            let [, value, fraction = ''] = match(RE_NUMBER_LITERAL);
            let precision = fraction.length;
            return {
              type: 'num',
              value: parseFloat(value),
              precision
            };
          }
          function parseStringLiteral() {
            consumeChar('"', SyntaxError);
            let value = '';
            while (true) {
              value += match1(RE_STRING_RUN);
              if (source[cursor] === '\\') {
                value += parseEscapeSequence();
                continue;
              }
              if (consumeChar('"')) {
                return { type: 'str', value };
              }
              // We've reached an EOL of EOF.
              throw new SyntaxError('Unclosed string literal');
            }
          }
          // Unescape known escape sequences.
          function parseEscapeSequence() {
            if (test(RE_STRING_ESCAPE)) {
              return match1(RE_STRING_ESCAPE);
            }
            if (test(RE_UNICODE_ESCAPE)) {
              let [, codepoint4, codepoint6] = match(RE_UNICODE_ESCAPE);
              let codepoint = parseInt(codepoint4 || codepoint6, 16);
              return codepoint <= 0xd7ff || 0xe000 <= codepoint
                ? // It's a Unicode scalar value.
                  String.fromCodePoint(codepoint)
                : // Lonely surrogates can cause trouble when the parsing result is
                  // saved using UTF-8. Use U+FFFD REPLACEMENT CHARACTER instead.
                  '�';
            }
            throw new SyntaxError('Unknown escape sequence');
          }
          // Parse blank space. Return it if it looks like indent before a pattern
          // line. Skip it othwerwise.
          function parseIndent() {
            let start = cursor;
            consumeToken(TOKEN_BLANK);
            // Check the first non-blank character after the indent.
            switch (source[cursor]) {
              case '.':
              case '[':
              case '*':
              case '}':
              case undefined: // EOF
                // A special character. End the Pattern.
                return false;
              case '{':
                // Placeables don't require indentation (in EBNF: block-placeable).
                // Continue the Pattern.
                return makeIndent(source.slice(start, cursor));
            }
            // If the first character on the line is not one of the special characters
            // listed above, it's a regular text character. Check if there's at least
            // one space of indent before it.
            if (source[cursor - 1] === ' ') {
              // It's an indented text character (in EBNF: indented-char). Continue
              // the Pattern.
              return makeIndent(source.slice(start, cursor));
            }
            // A not-indented text character is likely the identifier of the next
            // message. End the Pattern.
            return false;
          }
          // Trim blanks in text according to the given regex.
          function trim(text, re) {
            return text.replace(re, '');
          }
          // Normalize a blank block and extract the indent details.
          function makeIndent(blank) {
            let value = blank.replace(RE_BLANK_LINES, '\n');
            let length = RE_INDENT.exec(blank)[1].length;
            return new Indent(value, length);
          }
        }
      }
      class Indent {
        constructor(value, length) {
          this.value = value;
          this.length = length;
        }
      } // ./node_modules/@fluent/bundle/esm/index.js
      /**
       * A JavaScript implementation of Project Fluent, a localization
       * framework designed to unleash the expressive power of the natural language.
       *
       * @module
       */

      /***/
    },

    /***/ 583: /***/ (
      module,
      __unused_webpack_exports,
      __webpack_require__
    ) => {
      const { FluentBundle, FluentResource } = __webpack_require__(559);
      const { parse } = __webpack_require__(883);
      module.exports = { FluentBundle, FluentResource, parseResource: parse };

      /***/
    },

    /***/ 883: /***/ (
      __unused_webpack___webpack_module__,
      __webpack_exports__,
      __webpack_require__
    ) => {
      'use strict';
      // ESM COMPAT FLAG
      __webpack_require__.r(__webpack_exports__);

      // EXPORTS
      __webpack_require__.d(__webpack_exports__, {
        Annotation: () => /* reexport */ Annotation,
        Attribute: () => /* reexport */ Attribute,
        BaseComment: () => /* reexport */ BaseComment,
        BaseLiteral: () => /* reexport */ BaseLiteral,
        BaseNode: () => /* reexport */ BaseNode,
        CallArguments: () => /* reexport */ CallArguments,
        Comment: () => /* reexport */ ast_Comment,
        FluentParser: () => /* reexport */ FluentParser,
        FluentSerializer: () => /* reexport */ FluentSerializer,
        FunctionReference: () => /* reexport */ FunctionReference,
        GroupComment: () => /* reexport */ GroupComment,
        Identifier: () => /* reexport */ Identifier,
        Junk: () => /* reexport */ Junk,
        Message: () => /* reexport */ Message,
        MessageReference: () => /* reexport */ MessageReference,
        NamedArgument: () => /* reexport */ NamedArgument,
        NumberLiteral: () => /* reexport */ NumberLiteral,
        ParseError: () => /* reexport */ ParseError,
        Pattern: () => /* reexport */ Pattern,
        Placeable: () => /* reexport */ Placeable,
        Resource: () => /* reexport */ Resource,
        ResourceComment: () => /* reexport */ ResourceComment,
        SelectExpression: () => /* reexport */ SelectExpression,
        Span: () => /* reexport */ Span,
        StringLiteral: () => /* reexport */ StringLiteral,
        SyntaxNode: () => /* reexport */ SyntaxNode,
        Term: () => /* reexport */ Term,
        TermReference: () => /* reexport */ TermReference,
        TextElement: () => /* reexport */ TextElement,
        Transformer: () => /* reexport */ Transformer,
        VariableReference: () => /* reexport */ VariableReference,
        Variant: () => /* reexport */ Variant,
        Visitor: () => /* reexport */ Visitor,
        columnOffset: () => /* binding */ columnOffset,
        lineOffset: () => /* binding */ lineOffset,
        parse: () => /* binding */ parse,
        serialize: () => /* binding */ serialize,
        serializeExpression: () => /* reexport */ serializeExpression,
        serializeVariantKey: () => /* reexport */ serializeVariantKey
      }); // ./node_modules/@fluent/syntax/esm/ast.js

      /**
       * Base class for all Fluent AST nodes.
       *
       * All productions described in the ASDL subclass BaseNode, including Span and
       * Annotation.
       *
       */
      class BaseNode {
        equals(other, ignoredFields = ['span']) {
          const thisKeys = new Set(Object.keys(this));
          const otherKeys = new Set(Object.keys(other));
          if (ignoredFields) {
            for (const fieldName of ignoredFields) {
              thisKeys.delete(fieldName);
              otherKeys.delete(fieldName);
            }
          }
          if (thisKeys.size !== otherKeys.size) {
            return false;
          }
          for (const fieldName of thisKeys) {
            if (!otherKeys.has(fieldName)) {
              return false;
            }
            const thisVal = this[fieldName];
            const otherVal = other[fieldName];
            if (typeof thisVal !== typeof otherVal) {
              return false;
            }
            if (thisVal instanceof Array && otherVal instanceof Array) {
              if (thisVal.length !== otherVal.length) {
                return false;
              }
              for (let i = 0; i < thisVal.length; ++i) {
                if (!scalarsEqual(thisVal[i], otherVal[i], ignoredFields)) {
                  return false;
                }
              }
            } else if (!scalarsEqual(thisVal, otherVal, ignoredFields)) {
              return false;
            }
          }
          return true;
        }
        clone() {
          function visit(value) {
            if (value instanceof BaseNode) {
              return value.clone();
            }
            if (Array.isArray(value)) {
              return value.map(visit);
            }
            return value;
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          const clone = Object.create(this.constructor.prototype);
          for (const prop of Object.keys(this)) {
            clone[prop] = visit(this[prop]);
          }
          return clone;
        }
      }
      function scalarsEqual(thisVal, otherVal, ignoredFields) {
        if (thisVal instanceof BaseNode && otherVal instanceof BaseNode) {
          return thisVal.equals(otherVal, ignoredFields);
        }
        return thisVal === otherVal;
      }
      /**
       * Base class for AST nodes which can have Spans.
       */
      class SyntaxNode extends BaseNode {
        /** @ignore */
        addSpan(start, end) {
          this.span = new Span(start, end);
        }
      }
      class Resource extends SyntaxNode {
        constructor(body = []) {
          super();
          this.type = 'Resource';
          this.body = body;
        }
      }
      class Message extends SyntaxNode {
        constructor(id, value = null, attributes = [], comment = null) {
          super();
          this.type = 'Message';
          this.id = id;
          this.value = value;
          this.attributes = attributes;
          this.comment = comment;
        }
      }
      class Term extends SyntaxNode {
        constructor(id, value, attributes = [], comment = null) {
          super();
          this.type = 'Term';
          this.id = id;
          this.value = value;
          this.attributes = attributes;
          this.comment = comment;
        }
      }
      class Pattern extends SyntaxNode {
        constructor(elements) {
          super();
          this.type = 'Pattern';
          this.elements = elements;
        }
      }
      class TextElement extends SyntaxNode {
        constructor(value) {
          super();
          this.type = 'TextElement';
          this.value = value;
        }
      }
      class Placeable extends SyntaxNode {
        constructor(expression) {
          super();
          this.type = 'Placeable';
          this.expression = expression;
        }
      }
      // An abstract base class for Literals.
      class BaseLiteral extends SyntaxNode {
        constructor(value) {
          super();
          // The "value" field contains the exact contents of the literal,
          // character-for-character.
          this.value = value;
        }
      }
      class StringLiteral extends BaseLiteral {
        constructor() {
          super(...arguments);
          this.type = 'StringLiteral';
        }
        parse() {
          // Backslash backslash, backslash double quote, uHHHH, UHHHHHH.
          const KNOWN_ESCAPES =
            /(?:\\\\|\\"|\\u([0-9a-fA-F]{4})|\\U([0-9a-fA-F]{6}))/g;
          function fromEscapeSequence(match, codepoint4, codepoint6) {
            switch (match) {
              case '\\\\':
                return '\\';
              case '\\"':
                return '"';
              default: {
                let codepoint = parseInt(codepoint4 || codepoint6, 16);
                if (codepoint <= 0xd7ff || 0xe000 <= codepoint) {
                  // It's a Unicode scalar value.
                  return String.fromCodePoint(codepoint);
                }
                // Escape sequences reresenting surrogate code points are
                // well-formed but invalid in Fluent. Replace them with U+FFFD
                // REPLACEMENT CHARACTER.
                return '�';
              }
            }
          }
          let value = this.value.replace(KNOWN_ESCAPES, fromEscapeSequence);
          return { value };
        }
      }
      class NumberLiteral extends BaseLiteral {
        constructor() {
          super(...arguments);
          this.type = 'NumberLiteral';
        }
        parse() {
          let value = parseFloat(this.value);
          let decimalPos = this.value.indexOf('.');
          let precision =
            decimalPos > 0 ? this.value.length - decimalPos - 1 : 0;
          return { value, precision };
        }
      }
      class MessageReference extends SyntaxNode {
        constructor(id, attribute = null) {
          super();
          this.type = 'MessageReference';
          this.id = id;
          this.attribute = attribute;
        }
      }
      class TermReference extends SyntaxNode {
        constructor(id, attribute = null, args = null) {
          super();
          this.type = 'TermReference';
          this.id = id;
          this.attribute = attribute;
          this.arguments = args;
        }
      }
      class VariableReference extends SyntaxNode {
        constructor(id) {
          super();
          this.type = 'VariableReference';
          this.id = id;
        }
      }
      class FunctionReference extends SyntaxNode {
        constructor(id, args) {
          super();
          this.type = 'FunctionReference';
          this.id = id;
          this.arguments = args;
        }
      }
      class SelectExpression extends SyntaxNode {
        constructor(selector, variants) {
          super();
          this.type = 'SelectExpression';
          this.selector = selector;
          this.variants = variants;
        }
      }
      class CallArguments extends SyntaxNode {
        constructor(positional = [], named = []) {
          super();
          this.type = 'CallArguments';
          this.positional = positional;
          this.named = named;
        }
      }
      class Attribute extends SyntaxNode {
        constructor(id, value) {
          super();
          this.type = 'Attribute';
          this.id = id;
          this.value = value;
        }
      }
      class Variant extends SyntaxNode {
        constructor(key, value, def) {
          super();
          this.type = 'Variant';
          this.key = key;
          this.value = value;
          this.default = def;
        }
      }
      class NamedArgument extends SyntaxNode {
        constructor(name, value) {
          super();
          this.type = 'NamedArgument';
          this.name = name;
          this.value = value;
        }
      }
      class Identifier extends SyntaxNode {
        constructor(name) {
          super();
          this.type = 'Identifier';
          this.name = name;
        }
      }
      class BaseComment extends SyntaxNode {
        constructor(content) {
          super();
          this.content = content;
        }
      }
      class ast_Comment extends BaseComment {
        constructor() {
          super(...arguments);
          this.type = 'Comment';
        }
      }
      class GroupComment extends BaseComment {
        constructor() {
          super(...arguments);
          this.type = 'GroupComment';
        }
      }
      class ResourceComment extends BaseComment {
        constructor() {
          super(...arguments);
          this.type = 'ResourceComment';
        }
      }
      class Junk extends SyntaxNode {
        constructor(content) {
          super();
          this.type = 'Junk';
          this.annotations = [];
          this.content = content;
        }
        addAnnotation(annotation) {
          this.annotations.push(annotation);
        }
      }
      class Span extends BaseNode {
        constructor(start, end) {
          super();
          this.type = 'Span';
          this.start = start;
          this.end = end;
        }
      }
      class Annotation extends SyntaxNode {
        constructor(code, args = [], message) {
          super();
          this.type = 'Annotation';
          this.code = code;
          this.arguments = args;
          this.message = message;
        }
      } // ./node_modules/@fluent/syntax/esm/errors.js

      /* eslint-disable @typescript-eslint/restrict-template-expressions */
      class ParseError extends Error {
        constructor(code, ...args) {
          super();
          this.code = code;
          this.args = args;
          this.message = getErrorMessage(code, args);
        }
      }
      /* eslint-disable complexity */
      function getErrorMessage(code, args) {
        switch (code) {
          case 'E0001':
            return 'Generic error';
          case 'E0002':
            return 'Expected an entry start';
          case 'E0003': {
            const [token] = args;
            return `Expected token: "${token}"`;
          }
          case 'E0004': {
            const [range] = args;
            return `Expected a character from range: "${range}"`;
          }
          case 'E0005': {
            const [id] = args;
            return `Expected message "${id}" to have a value or attributes`;
          }
          case 'E0006': {
            const [id] = args;
            return `Expected term "-${id}" to have a value`;
          }
          case 'E0007':
            return 'Keyword cannot end with a whitespace';
          case 'E0008':
            return 'The callee has to be an upper-case identifier or a term';
          case 'E0009':
            return 'The argument name has to be a simple identifier';
          case 'E0010':
            return 'Expected one of the variants to be marked as default (*)';
          case 'E0011':
            return 'Expected at least one variant after "->"';
          case 'E0012':
            return 'Expected value';
          case 'E0013':
            return 'Expected variant key';
          case 'E0014':
            return 'Expected literal';
          case 'E0015':
            return 'Only one variant can be marked as default (*)';
          case 'E0016':
            return 'Message references cannot be used as selectors';
          case 'E0017':
            return 'Terms cannot be used as selectors';
          case 'E0018':
            return 'Attributes of messages cannot be used as selectors';
          case 'E0019':
            return 'Attributes of terms cannot be used as placeables';
          case 'E0020':
            return 'Unterminated string expression';
          case 'E0021':
            return 'Positional arguments must not follow named arguments';
          case 'E0022':
            return 'Named arguments must be unique';
          case 'E0024':
            return 'Cannot access variants of a message.';
          case 'E0025': {
            const [char] = args;
            return `Unknown escape sequence: \\${char}.`;
          }
          case 'E0026': {
            const [sequence] = args;
            return `Invalid Unicode escape sequence: ${sequence}.`;
          }
          case 'E0027':
            return 'Unbalanced closing brace in TextElement.';
          case 'E0028':
            return 'Expected an inline expression';
          case 'E0029':
            return 'Expected simple expression as selector';
          default:
            return code;
        }
      } // ./node_modules/@fluent/syntax/esm/stream.js

      /* eslint no-magic-numbers: "off" */

      class ParserStream {
        constructor(string) {
          this.string = string;
          this.index = 0;
          this.peekOffset = 0;
        }
        charAt(offset) {
          // When the cursor is at CRLF, return LF but don't move the cursor.
          // The cursor still points to the EOL position, which in this case is the
          // beginning of the compound CRLF sequence. This ensures slices of
          // [inclusive, exclusive) continue to work properly.
          if (
            this.string[offset] === '\r' &&
            this.string[offset + 1] === '\n'
          ) {
            return '\n';
          }
          return this.string[offset];
        }
        currentChar() {
          return this.charAt(this.index);
        }
        currentPeek() {
          return this.charAt(this.index + this.peekOffset);
        }
        next() {
          this.peekOffset = 0;
          // Skip over the CRLF as if it was a single character.
          if (
            this.string[this.index] === '\r' &&
            this.string[this.index + 1] === '\n'
          ) {
            this.index++;
          }
          this.index++;
          return this.string[this.index];
        }
        peek() {
          // Skip over the CRLF as if it was a single character.
          if (
            this.string[this.index + this.peekOffset] === '\r' &&
            this.string[this.index + this.peekOffset + 1] === '\n'
          ) {
            this.peekOffset++;
          }
          this.peekOffset++;
          return this.string[this.index + this.peekOffset];
        }
        resetPeek(offset = 0) {
          this.peekOffset = offset;
        }
        skipToPeek() {
          this.index += this.peekOffset;
          this.peekOffset = 0;
        }
      }
      const EOL = '\n';
      const EOF = undefined;
      const SPECIAL_LINE_START_CHARS = ['}', '.', '[', '*'];
      class FluentParserStream extends ParserStream {
        peekBlankInline() {
          const start = this.index + this.peekOffset;
          while (this.currentPeek() === ' ') {
            this.peek();
          }
          return this.string.slice(start, this.index + this.peekOffset);
        }
        skipBlankInline() {
          const blank = this.peekBlankInline();
          this.skipToPeek();
          return blank;
        }
        peekBlankBlock() {
          let blank = '';
          while (true) {
            const lineStart = this.peekOffset;
            this.peekBlankInline();
            if (this.currentPeek() === EOL) {
              blank += EOL;
              this.peek();
              continue;
            }
            if (this.currentPeek() === EOF) {
              // Treat the blank line at EOF as a blank block.
              return blank;
            }
            // Any other char; reset to column 1 on this line.
            this.resetPeek(lineStart);
            return blank;
          }
        }
        skipBlankBlock() {
          const blank = this.peekBlankBlock();
          this.skipToPeek();
          return blank;
        }
        peekBlank() {
          while (this.currentPeek() === ' ' || this.currentPeek() === EOL) {
            this.peek();
          }
        }
        skipBlank() {
          this.peekBlank();
          this.skipToPeek();
        }
        expectChar(ch) {
          if (this.currentChar() === ch) {
            this.next();
            return;
          }
          throw new ParseError('E0003', ch);
        }
        expectLineEnd() {
          if (this.currentChar() === EOF) {
            // EOF is a valid line end in Fluent.
            return;
          }
          if (this.currentChar() === EOL) {
            this.next();
            return;
          }
          // Unicode Character 'SYMBOL FOR NEWLINE' (U+2424)
          throw new ParseError('E0003', '\u2424');
        }
        takeChar(f) {
          const ch = this.currentChar();
          if (ch === EOF) {
            return EOF;
          }
          if (f(ch)) {
            this.next();
            return ch;
          }
          return null;
        }
        isCharIdStart(ch) {
          if (ch === EOF) {
            return false;
          }
          const cc = ch.charCodeAt(0);
          return (
            (cc >= 97 && cc <= 122) || // a-z
            (cc >= 65 && cc <= 90)
          ); // A-Z
        }
        isIdentifierStart() {
          return this.isCharIdStart(this.currentPeek());
        }
        isNumberStart() {
          const ch =
            this.currentChar() === '-' ? this.peek() : this.currentChar();
          if (ch === EOF) {
            this.resetPeek();
            return false;
          }
          const cc = ch.charCodeAt(0);
          const isDigit = cc >= 48 && cc <= 57; // 0-9
          this.resetPeek();
          return isDigit;
        }
        isCharPatternContinuation(ch) {
          if (ch === EOF) {
            return false;
          }
          return !SPECIAL_LINE_START_CHARS.includes(ch);
        }
        isValueStart() {
          // Inline Patterns may start with any char.
          const ch = this.currentPeek();
          return ch !== EOL && ch !== EOF;
        }
        isValueContinuation() {
          const column1 = this.peekOffset;
          this.peekBlankInline();
          if (this.currentPeek() === '{') {
            this.resetPeek(column1);
            return true;
          }
          if (this.peekOffset - column1 === 0) {
            return false;
          }
          if (this.isCharPatternContinuation(this.currentPeek())) {
            this.resetPeek(column1);
            return true;
          }
          return false;
        }
        /**
         * @param level - -1: any, 0: comment, 1: group comment, 2: resource comment
         */
        isNextLineComment(level = -1) {
          if (this.currentChar() !== EOL) {
            return false;
          }
          let i = 0;
          while (i <= level || (level === -1 && i < 3)) {
            if (this.peek() !== '#') {
              if (i <= level && level !== -1) {
                this.resetPeek();
                return false;
              }
              break;
            }
            i++;
          }
          // The first char after #, ## or ###.
          const ch = this.peek();
          if (ch === ' ' || ch === EOL) {
            this.resetPeek();
            return true;
          }
          this.resetPeek();
          return false;
        }
        isVariantStart() {
          const currentPeekOffset = this.peekOffset;
          if (this.currentPeek() === '*') {
            this.peek();
          }
          if (this.currentPeek() === '[') {
            this.resetPeek(currentPeekOffset);
            return true;
          }
          this.resetPeek(currentPeekOffset);
          return false;
        }
        isAttributeStart() {
          return this.currentPeek() === '.';
        }
        skipToNextEntryStart(junkStart) {
          let lastNewline = this.string.lastIndexOf(EOL, this.index);
          if (junkStart < lastNewline) {
            // Last seen newline is _after_ the junk start. It's safe to rewind
            // without the risk of resuming at the same broken entry.
            this.index = lastNewline;
          }
          while (this.currentChar()) {
            // We're only interested in beginnings of line.
            if (this.currentChar() !== EOL) {
              this.next();
              continue;
            }
            // Break if the first char in this line looks like an entry start.
            const first = this.next();
            if (this.isCharIdStart(first) || first === '-' || first === '#') {
              break;
            }
          }
        }
        takeIDStart() {
          if (this.isCharIdStart(this.currentChar())) {
            const ret = this.currentChar();
            this.next();
            return ret;
          }
          throw new ParseError('E0004', 'a-zA-Z');
        }
        takeIDChar() {
          const closure = (ch) => {
            const cc = ch.charCodeAt(0);
            return (
              (cc >= 97 && cc <= 122) || // a-z
              (cc >= 65 && cc <= 90) || // A-Z
              (cc >= 48 && cc <= 57) || // 0-9
              cc === 95 ||
              cc === 45
            ); // _-
          };
          return this.takeChar(closure);
        }
        takeDigit() {
          const closure = (ch) => {
            const cc = ch.charCodeAt(0);
            return cc >= 48 && cc <= 57; // 0-9
          };
          return this.takeChar(closure);
        }
        takeHexDigit() {
          const closure = (ch) => {
            const cc = ch.charCodeAt(0);
            return (
              (cc >= 48 && cc <= 57) || // 0-9
              (cc >= 65 && cc <= 70) || // A-F
              (cc >= 97 && cc <= 102)
            ); // a-f
          };
          return this.takeChar(closure);
        }
      } // ./node_modules/@fluent/syntax/esm/parser.js

      /*  eslint no-magic-numbers: [0]  */

      const trailingWSRe = /[ \n\r]+$/;
      function withSpan(fn) {
        return function (ps, ...args) {
          if (!this.withSpans) {
            return fn.call(this, ps, ...args);
          }
          const start = ps.index;
          const node = fn.call(this, ps, ...args);
          // Don't re-add the span if the node already has it. This may happen when
          // one decorated function calls another decorated function.
          if (node.span) {
            return node;
          }
          const end = ps.index;
          node.addSpan(start, end);
          return node;
        };
      }
      class FluentParser {
        constructor({ withSpans = true } = {}) {
          this.withSpans = withSpans;
          // Poor man's decorators.
          /* eslint-disable @typescript-eslint/unbound-method */
          this.getComment = withSpan(this.getComment);
          this.getMessage = withSpan(this.getMessage);
          this.getTerm = withSpan(this.getTerm);
          this.getAttribute = withSpan(this.getAttribute);
          this.getIdentifier = withSpan(this.getIdentifier);
          this.getVariant = withSpan(this.getVariant);
          this.getNumber = withSpan(this.getNumber);
          this.getPattern = withSpan(this.getPattern);
          this.getTextElement = withSpan(this.getTextElement);
          this.getPlaceable = withSpan(this.getPlaceable);
          this.getExpression = withSpan(this.getExpression);
          this.getInlineExpression = withSpan(this.getInlineExpression);
          this.getCallArgument = withSpan(this.getCallArgument);
          this.getCallArguments = withSpan(this.getCallArguments);
          this.getString = withSpan(this.getString);
          this.getLiteral = withSpan(this.getLiteral);
          this.getComment = withSpan(this.getComment);
          /* eslint-enable @typescript-eslint/unbound-method */
        }
        parse(source) {
          const ps = new FluentParserStream(source);
          ps.skipBlankBlock();
          const entries = [];
          let lastComment = null;
          while (ps.currentChar()) {
            const entry = this.getEntryOrJunk(ps);
            const blankLines = ps.skipBlankBlock();
            // Regular Comments require special logic. Comments may be attached to
            // Messages or Terms if they are followed immediately by them. However
            // they should parse as standalone when they're followed by Junk.
            // Consequently, we only attach Comments once we know that the Message
            // or the Term parsed successfully.
            if (
              entry instanceof ast_Comment &&
              blankLines.length === 0 &&
              ps.currentChar()
            ) {
              // Stash the comment and decide what to do with it in the next pass.
              lastComment = entry;
              continue;
            }
            if (lastComment) {
              if (entry instanceof Message || entry instanceof Term) {
                entry.comment = lastComment;
                if (this.withSpans) {
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  entry.span.start = entry.comment.span.start;
                }
              } else {
                entries.push(lastComment);
              }
              // In either case, the stashed comment has been dealt with; clear it.
              lastComment = null;
            }
            // No special logic for other types of entries.
            entries.push(entry);
          }
          const res = new Resource(entries);
          if (this.withSpans) {
            res.addSpan(0, ps.index);
          }
          return res;
        }
        /**
         * Parse the first Message or Term in `source`.
         *
         * Skip all encountered comments and start parsing at the first Message or
         * Term start. Return Junk if the parsing is not successful.
         *
         * Preceding comments are ignored unless they contain syntax errors
         * themselves, in which case Junk for the invalid comment is returned.
         */
        parseEntry(source) {
          const ps = new FluentParserStream(source);
          ps.skipBlankBlock();
          while (ps.currentChar() === '#') {
            const skipped = this.getEntryOrJunk(ps);
            if (skipped instanceof Junk) {
              // Don't skip Junk comments.
              return skipped;
            }
            ps.skipBlankBlock();
          }
          return this.getEntryOrJunk(ps);
        }
        getEntryOrJunk(ps) {
          const entryStartPos = ps.index;
          try {
            const entry = this.getEntry(ps);
            ps.expectLineEnd();
            return entry;
          } catch (err) {
            if (!(err instanceof ParseError)) {
              throw err;
            }
            let errorIndex = ps.index;
            ps.skipToNextEntryStart(entryStartPos);
            const nextEntryStart = ps.index;
            if (nextEntryStart < errorIndex) {
              // The position of the error must be inside of the Junk's span.
              errorIndex = nextEntryStart;
            }
            // Create a Junk instance
            const slice = ps.string.substring(entryStartPos, nextEntryStart);
            const junk = new Junk(slice);
            if (this.withSpans) {
              junk.addSpan(entryStartPos, nextEntryStart);
            }
            const annot = new Annotation(err.code, err.args, err.message);
            annot.addSpan(errorIndex, errorIndex);
            junk.addAnnotation(annot);
            return junk;
          }
        }
        getEntry(ps) {
          if (ps.currentChar() === '#') {
            return this.getComment(ps);
          }
          if (ps.currentChar() === '-') {
            return this.getTerm(ps);
          }
          if (ps.isIdentifierStart()) {
            return this.getMessage(ps);
          }
          throw new ParseError('E0002');
        }
        getComment(ps) {
          // 0 - comment
          // 1 - group comment
          // 2 - resource comment
          let level = -1;
          let content = '';
          while (true) {
            let i = -1;
            while (ps.currentChar() === '#' && i < (level === -1 ? 2 : level)) {
              ps.next();
              i++;
            }
            if (level === -1) {
              level = i;
            }
            if (ps.currentChar() !== EOL) {
              ps.expectChar(' ');
              let ch;
              while ((ch = ps.takeChar((x) => x !== EOL))) {
                content += ch;
              }
            }
            if (ps.isNextLineComment(level)) {
              content += ps.currentChar();
              ps.next();
            } else {
              break;
            }
          }
          let Comment;
          switch (level) {
            case 0:
              Comment = ast_Comment;
              break;
            case 1:
              Comment = GroupComment;
              break;
            default:
              Comment = ResourceComment;
          }
          return new Comment(content);
        }
        getMessage(ps) {
          const id = this.getIdentifier(ps);
          ps.skipBlankInline();
          ps.expectChar('=');
          const value = this.maybeGetPattern(ps);
          const attrs = this.getAttributes(ps);
          if (value === null && attrs.length === 0) {
            throw new ParseError('E0005', id.name);
          }
          return new Message(id, value, attrs);
        }
        getTerm(ps) {
          ps.expectChar('-');
          const id = this.getIdentifier(ps);
          ps.skipBlankInline();
          ps.expectChar('=');
          const value = this.maybeGetPattern(ps);
          if (value === null) {
            throw new ParseError('E0006', id.name);
          }
          const attrs = this.getAttributes(ps);
          return new Term(id, value, attrs);
        }
        getAttribute(ps) {
          ps.expectChar('.');
          const key = this.getIdentifier(ps);
          ps.skipBlankInline();
          ps.expectChar('=');
          const value = this.maybeGetPattern(ps);
          if (value === null) {
            throw new ParseError('E0012');
          }
          return new Attribute(key, value);
        }
        getAttributes(ps) {
          const attrs = [];
          ps.peekBlank();
          while (ps.isAttributeStart()) {
            ps.skipToPeek();
            const attr = this.getAttribute(ps);
            attrs.push(attr);
            ps.peekBlank();
          }
          return attrs;
        }
        getIdentifier(ps) {
          let name = ps.takeIDStart();
          let ch;
          while ((ch = ps.takeIDChar())) {
            name += ch;
          }
          return new Identifier(name);
        }
        getVariantKey(ps) {
          const ch = ps.currentChar();
          if (ch === EOF) {
            throw new ParseError('E0013');
          }
          const cc = ch.charCodeAt(0);
          if ((cc >= 48 && cc <= 57) || cc === 45) {
            // 0-9, -
            return this.getNumber(ps);
          }
          return this.getIdentifier(ps);
        }
        getVariant(ps, hasDefault = false) {
          let defaultIndex = false;
          if (ps.currentChar() === '*') {
            if (hasDefault) {
              throw new ParseError('E0015');
            }
            ps.next();
            defaultIndex = true;
          }
          ps.expectChar('[');
          ps.skipBlank();
          const key = this.getVariantKey(ps);
          ps.skipBlank();
          ps.expectChar(']');
          const value = this.maybeGetPattern(ps);
          if (value === null) {
            throw new ParseError('E0012');
          }
          return new Variant(key, value, defaultIndex);
        }
        getVariants(ps) {
          const variants = [];
          let hasDefault = false;
          ps.skipBlank();
          while (ps.isVariantStart()) {
            const variant = this.getVariant(ps, hasDefault);
            if (variant.default) {
              hasDefault = true;
            }
            variants.push(variant);
            ps.expectLineEnd();
            ps.skipBlank();
          }
          if (variants.length === 0) {
            throw new ParseError('E0011');
          }
          if (!hasDefault) {
            throw new ParseError('E0010');
          }
          return variants;
        }
        getDigits(ps) {
          let num = '';
          let ch;
          while ((ch = ps.takeDigit())) {
            num += ch;
          }
          if (num.length === 0) {
            throw new ParseError('E0004', '0-9');
          }
          return num;
        }
        getNumber(ps) {
          let value = '';
          if (ps.currentChar() === '-') {
            ps.next();
            value += `-${this.getDigits(ps)}`;
          } else {
            value += this.getDigits(ps);
          }
          if (ps.currentChar() === '.') {
            ps.next();
            value += `.${this.getDigits(ps)}`;
          }
          return new NumberLiteral(value);
        }
        /**
         * maybeGetPattern distinguishes between patterns which start on the same line
         * as the identifier (a.k.a. inline signleline patterns and inline multiline
         * patterns) and patterns which start on a new line (a.k.a. block multiline
         * patterns). The distinction is important for the dedentation logic: the
         * indent of the first line of a block pattern must be taken into account when
         * calculating the maximum common indent.
         */
        maybeGetPattern(ps) {
          ps.peekBlankInline();
          if (ps.isValueStart()) {
            ps.skipToPeek();
            return this.getPattern(ps, false);
          }
          ps.peekBlankBlock();
          if (ps.isValueContinuation()) {
            ps.skipToPeek();
            return this.getPattern(ps, true);
          }
          return null;
        }
        getPattern(ps, isBlock) {
          const elements = [];
          let commonIndentLength;
          if (isBlock) {
            // A block pattern is a pattern which starts on a new line. Store and
            // measure the indent of this first line for the dedentation logic.
            const blankStart = ps.index;
            const firstIndent = ps.skipBlankInline();
            elements.push(this.getIndent(ps, firstIndent, blankStart));
            commonIndentLength = firstIndent.length;
          } else {
            commonIndentLength = Infinity;
          }
          let ch;
          elements: while ((ch = ps.currentChar())) {
            switch (ch) {
              case EOL: {
                const blankStart = ps.index;
                const blankLines = ps.peekBlankBlock();
                if (ps.isValueContinuation()) {
                  ps.skipToPeek();
                  const indent = ps.skipBlankInline();
                  commonIndentLength = Math.min(
                    commonIndentLength,
                    indent.length
                  );
                  elements.push(
                    this.getIndent(ps, blankLines + indent, blankStart)
                  );
                  continue elements;
                }
                // The end condition for getPattern's while loop is a newline
                // which is not followed by a valid pattern continuation.
                ps.resetPeek();
                break elements;
              }
              case '{':
                elements.push(this.getPlaceable(ps));
                continue elements;
              case '}':
                throw new ParseError('E0027');
              default:
                elements.push(this.getTextElement(ps));
            }
          }
          const dedented = this.dedent(elements, commonIndentLength);
          return new Pattern(dedented);
        }
        /**
         * Create a token representing an indent. It's not part of the AST and it will
         * be trimmed and merged into adjacent TextElements, or turned into a new
         * TextElement, if it's surrounded by two Placeables.
         */
        getIndent(ps, value, start) {
          return new Indent(value, start, ps.index);
        }
        /**
         * Dedent a list of elements by removing the maximum common indent from the
         * beginning of text lines. The common indent is calculated in getPattern.
         */
        dedent(elements, commonIndent) {
          const trimmed = [];
          for (let element of elements) {
            if (element instanceof Placeable) {
              trimmed.push(element);
              continue;
            }
            if (element instanceof Indent) {
              // Strip common indent.
              element.value = element.value.slice(
                0,
                element.value.length - commonIndent
              );
              if (element.value.length === 0) {
                continue;
              }
            }
            let prev = trimmed[trimmed.length - 1];
            if (prev && prev instanceof TextElement) {
              // Join adjacent TextElements by replacing them with their sum.
              const sum = new TextElement(prev.value + element.value);
              if (this.withSpans) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                sum.addSpan(prev.span.start, element.span.end);
              }
              trimmed[trimmed.length - 1] = sum;
              continue;
            }
            if (element instanceof Indent) {
              // If the indent hasn't been merged into a preceding TextElement,
              // convert it into a new TextElement.
              const textElement = new TextElement(element.value);
              if (this.withSpans) {
                textElement.addSpan(element.span.start, element.span.end);
              }
              element = textElement;
            }
            trimmed.push(element);
          }
          // Trim trailing whitespace from the Pattern.
          const lastElement = trimmed[trimmed.length - 1];
          if (lastElement instanceof TextElement) {
            lastElement.value = lastElement.value.replace(trailingWSRe, '');
            if (lastElement.value.length === 0) {
              trimmed.pop();
            }
          }
          return trimmed;
        }
        getTextElement(ps) {
          let buffer = '';
          let ch;
          while ((ch = ps.currentChar())) {
            if (ch === '{' || ch === '}') {
              return new TextElement(buffer);
            }
            if (ch === EOL) {
              return new TextElement(buffer);
            }
            buffer += ch;
            ps.next();
          }
          return new TextElement(buffer);
        }
        getEscapeSequence(ps) {
          const next = ps.currentChar();
          switch (next) {
            case '\\':
            case '"':
              ps.next();
              return `\\${next}`;
            case 'u':
              return this.getUnicodeEscapeSequence(ps, next, 4);
            case 'U':
              return this.getUnicodeEscapeSequence(ps, next, 6);
            default:
              throw new ParseError('E0025', next);
          }
        }
        getUnicodeEscapeSequence(ps, u, digits) {
          ps.expectChar(u);
          let sequence = '';
          for (let i = 0; i < digits; i++) {
            const ch = ps.takeHexDigit();
            if (!ch) {
              throw new ParseError(
                'E0026',
                `\\${u}${sequence}${ps.currentChar()}`
              );
            }
            sequence += ch;
          }
          return `\\${u}${sequence}`;
        }
        getPlaceable(ps) {
          ps.expectChar('{');
          ps.skipBlank();
          const expression = this.getExpression(ps);
          ps.expectChar('}');
          return new Placeable(expression);
        }
        getExpression(ps) {
          const selector = this.getInlineExpression(ps);
          ps.skipBlank();
          if (ps.currentChar() === '-') {
            if (ps.peek() !== '>') {
              ps.resetPeek();
              return selector;
            }
            // Validate selector expression according to
            // abstract.js in the Fluent specification
            if (selector instanceof MessageReference) {
              if (selector.attribute === null) {
                throw new ParseError('E0016');
              } else {
                throw new ParseError('E0018');
              }
            } else if (selector instanceof TermReference) {
              if (selector.attribute === null) {
                throw new ParseError('E0017');
              }
            } else if (selector instanceof Placeable) {
              throw new ParseError('E0029');
            }
            ps.next();
            ps.next();
            ps.skipBlankInline();
            ps.expectLineEnd();
            const variants = this.getVariants(ps);
            return new SelectExpression(selector, variants);
          }
          if (
            selector instanceof TermReference &&
            selector.attribute !== null
          ) {
            throw new ParseError('E0019');
          }
          return selector;
        }
        getInlineExpression(ps) {
          if (ps.currentChar() === '{') {
            return this.getPlaceable(ps);
          }
          if (ps.isNumberStart()) {
            return this.getNumber(ps);
          }
          if (ps.currentChar() === '"') {
            return this.getString(ps);
          }
          if (ps.currentChar() === '$') {
            ps.next();
            const id = this.getIdentifier(ps);
            return new VariableReference(id);
          }
          if (ps.currentChar() === '-') {
            ps.next();
            const id = this.getIdentifier(ps);
            let attr;
            if (ps.currentChar() === '.') {
              ps.next();
              attr = this.getIdentifier(ps);
            }
            let args;
            ps.peekBlank();
            if (ps.currentPeek() === '(') {
              ps.skipToPeek();
              args = this.getCallArguments(ps);
            }
            return new TermReference(id, attr, args);
          }
          if (ps.isIdentifierStart()) {
            const id = this.getIdentifier(ps);
            ps.peekBlank();
            if (ps.currentPeek() === '(') {
              // It's a Function. Ensure it's all upper-case.
              if (!/^[A-Z][A-Z0-9_-]*$/.test(id.name)) {
                throw new ParseError('E0008');
              }
              ps.skipToPeek();
              let args = this.getCallArguments(ps);
              return new FunctionReference(id, args);
            }
            let attr;
            if (ps.currentChar() === '.') {
              ps.next();
              attr = this.getIdentifier(ps);
            }
            return new MessageReference(id, attr);
          }
          throw new ParseError('E0028');
        }
        getCallArgument(ps) {
          const exp = this.getInlineExpression(ps);
          ps.skipBlank();
          if (ps.currentChar() !== ':') {
            return exp;
          }
          if (exp instanceof MessageReference && exp.attribute === null) {
            ps.next();
            ps.skipBlank();
            const value = this.getLiteral(ps);
            return new NamedArgument(exp.id, value);
          }
          throw new ParseError('E0009');
        }
        getCallArguments(ps) {
          const positional = [];
          const named = [];
          const argumentNames = new Set();
          ps.expectChar('(');
          ps.skipBlank();
          while (true) {
            if (ps.currentChar() === ')') {
              break;
            }
            const arg = this.getCallArgument(ps);
            if (arg instanceof NamedArgument) {
              if (argumentNames.has(arg.name.name)) {
                throw new ParseError('E0022');
              }
              named.push(arg);
              argumentNames.add(arg.name.name);
            } else if (argumentNames.size > 0) {
              throw new ParseError('E0021');
            } else {
              positional.push(arg);
            }
            ps.skipBlank();
            if (ps.currentChar() === ',') {
              ps.next();
              ps.skipBlank();
              continue;
            }
            break;
          }
          ps.expectChar(')');
          return new CallArguments(positional, named);
        }
        getString(ps) {
          ps.expectChar('"');
          let value = '';
          let ch;
          while ((ch = ps.takeChar((x) => x !== '"' && x !== EOL))) {
            if (ch === '\\') {
              value += this.getEscapeSequence(ps);
            } else {
              value += ch;
            }
          }
          if (ps.currentChar() === EOL) {
            throw new ParseError('E0020');
          }
          ps.expectChar('"');
          return new StringLiteral(value);
        }
        getLiteral(ps) {
          if (ps.isNumberStart()) {
            return this.getNumber(ps);
          }
          if (ps.currentChar() === '"') {
            return this.getString(ps);
          }
          throw new ParseError('E0014');
        }
      }
      class Indent {
        /** @ignore */
        constructor(value, start, end) {
          this.type = 'Indent';
          this.value = value;
          this.span = new Span(start, end);
        }
      } // ./node_modules/@fluent/syntax/esm/serializer.js

      /* eslint-disable @typescript-eslint/restrict-template-expressions */

      function indentExceptFirstLine(content) {
        return content.split('\n').join('\n    ');
      }
      function includesNewLine(elem) {
        return elem instanceof TextElement && elem.value.includes('\n');
      }
      function isSelectExpr(elem) {
        return (
          elem instanceof Placeable &&
          elem.expression instanceof SelectExpression
        );
      }
      function shouldStartOnNewLine(pattern) {
        const isMultiline =
          pattern.elements.some(isSelectExpr) ||
          pattern.elements.some(includesNewLine);
        if (isMultiline) {
          const firstElement = pattern.elements[0];
          if (firstElement instanceof TextElement) {
            const firstChar = firstElement.value[0];
            // Due to the indentation requirement these text characters may not appear
            // as the first character on a new line.
            if (firstChar === '[' || firstChar === '.' || firstChar === '*') {
              return false;
            }
          }
          return true;
        }
        return false;
      }
      /** Bit masks representing the state of the serializer. */
      const HAS_ENTRIES = 1;
      class FluentSerializer {
        constructor({ withJunk = false } = {}) {
          this.withJunk = withJunk;
        }
        serialize(resource) {
          if (!(resource instanceof Resource)) {
            throw new Error(`Unknown resource type: ${resource}`);
          }
          let state = 0;
          const parts = [];
          for (const entry of resource.body) {
            if (!(entry instanceof Junk) || this.withJunk) {
              parts.push(this.serializeEntry(entry, state));
              if (!(state & HAS_ENTRIES)) {
                state |= HAS_ENTRIES;
              }
            }
          }
          return parts.join('');
        }
        serializeEntry(entry, state = 0) {
          if (entry instanceof Message) {
            return serializeMessage(entry);
          }
          if (entry instanceof Term) {
            return serializeTerm(entry);
          }
          if (entry instanceof ast_Comment) {
            if (state & HAS_ENTRIES) {
              return `\n${serializeComment(entry, '#')}\n`;
            }
            return `${serializeComment(entry, '#')}\n`;
          }
          if (entry instanceof GroupComment) {
            if (state & HAS_ENTRIES) {
              return `\n${serializeComment(entry, '##')}\n`;
            }
            return `${serializeComment(entry, '##')}\n`;
          }
          if (entry instanceof ResourceComment) {
            if (state & HAS_ENTRIES) {
              return `\n${serializeComment(entry, '###')}\n`;
            }
            return `${serializeComment(entry, '###')}\n`;
          }
          if (entry instanceof Junk) {
            return serializeJunk(entry);
          }
          throw new Error(`Unknown entry type: ${entry}`);
        }
      }
      function serializeComment(comment, prefix = '#') {
        const prefixed = comment.content
          .split('\n')
          .map((line) => (line.length ? `${prefix} ${line}` : prefix))
          .join('\n');
        // Add the trailing newline.
        return `${prefixed}\n`;
      }
      function serializeJunk(junk) {
        return junk.content;
      }
      function serializeMessage(message) {
        const parts = [];
        if (message.comment) {
          parts.push(serializeComment(message.comment));
        }
        parts.push(`${message.id.name} =`);
        if (message.value) {
          parts.push(serializePattern(message.value));
        }
        for (const attribute of message.attributes) {
          parts.push(serializeAttribute(attribute));
        }
        parts.push('\n');
        return parts.join('');
      }
      function serializeTerm(term) {
        const parts = [];
        if (term.comment) {
          parts.push(serializeComment(term.comment));
        }
        parts.push(`-${term.id.name} =`);
        parts.push(serializePattern(term.value));
        for (const attribute of term.attributes) {
          parts.push(serializeAttribute(attribute));
        }
        parts.push('\n');
        return parts.join('');
      }
      function serializeAttribute(attribute) {
        const value = indentExceptFirstLine(serializePattern(attribute.value));
        return `\n    .${attribute.id.name} =${value}`;
      }
      function serializePattern(pattern) {
        const content = pattern.elements.map(serializeElement).join('');
        if (shouldStartOnNewLine(pattern)) {
          return `\n    ${indentExceptFirstLine(content)}`;
        }
        return ` ${indentExceptFirstLine(content)}`;
      }
      function serializeElement(element) {
        if (element instanceof TextElement) {
          return element.value;
        }
        if (element instanceof Placeable) {
          return serializePlaceable(element);
        }
        throw new Error(`Unknown element type: ${element}`);
      }
      function serializePlaceable(placeable) {
        const expr = placeable.expression;
        if (expr instanceof Placeable) {
          return `{${serializePlaceable(expr)}}`;
        }
        if (expr instanceof SelectExpression) {
          // Special-case select expression to control the whitespace around the
          // opening and the closing brace.
          return `{ ${serializeExpression(expr)}}`;
        }
        return `{ ${serializeExpression(expr)} }`;
      }
      function serializeExpression(expr) {
        if (expr instanceof StringLiteral) {
          return `"${expr.value}"`;
        }
        if (expr instanceof NumberLiteral) {
          return expr.value;
        }
        if (expr instanceof VariableReference) {
          return `$${expr.id.name}`;
        }
        if (expr instanceof TermReference) {
          let out = `-${expr.id.name}`;
          if (expr.attribute) {
            out += `.${expr.attribute.name}`;
          }
          if (expr.arguments) {
            out += serializeCallArguments(expr.arguments);
          }
          return out;
        }
        if (expr instanceof MessageReference) {
          let out = expr.id.name;
          if (expr.attribute) {
            out += `.${expr.attribute.name}`;
          }
          return out;
        }
        if (expr instanceof FunctionReference) {
          return `${expr.id.name}${serializeCallArguments(expr.arguments)}`;
        }
        if (expr instanceof SelectExpression) {
          let out = `${serializeExpression(expr.selector)} ->`;
          for (let variant of expr.variants) {
            out += serializeVariant(variant);
          }
          return `${out}\n`;
        }
        if (expr instanceof Placeable) {
          return serializePlaceable(expr);
        }
        throw new Error(`Unknown expression type: ${expr}`);
      }
      function serializeVariant(variant) {
        const key = serializeVariantKey(variant.key);
        const value = indentExceptFirstLine(serializePattern(variant.value));
        if (variant.default) {
          return `\n   *[${key}]${value}`;
        }
        return `\n    [${key}]${value}`;
      }
      function serializeCallArguments(expr) {
        const positional = expr.positional.map(serializeExpression).join(', ');
        const named = expr.named.map(serializeNamedArgument).join(', ');
        if (expr.positional.length > 0 && expr.named.length > 0) {
          return `(${positional}, ${named})`;
        }
        return `(${positional || named})`;
      }
      function serializeNamedArgument(arg) {
        const value = serializeExpression(arg.value);
        return `${arg.name.name}: ${value}`;
      }
      function serializeVariantKey(key) {
        if (key instanceof Identifier) {
          return key.name;
        }
        if (key instanceof NumberLiteral) {
          return key.value;
        }
        throw new Error(`Unknown variant key type: ${key}`);
      } // ./node_modules/@fluent/syntax/esm/visitor.js

      /**
       * A read-only visitor.
       *
       * Subclasses can be used to gather information from an AST.
       *
       * To handle specific node types add methods like `visitPattern`.
       * Then, to descend into children call `genericVisit`.
       *
       * Visiting methods must implement the following interface:
       *
       * ```ts
       * interface VisitingMethod {
       *     (this: Visitor, node: AST.BaseNode): void;
       * }
       * ```
       */
      class Visitor {
        visit(node) {
          let visit = this[`visit${node.type}`];
          if (typeof visit === 'function') {
            visit.call(this, node);
          } else {
            this.genericVisit(node);
          }
        }
        genericVisit(node) {
          for (const key of Object.keys(node)) {
            let prop = node[key];
            if (prop instanceof BaseNode) {
              this.visit(prop);
            } else if (Array.isArray(prop)) {
              for (let element of prop) {
                this.visit(element);
              }
            }
          }
        }
      }
      /**
       * A read-and-write visitor.
       *
       * Subclasses can be used to modify an AST in-place.
       *
       * To handle specific node types add methods like `visitPattern`.
       * Then, to descend into children call `genericVisit`.
       *
       * Visiting methods must implement the following interface:
       *
       * ```ts
       * interface TransformingMethod {
       *     (this: Transformer, node: AST.BaseNode): AST.BaseNode | undefined;
       * }
       * ```
       *
       * The returned node will replace the original one in the AST. Return
       * `undefined` to remove the node instead.
       */
      class Transformer extends Visitor {
        visit(node) {
          let visit = this[`visit${node.type}`];
          if (typeof visit === 'function') {
            return visit.call(this, node);
          }
          return this.genericVisit(node);
        }
        genericVisit(node) {
          for (const key of Object.keys(node)) {
            let prop = node[key];
            if (prop instanceof BaseNode) {
              let newVal = this.visit(prop);
              if (newVal === undefined) {
                delete node[key];
              } else {
                node[key] = newVal;
              }
            } else if (Array.isArray(prop)) {
              let newVals = [];
              for (let element of prop) {
                let newVal = this.visit(element);
                if (newVal !== undefined) {
                  newVals.push(newVal);
                }
              }
              node[key] = newVals;
            }
          }
          return node;
        }
      } // ./node_modules/@fluent/syntax/esm/index.js

      function parse(source, opts) {
        const parser = new FluentParser(opts);
        return parser.parse(source);
      }
      function serialize(resource, opts) {
        const serializer = new FluentSerializer(opts);
        return serializer.serialize(resource);
      }
      function lineOffset(source, pos) {
        // Subtract 1 to get the offset.
        return source.substring(0, pos).split('\n').length - 1;
      }
      function columnOffset(source, pos) {
        // Find the last line break starting backwards from the index just before
        // pos.  This allows us to correctly handle ths case where the character at
        // pos  is a line break as well.
        const fromIndex = pos - 1;
        const prevLineBreak = source.lastIndexOf('\n', fromIndex);
        // pos is a position in the first line of source.
        if (prevLineBreak === -1) {
          return pos;
        }
        // Subtracting two offsets gives length; subtract 1 to get the offset.
        return pos - prevLineBreak - 1;
      }

      /***/
    }

    /******/
  };
  /************************************************************************/
  /******/ // The module cache
  /******/ var __webpack_module_cache__ = {};
  /******/
  /******/ // The require function
  /******/ function __webpack_require__(moduleId) {
    /******/ // Check if module is in cache
    /******/ var cachedModule = __webpack_module_cache__[moduleId];
    /******/ if (cachedModule !== undefined) {
      /******/ return cachedModule.exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/ var module = (__webpack_module_cache__[moduleId] = {
      /******/ // no module.id needed
      /******/ // no module.loaded needed
      /******/ exports: {}
      /******/
    });
    /******/
    /******/ // Execute the module function
    /******/ __webpack_modules__[moduleId](
      module,
      module.exports,
      __webpack_require__
    );
    /******/
    /******/ // Return the exports of the module
    /******/ return module.exports;
    /******/
  }
  /******/
  /************************************************************************/
  /******/ /* webpack/runtime/define property getters */
  /******/ (() => {
    /******/ // define getter functions for harmony exports
    /******/ __webpack_require__.d = (exports, definition) => {
      /******/ for (var key in definition) {
        /******/ if (
          __webpack_require__.o(definition, key) &&
          !__webpack_require__.o(exports, key)
        ) {
          /******/ Object.defineProperty(exports, key, {
            enumerable: true,
            get: definition[key]
          });
          /******/
        }
        /******/
      }
      /******/
    };
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/hasOwnProperty shorthand */
  /******/ (() => {
    /******/ __webpack_require__.o = (obj, prop) =>
      Object.prototype.hasOwnProperty.call(obj, prop);
    /******/
  })();
  /******/
  /******/ /* webpack/runtime/make namespace object */
  /******/ (() => {
    /******/ // define __esModule on exports
    /******/ __webpack_require__.r = (exports) => {
      /******/ if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        /******/ Object.defineProperty(exports, Symbol.toStringTag, {
          value: 'Module'
        });
        /******/
      }
      /******/ Object.defineProperty(exports, '__esModule', { value: true });
      /******/
    };
    /******/
  })();
  /******/
  /************************************************************************/
  /******/
  /******/ // startup
  /******/ // Load entry module and return exports
  /******/ // This entry module is referenced by other modules so it can't be inlined
  /******/ var __webpack_exports__ = __webpack_require__(583);
  /******/ FluentLib = __webpack_exports__;
  /******/
  /******/
})();
// Make Fluent functions globally available for MathQuill
var FluentBundle = FluentLib.FluentBundle;
var FluentResource = FluentLib.FluentResource;
var parseResource = FluentLib.parseResource;
