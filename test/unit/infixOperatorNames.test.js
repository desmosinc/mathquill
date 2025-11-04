suite('infixOperatorNames', function () {
  const $ = window.test_only_jquery;
  var mq;
  setup(function () {
    const autoOperatorNames = 'arcsinh sin height with for';
    const infixOperatorNames = 'with for';
    const prefixOperatorNames = 'sin ln log';
    const opts = { autoOperatorNames, infixOperatorNames, prefixOperatorNames };
    mq = MQ.MathField($('<span></span>').appendTo('#mock')[0], opts);
  });

  function prayWellFormedPoint(pt) {
    prayWellFormed(pt.parent, pt[L], pt[R]);
  }
  function assertLatex(latex) {
    prayWellFormedPoint(mq.__controller.cursor);
    assert.equal(mq.latex(), latex);
  }

  function assertAriaEqual(alertText) {
    assert.equal(mq.__controller.aria.msg, alertText);
  }

  test('for stops scanning', function () {
    mq.typedText('tfor1/');
    assertLatex('t\\operatorname{for}\\frac{1}{ }');
  });

  test('sin does not stop scanning', function () {
    mq.typedText('tsin1/');
    assertLatex('\\frac{t\\sin1}{ }');
  });

  test('arcsinh does not stop scanning', function () {
    mq.typedText('tarcsinh1/');
    assertLatex('\\frac{t\\operatorname{arcsinh}1}{ }');
  });

  test('backspace invalidates word', function () {
    mq.typedText('tfor1');
    mq.keystroke('Home').keystroke('Right').keystroke('Del');
    assertLatex('tor1');
    mq.keystroke('End').typedText('/');
    assertLatex('\\frac{tor1}{ }');
  });

  test('minus after height is minus', function () {
    mq.typedText('theight-');
    assertAriaEqual('minus');
    var t = $('#mock var.mq-operator-name:last');
    assert.equal(t.text(), 't');
    assert.ok(!t.is('.mq-last'));
  });

  test('minus after sin is minus', function () {
    mq.typedText('tsin-');
    assertAriaEqual('negative');
    var n = $('#mock var.mq-operator-name:last');
    assert.equal(n.text(), 'n');
    assert.ok(n.is('.mq-last'));
  });

  test('minus after for is negative', function () {
    mq.typedText('tfor-');
    assertAriaEqual('negative');
    var r = $('#mock var.mq-operator-name:last');
    assert.equal(r.text(), 'r');
    assert.ok(r.is('.mq-last'));
  });

  test('minus after close-paren is minus', function () {
    mq.typedText('(x)-');
    assertAriaEqual('minus');
  });

  test('minus after open-paren is negative', function () {
    mq.typedText('(-');
    assertAriaEqual('negative');
  });
});
