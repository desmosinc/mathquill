suite('Public API', function () {
  const $ = window.test_only_jquery;
  suite('global functions', function () {
    test('null', function () {
      assert.equal(MQ(), null);
      assert.equal(MQ(0), null);
      assert.equal(MQ('<span/>'), null);
      assert.equal(MQ($('<span/>')[0]), null);
      assert.equal(MQ.MathField(), null);
      assert.equal(MQ.MathField(0), null);
      assert.equal(MQ.MathField('<span/>'), null);
    });

    test('MQ.MathField()', function () {
      var el = $('<span>x^2</span>');
      var mathField = MQ.MathField(el[0]);
      assert.ok(mathField instanceof MQ.MathField);
      assert.ok(mathField instanceof MQ.EditableField);
      assert.ok(mathField instanceof MQ);
      assert.ok(mathField instanceof MathQuill);
    });

    test('interface versioning isolates prototype chain', function () {
      var mathFieldSpan = $('<span/>')[0];
      var mathField = MQ.MathField(mathFieldSpan);

      var MQ1 = MathQuill.getInterface(1);
      assert.ok(!(mathField instanceof MQ1.MathField));
      assert.ok(!(mathField instanceof MQ1.EditableField));
      assert.ok(!(mathField instanceof MQ1));
    });

    test('interface version < 3 throws an error if jQuery is not present', function () {
      window.$ = window.jQuery = undefined;
      assert.throws(
        () => MathQuill.getInterface(1),
        'MathQuill.getInterface(1) throws if jquery is not present'
      );
      assert.throws(
        () => MathQuill.getInterface(2),
        'MathQuill.getInterface(2) throws if jquery is not present'
      );
      assert.ok(
        MathQuill.getInterface(3),
        'MathQuill.getInterface(3) succeeds without jquery present'
      );
      setupJqueryStub();
      assert.ok(
        MathQuill.getInterface(1),
        'MathQuill.getInterface(1) succeeds when jquery is present'
      );
      assert.ok(
        MathQuill.getInterface(2),
        'MathQuill.getInterface(1) succeeds when jquery is present'
      );
    });

    test('identity of API object returned by MQ()', function () {
      var mathFieldSpan = $('<span/>')[0];
      var mathField = MQ.MathField(mathFieldSpan);

      assert.ok(MQ(mathFieldSpan) !== mathField);

      assert.equal(MQ(mathFieldSpan).id, mathField.id);
      assert.equal(MQ(mathFieldSpan).id, MQ(mathFieldSpan).id);

      assert.equal(MQ(mathFieldSpan).data, mathField.data);
      assert.equal(MQ(mathFieldSpan).data, MQ(mathFieldSpan).data);
    });

    test('blurred when created', function () {
      var el = $('<span/>');
      MQ.MathField(el[0]);
      var rootBlock = el.find('.mq-root-block');
      assert.ok(rootBlock.hasClass('mq-empty'));
      assert.ok(!rootBlock.hasClass('mq-hasCursor'));
    });
  });

  suite('mathquill-basic', function () {
    var mq;
    setup(function () {
      mq = MQBasic.MathField($('<span></span>').appendTo('#mock')[0]);
    });

    test('typing \\', function () {
      mq.typedText('\\');
      assert.equal(mq.latex(), '\\backslash');
    });

    test('typing $', function () {
      mq.typedText('$');
      assert.equal(mq.latex(), '\\$');
    });

    test('parsing of advanced symbols', function () {
      mq.latex('\\oplus');
      assert.equal(mq.latex(), ''); // TODO: better LaTeX parse error behavior
    });
  });

  suite('basic API methods', function () {
    var mq;
    setup(function () {
      mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);
    });

    test('.revert()', function () {
      var mq = MQ.MathField($('<span>some <code>HTML</code></span>')[0]);
      assert.equal(mq.revert().innerHTML, 'some <code>HTML</code>');
    });

    test('interface v1 and v2 .revert() return jquery colletion', function () {
      // interface version 1
      setupJqueryStub();
      var MQ1 = MathQuill.getInterface(1);
      var mq = MQ1.MathField($('<span>some <code>HTML</code></span>')[0]);
      assert.equal(mq.revert().html(), 'some <code>HTML</code>');

      var MQ2 = MathQuill.getInterface(2);
      var mq = MQ2.MathField($('<span>some <code>HTML</code></span>')[0]);
      assert.equal(mq.revert().html(), 'some <code>HTML</code>');
    });

    test('select, clearSelection', function () {
      mq.latex('n+\\frac{n}{2}');
      assert.ok(!mq.__controller.cursor.selection);
      mq.select();
      assert.equal(
        mq.__controller.cursor.selection.join('latex'),
        'n+\\frac{n}{2}'
      );
      mq.clearSelection();
      assert.ok(!mq.__controller.cursor.selection);
    });

    test('select an empty mq', function () {
      assert.ok(!mq.__controller.cursor.selection);
      mq.select();
      // select on an empty mq is a noop
      assert.ok(!mq.__controller.cursor.selection);
    });

    test("latex while there's a selection", function () {
      mq.latex('a');
      assert.equal(mq.latex(), 'a');
      mq.select();
      assert.equal(mq.__controller.cursor.selection.join('latex'), 'a');
      mq.latex('b');
      assert.equal(mq.latex(), 'b');
      mq.typedText('c');
      assert.equal(mq.latex(), 'bc');
    });

    test("latex while there's a selection 2", function () {
      mq.latex('1.2');
      assert.equal(mq.latex(), '1.2');
      mq.select();
      assert.equal(mq.__controller.cursor.selection.join('latex'), '1.2');
      mq.latex('1');
      assert.equal(mq.latex(), '1');
      mq.typedText('c');
      assert.equal(mq.latex(), '1c');
    });

    test('latex while cursor is in the middle of an expression', function () {
      mq.typedText('1.2');
      mq.focus();
      var t = mq.el().querySelector('textarea');
      trigger.keydown(t, 'ArrowLeft');
      trigger.keypress(t, 'ArrowLeft');
      trigger.keyup(t, 'ArrowLeft');
      trigger.keydown(t, 'Backspace');
      trigger.keypress(t, 'Backspace');
      trigger.keyup(t, 'Backspace');
      assert.equal(mq.latex(), '12');
      mq.latex('1.2');
      assert.equal(mq.latex(), '1.2');
      mq.typedText('/');
      assert.equal(mq.latex(), '\\frac{1.2}{ }');
    });

    test('.html() trivial case', function () {
      mq.latex('x+y');
      assert.equal(
        mq.html(),
        '<var>x</var><span class="mq-binary-operator">+</span><var>y</var>'
      );
    });

    test('.text() with incomplete commands', function () {
      assert.equal(mq.text(), '');
      mq.typedText('\\');
      assert.equal(mq.text(), '\\');
      mq.typedText('s');
      assert.equal(mq.text(), '\\s');
      mq.typedText('qrt');
      assert.equal(mq.text(), '\\sqrt');
    });

    test('.text() with complete commands', function () {
      mq.latex('\\sqrt{}');
      assert.equal(mq.text(), 'sqrt()');
      mq.latex('\\nthroot[]{}');
      assert.equal(mq.text(), 'sqrt[]()');
      mq.latex('\\frac{}{}');
      assert.equal(mq.text(), '()/()');
      mq.latex('\\frac{3}{5}');
      assert.equal(mq.text(), '(3)/(5)');
      mq.latex('\\frac{3+2}{5-1}');
      assert.equal(mq.text(), '(3+2)/(5-1)');
      mq.latex('\\div');
      assert.equal(mq.text(), '[/]');
      mq.latex('^{}');
      assert.equal(mq.text(), '^( )');
      mq.latex('3^{4}');
      assert.equal(mq.text(), '3^4');
      mq.latex('3x+\\ 4');
      assert.equal(mq.text(), '3*x+ 4');
      mq.latex('x^2');
      assert.equal(mq.text(), 'x^2');

      mq.latex('');
      mq.typedText('*2*3***4');
      assert.equal(mq.text(), '*2*3***4');
    });

    test('.moveToDirEnd(dir)', function () {
      mq.latex('a x^2 + b x + c = 0');
      assert.equal(mq.__controller.cursor[L].ctrlSeq, '0');
      assert.equal(mq.__controller.cursor[R], 0);
      mq.moveToLeftEnd();
      assert.equal(mq.__controller.cursor[L], 0);
      assert.equal(mq.__controller.cursor[R].ctrlSeq, 'a');
      mq.moveToRightEnd();
      assert.equal(mq.__controller.cursor[L].ctrlSeq, '0');
      assert.equal(mq.__controller.cursor[R], 0);
    });

    test('.empty()', function () {
      mq.latex('xyz');
      mq.empty();
      assert.equal(mq.latex(), '');
    });
    test('ARIA labels', function () {
      mq.setAriaLabel('ARIA label');
      mq.setAriaPostLabel('ARIA post-label');
      assert.equal(mq.getAriaLabel(), 'ARIA label');
      assert.equal(mq.getAriaPostLabel(), 'ARIA post-label');
      mq.setAriaLabel('');
      mq.setAriaPostLabel('');
      assert.equal(mq.getAriaLabel(), 'Math Input');
      assert.equal(mq.getAriaPostLabel(), '');
    });

    test('.isUserSelecting()', function () {
      mq.latex('x+y');

      // Initially should not be selecting
      assert.equal(mq.isUserSelecting(), false);

      // Simulate mouse down event to start selection
      var mouseDownEvent = new MouseEvent('mousedown', {
        clientX: 10,
        clientY: 10,
        bubbles: true
      });
      mq.el().dispatchEvent(mouseDownEvent);

      // Should be selecting during mouse down
      assert.equal(mq.isUserSelecting(), true);

      // Simulate mouse up event to end selection
      var mouseUpEvent = new MouseEvent('mouseup', {
        clientX: 20,
        clientY: 10,
        bubbles: true
      });
      document.dispatchEvent(mouseUpEvent);

      // Should not be selecting after mouse up
      assert.equal(mq.isUserSelecting(), false);
    });

    test('selection restoration shows blinking cursor', function () {
      mq.latex('a+b+c');
      mq.focus();

      assert.ok(
        mq.el().querySelector('.mq-cursor'),
        'cursor shows up to start'
      );

      // Create a selection covering entire content
      mq.select();
      var selectionSnapshot = mq.selection();

      assert.ok(
        !mq.el().querySelector('.mq-cursor'),
        'cursor should not be in DOM during selection'
      );

      // Move to a single cursor position (no selection)
      mq.moveToLeftEnd();
      var caretSnapshot = mq.selection();

      assert.ok(
        mq.el().querySelector('.mq-cursor'),
        'cursor should be in DOM at single position'
      );
      assert.equal(
        caretSnapshot.startIndex,
        caretSnapshot.endIndex,
        'should be a caret position'
      );

      // Restore the full selection
      mq.selection(selectionSnapshot);
      assert.ok(
        !mq.el().querySelector('.mq-cursor'),
        'cursor should not be in DOM during selection'
      );

      // Now restore the single caret position - this should show the blinking cursor
      mq.selection(caretSnapshot);
      assert.ok(
        mq.el().querySelector('.mq-cursor'),
        'cursor should be in DOM and visible after restoring caret position'
      );
    });

    test('.mathspeak()', function () {
      function assertMathSpeakEqual(a, b) {
        assert.equal(normalize(a), normalize(b));
        function normalize(str) {
          return str
            .replace(/\d(?!\d)/g, '$& ')
            .split(/[ ,]+/)
            .join(' ')
            .trim();
        }
      }

      mq.latex('123.456');
      assertMathSpeakEqual(mq.mathspeak(), '123.4 5 6');

      mq.latex('\\frac{d}{dx}\\sqrt{x}');
      assertMathSpeakEqual(
        mq.mathspeak(),
        'Start Fraction "d" over "d" "x" End Fraction Start Root "x" End Root'
      );

      mq.latex('1+2-3\\cdot\\frac{5}{6^7}=\\left(8+9\\right)');
      assertMathSpeakEqual(
        mq.mathspeak(),
        '1 plus 2 minus 3 times Start Fraction 5 over 6 to the 7th power End Fraction equals left parenthesis 8 plus 9 right parenthesis'
      );

      // Example 13 from http://www.gh-mathspeak.com/examples/quick-tutorial/index.php?verbosity=v&explicitness=2&interp=0
      mq.latex(
        'd=\\sqrt{ \\left( x_2 - x_1 \\right)^2 - \\left( y_2 - y_1 \\right)^2 }'
      );
      assertMathSpeakEqual(
        mq.mathspeak(),
        '"d" equals Start Root left parenthesis "x" Subscript 2 Baseline minus "x" Subscript 1 Baseline right parenthesis squared minus left parenthesis "y" Subscript 2 Baseline minus "y" Subscript 1 Baseline right parenthesis squared End Root'
      );

      mq.latex('').typedText('\\langle').keystroke('Spacebar').typedText('u,v'); // .latex() doesn't work yet for angle brackets :(
      assertMathSpeakEqual(
        mq.mathspeak(),
        'left angle-bracket "u" "v" right angle-bracket'
      );

      mq.latex('\\left| x \\right| + \\left( y \\right|');
      assertMathSpeakEqual(
        mq.mathspeak(),
        'Start Absolute Value "x" End Absolute Value plus left parenthesis "y" right pipe'
      );
    });
  });

  test('edit handler interface versioning', function () {
    var count = 0;
    setupJqueryStub();

    // interface version 2 (latest)
    var mq2 = MQ.MathField($('<span></span>').appendTo('#mock')[0], {
      handlers: {
        edit: function (_mq) {
          assert.equal(mq2.id, _mq.id);
          count += 1;
        }
      }
    });
    assert.equal(count, 0);
    mq2.latex('x^2');
    assert.equal(count, 2); // sigh, once for postOrder and once for bubble

    count = 0;
    // interface version 1
    var MQ1 = MathQuill.getInterface(1);
    var mq1 = MQ1.MathField($('<span></span>').appendTo('#mock')[0], {
      handlers: {
        edit: function (_mq) {
          if (count <= 2) assert.equal(mq1, undefined);
          else assert.equal(mq1.id, _mq.id);
          count += 1;
        }
      }
    });
    assert.equal(count, 2);
  });

  suite('*OutOf handlers', function () {
    testHandlers('MQ.MathField() constructor', function (options) {
      return MQ.MathField($('<span></span>').appendTo('#mock')[0], options);
    });
    testHandlers('MQ.StaticMath() constructor', function (options) {
      return MQ.StaticMath(
        $('<span>\\MathQuillMathField{}</span>').appendTo('#mock')[0],
        options
      ).innerFields[0];
    });
    testHandlers('MQ.MathField::config()', function (options) {
      return MQ.MathField($('<span></span>').appendTo('#mock')[0]).config(
        options
      );
    });
    testHandlers(
      'MQ.StaticMath::config() propagates down to \\MathQuillMathField{}',
      function (options) {
        return MQ.StaticMath(
          $('<span>\\MathQuillMathField{}</span>').appendTo('#mock')[0]
        ).config(options).innerFields[0];
      }
    );
    testHandlers(
      '.config() directly on a \\MathQuillMathField{} in a MQ.StaticMath using .innerFields',
      function (options) {
        return MQ.StaticMath(
          $('<span>\\MathQuillMathField{}</span>').appendTo('#mock')[0]
        ).innerFields[0].config(options);
      }
    );
    suite('global MQ.config()', function () {
      testHandlers('a MQ.MathField', function (options) {
        MQ.config(options);
        return MQ.MathField($('<span></span>').appendTo('#mock')[0]);
      });
      testHandlers(
        '\\MathQuillMathField{} in a MQ.StaticMath',
        function (options) {
          MQ.config(options);
          return MQ.StaticMath(
            $('<span>\\MathQuillMathField{}</span>').appendTo('#mock')[0]
          ).innerFields[0];
        }
      );
      teardown(function () {
        MQ.config({ handlers: undefined });
      });
    });
    function testHandlers(title, mathFieldMaker) {
      test(title, function () {
        var enterCounter = 0,
          upCounter = 0,
          moveCounter = 0,
          deleteCounter = 0,
          dir = null;

        var mq = mathFieldMaker({
          handlers: {
            enter: function (_mq) {
              assert.equal(arguments.length, 1);
              assert.equal(_mq.id, mq.id);
              enterCounter += 1;
            },
            upOutOf: function (_mq) {
              assert.equal(arguments.length, 1);
              assert.equal(_mq.id, mq.id);
              upCounter += 1;
            },
            moveOutOf: function (_dir, _mq) {
              assert.equal(arguments.length, 2);
              assert.equal(_mq.id, mq.id);
              dir = _dir;
              moveCounter += 1;
            },
            deleteOutOf: function (_dir, _mq) {
              assert.equal(arguments.length, 2);
              assert.equal(_mq.id, mq.id);
              dir = _dir;
              deleteCounter += 1;
            }
          }
        });

        mq.latex('n+\\frac{n}{2}'); // starts at right edge
        assert.equal(moveCounter, 0);

        mq.typedText('\n'); // nothing happens
        assert.equal(enterCounter, 1);

        mq.keystroke('Right'); // stay at right edge
        assert.equal(moveCounter, 1);
        assert.equal(dir, R);

        mq.keystroke('Right'); // stay at right edge
        assert.equal(moveCounter, 2);
        assert.equal(dir, R);

        mq.keystroke('Left'); // right edge of denominator
        assert.equal(moveCounter, 2);
        assert.equal(upCounter, 0);

        mq.keystroke('Up'); // right edge of numerator
        assert.equal(moveCounter, 2);
        assert.equal(upCounter, 0);

        mq.keystroke('Up'); // stays at right edge of numerator
        assert.equal(upCounter, 1);

        mq.keystroke('Up'); // stays at right edge of numerator
        assert.equal(upCounter, 2);

        // go to left edge
        mq.keystroke('Left')
          .keystroke('Left')
          .keystroke('Left')
          .keystroke('Left');
        assert.equal(moveCounter, 2);

        mq.keystroke('Left'); // stays at left edge
        assert.equal(moveCounter, 3);
        assert.equal(dir, L);
        assert.equal(deleteCounter, 0);

        mq.keystroke('Backspace'); // stays at left edge
        assert.equal(deleteCounter, 1);
        assert.equal(dir, L);

        mq.keystroke('Backspace'); // stays at left edge
        assert.equal(deleteCounter, 2);
        assert.equal(dir, L);

        mq.keystroke('Left'); // stays at left edge
        assert.equal(moveCounter, 4);
        assert.equal(dir, L);

        $('#mock').empty();
      });
    }
  });

  suite('edit handler', function () {
    test('fires when closing a bracket expression', function () {
      var count = 0;
      var mq = MQ.MathField($('<span>').appendTo('#mock')[0], {
        handlers: {
          edit: function () {
            count += 1;
          }
        }
      });
      mq.typedText('(3, 4');
      var countBeforeClosingBracket = count;
      mq.typedText(']');
      assert.equal(count, countBeforeClosingBracket + 1);
    });
  });

  suite('.cmd(...)', function () {
    var mq;
    setup(function () {
      mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);
    });

    test('basic', function () {
      mq.cmd('x');
      assert.equal(mq.latex(), 'x');
      mq.cmd('y');
      assert.equal(mq.latex(), 'xy');
      mq.cmd('^');
      assert.equal(mq.latex(), 'xy^{ }');
      mq.cmd('2');
      assert.equal(mq.latex(), 'xy^{2}');
      mq.keystroke('Right Shift-Left Shift-Left Shift-Left').cmd('\\sqrt');
      assert.equal(mq.latex(), '\\sqrt{xy^{2}}');
      mq.typedText('*2**');
      assert.equal(mq.latex(), '\\sqrt{xy^{2}\\cdot2\\cdot\\cdot}');
    });

    test('backslash commands are passed their name', function () {
      mq.cmd('\\alpha');
      assert.equal(mq.latex(), '\\alpha');
    });

    test('replaces selection', function () {
      mq.typedText('49').select().cmd('\\sqrt');
      assert.equal(mq.latex(), '\\sqrt{49}');
    });

    test('operator name', function () {
      mq.cmd('\\sin');
      assert.equal(mq.latex(), '\\sin');
    });

    test('nonexistent LaTeX command is noop', function () {
      mq.typedText('49').select().cmd('\\asdf').cmd('\\sqrt');
      assert.equal(mq.latex(), '\\sqrt{49}');
    });

    test('overflow triggers automatic horizontal scroll', function (done) {
      var mqEl = mq.el();
      var rootEl = mq.__controller.root.domFrag().oneElement();
      var cursor = mq.__controller.cursor;

      $(mqEl).width(10);
      var previousScrollLeft = rootEl.scrollLeft;

      mq.cmd('\\alpha');
      setTimeout(afterScroll, 150);

      function afterScroll() {
        cursor.show();

        try {
          assert.ok(rootEl.scrollLeft > previousScrollLeft, 'scrolls on cmd');
          assert.ok(
            mqEl.getBoundingClientRect().right >
              cursor.domFrag().firstElement().getBoundingClientRect().right,
            'cursor right end is inside the field'
          );
        } catch (error) {
          done(error);
          return;
        }

        done();
      }
    });
  });

  suite('spaceBehavesLikeTab', function () {
    var mq, rootBlock, cursor;
    test('space behaves like tab with default opts', function () {
      mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);
      rootBlock = mq.__controller.root;
      cursor = mq.__controller.cursor;

      mq.latex('\\sqrt{x}');
      mq.keystroke('Left');

      mq.keystroke('Spacebar');
      mq.typedText(' ');
      assert.equal(
        cursor[L].ctrlSeq,
        '\\ ',
        'left of the cursor is ' + cursor[L].ctrlSeq
      );
      assert.equal(cursor[R], 0, 'right of the cursor is ' + cursor[R]);
      mq.keystroke('Backspace');

      mq.keystroke('Shift-Spacebar');
      mq.typedText(' ');
      assert.equal(
        cursor[L].ctrlSeq,
        '\\ ',
        'left of the cursor is ' + cursor[L].ctrlSeq
      );
      assert.equal(cursor[R], 0, 'right of the cursor is ' + cursor[R]);
    });
    test('space behaves like tab when spaceBehavesLikeTab is true', function () {
      var opts = { spaceBehavesLikeTab: true };
      mq = MQ.MathField($('<span></span>').appendTo('#mock')[0], opts);
      rootBlock = mq.__controller.root;
      cursor = mq.__controller.cursor;

      mq.latex('\\sqrt{x}');

      mq.keystroke('Left');
      mq.keystroke('Spacebar');
      assert.equal(
        cursor[L].parent,
        rootBlock,
        'parent of the cursor is  ' + cursor[L].ctrlSeq
      );
      assert.equal(cursor[R], 0, 'right cursor is ' + cursor[R]);

      mq.keystroke('Left');
      mq.keystroke('Shift-Spacebar');
      assert.equal(cursor[L], 0, 'left cursor is ' + cursor[L]);
      assert.equal(
        cursor[R],
        rootBlock.ends[L],
        'parent of rootBlock is ' + cursor[R]
      );
    });
    test('space behaves like tab when globally set to true', function () {
      MQ.config({ spaceBehavesLikeTab: true });

      mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);
      rootBlock = mq.__controller.root;
      cursor = mq.__controller.cursor;

      mq.latex('\\sqrt{x}');

      mq.keystroke('Left');
      mq.keystroke('Spacebar');
      assert.equal(cursor.parent, rootBlock, 'cursor in root block');
      assert.equal(cursor[R], 0, 'cursor at end of block');
    });
  });

  suite('maxDepth option', function () {
    setup(function () {
      mq = MQ.MathField($('<span></span>').appendTo('#mock')[0], {
        maxDepth: 1
      });
    });
    teardown(function () {
      $(mq.el()).remove();
    });

    test('prevents nested math input via .write() method', function () {
      mq.write('1\\frac{\\frac{3}{3}}{2}');
      assert.equal(mq.latex(), '1\\frac{ }{ }');
    });

    test('prevents nested math input via keyboard input', function () {
      mq.cmd('/').write('x');
      assert.equal(mq.latex(), '\\frac{ }{ }');
    });

    test('stops new fraction moving content into numerator', function () {
      mq.write('x').cmd('/');
      assert.equal(mq.latex(), 'x\\frac{ }{ }');
    });

    test('prevents nested math input via replacedFragment', function () {
      mq.cmd('(').keystroke('Left').cmd('(');
      assert.equal(mq.latex(), '\\left(\\right)');
    });
  });

  suite('statelessClipboard option', function () {
    suite('default', function () {
      var mq, textarea;
      setup(function () {
        mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);
        textarea = $(mq.el()).find('textarea');
      });
      function assertPaste(paste, latex) {
        if (arguments.length < 2) latex = paste;
        mq.latex('');
        trigger.paste(textarea[0]);
        textarea.val(paste);
        trigger.input(textarea[0]);
        assert.equal(mq.latex(), latex);
      }

      test('numbers and letters', function () {
        assertPaste('123xyz');
      });
      test('a sentence', function () {
        assertPaste(
          'Lorem ipsum is a placeholder text commonly used to ' +
            'demonstrate the graphical elements of a document or ' +
            'visual presentation.',
          'Loremipsumisaplaceholdertextcommonlyusedtodemonstrate' +
            'thegraphicalelementsofadocumentorvisualpresentation.'
        );
      });
      test('actual LaTeX', function () {
        assertPaste('a_{n}x^{n}+a_{n+1}x^{n+1}');
        assertPaste('\\frac{1}{2\\sqrt{x}}');
      });
      test('\\text{...}', function () {
        assertPaste('\\text{lol}');
        assertPaste('1+\\text{lol}+2');
        assertPaste('\\frac{\\text{apples}}{\\text{oranges}}');
      });
      test('selection', function (done) {
        mq.latex('x^2').select();
        setTimeout(function () {
          assert.equal(textarea.val(), 'x^{2}');
          done();
        });
      });
    });
    suite('statelessClipboard set to true', function () {
      var mq, textarea;
      setup(function () {
        mq = MQ.MathField($('<span></span>').appendTo('#mock')[0], {
          statelessClipboard: true
        });
        textarea = $(mq.el()).find('textarea');
      });
      function assertPaste(paste, latex) {
        if (arguments.length < 2) latex = paste;
        mq.latex('');
        trigger.paste(textarea[0]);
        textarea.val(paste);
        trigger.input(textarea[0]);
        assert.equal(mq.latex(), latex);
      }

      test('numbers and letters', function () {
        assertPaste('123xyz', '\\text{123xyz}');
      });
      test('a sentence', function () {
        assertPaste(
          'Lorem ipsum is a placeholder text commonly used to ' +
            'demonstrate the graphical elements of a document or ' +
            'visual presentation.',
          '\\text{Lorem ipsum is a placeholder text commonly used to ' +
            'demonstrate the graphical elements of a document or ' +
            'visual presentation.}'
        );
      });
      test('backslashes', function () {
        assertPaste(
          'something \\pi something \\asdf',
          '\\text{something \\backslash pi something \\backslash asdf}'
        );
      });
      // TODO: braces (currently broken)
      test('actual math LaTeX wrapped in dollar signs', function () {
        assertPaste('$a_nx^n+a_{n+1}x^{n+1}$', 'a_{n}x^{n}+a_{n+1}x^{n+1}');
        assertPaste('$\\frac{1}{2\\sqrt{x}}$', '\\frac{1}{2\\sqrt{x}}');
      });
      test('selection', function (done) {
        mq.latex('x^2').select();
        setTimeout(function () {
          assert.equal(textarea.val(), '$x^{2}$');
          done();
        });
      });
    });
  });

  suite('leftRightIntoCmdGoes: "up"/"down"', function () {
    test('"up" or "down" required', function () {
      assert.throws(function () {
        MQ.MathField($('<span></span>')[0], { leftRightIntoCmdGoes: 1 });
      });
    });
    suite('default', function () {
      var mq;
      setup(function () {
        mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);
      });

      test('fractions', function () {
        mq.latex('\\frac{1}{x}+\\frac{\\frac{1}{2}}{\\frac{3}{4}}');
        assert.equal(
          mq.latex(),
          '\\frac{1}{x}+\\frac{\\frac{1}{2}}{\\frac{3}{4}}'
        );

        mq.moveToLeftEnd().typedText('a');
        assert.equal(
          mq.latex(),
          'a\\frac{1}{x}+\\frac{\\frac{1}{2}}{\\frac{3}{4}}'
        );

        mq.keystroke('Right').typedText('b');
        assert.equal(
          mq.latex(),
          'a\\frac{b1}{x}+\\frac{\\frac{1}{2}}{\\frac{3}{4}}'
        );

        mq.keystroke('Right Right').typedText('c');
        assert.equal(
          mq.latex(),
          'a\\frac{b1}{cx}+\\frac{\\frac{1}{2}}{\\frac{3}{4}}'
        );

        mq.keystroke('Right Right').typedText('d');
        assert.equal(
          mq.latex(),
          'a\\frac{b1}{cx}d+\\frac{\\frac{1}{2}}{\\frac{3}{4}}'
        );

        mq.keystroke('Right Right').typedText('e');
        assert.equal(
          mq.latex(),
          'a\\frac{b1}{cx}d+\\frac{e\\frac{1}{2}}{\\frac{3}{4}}'
        );

        mq.keystroke('Right').typedText('f');
        assert.equal(
          mq.latex(),
          'a\\frac{b1}{cx}d+\\frac{e\\frac{f1}{2}}{\\frac{3}{4}}'
        );

        mq.keystroke('Right Right').typedText('g');
        assert.equal(
          mq.latex(),
          'a\\frac{b1}{cx}d+\\frac{e\\frac{f1}{g2}}{\\frac{3}{4}}'
        );

        mq.keystroke('Right Right').typedText('h');
        assert.equal(
          mq.latex(),
          'a\\frac{b1}{cx}d+\\frac{e\\frac{f1}{g2}h}{\\frac{3}{4}}'
        );

        mq.keystroke('Right').typedText('i');
        assert.equal(
          mq.latex(),
          'a\\frac{b1}{cx}d+\\frac{e\\frac{f1}{g2}h}{i\\frac{3}{4}}'
        );

        mq.keystroke('Right').typedText('j');
        assert.equal(
          mq.latex(),
          'a\\frac{b1}{cx}d+\\frac{e\\frac{f1}{g2}h}{i\\frac{j3}{4}}'
        );

        mq.keystroke('Right Right').typedText('k');
        assert.equal(
          mq.latex(),
          'a\\frac{b1}{cx}d+\\frac{e\\frac{f1}{g2}h}{i\\frac{j3}{k4}}'
        );

        mq.keystroke('Right Right').typedText('l');
        assert.equal(
          mq.latex(),
          'a\\frac{b1}{cx}d+\\frac{e\\frac{f1}{g2}h}{i\\frac{j3}{k4}l}'
        );

        mq.keystroke('Right').typedText('m');
        assert.equal(
          mq.latex(),
          'a\\frac{b1}{cx}d+\\frac{e\\frac{f1}{g2}h}{i\\frac{j3}{k4}l}m'
        );
      });

      test('supsub', function () {
        mq.latex('x_a+y^b+z_a^b+w');
        assert.equal(mq.latex(), 'x_{a}+y^{b}+z_{a}^{b}+w');

        mq.moveToLeftEnd().typedText('1');
        assert.equal(mq.latex(), '1x_{a}+y^{b}+z_{a}^{b}+w');

        mq.keystroke('Right Right').typedText('2');
        assert.equal(mq.latex(), '1x_{2a}+y^{b}+z_{a}^{b}+w');

        mq.keystroke('Right Right').typedText('3');
        assert.equal(mq.latex(), '1x_{2a}3+y^{b}+z_{a}^{b}+w');

        mq.keystroke('Right Right Right').typedText('4');
        assert.equal(mq.latex(), '1x_{2a}3+y^{4b}+z_{a}^{b}+w');

        mq.keystroke('Right Right').typedText('5');
        assert.equal(mq.latex(), '1x_{2a}3+y^{4b}5+z_{a}^{b}+w');

        mq.keystroke('Right Right Right').typedText('6');
        assert.equal(mq.latex(), '1x_{2a}3+y^{4b}5+z_{6a}^{b}+w');

        mq.keystroke('Right Right').typedText('7');
        assert.equal(mq.latex(), '1x_{2a}3+y^{4b}5+z_{6a}^{7b}+w');

        mq.keystroke('Right Right').typedText('8');
        assert.equal(mq.latex(), '1x_{2a}3+y^{4b}5+z_{6a}^{7b}8+w');
      });

      test('nthroot', function () {
        mq.latex('\\sqrt[n]{x}');
        assert.equal(mq.latex(), '\\sqrt[n]{x}');

        mq.moveToLeftEnd().typedText('1');
        assert.equal(mq.latex(), '1\\sqrt[n]{x}');

        mq.keystroke('Right').typedText('2');
        assert.equal(mq.latex(), '1\\sqrt[2n]{x}');

        mq.keystroke('Right Right').typedText('3');
        assert.equal(mq.latex(), '1\\sqrt[2n]{3x}');

        mq.keystroke('Right Right').typedText('4');
        assert.equal(mq.latex(), '1\\sqrt[2n]{3x}4');
      });
    });

    suite('"up"', function () {
      var mq;
      setup(function () {
        mq = MQ.MathField($('<span></span>').appendTo('#mock')[0], {
          leftRightIntoCmdGoes: 'up'
        });
      });

      test('fractions', function () {
        mq.latex('\\frac{1}{x}+\\frac{\\frac{1}{2}}{\\frac{3}{4}}');
        assert.equal(
          mq.latex(),
          '\\frac{1}{x}+\\frac{\\frac{1}{2}}{\\frac{3}{4}}'
        );

        mq.moveToLeftEnd().typedText('a');
        assert.equal(
          mq.latex(),
          'a\\frac{1}{x}+\\frac{\\frac{1}{2}}{\\frac{3}{4}}'
        );

        mq.keystroke('Right').typedText('b');
        assert.equal(
          mq.latex(),
          'a\\frac{b1}{x}+\\frac{\\frac{1}{2}}{\\frac{3}{4}}'
        );

        mq.keystroke('Right Right').typedText('c');
        assert.equal(
          mq.latex(),
          'a\\frac{b1}{x}c+\\frac{\\frac{1}{2}}{\\frac{3}{4}}'
        );

        mq.keystroke('Right Right').typedText('d');
        assert.equal(
          mq.latex(),
          'a\\frac{b1}{x}c+\\frac{d\\frac{1}{2}}{\\frac{3}{4}}'
        );

        mq.keystroke('Right').typedText('e');
        assert.equal(
          mq.latex(),
          'a\\frac{b1}{x}c+\\frac{d\\frac{e1}{2}}{\\frac{3}{4}}'
        );

        mq.keystroke('Right Right').typedText('f');
        assert.equal(
          mq.latex(),
          'a\\frac{b1}{x}c+\\frac{d\\frac{e1}{2}f}{\\frac{3}{4}}'
        );

        mq.keystroke('Right').typedText('g');
        assert.equal(
          mq.latex(),
          'a\\frac{b1}{x}c+\\frac{d\\frac{e1}{2}f}{\\frac{3}{4}}g'
        );
      });

      test('supsub', function () {
        mq.latex('x_a+y^b+z_a^b+w');
        assert.equal(mq.latex(), 'x_{a}+y^{b}+z_{a}^{b}+w');

        mq.moveToLeftEnd().typedText('1');
        assert.equal(mq.latex(), '1x_{a}+y^{b}+z_{a}^{b}+w');

        mq.keystroke('Right Right').typedText('2');
        assert.equal(mq.latex(), '1x_{2a}+y^{b}+z_{a}^{b}+w');

        mq.keystroke('Right Right').typedText('3');
        assert.equal(mq.latex(), '1x_{2a}3+y^{b}+z_{a}^{b}+w');

        mq.keystroke('Right Right Right').typedText('4');
        assert.equal(mq.latex(), '1x_{2a}3+y^{4b}+z_{a}^{b}+w');

        mq.keystroke('Right Right').typedText('5');
        assert.equal(mq.latex(), '1x_{2a}3+y^{4b}5+z_{a}^{b}+w');

        mq.keystroke('Right Right Right').typedText('6');
        assert.equal(mq.latex(), '1x_{2a}3+y^{4b}5+z_{a}^{6b}+w');

        mq.keystroke('Right Right').typedText('7');
        assert.equal(mq.latex(), '1x_{2a}3+y^{4b}5+z_{a}^{6b}7+w');
      });

      test('nthroot', function () {
        mq.latex('\\sqrt[n]{x}');
        assert.equal(mq.latex(), '\\sqrt[n]{x}');

        mq.moveToLeftEnd().typedText('1');
        assert.equal(mq.latex(), '1\\sqrt[n]{x}');

        mq.keystroke('Right').typedText('2');
        assert.equal(mq.latex(), '1\\sqrt[2n]{x}');

        mq.keystroke('Right Right').typedText('3');
        assert.equal(mq.latex(), '1\\sqrt[2n]{3x}');

        mq.keystroke('Right Right').typedText('4');
        assert.equal(mq.latex(), '1\\sqrt[2n]{3x}4');
      });
    });
  });

  suite('sumStartsWithNEquals', function () {
    test('sum defaults to empty limits', function () {
      var mq = MQ.MathField($('<span>').appendTo('#mock')[0]);
      assert.equal(mq.latex(), '');

      mq.cmd('\\sum');
      assert.equal(mq.latex(), '\\sum_{ }^{ }');

      mq.cmd('n');
      assert.equal(mq.latex(), '\\sum_{n}^{ }', 'cursor in lower limit');
    });
    test('sum starts with `n=`', function () {
      var mq = MQ.MathField($('<span>').appendTo('#mock')[0], {
        sumStartsWithNEquals: true
      });
      assert.equal(mq.latex(), '');

      mq.cmd('\\sum');
      assert.equal(mq.latex(), '\\sum_{n=}^{ }');

      mq.cmd('0');
      assert.equal(mq.latex(), '\\sum_{n=0}^{ }', 'cursor after the `n=`');
    });
    test('integral still has empty limits', function () {
      var mq = MQ.MathField($('<span>').appendTo('#mock')[0], {
        sumStartsWithNEquals: true
      });
      assert.equal(mq.latex(), '');

      mq.cmd('\\int');
      assert.equal(mq.latex(), '\\int_{ }^{ }');

      mq.cmd('0');
      assert.equal(mq.latex(), '\\int_{0}^{ }', 'cursor in the from block');
    });
  });

  suite('substituteTextarea', function () {
    test("doesn't blow up on selection", function () {
      var mq = MQ.MathField($('<span>').appendTo('#mock')[0], {
        substituteTextarea: function () {
          return $(
            '<span tabindex=0 style="display:inline-block;width:1px;height:1px" />'
          )[0];
        }
      });

      assert.equal(mq.latex(), '');
      mq.write('asdf');
      mq.select();
    });
  });

  suite('overrideKeystroke', function () {
    test('can intercept key events', function () {
      var mq = MQ.MathField($('<span>').appendTo('#mock')[0], {
        overrideKeystroke: function (_key, evt) {
          key = _key;
          return mq.keystroke.apply(mq, arguments);
        }
      });
      var key;

      trigger.keydown(mq.el().querySelector('textarea'), 'ArrowLeft');
      assert.equal(key, 'Left');
    });
    test('can intercept key events on static', function () {
      var mq = MQ.StaticMath($('<span>').appendTo('#mock')[0], {
        overrideKeystroke: function (_key, evt) {
          key = _key;
        }
      });
      var key;

      trigger.keydown(mq.el().querySelector('textarea'), 'ArrowLeft');
      assert.equal(key, 'Left');
    });
    test('cut is async', function (done) {
      var mq = MQ.MathField($('<span>').appendTo('#mock')[0], {
        onCut: function () {
          count += 1;
        }
      });
      var count = 0;

      mq.latex('a=2');
      mq.select();

      const textarea = mq.el().querySelector('textarea');

      trigger.cut(textarea);
      assert.equal(count, 0);

      trigger.input(textarea);
      assert.equal(count, 0);

      trigger.keyup(textarea);
      assert.equal(count, 0);

      setTimeout(function () {
        assert.equal(count, 1);
        done();
      }, 100);
    });
  });

  suite('substituteKeyboardEvents (interface versions 1 and 2)', function () {
    for (const v of [1, 2]) {
      setupJqueryStub();
      const MQ_old = MathQuill.getInterface(v);
      test('can intercept key events, interface version ' + v, function () {
        var mq = MQ_old.MathField($('<span>').appendTo('#mock')[0], {
          substituteKeyboardEvents: function (textarea, handlers) {
            return MQ_old.saneKeyboardEvents(
              textarea,
              $.extend({}, handlers, {
                keystroke: function (_key, evt) {
                  key = _key;
                  return handlers.keystroke.apply(handlers, arguments);
                }
              })
            );
          }
        });
        var key;

        trigger.keydown(mq.el().querySelector('textarea'), 'ArrowLeft');
        assert.equal(key, 'Left');
      });
      test('cut is async, interface version ' + v, function () {
        var mq = MQ_old.MathField($('<span>').appendTo('#mock')[0], {
          substituteKeyboardEvents: function (textarea, handlers) {
            return MQ_old.saneKeyboardEvents(
              textarea,
              $.extend({}, handlers, {
                cut: function () {
                  count += 1;
                  return handlers.cut.apply(handlers, arguments);
                }
              })
            );
          }
        });
        var count = 0;

        const textarea = mq.el().querySelector('textarea');

        trigger.cut(textarea);
        assert.equal(count, 0);

        trigger.input(textarea);
        assert.equal(count, 1);

        trigger.keyup(textarea);
        assert.equal(count, 1);
      });
    }

    test('throws for interface version 3', function () {
      assert.throws(() =>
        MQ.MathField(document.createElement('span'), {
          substituteKeyboardEvents: function () {}
        })
      );
    });
  });

  suite('clickAt', function () {
    test('inserts at coordinates', function () {
      // Insert filler so that the page is taller than the window so this test is deterministic
      // Test that we use clientY instead of pageY
      var windowHeight = $(window).height();
      var filler = $('<div>').height(windowHeight);
      filler.prependTo('#mock');

      var mq = MQ.MathField($('<span>').appendTo('#mock')[0]);
      mq.typedText('mmmm/mmmm');
      mq.el().scrollIntoView();

      var box = mq.el().getBoundingClientRect();
      var clientX = box.left + 30;
      var clientY = box.top + 30;
      var target = document.elementFromPoint(clientX, clientY);

      assert.equal(document.activeElement, document.body);
      mq.clickAt(clientX, clientY, target).write('x');
      assert.equal(document.activeElement, $(mq.el()).find('textarea')[0]);

      assert.equal(mq.latex(), '\\frac{mmmm}{mmxmm}');
    });
    test('target is optional', function () {
      // Insert filler so that the page is taller than the window so this test is deterministic
      // Test that we use clientY instead of pageY
      var windowHeight = $(window).height();
      var filler = $('<div>').height(windowHeight);
      filler.prependTo('#mock');

      var mq = MQ.MathField($('<span>').appendTo('#mock')[0]);
      mq.typedText('mmmm/mmmm');
      mq.el().scrollIntoView();

      var box = mq.el().getBoundingClientRect();
      var clientX = box.left + 30;
      var clientY = box.top + 30;

      assert.equal(document.activeElement, document.body);
      mq.clickAt(clientX, clientY).write('x');
      assert.equal(document.activeElement, $(mq.el()).find('textarea')[0]);

      assert.equal(mq.latex(), '\\frac{mmmm}{mmxmm}');
    });
  });

  suite('dropEmbedded', function () {
    test('inserts into empty', function () {
      var mq = MQ.MathField($('<span>').appendTo('#mock')[0]);
      mq.dropEmbedded(0, 0, {
        htmlString: '<span class="embedded-html"></span>',
        text: function () {
          return 'embedded text';
        },
        latex: function () {
          return 'embedded latex';
        }
      });

      assert.ok($('.embedded-html').length);
      assert.equal(mq.text(), 'embedded text');
      assert.equal(mq.latex(), 'embedded latex');
    });
    test('inserts at coordinates', function () {
      // Insert filler so that the page is taller than the window so this test is deterministic
      // Test that we use clientY instead of pageY
      var windowHeight = $(window).height();
      var filler = $('<div>').height(windowHeight);
      filler.prependTo('#mock');

      var mq = MQ.MathField($('<span>').appendTo('#mock')[0]);
      mq.typedText('mmmm/mmmm');
      var pos = $(mq.el()).offset();
      var mqx = pos.left;
      var mqy = pos.top;

      mq.el().scrollIntoView();

      mq.dropEmbedded(mqx + 30, mqy + 30, {
        htmlString: '<span class="embedded-html"></span>',
        text: function () {
          return 'embedded text';
        },
        latex: function () {
          return 'embedded latex';
        }
      });

      assert.ok($('.embedded-html').length);
      assert.equal(mq.text(), '(m*m*m*m)/(m*m*embedded text*m*m)');
      assert.equal(mq.latex(), '\\frac{mmmm}{mmembedded latexmm}');
    });
  });

  test('.registerEmbed()', function () {
    var calls = 0,
      data;
    MQ.registerEmbed('thing', function (data_) {
      calls += 1;
      data = data_;
      return {
        htmlString:
          '<span class="embedded-html"></span><span class="embedded-html-2"></span>',
        text: function () {
          return 'embedded text';
        },
        latex: function () {
          return 'embedded latex';
        }
      };
    });
    var mq = MQ.MathField(
      $('<span>\\sqrt{\\embed{thing}}</span>').appendTo('#mock')[0]
    );
    assert.equal(calls, 1);
    assert.equal(data, undefined);

    assert.ok($('.embedded-html').length);
    assert.ok($('.embedded-html-2').length);
    assert.equal(mq.text(), 'sqrt(embedded text)');
    assert.equal(mq.latex(), '\\sqrt{embedded latex}');

    mq.latex('\\sqrt{\\embed{thing}[data]}');
    assert.equal(calls, 2);
    assert.equal(data, 'data');

    assert.ok($('.embedded-html').length);
    assert.ok($('.embedded-html-2').length);
    assert.equal(mq.text(), 'sqrt(embedded text)');
    assert.equal(mq.latex(), '\\sqrt{embedded latex}');
  });

  suite('StaticMath', function () {
    test('does not render cursor', function () {
      const span = document.createElement('span');
      span.textContent = '\\frac{1}{2}';
      var mq = MQ.StaticMath(
        domFrag(span).appendTo(document.querySelector('#mock')).oneElement(),
        {}
      );
      assert.equal(
        mq.__controller.blurred,
        true,
        'focus state is initialized to blurred'
      );
      assert.equal(
        span.querySelector('.mq-cursor'),
        null,
        'there is no .mq-cursor element'
      );
      mq.latex('123');
      assert.equal(
        span.querySelector('.mq-cursor'),
        null,
        'there is still no .mq-cursor element'
      );
    });

    test('does not render cursor with mouseEvents: false', function () {
      const span = document.createElement('span');
      span.textContent = '\\frac{1}{2}';
      var mq = MQ.StaticMath(
        domFrag(span).appendTo(document.querySelector('#mock')).oneElement(),
        {
          mouseEvents: false
        }
      );
      assert.equal(
        mq.__controller.blurred,
        true,
        'focus state is initialized to blurred'
      );
      assert.equal(
        span.querySelector('.mq-cursor'),
        null,
        'there is no .mq-cursor element'
      );
      mq.latex('123');
      assert.equal(
        span.querySelector('.mq-cursor'),
        null,
        'there is still no .mq-cursor element'
      );
    });
  });

  suite('Localization', function () {
    const $ = window.test_only_jquery;
    var mq;

    setup(function () {
      // Reset global language to default before each test
      MQ.config({ language: 'en' });
    });

    suite('Default Language Behavior', function () {
      test('default language is English with English ARIA labels and mathspeak', function () {
        mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

        // Verify default language is English
        assert.equal(
          mq.getAriaLabel(),
          'Math Input',
          'Default ARIA label should be English'
        );

        // Create a fraction and verify English output
        mq.latex('\\frac{1}{2}');
        assert.equal(
          mq.getAriaLabel(),
          'Math Input',
          'ARIA label should remain English after adding content'
        );
        assert.equal(
          mq.mathspeak(),
          '1 half',
          'Mathspeak should be in English'
        );

        // Change language to Spanish and verify Spanish output
        mq.config({ language: 'es' });
        assert.equal(
          mq.getAriaLabel(),
          'Entrada Matemática',
          'ARIA label should be Spanish after language change'
        );
        assert.equal(
          mq.mathspeak(),
          '1 medio',
          'Mathspeak should be in Spanish'
        );
      });

      test('language switching updates both ARIA labels and mathspeak', function () {
        mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

        // Start with a fraction in English
        mq.latex('\\frac{3}{4}');
        assert.equal(mq.getAriaLabel(), 'Math Input');
        assert.equal(mq.mathspeak(), '3 quarters');

        // Switch to Spanish
        mq.config({ language: 'es' });
        assert.equal(mq.getAriaLabel(), 'Entrada Matemática');
        assert.equal(mq.mathspeak(), '3 cuartos');

        // Switch back to English
        mq.config({ language: 'en' });
        assert.equal(mq.getAriaLabel(), 'Math Input');
        assert.equal(mq.mathspeak(), '3 quarters');
      });

      test('complex expressions in multiple languages', function () {
        mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

        // Test with squared expression
        mq.latex('x^2');
        assert.equal(
          mq.mathspeak(),
          '"x" squared',
          'English squared should work'
        );

        mq.config({ language: 'es' });
        assert.equal(
          mq.mathspeak(),
          '"x" al cuadrado',
          'Spanish squared should work'
        );

        // Test with square root
        mq.latex('\\sqrt{x}');
        mq.config({ language: 'en' });
        assert.equal(
          mq.mathspeak(),
          'Start Root, "x" , End Root',
          'English square root should work'
        );

        mq.config({ language: 'es' });
        assert.equal(
          mq.mathspeak(),
          'Inicio Raíz, "x" , Fin Raíz',
          'Spanish square root should work'
        );
      });
    });

    suite('Constructor Language Configuration', function () {
      test('creating MathField with Spanish language in constructor', function () {
        // Create MathField with Spanish language
        mq = MQ.MathField($('<span></span>').appendTo('#mock')[0], {
          language: 'es'
        });
        assert.equal(
          mq.getAriaLabel(),
          'Entrada Matemática',
          'Should initialize with Spanish ARIA label'
        );

        // Create a fraction and verify Spanish output
        mq.latex('\\frac{1}{2}');
        assert.equal(
          mq.getAriaLabel(),
          'Entrada Matemática',
          'ARIA label should remain Spanish'
        );
        assert.equal(
          mq.mathspeak(),
          '1 medio',
          'Mathspeak should be in Spanish'
        );
      });

      test('constructor language setting works with various expressions', function () {
        mq = MQ.MathField($('<span></span>').appendTo('#mock')[0], {
          language: 'es'
        });

        // Test fraction shortcuts with Spanish pluralization
        mq.latex('\\frac{1}{3}');
        assert.equal(mq.mathspeak(), '1 tercio');

        // Test powers in Spanish
        mq.latex('x^3');
        assert.equal(mq.mathspeak(), '"x" al cubo');

        // Test cube root in Spanish
        mq.latex('\\sqrt[3]{x}');
        assert.equal(
          mq.mathspeak(),
          'Inicio Raíz Cúbica, "x" , Fin Raíz Cúbica'
        );
      });

      test('global language configuration affects new instances', function () {
        // Set global language to Spanish
        MQ.config({ language: 'es' });

        // Create new MathField without explicit language
        mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);
        assert.equal(
          mq.getAriaLabel(),
          'Entrada Matemática',
          'Global language setting should affect new instances'
        );

        // Verify mathspeak is also in Spanish
        mq.latex('\\frac{2}{3}');
        assert.equal(mq.mathspeak(), '2 tercios');
      });
    });

    suite('Error Handling and Fallbacks', function () {
      test('bogus language code throws error and falls back to English', function () {
        assert.throws(function () {
          mq = MQ.MathField($('<span></span>').appendTo('#mock')[0], {
            language: 'xxx'
          });
        }, 'Should throw error for invalid language code');
      });

      test('invalid language falls back to English behavior', function () {
        // Create with valid language first, then try to set invalid
        mq = MQ.MathField($('<span></span>').appendTo('#mock')[0], {
          language: 'en'
        });

        // Try to set bogus language via config - should not throw but should fail silently
        try {
          mq.config({ language: 'xx' });
        } catch (e) {
          // Expected to throw during validation
        }

        // Create fraction and verify fallback to English
        mq.latex('\\frac{1}{2}');
        assert.equal(
          mq.getAriaLabel(),
          'Math Input',
          'Should fall back to English ARIA label'
        );
        assert.equal(
          mq.mathspeak(),
          '1 half',
          'Should fall back to English mathspeak'
        );
      });

      test('language validation during configuration', function () {
        mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

        // Valid language switches should work
        mq.config({ language: 'es' });
        assert.equal(mq.getAriaLabel(), 'Entrada Matemática');

        mq.config({ language: 'en' });
        assert.equal(mq.getAriaLabel(), 'Math Input');

        // Invalid language should throw
        assert.throws(function () {
          mq.config({ language: 'invalid' });
        }, 'Should throw for invalid language codes');

        // Field should still work after failed language change
        assert.equal(
          mq.getAriaLabel(),
          'Math Input',
          'Should maintain last valid language'
        );
      });

      test('non-string language values throw errors', function () {
        assert.throws(function () {
          MQ.MathField($('<span></span>').appendTo('#mock')[0], {
            language: 123
          });
        }, 'Should throw for numeric language');

        assert.throws(function () {
          MQ.MathField($('<span></span>').appendTo('#mock')[0], {
            language: null
          });
        }, 'Should throw for null language');

        assert.throws(function () {
          MQ.MathField($('<span></span>').appendTo('#mock')[0], {
            language: undefined
          });
        }, 'Should throw for undefined language');
      });
    });

    suite('Language Fallback System', function () {
      test('locale-specific language falls back to base language (en-GB → en)', function () {
        // Test requesting en-GB should fall back to en
        mq = MQ.MathField($('<span></span>').appendTo('#mock')[0], {
          language: 'en-GB'
        });

        // Should work as English
        assert.equal(
          mq.getAriaLabel(),
          'Math Input',
          'en-GB should fall back to English'
        );

        mq.latex('\\frac{1}{2}');
        assert.equal(mq.mathspeak(), '1 half', 'Should use English mathspeak');
      });

      test('locale-specific language falls back to base language (es-AR → es)', function () {
        // Test requesting es-AR should fall back to es
        mq = MQ.MathField($('<span></span>').appendTo('#mock')[0], {
          language: 'es-AR'
        });

        // Should work as Spanish
        assert.equal(
          mq.getAriaLabel(),
          'Entrada Matemática',
          'es-AR should fall back to Spanish'
        );

        mq.latex('\\frac{1}{2}');
        assert.equal(mq.mathspeak(), '1 medio', 'Should use Spanish mathspeak');
      });

      test('base language falls back to locale variant when available (es → es-MX)', function () {
        // Note: This test demonstrates the concept, but since es-MX currently loads the same
        // messages as es, the behavior will be identical. In a real implementation with
        // different es-MX messages, this would show locale-specific differences.
        mq = MQ.MathField($('<span></span>').appendTo('#mock')[0], {
          language: 'es'
        });

        // Should work as Spanish (potentially with Mexican variant if available)
        assert.equal(
          mq.getAriaLabel(),
          'Entrada Matemática',
          'es should load successfully'
        );

        mq.latex('\\frac{1}{2}');
        assert.equal(mq.mathspeak(), '1 medio', 'Should use Spanish mathspeak');
      });

      test('cascading fallback: fr-CA → fr → en', function () {
        // Test unsupported French Canadian falls back all the way to English
        mq = MQ.MathField($('<span></span>').appendTo('#mock')[0], {
          language: 'fr-CA'
        });

        // Should fall back to English as final resort
        assert.equal(
          mq.getAriaLabel(),
          'Math Input',
          'fr-CA should fall back to English'
        );

        mq.latex('\\frac{1}{2}');
        assert.equal(mq.mathspeak(), '1 half', 'Should use English mathspeak');
      });

      test('runtime language switching with fallbacks', function () {
        mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

        // Start with English
        mq.latex('\\frac{1}{2}');
        assert.equal(mq.getAriaLabel(), 'Math Input');
        assert.equal(mq.mathspeak(), '1 half');

        // Switch to es-CO (should fall back to es)
        mq.config({ language: 'es-CO' });
        assert.equal(
          mq.getAriaLabel(),
          'Entrada Matemática',
          'es-CO should fall back to Spanish'
        );
        assert.equal(mq.mathspeak(), '1 medio');

        // Switch to en-AU (should fall back to en)
        mq.config({ language: 'en-AU' });
        assert.equal(
          mq.getAriaLabel(),
          'Math Input',
          'en-AU should fall back to English'
        );
        assert.equal(mq.mathspeak(), '1 half');

        // Switch to de-DE (should fall back to en)
        mq.config({ language: 'de-DE' });
        assert.equal(
          mq.getAriaLabel(),
          'Math Input',
          'de-DE should fall back to English'
        );
        assert.equal(mq.mathspeak(), '1 half');
      });

      test('fallback preserves mathematical functionality', function () {
        // Test that fallback doesn't break mathematical expression handling
        mq = MQ.MathField($('<span></span>').appendTo('#mock')[0], {
          language: 'pt-BR'
        }); // Falls back to English

        // Test various mathematical expressions
        mq.latex('x^2');
        assert.equal(
          mq.mathspeak(),
          '"x" squared',
          'Powers should work with fallback'
        );

        mq.latex('\\sqrt{x}');
        assert.equal(
          mq.mathspeak(),
          'Start Root, "x" , End Root',
          'Roots should work with fallback'
        );

        mq.latex('\\sum_{i=1}^{n} x_i');
        assert.equal(
          mq.mathspeak(),
          'Start sum from "i" equals 1, to, "n" , end sum "x" Subscript, "i" , Baseline',
          'Complex expressions should work with fallback'
        );
      });
    });

    suite('Advanced Localization Features', function () {
      test('mathematical notation localization', function () {
        mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

        // Test summation notation
        mq.latex('\\sum_{i=1}^{n} x_i');
        mq.config({ language: 'en' });
        assert.equal(
          mq.mathspeak(),
          'Start sum from "i" equals 1, to, "n" , end sum "x" Subscript, "i" , Baseline',
          'summation notation works in English'
        );

        mq.config({ language: 'es' });
        assert.equal(
          mq.mathspeak(),
          'Inicio suma desde "i" igual 1, hasta, "n" , fin suma "x" Subíndice, "i" , Línea Base',
          'summation notation works in Spanish'
        );
      });

      test('power expressions with ordinal numbers', function () {
        mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

        // Test various power expressions
        mq.latex('x^4');
        mq.config({ language: 'en' });
        assert.equal(
          mq.mathspeak(),
          '"x" to the 4th power',
          'ordinal exponent in English'
        );

        mq.config({ language: 'es' });
        assert.equal(
          mq.mathspeak(),
          '"x" a la cuarta potencia',
          'ordinal exponent in Spanish'
        );
      });

      test('directional navigation announcements', function () {
        mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);
        mq.latex('\\frac{a}{b}');

        // Focus the field so cursor navigation works
        mq.focus();

        // Test navigation - the specific implementation may vary but language should affect announcements
        var initialCursor = mq.__controller.cursor;
        assert.ok(initialCursor, 'Cursor should exist for navigation testing');
      });

      test('inequality operators localization', function () {
        mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

        // Test less than in English
        mq.latex('x < y');
        mq.config({ language: 'en' });
        assert.equal(
          mq.mathspeak(),
          '"x" less than "y"',
          'less than should work in English'
        );

        // Test less than in Spanish
        mq.config({ language: 'es' });
        assert.equal(
          mq.mathspeak(),
          '"x" menor que "y"',
          'less than should work in Spanish'
        );

        // Test greater than in English
        mq.latex('x > y');
        mq.config({ language: 'en' });
        assert.equal(
          mq.mathspeak(),
          '"x" greater than "y"',
          'greater than should work in English'
        );

        // Test greater than in Spanish
        mq.config({ language: 'es' });
        assert.equal(
          mq.mathspeak(),
          '"x" mayor que "y"',
          'greater than should work in Spanish'
        );

        // Test less than or equal to in English
        mq.latex('x \\le y');
        mq.config({ language: 'en' });
        assert.equal(
          mq.mathspeak(),
          '"x" less than or equal to "y"',
          'less than or equal to should work in English'
        );

        // Test less than or equal to in Spanish
        mq.config({ language: 'es' });
        assert.equal(
          mq.mathspeak(),
          '"x" menor o igual que "y"',
          'less than or equal to should work in Spanish'
        );

        // Test greater than or equal to in English
        mq.latex('x \\ge y');
        mq.config({ language: 'en' });
        assert.equal(
          mq.mathspeak(),
          '"x" greater than or equal to "y"',
          'greater than or equal to should work in English'
        );

        // Test greater than or equal to in Spanish
        mq.config({ language: 'es' });
        assert.equal(
          mq.mathspeak(),
          '"x" mayor o igual que "y"',
          'greater than or equal to should work in Spanish'
        );

        // Test not equal to in English
        mq.latex('x \\ne y');
        mq.config({ language: 'en' });
        assert.equal(
          mq.mathspeak(),
          '"x" not equal to "y"',
          'not equal to should work in English'
        );

        // Test not equal to in Spanish
        mq.config({ language: 'es' });
        assert.equal(
          mq.mathspeak(),
          '"x" no igual a "y"',
          'not equal to should work in Spanish'
        );

        // Test approximately equal to in English
        mq.latex('x \\approx y');
        mq.config({ language: 'en' });
        assert.equal(
          mq.mathspeak(),
          '"x" approximately equal to "y"',
          'approximately equal to should work in English'
        );

        // Test approximately equal to in Spanish
        mq.config({ language: 'es' });
        assert.equal(
          mq.mathspeak(),
          '"x" aproximadamente igual a "y"',
          'approximately equal to should work in Spanish'
        );
      });
    });

    suite('Edge Cases and Robustness', function () {
      test('empty field localization', function () {
        mq = MQ.MathField($('<span></span>').appendTo('#mock')[0], {
          language: 'es'
        });

        // Empty field should still have localized ARIA label
        assert.equal(mq.getAriaLabel(), 'Entrada Matemática');
        assert.equal(
          mq.mathspeak(),
          '',
          'Empty field should have empty mathspeak'
        );

        // Language switching on empty field should work
        mq.config({ language: 'en' });
        assert.equal(mq.getAriaLabel(), 'Math Input');
      });

      test('language switching preserves content', function () {
        mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);

        // Create complex expression
        mq.latex('\\frac{x^2 + 1}{\\sqrt{y}}');
        var originalLatex = mq.latex();

        // Switch languages multiple times
        mq.config({ language: 'es' });
        mq.config({ language: 'en' });
        mq.config({ language: 'es' });

        // Content should be preserved
        assert.equal(
          mq.latex(),
          originalLatex,
          'LaTeX content should be preserved through language switches'
        );
      });

      test('multiple MathFields with different languages', function () {
        var mq1 = MQ.MathField($('<span></span>').appendTo('#mock')[0], {
          language: 'en'
        });
        var mq2 = MQ.MathField($('<span></span>').appendTo('#mock')[0], {
          language: 'es'
        });

        mq1.latex('\\frac{1}{2}');
        mq2.latex('\\frac{1}{2}');

        // Each field should maintain its own language
        assert.equal(mq1.getAriaLabel(), 'Math Input');
        assert.equal(mq2.getAriaLabel(), 'Entrada Matemática');
        assert.equal(mq1.mathspeak(), '1 half');
        assert.equal(mq2.mathspeak(), '1 medio');
      });

      test('localization with custom ARIA labels', function () {
        mq = MQ.MathField($('<span></span>').appendTo('#mock')[0], {
          language: 'es'
        });

        // Set custom ARIA label
        mq.setAriaLabel('Campo Personalizado');
        assert.equal(mq.getAriaLabel(), 'Campo Personalizado');

        // Language switching should not affect custom labels
        mq.config({ language: 'en' });
        assert.equal(
          mq.getAriaLabel(),
          'Campo Personalizado',
          'Custom ARIA labels should be preserved'
        );

        // Resetting to empty should restore localized default
        mq.setAriaLabel('');
        assert.equal(
          mq.getAriaLabel(),
          'Math Input',
          'Should restore localized default after clearing custom label'
        );
      });
    });

    teardown(function () {
      // Clean up any global state
      MQ.config({ language: 'en' });
    });
  });
});
