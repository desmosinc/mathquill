class TempSingleCharNode extends MQNode {
  constructor(_char: string) {
    super();
  }
}

type ExportedLatexSelection = {
  latex: string;
  startIndex: number;
  endIndex: number;
};

// Parser MathBlock
var latexMathParser = (function () {
  function commandToBlock(cmd: MQNode | Fragment): MathBlock {
    // can also take in a Fragment
    var block = new MathBlock();
    cmd.adopt(block, 0, 0);
    return block;
  }
  function joinBlocks(blocks: MathBlock[]) {
    var firstBlock = blocks[0] || new MathBlock();

    for (var i = 1; i < blocks.length; i += 1) {
      blocks[i].children().adopt(firstBlock, firstBlock.getEnd(R), 0);
    }

    return firstBlock;
  }

  var string = Parser.string;
  var regex = Parser.regex;
  var letter = Parser.letter;
  var digit = Parser.digit;
  var any = Parser.any;
  var optWhitespace = Parser.optWhitespace;
  var succeed = Parser.succeed;
  var fail = Parser.fail;

  // Parsers yielding either MathCommands, or Fragments of MathCommands
  //   (either way, something that can be adopted by a MathBlock)
  var variable = letter.map(function (c) {
    return new Letter(c);
  });
  var number = digit.map(function (c) {
    return new Digit(c);
  });
  var symbol = regex(/^[^${}\\_^]/).map(function (c) {
    return new VanillaSymbol(c);
  });

  var controlSequence = regex(/^[^\\a-eg-zA-Z]/) // hotfix #164; match MathBlock::write
    .or(
      string('\\').then(
        regex(/^[a-z]+/i)
          .or(regex(/^\s+/).result(' '))
          .or(any)
      )
    )
    .then(function (ctrlSeq) {
      // TODO - is Parser<MQNode> correct?
      var cmdKlass = (LatexCmds as LatexCmdsSingleChar)[ctrlSeq];

      if (cmdKlass) {
        if (cmdKlass.constructor) {
          var actualClass = cmdKlass as typeof TempSingleCharNode; // TODO - figure out how to know the difference
          return new actualClass(ctrlSeq).parser();
        } else {
          var builder = cmdKlass as (c: string) => TempSingleCharNode; // TODO - figure out how to know the difference
          return builder(ctrlSeq).parser();
        }
      } else {
        return fail('unknown command: \\' + ctrlSeq);
      }
    });
  var command = controlSequence.or(variable).or(number).or(symbol);
  // Parsers yielding MathBlocks
  var mathGroup: Parser<MathBlock> = string('{')
    .then(function () {
      return mathSequence;
    })
    .skip(string('}'));
  var mathBlock = optWhitespace.then(mathGroup.or(command.map(commandToBlock)));
  var mathSequence = mathBlock.many().map(joinBlocks).skip(optWhitespace);

  var optMathBlock = string('[')
    .then(
      mathBlock
        .then(function (block) {
          return block.join('latex') !== ']' ? succeed(block) : fail('');
        })
        .many()
        .map(joinBlocks)
        .skip(optWhitespace)
    )
    .skip(string(']'));
  var latexMath: typeof mathSequence & {
    block: typeof mathBlock;
    optBlock: typeof optMathBlock;
  } = mathSequence as any;

  latexMath.block = mathBlock;
  latexMath.optBlock = optMathBlock;
  return latexMath;
})();

baseOptionProcessors.maxDepth = function (depth: number | undefined) {
  return typeof depth === 'number' ? depth : undefined;
};

class Controller_latex extends Controller_keystroke {
  cleanLatex(latex: string) {
    //prune unnecessary spaces
    return latex.replace(/(\\[a-z]+) (?![a-z])/gi, '$1');
  }
  exportLatex() {
    return this.cleanLatex(this.root.latex());
  }
  writeLatex(latex: string) {
    var cursor = this.notify('edit').cursor;
    cursor.parent.writeLatex(cursor, latex);

    return this;
  }

  prepareCursorForRestoration() {
    this.cursor.clearSelection().endSelection();
    return this.notify('move').cursor;
  }

  restoreLatexSelection(newSelection: ExportedLatexSelection) {
    const oldSelectionInfo = this.exportLatexSelection();
    const oldSelection = oldSelectionInfo.selection;
    const oldLatex = oldSelection.latex;
    const newLatex = newSelection.latex;

    // latexs must match for the startIndex and endIndex to match up
    if (newLatex !== oldLatex) return;

    // nothing has changed, so there's nothing to do.
    if (
      newSelection.startIndex === oldSelection.startIndex &&
      newSelection.endIndex === oldSelection.endIndex
    )
      return;

    if (newSelection.endIndex === 0) {
      this.prepareCursorForRestoration().insAtDirEnd(L, this.root);
    } else if (newSelection.startIndex === newLatex.length) {
      this.prepareCursorForRestoration().insAtDirEnd(R, this.root);
    } else {
      // the data.startIndex and data.endIndex are values that are relative to the
      // cleaned latex. The problem is that when we traverse this tree looking for
      // the nodes in those positions we will be working on raw uncleaned latex. We need
      // to map our cleaned indices back to uncleaned indices. Then we can take another
      // pass through the tree looking for the nodes at the startIndex and endIndex
      const mappedIndices = mapFromCleanedToUncleanedIndices(
        oldLatex,
        oldSelectionInfo.ctx.latex,
        newSelection
      );

      const { restoreInfo } = this.exportLatexSelection(mappedIndices).ctx;

      if (newSelection.startIndex === newSelection.endIndex) {
        if (restoreInfo?.cursorL) {
          this.prepareCursorForRestoration().insRightOf(
            restoreInfo.cursorL as MQNode
          );
        } else if (restoreInfo?.cursorParent) {
          this.prepareCursorForRestoration().insAtLeftEnd(
            restoreInfo.cursorParent as MQNode
          );
        }
      } else {
        if (restoreInfo?.selectionL && restoreInfo.selectionR) {
          // TODO - should we validate this selection by verifying you can get from selectionR
          // to selectionL by traversing leftward? That would be a quick and easy sanity check
          // to run ahead of time to prevent messing up selection if an invalid selection is
          // passed in. If an invalid selection is passed in we shouldn't loop infinitely but
          // we could end up in a weird state.

          // copied this from the selectAll routine. It does appear selecting from the
          // right to the left is critical to this working.
          this.prepareCursorForRestoration().insRightOf(
            restoreInfo.selectionR as MQNode
          );

          const root = this.cursor.controller.root;
          this.withIncrementalSelection((selectDir) => {
            do {
              selectDir(L);

              // if something goes wrong avoid an infinite loop. We should eventually
              // reach the leftmost side.
              if (!this.cursor[L] && this.cursor.parent === root) {
                break;
              }
            } while (this.cursor[R] !== restoreInfo.selectionL);
          });

          // TODO - should we validate that we ended up with exactly the correct selectionL
          // and selectionR? It might be a little late to restore the previous selection. The
          // case I'm thinking of is maybe your startIndex and endIndex are constructed in a way
          // that we end up expand the selection in both directions. Hopefully we'd be able to
          // guard against that in a precheck though.
        }
      }
    }
  }

  exportLatexSelection(restoreInfo?: {
    uncleanStartIndex: number;
    uncleanEndIndex: number;
  }): {
    selection: ExportedLatexSelection;
    ctx: LatexContext;
  } {
    var ctx: LatexContext = {
      latex: '',
      startIndex: -1,
      endIndex: -1
    };

    if (restoreInfo) {
      ctx.restoreInfo = {
        startIndex: restoreInfo.uncleanStartIndex,
        endIndex: restoreInfo.uncleanEndIndex
      };
    }

    var selection = this.cursor.selection;
    if (selection && this.cursor.anticursor) {
      ctx.startSelectionBefore = selection.getEnd(L);
      ctx.endSelectionAfter = selection.getEnd(R);
    } else {
      var cursorL = this.cursor[L];
      if (cursorL) {
        ctx.startSelectionAfter = cursorL;
      } else {
        ctx.startSelectionBefore = this.cursor.parent;
      }

      var cursorR = this.cursor[R];
      if (cursorR) {
        ctx.endSelectionBefore = cursorR;
      } else {
        ctx.endSelectionAfter = this.cursor.parent;
      }
    }

    this.root.latexRecursive(ctx);

    // need to clean the latex
    var uncleanedLatex = ctx.latex;
    var cleanLatex = this.cleanLatex(uncleanedLatex);
    const { startIndex, endIndex } = mapFromUncleanedToCleanedIndices(
      uncleanedLatex,
      cleanLatex,
      ctx
    );

    return {
      selection: {
        latex: cleanLatex,
        startIndex: startIndex,
        endIndex: endIndex
      },
      ctx
    };
  }

  classifyLatexForEfficientUpdate(latex: unknown) {
    if (typeof latex !== 'string') return;

    var matches = latex.match(/-?[0-9.]+$/g);
    if (matches && matches.length === 1) {
      return {
        latex: latex,
        prefix: latex.substr(0, latex.length - matches[0].length),
        digits: matches[0]
      };
    }

    return;
  }
  private updateLatexMathEfficiently(latex: unknown, oldLatex: unknown) {
    // Note, benchmark/update.html is useful for measuring the
    // performance of renderLatexMathEfficiently
    var root = this.root;
    var oldClassification;
    var classification = this.classifyLatexForEfficientUpdate(latex);
    if (classification) {
      oldClassification = this.classifyLatexForEfficientUpdate(oldLatex);
      if (
        !oldClassification ||
        oldClassification.prefix !== classification.prefix
      ) {
        return false;
      }
    } else {
      return false;
    }

    // check if minus sign is changing
    var oldDigits = oldClassification.digits;
    var newDigits = classification.digits;
    var oldMinusSign = false;
    var newMinusSign = false;
    if (oldDigits[0] === '-') {
      oldMinusSign = true;
      oldDigits = oldDigits.substr(1);
    }
    if (newDigits[0] === '-') {
      newMinusSign = true;
      newDigits = newDigits.substr(1);
    }

    // start at the very end
    var charNode = this.root.getEnd(R);
    var oldCharNodes = [];
    for (var i = oldDigits.length - 1; i >= 0; i--) {
      // the tree does not match what we expect
      if (!charNode || charNode.ctrlSeq !== oldDigits[i]) {
        return false;
      }

      // the trailing digits are not just under the root. We require the root
      // to be the parent so that we can be sure we do not need a reflow to
      // grow parens.
      if (charNode.parent !== root) {
        return false;
      }

      // push to the start. We're traversing backwards
      oldCharNodes.unshift(charNode);

      // move left one character
      charNode = charNode[L];
    }

    // remove the minus sign
    if (oldMinusSign && !newMinusSign) {
      var oldMinusNode = charNode;
      if (!oldMinusNode) return false;
      if (oldMinusNode.ctrlSeq !== '-') return false;
      if (oldMinusNode[R] !== oldCharNodes[0]) return false;
      if (oldMinusNode.parent !== root) return false;

      const oldMinusNodeL = oldMinusNode[L];
      if (oldMinusNodeL && oldMinusNodeL.parent !== root) return false;

      oldCharNodes[0][L] = oldMinusNode[L];

      if (root.getEnd(L) === oldMinusNode) {
        root.setEnds({ [L]: oldCharNodes[0], [R]: root.getEnd(R) });
      }
      if (oldMinusNodeL) oldMinusNodeL[R] = oldCharNodes[0];

      oldMinusNode.domFrag().remove();
    }

    // add a minus sign
    if (!oldMinusSign && newMinusSign) {
      var newMinusNode = new PlusMinus('-');
      var minusSpan = document.createElement('span');
      minusSpan.textContent = '-';
      newMinusNode.setDOM(minusSpan);

      var oldCharNodes0L = oldCharNodes[0][L];
      if (oldCharNodes0L) oldCharNodes0L[R] = newMinusNode;
      if (root.getEnd(L) === oldCharNodes[0]) {
        root.setEnds({ [L]: newMinusNode, [R]: root.getEnd(R) });
      }

      newMinusNode.parent = root;
      newMinusNode[L] = oldCharNodes[0][L];
      newMinusNode[R] = oldCharNodes[0];
      oldCharNodes[0][L] = newMinusNode;

      newMinusNode.contactWeld(this.cursor); // decide if binary operator
      newMinusNode.domFrag().insertBefore(oldCharNodes[0].domFrag());
    }

    // update the text of the current nodes
    var commonLength = Math.min(oldDigits.length, newDigits.length);
    for (i = 0; i < commonLength; i++) {
      var newText = newDigits[i];
      charNode = oldCharNodes[i];
      if (charNode.ctrlSeq !== newText) {
        charNode.ctrlSeq = newText;
        charNode.domFrag().oneElement().textContent = newText;
        charNode.mathspeakName = newText;
      }
    }

    // remove the extra digits at the end
    if (oldDigits.length > newDigits.length) {
      charNode = oldCharNodes[newDigits.length - 1];
      root.setEnds({ [L]: root.getEnd(L), [R]: charNode });
      charNode[R] = 0;

      for (i = oldDigits.length - 1; i >= commonLength; i--) {
        oldCharNodes[i].domFrag().remove();
      }
    }

    // add new digits after the existing ones
    if (newDigits.length > oldDigits.length) {
      var frag = document.createDocumentFragment();

      for (i = commonLength; i < newDigits.length; i++) {
        var span = document.createElement('span');
        span.className = 'mq-digit';
        span.textContent = newDigits[i];

        var newNode = new Digit(newDigits[i]);
        newNode.parent = root;
        newNode.setDOM(span);
        frag.appendChild(span);

        // splice this node in
        newNode[L] = root.getEnd(R);
        newNode[R] = 0;

        const newNodeL = newNode[L] as MQNode;
        newNodeL[R] = newNode;
        root.setEnds({ [L]: root.getEnd(L), [R]: newNode });
      }

      root.domFrag().oneElement().appendChild(frag);
    }

    var currentLatex = this.exportLatex();
    if (currentLatex !== latex) {
      console.warn(
        'tried updating latex efficiently but did not work. Attempted: ' +
          latex +
          ' but wrote: ' +
          currentLatex
      );
      return false;
    }

    var rightMost = root.getEnd(R);
    if (rightMost) {
      rightMost.fixDigitGrouping(this.cursor.options);
    }

    return true;
  }
  private renderLatexMathFromScratch(latex: unknown) {
    var root = this.root,
      cursor = this.cursor;
    var all = Parser.all;
    var eof = Parser.eof;

    var block = latexMathParser
      .skip(eof)
      .or(all.result<false>(false))
      .parse(latex);

    root.setEnds({ [L]: 0, [R]: 0 });

    if (block) {
      block.children().adopt(root, 0, 0);
    }

    if (block) {
      const frag = root.domFrag();
      frag.children().remove();
      frag.oneElement().appendChild(block.html());
      root.finalizeInsert(cursor.options, cursor);
    } else {
      root.domFrag().empty();
    }
  }
  renderLatexMath(latex: unknown) {
    var cursor = this.cursor;
    var root = this.root;
    this.notify('replace');
    cursor.clearSelection();
    var oldLatex = this.exportLatex();
    if (!root.getEnd(L) || !root.getEnd(R) || oldLatex !== latex) {
      this.updateLatexMathEfficiently(latex, oldLatex) ||
        this.renderLatexMathFromScratch(latex);
      this.updateMathspeak();
    }
    cursor.insAtRightEnd(root);
  }
  renderLatexText(latex: string) {
    var root = this.root,
      cursor = this.cursor;

    root.domFrag().children().slice(1).remove();
    root.setEnds({ [L]: 0, [R]: 0 });
    delete cursor.selection;
    cursor.show().insAtRightEnd(root);

    var regex = Parser.regex;
    var string = Parser.string;
    var eof = Parser.eof;
    var all = Parser.all;

    // Parser RootMathCommand
    var mathMode = string('$')
      .then(latexMathParser)
      // because TeX is insane, math mode doesn't necessarily
      // have to end.  So we allow for the case that math mode
      // continues to the end of the stream.
      .skip(string('$').or(eof))
      .map(function (block) {
        // HACK FIXME: this shouldn't have to have access to cursor
        var rootMathCommand = new RootMathCommand(cursor);

        rootMathCommand.createBlocks();
        var rootMathBlock = rootMathCommand.getEnd(L);
        block.children().adopt(rootMathBlock as MQNode, 0, 0);

        return rootMathCommand;
      });
    var escapedDollar = string('\\$').result('$');
    var textChar = escapedDollar
      .or(regex(/^[^$]/))
      .map((ch) => new VanillaSymbol(ch));
    var latexText = mathMode.or(textChar).many();
    var commands = latexText
      .skip(eof)
      .or(all.result<false>(false))
      .parse(latex);

    if (commands) {
      for (var i = 0; i < commands.length; i += 1) {
        commands[i].adopt(root, root.getEnd(R), 0);
      }

      domFrag(root.html()).appendTo(root.domFrag().oneElement());

      root.finalizeInsert(cursor.options, cursor);
    }
  }
}

function mapFromUncleanedToCleanedIndices(
  uncleanedLatex: string,
  cleanedLatex: string,
  indices: { startIndex: number; endIndex: number }
) {
  var startIndex = indices.startIndex;
  var endIndex = indices.endIndex;

  // assumes that the cleaning process will only remove space characters. We
  // run through the uncleanedLatex and cleanLatex to find differences.
  // when we find differences we see how many characters are dropped until
  // we sync back up. While detecting missing characters we decrement the
  // startIndex and endIndex if appropriate.
  for (
    var uncleanIdx = 0, cleanIdx = 0;
    uncleanIdx < indices.endIndex;
    uncleanIdx++
  ) {
    if (uncleanedLatex[uncleanIdx] !== cleanedLatex[cleanIdx]) {
      if (uncleanIdx < indices.startIndex) {
        startIndex -= 1;
      }
      endIndex -= 1;

      // do not increment j. We wan to keep looking at this same
      // cleanLatex character until we find it in the uncleanedLatex
    } else {
      cleanIdx += 1; //move to next cleanLatex character
    }
  }

  return {
    startIndex,
    endIndex
  };
}

function mapFromCleanedToUncleanedIndices(
  cleanedLatex: string,
  uncleanedLatex: string,
  indices: { startIndex: number; endIndex: number }
) {
  const cleanStartIdx = indices.startIndex;
  const cleanEndIdx = indices.endIndex;
  var uncleanStartIndex = cleanStartIdx;
  var uncleanEndIndex = cleanEndIdx;

  // assumes that the cleaning process will only remove space characters. We
  // run through the uncleanedLatex moving one character every time. We compare
  // against the cleanedLatex. If the cleanedLatex matches we consume a cleanedLatex
  // character. Otherwise we continue pointing to the same cleanedLatex character until
  // it matches the uncleanedLatex. When we find mismatches we know that we need to increase
  // the startIndex and endIndex to correspond to the correct uncleaned positions.
  for (
    var uncleanIdx = 0, cleanIdx = 0;
    uncleanIdx < uncleanedLatex.length;
    uncleanIdx++
  ) {
    if (uncleanedLatex[uncleanIdx] !== cleanedLatex[cleanIdx]) {
      if (cleanIdx <= cleanStartIdx) {
        uncleanStartIndex += 1;
      }
      if (cleanIdx <= cleanEndIdx) {
        uncleanEndIndex += 1;
      }
    } else {
      cleanIdx += 1;
    }
  }

  return {
    uncleanStartIndex,
    uncleanEndIndex
  };
}
