suite('latex', function () {
  const $ = window.test_only_jquery;
  function assertParsesLatex(str, latex) {
    if (arguments.length < 2) latex = str;

    var result = latexMathParser
      .parse(str)
      .postOrder(function (node) {
        node.finalizeTree(Options.prototype);
      })
      .join('latex');
    assert.equal(
      result,
      latex,
      "parsing '" + str + "', got '" + result + "', expected '" + latex + "'"
    );
  }

  test('empty LaTeX', function () {
    assertParsesLatex('');
    assertParsesLatex(' ', '');
    assertParsesLatex('{}', '');
    assertParsesLatex('   {}{} {{{}}  }', '');
  });

  test('variables', function () {
    assertParsesLatex('xyz');
  });

  test('variables that can be mathbb', function () {
    assertParsesLatex('PNZQRCH');
  });

  test('can parse mathbb symbols', function () {
    assertParsesLatex(
      '\\P\\N\\Z\\Q\\R\\C\\H',
      '\\mathbb{P}\\mathbb{N}\\mathbb{Z}\\mathbb{Q}\\mathbb{R}\\mathbb{C}\\mathbb{H}'
    );
    assertParsesLatex(
      '\\mathbb{P}\\mathbb{N}\\mathbb{Z}\\mathbb{Q}\\mathbb{R}\\mathbb{C}\\mathbb{H}'
    );
  });

  test('can parse mathbb error case', function () {
    assert.throws(function () {
      assertParsesLatex('\\mathbb + 2');
    });
    assert.throws(function () {
      assertParsesLatex('\\mathbb{A}');
    });
  });

  test('simple exponent', function () {
    assertParsesLatex('x^{n}');
  });

  test('block exponent', function () {
    assertParsesLatex('x^{n}', 'x^{n}');
    assertParsesLatex('x^{nm}');
    assertParsesLatex('x^{}', 'x^{ }');
  });

  test('nested exponents', function () {
    assertParsesLatex('x^{n^{m}}');
  });

  test('exponents with spaces', function () {
    assertParsesLatex('x^ 2', 'x^{2}');

    assertParsesLatex('x ^2', 'x^{2}');
  });

  test('inner groups', function () {
    assertParsesLatex('a{bc}d', 'abcd');
    assertParsesLatex('{bc}d', 'bcd');
    assertParsesLatex('a{bc}', 'abc');
    assertParsesLatex('{bc}', 'bc');

    assertParsesLatex('x^{a{bc}d}', 'x^{abcd}');
    assertParsesLatex('x^{a{bc}}', 'x^{abc}');
    assertParsesLatex('x^{{bc}}', 'x^{bc}');
    assertParsesLatex('x^{{bc}d}', 'x^{bcd}');

    assertParsesLatex('{asdf{asdf{asdf}asdf}asdf}', 'asdfasdfasdfasdfasdf');
  });

  test('commands without braces', function () {
    assertParsesLatex('\\frac12', '\\frac{1}{2}');
    assertParsesLatex('\\frac1a', '\\frac{1}{a}');
    assertParsesLatex('\\frac ab', '\\frac{a}{b}');

    assertParsesLatex('\\frac a b', '\\frac{a}{b}');
    assertParsesLatex(' \\frac a b ', '\\frac{a}{b}');
    assertParsesLatex('\\frac{1} 2', '\\frac{1}{2}');
    assertParsesLatex('\\frac{ 1 } 2', '\\frac{1}{2}');

    assert.throws(function () {
      latexMathParser.parse('\\frac');
    });
  });

  test('whitespace', function () {
    assertParsesLatex('  a + b ', 'a+b');
    assertParsesLatex('       ', '');
    assertParsesLatex('', '');
  });

  test('parens', function () {
    var tree = latexMathParser.parse('\\left(123\\right)');

    assert.ok(tree.ends[L] instanceof Bracket);
    var contents = tree.ends[L].ends[L].join('latex');
    assert.equal(contents, '123');
    assert.equal(tree.join('latex'), '\\left(123\\right)');
  });

  test('\\langle/\\rangle (issue #508)', function () {
    var tree = latexMathParser.parse('\\left\\langle 123\\right\\rangle)');

    assert.ok(tree.ends[L] instanceof Bracket);
    var contents = tree.ends[L].ends[L].join('latex');
    assert.equal(contents, '123');
    assert.equal(tree.join('latex'), '\\left\\langle 123\\right\\rangle )');
  });

  test('\\langle/\\rangle (without whitespace)', function () {
    var tree = latexMathParser.parse('\\left\\langle123\\right\\rangle)');

    assert.ok(tree.ends[L] instanceof Bracket);
    var contents = tree.ends[L].ends[L].join('latex');
    assert.equal(contents, '123');
    assert.equal(tree.join('latex'), '\\left\\langle 123\\right\\rangle )');
  });

  test('\\lVert/\\rVert', function () {
    var tree = latexMathParser.parse('\\left\\lVert 123\\right\\rVert)');

    assert.ok(tree.ends[L] instanceof Bracket);
    var contents = tree.ends[L].ends[L].join('latex');
    assert.equal(contents, '123');
    assert.equal(tree.join('latex'), '\\left\\lVert 123\\right\\rVert )');
  });

  test('\\lVert/\\rVert (without whitespace)', function () {
    var tree = latexMathParser.parse('\\left\\lVert123\\right\\rVert)');

    assert.ok(tree.ends[L] instanceof Bracket);
    var contents = tree.ends[L].ends[L].join('latex');
    assert.equal(contents, '123');
    assert.equal(tree.join('latex'), '\\left\\lVert 123\\right\\rVert )');
  });

  test('\\langler should not parse', function () {
    assert.throws(function () {
      latexMathParser.parse('\\left\\langler123\\right\\rangler');
    });
  });

  test('\\lVerte should not parse', function () {
    assert.throws(function () {
      latexMathParser.parse('\\left\\lVerte123\\right\\rVerte');
    });
  });

  test('parens with whitespace', function () {
    assertParsesLatex('\\left ( 123 \\right ) ', '\\left(123\\right)');
  });

  test('escaped whitespace', function () {
    assertParsesLatex('\\ ', '\\ ');
    assertParsesLatex('\\      ', '\\ ');
    assertParsesLatex('  \\   \\\t\t\t\\   \\\n\n\n', '\\ \\ \\ \\ ');
    assertParsesLatex('\\space\\   \\   space  ', '\\ \\ \\ space');
  });

  test('\\text', function () {
    assertParsesLatex('\\text { lol! } ', '\\text{ lol! }');
    assertParsesLatex(
      '\\text{apples} \\ne \\text{oranges}',
      '\\text{apples}\\ne \\text{oranges}'
    );
    assertParsesLatex('\\text{}', '');
  });

  test('\\textcolor', function () {
    assertParsesLatex('\\textcolor{blue}{8}', '\\textcolor{blue}{8}');
  });

  test('\\class', function () {
    assertParsesLatex('\\class{name}{8}', '\\class{name}{8}');
    assertParsesLatex('\\class{name}{8-4}', '\\class{name}{8-4}');
  });

  test('not real LaTex commands, but valid symbols', function () {
    assertParsesLatex('\\parallelogram ');
    assertParsesLatex('\\circledot ', '\\odot ');
    assertParsesLatex('\\degree ');
    assertParsesLatex('\\square ');
  });

  suite('public API', function () {
    var mq;
    setup(function () {
      mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);
    });

    suite('.latex(...)', function () {
      function assertParsesLatex(str, latex) {
        if (arguments.length < 2) latex = str;
        mq.latex(str);
        assert.equal(mq.latex(), latex);
      }

      test('basic rendering', function () {
        assertParsesLatex(
          'x = \\frac{ -b \\pm \\sqrt{ b^2 - 4ac } }{ 2a }',
          'x=\\frac{-b\\pm\\sqrt{b^{2}-4ac}}{2a}'
        );
      });

      test('re-rendering', function () {
        assertParsesLatex('a x^2 + b x + c = 0', 'ax^{2}+bx+c=0');
        assertParsesLatex(
          'x = \\frac{ -b \\pm \\sqrt{ b^2 - 4ac } }{ 2a }',
          'x=\\frac{-b\\pm\\sqrt{b^{2}-4ac}}{2a}'
        );
      });

      test('empty LaTeX', function () {
        assertParsesLatex('');
        assertParsesLatex(' ', '');
        assertParsesLatex('{}', '');
        assertParsesLatex('   {}{} {{{}}  }', '');
      });

      test('coerces to a string', function () {
        assertParsesLatex(undefined, 'undefined');
        assertParsesLatex(null, 'null');
        assertParsesLatex(0, '0');
        assertParsesLatex(Infinity, 'Infinity');
        assertParsesLatex(NaN, 'NaN');
        assertParsesLatex(true, 'true');
        assertParsesLatex(false, 'false');
        assertParsesLatex({}, '[objectObject]'); // lol, the space gets ignored
        assertParsesLatex(
          {
            toString: function () {
              return 'thing';
            }
          },
          'thing'
        );
      });
    });

    suite('.write(...)', function () {
      test('empty LaTeX', function () {
        function assertParsesLatex(str, latex) {
          if (arguments.length < 2) latex = str;
          mq.write(str);
          assert.equal(mq.latex(), latex);
        }
        assertParsesLatex('');
        assertParsesLatex(' ', '');
        assertParsesLatex('{}', '');
        assertParsesLatex('   {}{} {{{}}  }', '');
      });

      test('overflow triggers automatic horizontal scroll', function (done) {
        var mqEl = mq.el();
        var rootEl = mq.__controller.root.domFrag().oneElement();
        var cursor = mq.__controller.cursor;

        $(mqEl).width(10);
        var previousScrollLeft = rootEl.scrollLeft;

        mq.write('abc');
        setTimeout(afterScroll, 150);

        function afterScroll() {
          cursor.show();

          try {
            assert.ok(
              rootEl.scrollLeft > previousScrollLeft,
              'scrolls on write'
            );
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

      suite('\\sum', function () {
        test('basic', function () {
          mq.write('\\sum_{n=0}^5');
          assert.equal(mq.latex(), '\\sum_{n=0}^{5}');
          mq.write('x^n');
          assert.equal(mq.latex(), '\\sum_{n=0}^{5}x^{n}');
        });

        test('only lower bound', function () {
          mq.write('\\sum_{n=0}');
          assert.equal(mq.latex(), '\\sum_{n=0}^{ }');
          mq.write('x^n');
          assert.equal(mq.latex(), '\\sum_{n=0}^{ }x^{n}');
        });

        test('only upper bound', function () {
          mq.write('\\sum^5');
          assert.equal(mq.latex(), '\\sum_{ }^{5}');
          mq.write('x^n');
          assert.equal(mq.latex(), '\\sum_{ }^{5}x^{n}');
        });
      });

      suite('\\token', function () {
        test('parsing and serializing', function () {
          mq.latex('\\token{12}');
          assert.equal(mq.latex(), '\\token{12}');
        });
      });
    });

    suite('setting .selection()', function () {
      test('cursor only', function () {
        mq.latex(
          '\\sqrt{2}+1+\\frac{1}{\\sqrt{2}}+\\sqrt{\\sqrt{\\sqrt{\\frac{1}{2+2}}}}'
        );
        mq.clearSelection();
        mq.keystroke('Ctrl-Home');

        function assertSelectionCanBeSet(key) {
          if (key) {
            mq.keystroke(key);
          }

          const original = mq.selection();
          mq.clearSelection();
          mq.selection(original);
          const restored = mq.selection();

          assert.equal(
            JSON.stringify(restored, null, 2),
            JSON.stringify(original, null, 2)
          );
        }

        // run from left to right asserting that we can reset the cursor position in every position
        assertSelectionCanBeSet();
        for (let i = 0; i < 26; i++) {
          assertSelectionCanBeSet('Right');
        }

        const selectionAfterLoop = mq.selection();
        assertSelectionCanBeSet('Right');
        const selectionAfterFirstRight = mq.selection();
        assert.equal(
          selectionAfterLoop.endIndex + 1,
          selectionAfterFirstRight.endIndex,
          'this right arrow does move selection after the loop'
        );

        assertSelectionCanBeSet('Right');
        const selectionAftersecondRight = mq.selection();
        assert.equal(
          selectionAfterFirstRight.endIndex,
          selectionAftersecondRight.endIndex,
          'we have reached the end'
        );
      });
      test('does not update selection if latex does not match', function () {
        const startingLatex = 'abcdefghi';
        mq.latex(startingLatex);
        mq.keystroke('Ctrl-Home');
        mq.keystroke('Right');
        mq.keystroke('Shift-Right');
        mq.keystroke('Shift-Right');
        const originalSelection = mq.selection();

        mq.keystroke('Backspace');
        const selectionAfterBackspace = mq.selection();

        mq.selection(originalSelection);
        const failedRestoredSelection = mq.selection();

        mq.latex(startingLatex);
        mq.selection(originalSelection);
        const successfulRestoredSelection = mq.selection();

        assert.ok(
          JSON.stringify(originalSelection, null, 2) !==
            JSON.stringify(selectionAfterBackspace, null, 2),
          'selection changed after backspace'
        );

        assert.equal(
          JSON.stringify(selectionAfterBackspace, null, 2),
          JSON.stringify(failedRestoredSelection, null, 2),
          'selection not mutated if latex has changed'
        );

        assert.equal(
          JSON.stringify(originalSelection, null, 2),
          JSON.stringify(successfulRestoredSelection, null, 2),
          'can restore selection succesfully if latex matches'
        );
      });
      test('empty latex still has a selection', function () {
        mq.latex('');

        const emptySelection = mq.selection();
        assert.equal(
          emptySelection.startIndex,
          0,
          'empty selection has startIndex=0'
        );
        assert.equal(
          emptySelection.endIndex,
          0,
          'empty selection has endIndex=0'
        );

        mq.latex('abc');
        const abcSelection = mq.selection();

        mq.selection(emptySelection);
        const failedRestoredSelection = mq.selection();

        assert.equal(
          JSON.stringify(abcSelection, null, 2),
          JSON.stringify(failedRestoredSelection, null, 2),
          'restoring selection failed'
        );

        mq.latex('');
        mq.selection(emptySelection);
        const successfulRestoredSelection = mq.selection();
        assert.equal(
          JSON.stringify(emptySelection, null, 2),
          JSON.stringify(successfulRestoredSelection, null, 2),
          'restoring selection failed'
        );
      });
      test('always restores selection with cursor left of anticursor', function () {
        mq.latex('abc');
        const endSelection = mq.selection();
        assert.equal(
          endSelection.startIndex,
          3,
          'endSelection has startIndex=3'
        );
        assert.equal(endSelection.endIndex, 3, 'endSelection has endIndex=3');

        mq.keystroke('Shift-Left');
        mq.keystroke('Shift-Left');
        mq.keystroke('Shift-Left');
        const rightToLeftSelection = mq.selection();
        assert.equal(
          rightToLeftSelection.startIndex,
          0,
          'rightToLeft has startIndex=0'
        );
        assert.equal(
          rightToLeftSelection.endIndex,
          3,
          'rightToLeft has endIndex=3'
        );

        mq.keystroke('Ctrl-Home');
        mq.keystroke('Shift-Right');
        mq.keystroke('Shift-Right');
        mq.keystroke('Shift-Right');
        const leftToRightSelection = mq.selection();
        assert.equal(
          rightToLeftSelection.startIndex,
          0,
          'rightToLeft has startIndex=0'
        );
        assert.equal(
          rightToLeftSelection.endIndex,
          3,
          'rightToLeft has endIndex=3'
        );

        mq.selection(endSelection);
        assert.equal(
          mq.selection().startIndex,
          3,
          'restored endSelection has startIndex=3'
        );
        assert.equal(
          mq.selection().endIndex,
          3,
          'restored endSelection has endIndex=3'
        );

        mq.selection(rightToLeftSelection);
        mq.keystroke('Shift-Right');
        assert.equal(
          mq.selection().startIndex,
          1,
          'Shift-Right moves head to right'
        );
        mq.keystroke('Shift-Left');
        assert.equal(
          mq.selection().startIndex,
          0,
          'Shift-Left moves head to left'
        );
        mq.keystroke('Shift-Left');
        assert.equal(
          mq.selection().startIndex,
          0,
          'Shift-Left now does nothing'
        );
        mq.keystroke('Shift-Right');
        assert.equal(
          mq.selection().startIndex,
          1,
          'Shift-Right moves head to right'
        );

        mq.selection(endSelection);
        mq.selection(leftToRightSelection);
        mq.keystroke('Shift-Right');
        assert.equal(
          mq.selection().startIndex,
          1,
          'Shift-Right moves head to right'
        );
        mq.keystroke('Shift-Left');
        assert.equal(
          mq.selection().startIndex,
          0,
          'Shift-Left moves head to left'
        );
        mq.keystroke('Shift-Left');
        assert.equal(
          mq.selection().startIndex,
          0,
          'Shift-Left now does nothing'
        );
        mq.keystroke('Shift-Right');
        assert.equal(
          mq.selection().startIndex,
          1,
          'Shift-Right moves head to right'
        );
      });
      test('entire selection works', function () {
        mq.latex('abc');
        mq.select();

        const entireSelection = mq.selection();
        assert.equal(entireSelection.startIndex, 0, 'startIndex = 0');
        assert.equal(entireSelection.endIndex, 3, 'endIndex = 3');

        mq.clearSelection();
        const clearedSelection = mq.selection();
        assert.equal(clearedSelection.startIndex, 0, 'cleared startIndex = 0');
        assert.equal(clearedSelection.endIndex, 0, 'cleared endIndex = 0');
        mq.selection(entireSelection);
        const restoredSelection = mq.selection();
        console.log('restoredSelection: ', restoredSelection);
        assert.equal(
          JSON.stringify(restoredSelection, null, 2),
          JSON.stringify(entireSelection, null, 2),
          'can restore entire selection'
        );
      });
      test('simple selection', function () {
        mq.latex('abcdefghi');

        mq.clearSelection();
        mq.keystroke('Ctrl-Home');
        mq.keystroke('Shift-Right');
        mq.keystroke('Shift-Right');
        mq.keystroke('Shift-Right');
        mq.keystroke('Shift-Right');
        mq.keystroke('Shift-Right');

        const originalSnapShot = mq.selection();
        mq.clearSelection();
        mq.selection(originalSnapShot);

        const restoredSnapShot = mq.selection();
        assert.equal(
          JSON.stringify(restoredSnapShot, null, 2),
          JSON.stringify(originalSnapShot, null, 2),
          'can restore selection'
        );
        assert.equal(restoredSnapShot.startIndex, 0, 'has correct startIndex');
        assert.equal(restoredSnapShot.endIndex, 5, 'has correct endIndex');
      });

      test('complicated latex', function () {
        mq.latex(
          '1+\\frac{1}{\\sqrt{2}}+\\sqrt{\\sqrt{\\sqrt{\\frac{1}{2+2}}}}'
        );

        mq.clearSelection();
        mq.keystroke('Ctrl-Home');
        mq.keystroke('Right');
        mq.keystroke('Shift-Right');
        mq.keystroke('Shift-Right');
        mq.keystroke('Shift-Right');
        mq.keystroke('Shift-Right');

        const originalSnapShot = mq.selection();
        mq.clearSelection();
        mq.selection(originalSnapShot);
        const restoredSnapShot = mq.selection();
        assert.equal(
          JSON.stringify(restoredSnapShot, null, 2),
          JSON.stringify(originalSnapShot, null, 2),
          'can restore selection'
        );
        assert.equal(restoredSnapShot.startIndex, 1, 'has correct startIndex');
        assert.equal(restoredSnapShot.endIndex, 55, 'has correct endIndex');
      });
    });

    suite('reading .selection()', function () {
      var mq2;
      setup(function () {
        mq2 = MQ.MathField($('<span></span>').appendTo('#mock')[0]);
      });

      function assertSelection(str, expected, commands) {
        mq.latex(str);
        commands.split(' ').forEach((cmd) => {
          if (!cmd) return;
          switch (cmd) {
            case 'Blur':
              mq.blur();
              break;
            case 'Start':
              mq.keystroke('Ctrl-Home');
              break;
            default:
              mq.keystroke(cmd);
          }
        });

        var expectedLatex = expected.replace(/[|]/g, '');
        var expectedStart = expected.indexOf('|');
        var expectedEnd = expected.lastIndexOf('|');
        if (expectedStart !== expectedEnd) {
          expectedEnd -= 1; // ignore the first | character insertted into our expectation of a selection
        }

        var sel = mq.selection();
        var actualFormattedParts = sel.latex.split('');
        if (sel.startIndex !== -1) {
          if (sel.endIndex > sel.startIndex) {
            actualFormattedParts.splice(sel.endIndex, 0, '|');
          }
          actualFormattedParts.splice(sel.startIndex, 0, '|');
        }
        var actualFormattedLatex = actualFormattedParts.join('');
        //if (expected !== actualFormattedLatex) debugger;
        assert.equal(expected, actualFormattedLatex, 'formatted latex');
        assert.equal(sel.latex, expectedLatex, 'actual latex');

        // if (sel.startIndex !== expectedStart) debugger;
        assert.equal(sel.startIndex, expectedStart, 'start position');
        assert.equal(sel.endIndex, expectedEnd, 'end position');

        // build a separate mq, set the latex, and try to restore the selection.
        // double check that the result from reading the selection matches what
        // we tried setting
        const originalSnapShot = mq.selection();
        mq2.latex('');
        mq2.latex(originalSnapShot.latex);
        mq2.selection(originalSnapShot);
        const restoredSnapShot = mq2.selection();
        assert.equal(
          JSON.stringify(restoredSnapShot, null, 2),
          JSON.stringify(originalSnapShot, null, 2),
          'can restore selection'
        );
      }

      function executeCases(cases, startKeys, repeatKey) {
        for (var latex in cases) {
          var keys = startKeys.slice();
          cases[latex].forEach((_case) => {
            assertSelection(latex, _case, keys.join(' '));
            keys.push(repeatKey);
          });
        }
      }

      test('not focused still returns default cursor position', function () {
        assertSelection('', '|', 'Blur');
        assertSelection(' ', '|', 'Blur');
        assertSelection('{}', '|', 'Blur');
        assertSelection('   {}{} {{{}}  }', '|', 'Blur');
        assertSelection('y=2', 'y=2|', 'Blur');
        assertSelection(
          '\\frac{d}{dx}\\sqrt{x}=',
          '\\frac{d}{dx}\\sqrt{x}=|',
          'Blur'
        );
      });

      test('move cursor left from end', function () {
        var cases = {
          '': ['|', '|'],
          '   {}{} {{{}}  }': ['|', '|'],
          'y=2': ['y=2|', 'y=|2', 'y|=2', '|y=2', '|y=2'],
          '\\frac{d}{dx}\\sqrt{x}=': [
            '\\frac{d}{dx}\\sqrt{x}=|',
            '\\frac{d}{dx}\\sqrt{x}|=',
            '\\frac{d}{dx}\\sqrt{x|}=',
            '\\frac{d}{dx}\\sqrt{|x}=',
            '\\frac{d}{dx}|\\sqrt{x}=',
            '\\frac{d}{dx|}\\sqrt{x}=',
            '\\frac{d}{d|x}\\sqrt{x}=',
            '\\frac{d}{|dx}\\sqrt{x}=',
            '\\frac{d|}{dx}\\sqrt{x}=',
            '\\frac{|d}{dx}\\sqrt{x}=',
            '|\\frac{d}{dx}\\sqrt{x}=',
            '|\\frac{d}{dx}\\sqrt{x}='
          ]
        };

        executeCases(cases, [], 'Left');
      });

      test('move cursor right from start', function () {
        var cases = {
          '': ['|', '|'],
          '   {}{} {{{}}  }': ['|', '|'],
          'y=2': ['|y=2', 'y|=2', 'y=|2', 'y=2|', 'y=2|'],
          '\\frac{d}{dx}\\sqrt{x}=': [
            '|\\frac{d}{dx}\\sqrt{x}=',
            '\\frac{|d}{dx}\\sqrt{x}=',
            '\\frac{d|}{dx}\\sqrt{x}=',
            '\\frac{d}{|dx}\\sqrt{x}=',
            '\\frac{d}{d|x}\\sqrt{x}=',
            '\\frac{d}{dx|}\\sqrt{x}=',
            '\\frac{d}{dx}|\\sqrt{x}=',
            '\\frac{d}{dx}\\sqrt{|x}=',
            '\\frac{d}{dx}\\sqrt{x|}=',
            '\\frac{d}{dx}\\sqrt{x}|=',
            '\\frac{d}{dx}\\sqrt{x}=|',
            '\\frac{d}{dx}\\sqrt{x}=|'
          ]
        };

        executeCases(cases, ['Start'], 'Right');
      });

      test('shift select leftward', function () {
        var cases = {
          '': ['|', '|'],
          '   {}{} {{{}}  }': ['|', '|'],
          'y=2': ['y=2|', 'y=|2|', 'y|=2|', '|y=2|', '|y=2|'],
          '\\frac{d}{dx}\\sqrt{x}=': [
            '\\frac{d}{dx}\\sqrt{x}=|',
            '\\frac{d}{dx}\\sqrt{x}|=|',
            '\\frac{d}{dx}|\\sqrt{x}=|',
            '|\\frac{d}{dx}\\sqrt{x}=|',
            '|\\frac{d}{dx}\\sqrt{x}=|'
          ]
        };

        executeCases(cases, [], 'Shift-Left');
      });

      test('shift select rightward', function () {
        var cases = {
          '': ['|', '|'],
          '   {}{} {{{}}  }': ['|', '|'],
          'y=2': ['|y=2', '|y|=2', '|y=|2', '|y=2|', '|y=2|'],
          '\\frac{d}{dx}\\sqrt{x}=': [
            '|\\frac{d}{dx}\\sqrt{x}=',
            '|\\frac{d}{dx}|\\sqrt{x}=',
            '|\\frac{d}{dx}\\sqrt{x}|=',
            '|\\frac{d}{dx}\\sqrt{x}=|',
            '|\\frac{d}{dx}\\sqrt{x}=|'
          ]
        };

        executeCases(cases, ['Start'], 'Shift-Right');
      });

      test('still cleans the latex', function () {
        var leftCases = {
          '\\sin\\cos': [
            '\\sin\\cos|',
            '\\sin\\co|s',
            '\\sin\\c|os',
            '\\sin|\\cos',
            '\\si|n\\cos',
            '\\s|in\\cos',
            '|\\sin\\cos'
          ],
          '\\sin\\left(\\right)': [
            '\\sin\\left(\\right)|',
            '\\sin\\left(|\\right)',
            '\\sin|\\left(\\right)',
            '\\si|n\\left(\\right)',
            '\\s|in\\left(\\right)',
            '|\\sin\\left(\\right)'
          ],
          '\\sum _{n=0}^{100}': [
            '\\sum_{n=0}^{100}|',
            '\\sum_{n=0}^{100|}',
            '\\sum_{n=0}^{10|0}',
            '\\sum_{n=0}^{1|00}',
            '\\sum_{n=0}^{|100}',
            '\\sum_{n=0|}^{100}',
            '\\sum_{n=|0}^{100}',
            '\\sum_{n|=0}^{100}',
            '\\sum_{|n=0}^{100}',
            '|\\sum_{n=0}^{100}'
          ]
        };

        var leftShiftCases = {
          '\\sin\\left(\\right)': [
            '\\sin\\left(\\right)|',
            '\\sin|\\left(\\right)|',
            '\\si|n\\left(\\right)|',
            '\\s|in\\left(\\right)|',
            '|\\sin\\left(\\right)|'
          ],
          '\\sum _{n=0}^{100}': ['\\sum_{n=0}^{100}|', '|\\sum_{n=0}^{100}|']
        };

        var rightShiftCases = {
          '\\sin\\left(\\right)': [
            '|\\sin\\left(\\right)',
            '|\\s|in\\left(\\right)',
            '|\\si|n\\left(\\right)',
            '|\\sin|\\left(\\right)',
            '|\\sin\\left(\\right)|'
          ]
        };

        var twoShiftLeftCases = {
          '\\sin\\cos': [
            '\\sin\\c|os',
            '\\sin|\\c|os',
            '\\si|n\\c|os',
            '\\s|in\\c|os',
            '|\\sin\\c|os'
          ],
          '\\sin\\cos+': [
            '\\sin\\co|s+',
            '\\sin\\c|o|s+',
            '\\sin|\\co|s+',
            '\\si|n\\co|s+',
            '\\s|in\\co|s+',
            '|\\sin\\co|s+'
          ],
          '\\sin\\cos+\\sin\\cos': [
            '\\sin\\cos+\\sin\\c|os',
            '\\sin\\cos+\\sin|\\c|os',
            '\\sin\\cos+\\si|n\\c|os',
            '\\sin\\cos+\\s|in\\c|os',
            '\\sin\\cos+|\\sin\\c|os',
            '\\sin\\cos|+\\sin\\c|os',
            '\\sin\\co|s+\\sin\\c|os'
          ]
        };

        var fourShiftLeftCases = {
          '\\sin\\cos': ['\\si|n\\cos', '\\s|i|n\\cos', '|\\si|n\\cos'],
          '\\sin\\cos+': [
            '\\sin|\\cos+',
            '\\si|n|\\cos+',
            '\\s|in|\\cos+',
            '|\\sin|\\cos+'
          ],
          '\\sin\\cos+\\sin\\cos': [
            '\\sin\\cos+\\si|n\\cos',
            '\\sin\\cos+\\s|i|n\\cos',
            '\\sin\\cos+|\\si|n\\cos',
            '\\sin\\cos|+\\si|n\\cos',
            '\\sin\\co|s+\\si|n\\cos',
            '\\sin\\c|os+\\si|n\\cos',
            '\\sin|\\cos+\\si|n\\cos',
            '\\si|n\\cos+\\si|n\\cos',
            '\\s|in\\cos+\\si|n\\cos',
            '|\\sin\\cos+\\si|n\\cos'
          ]
        };

        executeCases(leftCases, [], 'Left');
        executeCases(leftShiftCases, [], 'Shift-Left');
        executeCases(rightShiftCases, ['Start'], 'Shift-Right');
        executeCases(twoShiftLeftCases, ['Left Left'], 'Shift-Left');
        executeCases(fourShiftLeftCases, ['Left Left Left Left'], 'Shift-Left');
      });
    });
  });

  suite('\\MathQuillMathField', function () {
    var outer, inner1, inner2;
    setup(function () {
      outer = MQ.StaticMath(
        $(
          '<span>\\frac{\\MathQuillMathField{x_0 + x_1 + x_2}}{\\MathQuillMathField{3}}</span>'
        ).appendTo('#mock')[0]
      );
      inner1 = outer.innerFields[0];
      inner2 = outer.innerFields[1];
    });

    test('initial latex', function () {
      assert.equal(inner1.latex(), 'x_{0}+x_{1}+x_{2}');
      assert.equal(inner2.latex(), '3');
      assert.equal(outer.latex(), '\\frac{x_{0}+x_{1}+x_{2}}{3}');
    });

    test('setting latex', function () {
      inner1.latex('\\sum_{i=0}^N x_i');
      inner2.latex('N');
      assert.equal(inner1.latex(), '\\sum_{i=0}^{N}x_{i}');
      assert.equal(inner2.latex(), 'N');
      assert.equal(outer.latex(), '\\frac{\\sum_{i=0}^{N}x_{i}}{N}');
    });

    test('writing latex', function () {
      inner1.write('+ x_3');
      inner2.write('+ 1');
      assert.equal(inner1.latex(), 'x_{0}+x_{1}+x_{2}+x_{3}');
      assert.equal(inner2.latex(), '3+1');
      assert.equal(outer.latex(), '\\frac{x_{0}+x_{1}+x_{2}+x_{3}}{3+1}');
    });

    test('optional inner field name', function () {
      outer.latex(
        '\\MathQuillMathField[mantissa]{}\\cdot\\MathQuillMathField[base]{}^{\\MathQuillMathField[exp]{}}'
      );
      assert.equal(outer.innerFields.length, 3);

      var mantissa = outer.innerFields.mantissa;
      var base = outer.innerFields.base;
      var exp = outer.innerFields.exp;

      assert.equal(mantissa, outer.innerFields[0]);
      assert.equal(base, outer.innerFields[1]);
      assert.equal(exp, outer.innerFields[2]);

      mantissa.latex('1.2345');
      base.latex('10');
      exp.latex('8');
      assert.equal(outer.latex(), '1.2345\\cdot10^{8}');
    });

    test('make inner field static and then editable', function () {
      outer.latex(
        'y=\\MathQuillMathField[m]{\\textcolor{blue}{m}}x+\\MathQuillMathField[b]{b}'
      );
      assert.equal(outer.innerFields.length, 2);
      // assert.equal(outer.innerFields.m.__controller.container, false);

      outer.innerFields.m.makeStatic();
      assert.equal(outer.innerFields.m.__controller.editable, false);
      assert.equal(
        domFrag(outer.innerFields.m.__controller.container).hasClass(
          'mq-editable-field'
        ),
        false
      );
      assert.equal(outer.innerFields.b.__controller.editable, true);

      //ensure no errors in making static field static
      outer.innerFields.m.makeStatic();
      assert.equal(outer.innerFields.m.__controller.editable, false);
      assert.equal(
        domFrag(outer.innerFields.m.__controller.container).hasClass(
          'mq-editable-field'
        ),
        false
      );
      assert.equal(outer.innerFields.b.__controller.editable, true);

      outer.innerFields.m.makeEditable();
      assert.equal(outer.innerFields.m.__controller.editable, true);
      assert.equal(
        domFrag(outer.innerFields.m.__controller.container).hasClass(
          'mq-editable-field'
        ),
        true
      );
      assert.equal(outer.innerFields.b.__controller.editable, true);

      //ensure no errors with making editable field editable
      outer.innerFields.m.makeEditable();
      assert.equal(outer.innerFields.m.__controller.editable, true);
      assert.equal(
        domFrag(outer.innerFields.m.__controller.container).hasClass(
          'mq-editable-field'
        ),
        true
      );
      assert.equal(outer.innerFields.b.__controller.editable, true);
    });

    test('separate API object', function () {
      var outer2 = MQ(outer.el());
      assert.equal(outer2.innerFields.length, 2);
      assert.equal(outer2.innerFields[0].id, inner1.id);
      assert.equal(outer2.innerFields[1].id, inner2.id);
    });
  });

  suite('error handling', function () {
    var mq;
    setup(function () {
      mq = MQ.MathField($('<span></span>').appendTo('#mock')[0]);
    });

    function testCantParse(title /*, latex...*/) {
      var latex = [].slice.call(arguments, 1);
      test(title, function () {
        for (var i = 0; i < latex.length; i += 1) {
          mq.latex(latex[i]);
          assert.equal(mq.latex(), '', "shouldn't parse '" + latex[i] + "'");
        }
      });
    }

    testCantParse('missing blocks', '\\frac', '\\sqrt', '^', '_');
    testCantParse(
      'unmatched close brace',
      '}',
      ' 1 + 2 } ',
      '1 - {2 + 3} }',
      '\\sqrt{ x }} + \\sqrt{y}'
    );
    testCantParse(
      'unmatched open brace',
      '{',
      '1 * { 2 + 3',
      '\\frac{ \\sqrt x }{{ \\sqrt y}'
    );
    testCantParse(
      'unmatched \\left/\\right',
      '\\left ( 1 + 2 )',
      ' [ 1, 2 \\right ]'
    );
    testCantParse(
      'langlerfish/ranglerfish (checking for confusion with langle/rangle)',
      '\\left\\langlerfish 123\\right\\ranglerfish)'
    );
  });
});
