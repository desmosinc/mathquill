suite('Localization', function () {
  var $ = window.test_only_jquery;

  setup(function () {
    // Reset to English before each test
    var localization = getLocalization();
    localization.setLanguage('en');
  });

  suite('Basic Message Formatting', function () {
    test('formats basic messages in English', function () {
      var localization = getLocalization();
      assert.equal(localization.formatMessage('plus'), 'plus');
      assert.equal(localization.formatMessage('minus'), 'minus');
      assert.equal(localization.formatMessage('times'), 'times');
      assert.equal(localization.formatMessage('over'), 'over');
    });

    test('formats basic messages in Spanish', function () {
      var localization = getLocalization();
      localization.setLanguage('es');

      assert.equal(localization.formatMessage('plus'), 'más');
      assert.equal(localization.formatMessage('minus'), 'menos');
      assert.equal(localization.formatMessage('times'), 'por');
      assert.equal(localization.formatMessage('over'), 'sobre');
    });

    test('returns key for missing messages', function () {
      var localization = getLocalization();

      assert.equal(
        localization.formatMessage('nonexistent-key'),
        'nonexistent-key'
      );
    });

    test('formats parametric messages', function () {
      var localization = getLocalization();

      var result = localization.formatMessage('start-block', {
        blockType: 'Fraction'
      });
      assert.equal(result, 'Start Fraction');
    });
  });

  suite('Language Switching', function () {
    test('switches from English to Spanish', function () {
      var localization = getLocalization();

      // Start in English
      assert.equal(localization.formatMessage('plus'), 'plus');
      assert.equal(localization.getCurrentLanguage(), 'en');

      // Switch to Spanish
      localization.setLanguage('es');
      assert.equal(localization.formatMessage('plus'), 'más');
      assert.equal(localization.getCurrentLanguage(), 'es');
    });

    test('falls back to English for unsupported languages', function () {
      var localization = getLocalization();

      localization.setLanguage('fr'); // French not supported
      assert.equal(localization.formatMessage('plus'), 'plus'); // Should be English
      assert.equal(localization.getResolvedLanguage(), 'en');
    });

    test('resolves language variants', function () {
      var localization = getLocalization();

      localization.setLanguage('en-US');
      assert.equal(localization.getResolvedLanguage(), 'en');

      localization.setLanguage('es-MX');
      assert.equal(localization.getResolvedLanguage(), 'es');
    });
  });

  suite('Fraction Shortcuts', function () {
    test('returns fraction shortcuts with "1" prefix', function () {
      var localization = getLocalization();

      assert.equal(localization.formatFractionShortcut(1, 2), '1 half');
      assert.equal(localization.formatFractionShortcut(1, 3), '1 third');
      assert.equal(localization.formatFractionShortcut(1, 4), '1 quarter');
    });

    test('returns fraction shortcuts in Spanish', function () {
      var localization = getLocalization();
      localization.setLanguage('es');

      assert.equal(localization.formatFractionShortcut(1, 2), '1 medio');
      assert.equal(localization.formatFractionShortcut(1, 3), '1 tercio');
      assert.equal(localization.formatFractionShortcut(1, 4), '1 cuarto');
    });

    test('returns empty string for unsupported fractions', function () {
      var localization = getLocalization();

      assert.equal(localization.formatFractionShortcut(2, 19), '');
      assert.equal(localization.formatFractionShortcut(5, 13), '');
    });
  });

  suite('Auto Operator Localization', function () {
    test('localizes auto operators when available', function () {
      var localization = getLocalization();

      // Test sin operator (should have localization)
      var result = localization.formatAutoOperator('sin');
      assert.equal(result, 'sine');
    });

    test('falls back to original name for unlocalizable operators', function () {
      var localization = getLocalization();

      // Test custom operator (should not have localization)
      var result = localization.formatAutoOperator('customOp');
      assert.equal(result, 'customOp');
    });

    test('handles | syntax for user-defined operators', function () {
      var localization = getLocalization();

      // Test operator with | syntax (visual|spoken)
      var result = localization.formatAutoOperator('myop|my custom operator');
      assert.equal(result, 'my custom operator');

      // Test operator with | but no spoken part
      var result2 = localization.formatAutoOperator('op|');
      assert.equal(result2, 'op'); // Should fall back to visual part
    });
  });

  suite('Mathspeak Templates', function () {
    test('creates template with comma separators', function () {
      var localization = getLocalization();

      var template = localization.createMathspeakTemplate(
        'start-fraction',
        'end-fraction'
      );
      assert.equal(template[0], 'Start Fraction,');
      assert.equal(template[1], ', End Fraction');
    });

    test('creates Spanish templates', function () {
      var localization = getLocalization();
      localization.setLanguage('es');

      var template = localization.createMathspeakTemplate(
        'start-fraction',
        'end-fraction'
      );
      assert.equal(template[0], 'Inicio Fracción,');
      assert.equal(template[1], ', Fin Fracción');
    });
  });

  suite('Language Change Callbacks', function () {
    test('triggers callbacks on language change', function () {
      var localization = getLocalization();
      var callbackTriggered = false;
      var newLanguage = '';

      var unregister = localization.onLanguageChange(function () {
        callbackTriggered = true;
        newLanguage = localization.getCurrentLanguage();
      });

      localization.setLanguage('es');

      assert.equal(callbackTriggered, true);
      assert.equal(newLanguage, 'es');

      // Clean up
      unregister();
    });

    test('does not trigger callbacks when language stays the same', function () {
      var localization = getLocalization();
      var callbackCount = 0;

      var unregister = localization.onLanguageChange(function () {
        callbackCount++;
      });

      localization.setLanguage('en'); // Already English
      localization.setLanguage('en'); // Still English

      assert.equal(callbackCount, 0);

      // Clean up
      unregister();
    });

    test('allows callback unregistration', function () {
      var localization = getLocalization();
      var callbackTriggered = false;

      var unregister = localization.onLanguageChange(function () {
        callbackTriggered = true;
      });

      unregister(); // Unregister immediately
      localization.setLanguage('es');

      assert.equal(callbackTriggered, false);
    });
  });

  suite('Static Methods', function () {
    test('checks language support', function () {
      assert.equal(MathQuillLocalization.isLanguageSupported('en'), true);
      assert.equal(MathQuillLocalization.isLanguageSupported('es'), true);
      assert.equal(MathQuillLocalization.isLanguageSupported('fr'), false);
    });

    test('resolves language variants', function () {
      assert.equal(MathQuillLocalization.resolveLanguage('en-US'), 'en');
      assert.equal(MathQuillLocalization.resolveLanguage('es-MX'), 'es');
      assert.equal(MathQuillLocalization.resolveLanguage('fr'), 'en'); // fallback
    });
  });
});
