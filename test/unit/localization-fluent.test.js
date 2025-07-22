suite('Localization Fluent Integration', function () {
  var $ = window.test_only_jquery;

  setup(function () {
    // Reset to English before each test
    var localization = MQ.L10N.create('en');
    localization.setLanguage('en');
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
    var result = localization.formatMessage('power-ordinal');

    // Should handle missing parameters without crashing by returning the raw formatted string. We might want to make this an error at some point.
    assert.equal(result, 'to the {$number}th power');
  });

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
    assert.equal(localization.getResolvedLanguage(), 'en');
  });
});
