suite('mouse', function () {
  const $ = window.test_only_jquery;

  test('basic mouse selection', function () {
    const mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

    mq.latex('1+3+5+1+1');
    const rect = mq.el().getBoundingClientRect();
    const three = $('#mock .mq-digit:contains(3)');

    const beforeOne = rect.left + 1;
    const five = $('#mock .mq-digit:contains(5)');
    const afterThree = three.get(0).getBoundingClientRect().right;
    const afterFive = five.get(0).getBoundingClientRect().right;

    const cases = [
      { x0: beforeOne, x1: beforeOne, expected: [0, 0] },
      { x0: afterThree, x1: afterThree, expected: [3, 3] },
      { x0: beforeOne, x1: afterThree, expected: [0, 3] },
      { x0: afterFive, x1: afterFive, expected: [5, 5] },
      { x0: afterThree, x1: afterFive, expected: [3, 5] },
      { x0: afterFive, x1: afterThree, expected: [3, 5] }
    ];

    for (const { x0, x1, expected } of cases) {
      const y = rect.top + 10;

      dispatchMouseEventAtPoint('mousedown', rect.left + x0, y);
      dispatchMouseEventAtPoint('mousemove', rect.left + x1, y);
      dispatchMouseEventAtPoint('mouseup', rect.left + x1, y);

      assertDeepEqual(mq.selection(), {
        latex: '1+3+5+1+1',
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
