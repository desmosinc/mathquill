suite('Localization Mathspeak Integration', function () {
  var $ = window.test_only_jquery;

  setup(function () {
    // Reset to English before each test
    var localization = getLocalization();
    localization.setLanguage('en');
  });

  suite('Mathspeak Recomputation on Language Change', function () {
    test('updates mathspeak when language changes', function () {
      var mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

      // Type a fraction
      mq.typedText('1/2');

      // Get English mathspeak
      var englishMathspeak = mq.mathspeak();
      assert.equal(englishMathspeak, '1 half');

      // Switch to Spanish
      var localization = getLocalization();
      localization.setLanguage('es');

      // Force mathspeak update (simulating what happens in real usage)
      mq.__controller.updateMathspeak();

      // Get Spanish mathspeak
      var spanishMathspeak = mq.mathspeak();
      assert.equal(spanishMathspeak, '1 medio');
    });

    test('updates aria label when language changes', function () {
      var mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

      // Check default English aria label
      var englishLabel = mq.getAriaLabel();
      assert.equal(englishLabel, 'Math Input');

      // Switch to Spanish
      var localization = getLocalization();
      localization.setLanguage('es');

      // Force aria label update (simulating what happens in real usage)
      mq.__controller.updateAriaLabel();

      // Check Spanish aria label
      var spanishLabel = mq.getAriaLabel();
      assert.equal(spanishLabel, 'Entrada Matemática');
    });

    test('preserves custom aria labels during language changes', function () {
      var mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

      // Set custom aria label
      mq.setAriaLabel('Custom Calculator');
      assert.equal(mq.getAriaLabel(), 'Custom Calculator');

      // Switch language
      var localization = getLocalization();
      localization.setLanguage('es');

      // Custom label should be preserved
      assert.equal(mq.getAriaLabel(), 'Custom Calculator');
    });
  });

  suite('Aria Label Key Normalization', function () {
    test('normalizes aria label keys with hyphens', function () {
      var localization = getLocalization();

      // Test that spaces are converted to hyphens in aria label keys
      assert.equal(
        localization.formatMessage('start-lower-bound'),
        'Start Lower Bound'
      );
      assert.equal(
        localization.formatMessage('end-upper-bound'),
        'End Upper Bound'
      );
    });

    test('normalizes aria label keys in Spanish', function () {
      var localization = getLocalization();
      localization.setLanguage('es');

      assert.equal(
        localization.formatMessage('start-lower-bound'),
        'Inicio Límite Inferior'
      );
      assert.equal(
        localization.formatMessage('end-upper-bound'),
        'Fin Límite Superior'
      );
    });
  });

  suite('Fraction Denominator Pluralization', function () {
    test('uses singular forms for numerator = 1 in English', function () {
      var localization = getLocalization();
      localization.setLanguage('en');

      var mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

      // Test singular forms
      mq.latex('\\frac{1}{2}');
      assert.equal(mq.mathspeak(), '1 half');

      mq.latex('\\frac{1}{3}');
      assert.equal(mq.mathspeak(), '1 third');

      mq.latex('\\frac{1}{4}');
      assert.equal(mq.mathspeak(), '1 quarter');
    });

    test('uses plural forms for numerator > 1 in English', function () {
      var localization = getLocalization();
      localization.setLanguage('en');

      var mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

      // Test plural forms
      mq.latex('\\frac{2}{2}');
      assert.equal(mq.mathspeak(), '2 halves');

      mq.latex('\\frac{3}{4}');
      assert.equal(mq.mathspeak(), '3 quarters');

      mq.latex('\\frac{5}{6}');
      assert.equal(mq.mathspeak(), '5 sixths');
    });

    test('uses singular forms for numerator = 1 in Spanish', function () {
      var localization = getLocalization();
      localization.setLanguage('es');

      var mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

      // Test singular forms
      mq.latex('\\frac{1}{2}');
      assert.equal(mq.mathspeak(), '1 medio');

      mq.latex('\\frac{1}{3}');
      assert.equal(mq.mathspeak(), '1 tercio');

      mq.latex('\\frac{1}{4}');
      assert.equal(mq.mathspeak(), '1 cuarto');
    });

    test('uses plural forms for numerator > 1 in Spanish', function () {
      var localization = getLocalization();
      localization.setLanguage('es');

      var mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

      // Test plural forms
      mq.latex('\\frac{2}{2}');
      assert.equal(mq.mathspeak(), '2 medios');

      mq.latex('\\frac{3}{4}');
      assert.equal(mq.mathspeak(), '3 cuartos');

      mq.latex('\\frac{5}{6}');
      assert.equal(mq.mathspeak(), '5 sextos');
    });

    test('uses singular forms for negative numerator with absolute value = 1', function () {
      var localization = getLocalization();
      localization.setLanguage('en');

      var mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

      // Test negative fractions with |numerator| = 1 should use singular
      mq.latex('\\frac{-1}{2}');
      assert.equal(mq.mathspeak(), 'negative 1 half');

      mq.latex('\\frac{-1}{3}');
      assert.equal(mq.mathspeak(), 'negative 1 third');

      // Test negative fractions with |numerator| > 1 should use plural
      mq.latex('\\frac{-2}{3}');
      assert.equal(mq.mathspeak(), 'negative 2 thirds');

      mq.latex('\\frac{-3}{4}');
      assert.equal(mq.mathspeak(), 'negative 3 quarters');
    });

    test('uses singular forms for negative numerator with absolute value = 1 in Spanish', function () {
      var localization = getLocalization();
      localization.setLanguage('es');

      var mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

      // Test negative fractions with |numerator| = 1 should use singular
      mq.latex('\\frac{-1}{2}');
      assert.equal(mq.mathspeak(), 'negativo 1 medio');

      mq.latex('\\frac{-1}{3}');
      assert.equal(mq.mathspeak(), 'negativo 1 tercio');

      // Test negative fractions with |numerator| > 1 should use plural
      mq.latex('\\frac{-2}{3}');
      assert.equal(mq.mathspeak(), 'negativo 2 tercios');

      mq.latex('\\frac{-3}{4}');
      assert.equal(mq.mathspeak(), 'negativo 3 cuartos');
    });
  });

  suite('Power Expression Number Formatting', function () {
    test('large exponents do not have spaces inserted', function () {
      var localization = getLocalization();
      localization.setLanguage('en');

      var mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

      // Test that large numbers don't get spaces inserted
      mq.latex('x^{1000}');
      assert.equal(mq.mathspeak(), '"x" to the 1000th power');

      mq.latex('x^{12345}');
      assert.equal(mq.mathspeak(), '"x" to the 12345th power');
    });

    test('ordinal power expressions in Spanish', function () {
      var localization = getLocalization();
      localization.setLanguage('es');

      var mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

      // Test ordinal format for small numbers
      mq.latex('x^4');
      assert.equal(mq.mathspeak(), '"x" a la cuarta potencia');

      mq.latex('x^5');
      assert.equal(mq.mathspeak(), '"x" a la quinta potencia');

      // Test fallback format for large numbers (should use ª suffix)
      mq.latex('x^{1000}');
      assert.equal(mq.mathspeak(), '"x" a la 1000ª potencia');

      mq.latex('x^{12345}');
      assert.equal(mq.mathspeak(), '"x" a la 12345ª potencia');
    });

    test('negative power expressions', function () {
      var localization = getLocalization();
      localization.setLanguage('en');

      var mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

      // Test negative exponents should say "negative" instead of "-"
      mq.latex('10^{-5}');
      assert.equal(mq.mathspeak(), '10 to the negative 5th power');

      mq.latex('x^{-2}');
      assert.equal(mq.mathspeak(), '"x" to the negative 2nd power');

      // Switch to Spanish
      localization.setLanguage('es');
      mq.__controller.updateMathspeak();

      mq.latex('10^{-5}');
      assert.equal(mq.mathspeak(), '10 a la negativo quinta potencia');
    });
  });
});
