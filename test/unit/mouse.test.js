suite('mouse', function () {
  const $ = window.test_only_jquery;

  test('basic mouse selection', function () {
    const mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

    mq.latex('1+1+1+1+1');

    const cases = [
      { x0: 1, x1: 1, expected: [0, 0] },
      { x0: 40, x1: 40, expected: [3, 3] },
      { x0: 1, x1: 40, expected: [0, 3] },
      { x0: 80, x1: 80, expected: [6, 6] },
      { x0: 40, x1: 80, expected: [3, 6] },
      { x0: 80, x1: 40, expected: [3, 6] }
    ];

    for (const { x0, x1, expected } of cases) {
      const rect = mq.el().getBoundingClientRect();
      const y = rect.top + 10;

      dispatchMouseEventAtPoint('mousedown', rect.left + x0, y);
      dispatchMouseEventAtPoint('mousemove', rect.left + x1, y);
      dispatchMouseEventAtPoint('mouseup', rect.left + x1, y);

      assertDeepEqual(mq.selection(), {
        latex: '1+1+1+1+1',
        startIndex: expected[0],
        endIndex: expected[1]
      });

      mq.blur();
    }
  });

  test('selecting over embedded mathquill', function () {
    const mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

    mq.latex('1+1\\token{1}');

    const mqRect = mq.el().getBoundingClientRect();

    const x0 = mqRect.left + 1;
    const y = mqRect.top + 10;

    const embeddedMq = MQ.MathField(
      $('<span></span>').appendTo('[data-mq-token="1"]')[0]
    );
    embeddedMq.latex('abcdef');
    const tokenRect = embeddedMq.el().getBoundingClientRect();

    const x1 = tokenRect.left + tokenRect.width / 2;
    const x2 = tokenRect.right + 1;

    dispatchMouseEventAtPoint('mousedown', x0, y);
    dispatchMouseEventAtPoint('mousemove', x1, y);
    dispatchMouseEventAtPoint('mousemove', x2, y);
    dispatchMouseEventAtPoint('mouseup', x2, y);

    assertDeepEqual(mq.selection(), {
      latex: '1+1\\token{1}',
      startIndex: 0,
      endIndex: 12
    });
  });
});

function assertDeepEqual(a, b) {
  assert.equal(JSON.stringify(a), JSON.stringify(b));
}

function dispatchMouseEventAtPoint(type, x, y) {
  const el = document.elementFromPoint(x, y) || document;
  el.dispatchEvent(
    new MouseEvent(type, { clientX: x, clientY: y, bubbles: true })
  );
}
