suite('Localization Fluent Integration', function () {
  var $ = window.test_only_jquery;

  setup(function () {
    // Reset to English before each test
    var localization = MQ.L10N.create('en');
    localization.setLanguage('en');
  });

  suite('Fluent Bundle Configuration', function () {
    test('creates bundles without Unicode isolation marks', function () {
      var localization = MQ.L10N.create('en');

      // Test a message that could potentially have isolation marks
      var result = localization.formatMessage('default-aria-label');

      // Should not contain Unicode isolation marks
      assert.ok(!result.includes('\u2069')); // RIGHT-TO-LEFT ISOLATE
      assert.ok(!result.includes('\u2068')); // FIRST STRONG ISOLATE
      assert.ok(!result.includes('\u061C')); // ARABIC LETTER MARK

      // Should be clean text
      assert.equal(result, 'Math Input');
    });

    test('formats parametric messages without isolation marks', function () {
      var localization = MQ.L10N.create('en');

      var result = localization.formatMessage('start-block', {
        blockType: 'Fraction'
      });

      // Should not contain Unicode isolation marks
      assert.ok(!result.includes('\u2069'));
      assert.ok(!result.includes('\u2068'));
      assert.ok(!result.includes('\u061C'));

      assert.equal(result, 'Start Fraction');
    });

    test('handles Spanish messages without isolation marks', function () {
      var localization = MQ.L10N.create('en');
      localization.setLanguage('es');

      var result = localization.formatMessage('start-block', {
        blockType: 'Fraction'
      });

      // Should not contain Unicode isolation marks
      assert.ok(!result.includes('\u2069'));
      assert.ok(!result.includes('\u2068'));
      assert.ok(!result.includes('\u061C'));

      assert.equal(result, 'Inicio Fracción');
    });
  });

  suite('Real Fluent Library Integration', function () {
    test('uses actual FluentBundle and FluentResource', function () {
      // Test that the real Fluent library is being used
      assert.ok(
        typeof FluentBundle === 'function',
        'FluentBundle should be available'
      );
      assert.ok(
        typeof FluentResource === 'function',
        'FluentResource should be available'
      );

      // Test that we can create instances
      var bundle = new FluentBundle(['en'], { useIsolating: false });
      assert.ok(
        bundle instanceof FluentBundle,
        'Should create FluentBundle instance'
      );

      var resource = new FluentResource('test-key = test value');
      assert.ok(
        resource instanceof FluentResource,
        'Should create FluentResource instance'
      );
    });

    test('parses FTL syntax correctly', function () {
      var localization = MQ.L10N.create('en');

      // Test parametric message parsing
      var result = localization.formatMessage('power-ordinal', { number: 5 });
      assert.equal(result, 'to the 5th power');

      // Test in Spanish
      localization.setLanguage('es');
      result = localization.formatMessage('power-ordinal', { number: 5 });
      assert.equal(result, 'a la quinta potencia');
    });

    test('handles missing parameters gracefully', function () {
      var localization = MQ.L10N.create('en');

      // Try to format a parametric message without providing parameters
      var result = localization.formatMessage('start-block');

      // Should handle missing parameters without crashing
      assert.ok(typeof result === 'string');
      assert.ok(result.length > 0);
    });

    test('handles complex Fluent expressions', function () {
      var localization = MQ.L10N.create('en');

      // Test fraction shortcuts which use complex logic
      var result = localization.formatFractionShortcut(1, 2);
      assert.equal(result, '1 half');

      // Test that it's not returning raw Fluent syntax
      assert.ok(!result.includes('{'));
      assert.ok(!result.includes('}'));
      assert.ok(!result.includes('->'));
    });
  });

  suite('Bundle Caching', function () {
    test('caches bundles for performance', function () {
      var localization = MQ.L10N.create('en');

      // Switch to Spanish
      localization.setLanguage('es');
      var firstResult = localization.formatMessage('plus');

      // Switch back to English
      localization.setLanguage('en');
      var englishResult = localization.formatMessage('plus');

      // Switch back to Spanish (should use cache)
      localization.setLanguage('es');
      var cachedResult = localization.formatMessage('plus');

      assert.equal(firstResult, 'más');
      assert.equal(englishResult, 'plus');
      assert.equal(cachedResult, 'más');
      assert.equal(firstResult, cachedResult); // Should be identical
    });

    test('cache works with language variants', function () {
      var localization = MQ.L10N.create('en');

      // Request en-US (should resolve to en)
      localization.setLanguage('en-US');
      var result1 = localization.formatMessage('plus');

      // Request en-GB (should also resolve to en and use cache)
      localization.setLanguage('en-GB');
      var result2 = localization.formatMessage('plus');

      assert.equal(result1, 'plus');
      assert.equal(result2, 'plus');
      assert.equal(localization.getResolvedLanguage(), 'en');
    });
  });

  suite('Error Handling', function () {
    test('handles malformed FTL gracefully', function () {
      // This test ensures the system doesn't crash on malformed FTL
      // Since we control the FTL files, this is more of a safety net
      var localization = MQ.L10N.create('en');

      // Try to format a non-existent message
      var result = localization.formatMessage('completely-nonexistent-message');
      assert.equal(result, 'completely-nonexistent-message');
    });

    test('handles fallback on bundle creation failure', function () {
      var localization = MQ.L10N.create('en');

      // Try to set an unsupported language
      localization.setLanguage('xyz'); // Should fall back to English

      var result = localization.formatMessage('plus');
      assert.equal(result, 'plus'); // Should be English
      assert.equal(localization.getResolvedLanguage(), 'en');
    });
  });
});
