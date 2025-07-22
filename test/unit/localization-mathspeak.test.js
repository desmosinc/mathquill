suite('Localization Mathspeak Integration', function () {
  var $ = window.test_only_jquery;

  setup(function () {
    // Reset to English before each test
    MQ.L10N.setLanguage('en');
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
      MQ.L10N.setLanguage('es');

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
      MQ.L10N.setLanguage('es');

      // Check Spanish aria label
      var spanishLabel = mq.getAriaLabel();
      assert.equal(spanishLabel, 'Entrada Matemática');
    });

    test('preserves custom aria labels during language changes', function () {
      var mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

      // Set custom aria label
      mq.setAriaLabel('Expression 1');
      assert.equal(mq.getAriaLabel(), 'Expression 1');

      // Switch language
      MQ.L10N.setLanguage('es');

      // Custom label should be preserved
      assert.equal(mq.getAriaLabel(), 'Expression 1');
    });
  });

  suite('Aria Label Key Normalization', function () {
    test('normalizes aria label keys with hyphens', function () {
      var localization = MQ.L10N.create('en');

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
      MQ.L10N.setLanguage('es');
      var localization = MQ.L10N.create('es');

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
      var localization = MQ.L10N.create('en');
      localization.setLanguage('en');

      var mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

      mq.latex('\\frac{1}{2}');
      assert.equal(mq.mathspeak(), '1 half');
      mq.latex('\\frac{1}{3}');
      assert.equal(mq.mathspeak(), '1 third');
      mq.latex('\\frac{1}{4}');
      assert.equal(mq.mathspeak(), '1 quarter');
    });

    test('uses plural forms for numerator > 1 in English', function () {
      var localization = MQ.L10N.create('en');
      localization.setLanguage('en');

      var mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

      mq.latex('\\frac{2}{2}');
      assert.equal(mq.mathspeak(), '2 halves');
      mq.latex('\\frac{3}{4}');
      assert.equal(mq.mathspeak(), '3 quarters');
      mq.latex('\\frac{5}{6}');
      assert.equal(mq.mathspeak(), '5 sixths');
    });

    test('uses singular forms for numerator = 1 in Spanish', function () {
      var mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);
      MQ.L10N.setLanguage('es');

      mq.latex('\\frac{1}{2}');
      assert.equal(mq.mathspeak(), '1 medio');
      mq.latex('\\frac{1}{3}');
      assert.equal(mq.mathspeak(), '1 tercio');
      mq.latex('\\frac{1}{4}');
      assert.equal(mq.mathspeak(), '1 cuarto');
    });

    test('uses plural forms for numerator > 1 in Spanish', function () {
      var mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);
      MQ.L10N.setLanguage('es');

      mq.latex('\\frac{2}{2}');
      assert.equal(mq.mathspeak(), '2 medios');
      mq.latex('\\frac{3}{4}');
      assert.equal(mq.mathspeak(), '3 cuartos');
      mq.latex('\\frac{5}{6}');
      assert.equal(mq.mathspeak(), '5 sextos');
    });

    test('negative numerators in English', function () {
      var localization = MQ.L10N.create('en');
      localization.setLanguage('en');

      var mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

      mq.latex('\\frac{-1}{2}');
      assert.equal(mq.mathspeak(), 'negative 1 half');
      mq.latex('\\frac{-1}{3}');
      assert.equal(mq.mathspeak(), 'negative 1 third');
      mq.latex('\\frac{-2}{3}');
      assert.equal(mq.mathspeak(), 'negative 2 thirds');
      mq.latex('\\frac{-3}{4}');
      assert.equal(mq.mathspeak(), 'negative 3 quarters');
    });

    test('negative numerators in Spanish', function () {
      var mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);
      MQ.L10N.setLanguage('es');

      mq.latex('\\frac{-1}{2}');
      assert.equal(mq.mathspeak(), 'menos 1 medio');
      mq.latex('\\frac{-1}{3}');
      assert.equal(mq.mathspeak(), 'menos 1 tercio');
      mq.latex('\\frac{-2}{3}');
      assert.equal(mq.mathspeak(), 'menos 2 tercios');

      mq.latex('\\frac{-3}{4}');
      assert.equal(mq.mathspeak(), 'menos 3 cuartos');
    });
  });

  suite('Power Expression Number Formatting', function () {
    test('English exponents', function () {
      MQ.L10N.setLanguage('en');

      var mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);
      mq.latex('x^{1}');
      assert.equal(mq.mathspeak(), '"x" to the 1st power');
      mq.latex('x^{2}');
      assert.equal(mq.mathspeak(), '"x" squared');
      mq.latex('x^{3}');
      assert.equal(mq.mathspeak(), '"x" cubed');
      mq.latex('x^{1000}');
      assert.equal(mq.mathspeak(), '"x" to the 1000th power');
      mq.latex('x^{12345}');
      assert.equal(mq.mathspeak(), '"x" to the 12345th power');
    });

    test('Spanish exponents', function () {
      var mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);
      MQ.L10N.setLanguage('es');

      mq.latex('x^4');
      assert.equal(mq.mathspeak(), '"x" a la cuarta potencia');
      mq.latex('x^5');
      assert.equal(mq.mathspeak(), '"x" a la quinta potencia');
      mq.latex('x^{1000}');
      assert.equal(mq.mathspeak(), '"x" a la 1000ª potencia');
      mq.latex('x^{12345}');
      assert.equal(mq.mathspeak(), '"x" a la 12345ª potencia');
    });

    test('negative exponents', function () {
      MQ.L10N.setLanguage('en');

      var mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

      mq.latex('10^{-5}');
      assert.equal(mq.mathspeak(), '10 to the negative 5th power');
      mq.latex('x^{-2}');
      assert.equal(mq.mathspeak(), '"x" to the negative 2nd power');

      // Switch to Spanish
      MQ.L10N.setLanguage('es');

      mq.latex('10^{-5}');
      assert.equal(mq.mathspeak(), '10 a la potencia menos 5');
    });
  });
});
