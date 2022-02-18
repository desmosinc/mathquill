import { MQNode } from './keystroke';
import { L, R } from "../utils"
import { Controller_keystroke } from './keystroke';
import { MathBlock, VanillaSymbol } from '../commands/math';
import { Parser } from './parser.util';
import { optionProcessors } from 'src/publicapi';
import { Letter, Digit, PlusMinus } from 'src/commands/math/basicSymbols';
import { jQToDOMFragment, domFrag } from 'src/domFragment';
import { RootMathCommand } from 'src/commands/text';
import type { LatexCmdsSingleChar } from 'src/shared_types';
import { LatexCmds } from 'src/commands/list';
import type { Fragment } from 'src/node';

export class TempSingleCharNode extends MQNode {
  constructor(_char: string) {
    super();
  }
}

// Parser MathBlock
export const latexMathParser = (function () {
  function commandToBlock(cmd: MQNode | Fragment): MathBlock {
    // can also take in a Fragment
    let block = new MathBlock();
    cmd.adopt(block, 0, 0);
    return block;
  }
  function joinBlocks(blocks: MathBlock[]) {
    let firstBlock = blocks[0] || new MathBlock();

    for (let i = 1; i < blocks.length; i += 1) {
      blocks[i].children().adopt(firstBlock, firstBlock.getEnd(R), 0);
    }

    return firstBlock;
  }

  let string = Parser.string;
  let regex = Parser.regex;
  let letter = Parser.letter;
  let digit = Parser.digit;
  let any = Parser.any;
  let optWhitespace = Parser.optWhitespace;
  let succeed = Parser.succeed;
  let fail = Parser.fail;

  // Parsers yielding either MathCommands, or Fragments of MathCommands
  //   (either way, something that can be adopted by a MathBlock)
  let variable = letter.map(function (c) {
    return new Letter(c);
  });
  let number = digit.map(function (c) {
    return new Digit(c);
  });
  let symbol = regex(/^[^${}\\_^]/).map(function (c) {
    return new VanillaSymbol(c);
  });

  let controlSequence = regex(/^[^\\a-eg-zA-Z]/) // hotfix #164; match MathBlock::write
    .or(
      string('\\').then(
        regex(/^[a-z]+/i)
          .or(regex(/^\s+/).result(' '))
          .or(any)
      )
    )
    .then(function (ctrlSeq) {
      // TODO - is Parser<MQNode> correct?
      let cmdKlass = (LatexCmds as LatexCmdsSingleChar)[ctrlSeq];

      if (cmdKlass) {
        if (cmdKlass.constructor) {
          let actualClass = cmdKlass as typeof TempSingleCharNode; // TODO - figure out how to know the difference
          return new actualClass(ctrlSeq).parser();
        } else {
          let builder = cmdKlass as (c: string) => TempSingleCharNode; // TODO - figure out how to know the difference
          return builder(ctrlSeq).parser();
        }
      } else {
        return fail('unknown command: \\' + ctrlSeq);
      }
    });
  let command = controlSequence.or(variable).or(number).or(symbol);
  // Parsers yielding MathBlocks
  let mathGroup: Parser<MathBlock> = string('{')
    .then(function () {
      return mathSequence;
    })
    .skip(string('}'));
  let mathBlock = optWhitespace.then(mathGroup.or(command.map(commandToBlock)));
  let mathSequence = mathBlock.many().map(joinBlocks).skip(optWhitespace);

  let optMathBlock = string('[')
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
  let latexMath: typeof mathSequence & {
    block: typeof mathBlock;
    optBlock: typeof optMathBlock;
  } = mathSequence as any;

  latexMath.block = mathBlock;
  latexMath.optBlock = optMathBlock;
  return latexMath;
})();

optionProcessors.maxDepth = function (depth: number) {
  return typeof depth === 'number' ? depth : undefined;
};

export class Controller_latex extends Controller_keystroke {
  cleanLatex(latex: string) {
    //prune unnecessary spaces
    return latex.replace(/(\\[a-z]+) (?![a-z])/gi, '$1');
  }
  exportLatex() {
    return this.cleanLatex(this.root.latex());
  }
  writeLatex(latex: string) {
    let cursor = this.notify('edit').cursor;
    cursor.parent.writeLatex(cursor, latex);

    return this;
  }

  classifyLatexForEfficientUpdate(latex: string) {
    if (typeof latex !== 'string') return;

    let matches = latex.match(/-?[0-9.]+$/g);
    if (matches && matches.length === 1) {
      return {
        latex: latex,
        prefix: latex.substr(0, latex.length - matches[0].length),
        digits: matches[0],
      };
    }

    return;
  }
  renderLatexMathEfficiently(latex: string) {
    let root = this.root;
    let oldLatex = this.exportLatex();
    if (root.getEnd(L) && root.getEnd(R) && oldLatex === latex) {
      return true;
    }
    let oldClassification;
    let classification = this.classifyLatexForEfficientUpdate(latex);
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
    let oldDigits = oldClassification.digits;
    let newDigits = classification.digits;
    let oldMinusSign = false;
    let newMinusSign = false;
    if (oldDigits[0] === '-') {
      oldMinusSign = true;
      oldDigits = oldDigits.substr(1);
    }
    if (newDigits[0] === '-') {
      newMinusSign = true;
      newDigits = newDigits.substr(1);
    }

    // start at the very end
    let charNode = this.root.getEnd(R);
    let oldCharNodes = [];
    for (let i = oldDigits.length - 1; i >= 0; i--) {
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
      let oldMinusNode = charNode;
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
      let newMinusNode = new PlusMinus('-');
      let minusSpan = document.createElement('span');
      minusSpan.textContent = '-';
      newMinusNode.setDOMFrag(jQToDOMFragment($(minusSpan)));

      let oldCharNodes0L = oldCharNodes[0][L];
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
    let commonLength = Math.min(oldDigits.length, newDigits.length);
    for (let i = 0; i < commonLength; i++) {
      let newText = newDigits[i];
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

      for (let i = oldDigits.length - 1; i >= commonLength; i--) {
        oldCharNodes[i].domFrag().remove();
      }
    }

    // add new digits after the existing ones
    if (newDigits.length > oldDigits.length) {
      let frag = document.createDocumentFragment();

      for (let i = commonLength; i < newDigits.length; i++) {
        let span = document.createElement('span');
        span.className = 'mq-digit';
        span.textContent = newDigits[i];

        let newNode = new Digit(newDigits[i]);
        newNode.parent = root;
        newNode.setDOMFrag(jQToDOMFragment($(span)));
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

    let currentLatex = this.exportLatex();
    if (currentLatex !== latex) {
      console.warn(
        'tried updating latex efficiently but did not work. Attempted: ' +
          latex +
          ' but wrote: ' +
          currentLatex
      );
      return false;
    }

    this.cursor.resetToEnd(this);

    let rightMost = root.getEnd(R);
    if (rightMost) {
      rightMost.fixDigitGrouping(this.cursor.options);
    }

    return true;
  }
  renderLatexMathFromScratch(latex: string) {
    let root = this.root,
      cursor = this.cursor;
    let all = Parser.all;
    let eof = Parser.eof;

    let block = latexMathParser
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
    this.updateMathspeak();
    delete cursor.selection;
    cursor.insAtRightEnd(root);
  }
  renderLatexMath(latex: string) {
    this.notify('replace');

    if (this.renderLatexMathEfficiently(latex)) return;
    this.renderLatexMathFromScratch(latex);
  }
  renderLatexText(latex: string) {
    let root = this.root,
      cursor = this.cursor;

    root.domFrag().children().slice(1).remove();
    root.setEnds({ [L]: 0, [R]: 0 });
    delete cursor.selection;
    cursor.show().insAtRightEnd(root);

    let regex = Parser.regex;
    let string = Parser.string;
    let eof = Parser.eof;
    let all = Parser.all;

    // Parser RootMathCommand
    let mathMode = string('$')
      .then(latexMathParser)
      // because TeX is insane, math mode doesn't necessarily
      // have to end.  So we allow for the case that math mode
      // continues to the end of the stream.
      .skip(string('$').or(eof))
      .map(function (block) {
        // HACK FIXME: this shouldn't have to have access to cursor
        let rootMathCommand = new RootMathCommand(cursor);

        rootMathCommand.createBlocks();
        let rootMathBlock = rootMathCommand.getEnd(L);
        block.children().adopt(rootMathBlock as MQNode, 0, 0);

        return rootMathCommand;
      });
    let escapedDollar = string('\\$').result('$');
    let textChar = escapedDollar
      .or(regex(/^[^$]/))
      .map((ch) => new VanillaSymbol(ch));
    let latexText = mathMode.or(textChar).many();
    let commands = latexText
      .skip(eof)
      .or(all.result<false>(false))
      .parse(latex);

    if (commands) {
      for (let i = 0; i < commands.length; i += 1) {
        commands[i].adopt(root, root.getEnd(R), 0);
      }

      domFrag(root.html()).appendTo(root.domFrag().oneElement());

      root.finalizeInsert(cursor.options, cursor);
    }
  }
}
