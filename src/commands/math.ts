/*************************************************
 * Abstract classes of math blocks and commands.
 ************************************************/

import { MQNode } from "../services/keystroke";
import { CursorOptions, NodeRef, MathspeakOptions, LatexCmdsSingleCharBuilder } from "../shared_types";
import { Anticursor, Cursor, MQSelection } from "../cursor"
import { API, APIClasses, RootBlockMixin } from "../publicapi"
import { Direction, pray, L, R, noop } from "../utils"
import { Parser, } from "../services/parser.util";
import { domFrag } from "../domFragment";
import { h } from "../dom";
import { getBoundingClientRect } from "../browser";
import { Controller } from "../services/textarea";
import { latexMathParser } from "src/services/latex";
import { Digit, Letter } from "./math/basicSymbols";
import { Options } from "src/options";
import { CharCmdsAny, InnerFields, JoinMethod, LatexCmdsAny } from "src/pure_types";
import { LatexCmds, CharCmds } from "./list";
import { Ends, Fragment, NodeBase } from "src/node";

/**
 * Math tree node base class.
 * Some math-tree-specific extensions to MQNode.
 * Both MathBlock's and MathCommand's descend from it.
 */
export class MathElement extends MQNode {
  finalizeInsert(options: CursorOptions, cursor: Cursor) {
    let self = this;
    self.postOrder(function (node) {
      node.finalizeTree(options);
    });
    self.postOrder(function (node) {
      node.contactWeld(cursor);
    });

    // note: this order is important.
    // empty elements need the empty box provided by blur to
    // be present in order for their dimensions to be measured
    // correctly by 'reflow' handlers.
    self.postOrder(function (node) {
      node.blur(cursor);
    });

    self.postOrder(function (node) {
      node.reflow();
    });
    let selfR = self[R];
    let selfL = self[L];
    if (selfR) selfR.siblingCreated(options, L);
    if (selfL) selfL.siblingCreated(options, R);
    self.bubble(function (node) {
      node.reflow();
      return undefined;
    });
  }
  // If the maxDepth option is set, make sure
  // deeply nested content is truncated. Just return
  // false if the cursor is already too deep.
  prepareInsertionAt(cursor: Cursor) {
    let maxDepth = cursor.options.maxDepth;
    if (maxDepth !== undefined) {
      let cursorDepth = cursor.depth();
      if (cursorDepth > maxDepth) {
        return false;
      }
      this.removeNodesDeeperThan(maxDepth - cursorDepth);
    }
    return true;
  }
  // Remove nodes that are more than `cutoff`
  // blocks deep from this node.
  removeNodesDeeperThan(cutoff: number) {
    let depth = 0;
    let queue: [[MQNode, number]] = [[this, depth]];
    let current: [MQNode, number] | undefined;

    // Do a breadth-first search of this node's descendants
    // down to cutoff, removing anything deeper.
    while ((current = queue.shift())) {
      let c = current;
      c[0].children().each(function (child) {
        let i = child instanceof MathBlock ? 1 : 0;
        depth = c[1] + i;

        if (depth <= cutoff) {
          queue.push([child, depth]);
        } else {
          (i ? child.children() : child).remove();
        }
        return undefined;
      });
    }
  }
}

export class DOMView {
  constructor(
    public readonly childCount: number,
    public readonly render: (blocks: MathBlock[]) => Element | DocumentFragment
  ) {}
}

/**
 * Commands and operators, like subscripts, exponents, or fractions.
 * Descendant commands are organized into blocks.
 */
export class MathCommand extends MathElement {
  replacedFragment: Fragment | undefined;
  protected domView: DOMView;
  protected ends: Ends<MQNode>;

  constructor(ctrlSeq?: string, domView?: DOMView, textTemplate?: string[]) {
    super();
    this.setCtrlSeqHtmlAndText(ctrlSeq, domView, textTemplate);
  }

  setEnds(ends: Ends<MQNode>) {
    pray('MathCommand ends are never empty', ends[L] && ends[R]);
    this.ends = ends;
  }

  getEnd(dir: Direction): MQNode {
    return this.ends[dir];
  }

  setCtrlSeqHtmlAndText(
    ctrlSeq?: string,
    domView?: DOMView,
    textTemplate?: string[]
  ) {
    if (!this.ctrlSeq) this.ctrlSeq = ctrlSeq;
    if (domView) this.domView = domView;
    if (textTemplate) this.textTemplate = textTemplate;
  }

  // obvious methods
  replaces(replacedFragment: Fragment) {
    replacedFragment.disown();
    this.replacedFragment = replacedFragment;
  }
  isEmpty() {
    return this.foldChildren(true, function (isEmpty, child) {
      return isEmpty && child.isEmpty();
    });
  }

  parser(): Parser<MQNode | Fragment> {
    let block = latexMathParser.block;

    return block.times(this.numBlocks()).map((blocks) => {
      this.blocks = blocks;

      for (let i = 0; i < blocks.length; i += 1) {
        blocks[i].adopt(this, this.getEnd(R), 0);
      }

      return this;
    });
  }

  // createLeftOf(cursor) and the methods it calls
  createLeftOf(cursor: Cursor) {
    let cmd = this;
    let replacedFragment = cmd.replacedFragment;

    cmd.createBlocks();
    super.createLeftOf(cursor);
    if (replacedFragment) {
      const cmdEndsL = cmd.getEnd(L);
      replacedFragment.adopt(cmdEndsL, 0, 0);
      replacedFragment.domFrag().appendTo(cmdEndsL.domFrag().oneElement());
      cmd.placeCursor(cursor);
      cmd.prepareInsertionAt(cursor);
    }
    cmd.finalizeInsert(cursor.options, cursor);
    cmd.placeCursor(cursor);
  }
  createBlocks() {
    let cmd = this,
      numBlocks = cmd.numBlocks(),
      blocks = (cmd.blocks = Array(numBlocks));

    for (let i = 0; i < numBlocks; i += 1) {
      let newBlock = (blocks[i] = new MathBlock());
      newBlock.adopt(cmd, cmd.getEnd(R), 0);
    }
  }
  placeCursor(cursor: Cursor) {
    //insert the cursor at the right end of the first empty child, searching
    //left-to-right, or if none empty, the right end child
    cursor.insAtRightEnd(
      this.foldChildren(this.getEnd(L), function (leftward, child) {
        return leftward.isEmpty() ? leftward : child;
      })
    );
  }

  // editability methods: called by the cursor for editing, cursor movements,
  // and selection of the MathQuill tree, these all take in a direction and
  // the cursor
  moveTowards(dir: Direction, cursor: Cursor, updown?: 'up' | 'down') {
    let updownInto: NodeRef | undefined;
    if (updown === 'up') {
      updownInto = this.upInto;
    } else if (updown === 'down') {
      updownInto = this.downInto;
    }

    const el = updownInto || this.getEnd(-dir as Direction);
    cursor.insAtDirEnd(-dir as Direction, el);
    cursor.controller.aria
      .queueDirEndOf(-dir as Direction)
      .queue(cursor.parent, true);
  }
  deleteTowards(dir: Direction, cursor: Cursor) {
    if (this.isEmpty()) cursor[dir] = this.remove()[dir];
    else this.moveTowards(dir, cursor);
  }
  selectTowards(dir: Direction, cursor: Cursor) {
    cursor[-dir as Direction] = this;
    cursor[dir] = this[dir];
  }
  selectChildren(): MQSelection {
    return new MQSelection(this, this);
  }
  unselectInto(dir: Direction, cursor: Cursor) {
    const antiCursor = cursor.anticursor as Anticursor;
    const ancestor = antiCursor.ancestors[this.id] as MQNode;
    cursor.insAtDirEnd(-dir as Direction, ancestor);
  }
  seek(clientX: number, cursor: Cursor) {
    function getBounds(node: MQNode) {
      const el = node.domFrag().oneElement();
      const l = getBoundingClientRect(el).left;
      let r: number = l + el.offsetWidth;
      return {
        [L]: l,
        [R]: r,
      };
    }

    let cmd = this;
    let cmdBounds = getBounds(cmd);

    if (clientX < cmdBounds[L]) return cursor.insLeftOf(cmd);
    if (clientX > cmdBounds[R]) return cursor.insRightOf(cmd);

    let leftLeftBound = cmdBounds[L];
    cmd.eachChild(function (block) {
      let blockBounds = getBounds(block);
      if (clientX < blockBounds[L]) {
        // closer to this block's left bound, or the bound left of that?
        if (clientX - leftLeftBound < blockBounds[L] - clientX) {
          if (block[L]) cursor.insAtRightEnd(block[L] as MQNode);
          else cursor.insLeftOf(cmd);
        } else cursor.insAtLeftEnd(block);
        return false;
      } else if (clientX > blockBounds[R]) {
        if (block[R]) leftLeftBound = blockBounds[R];
        // continue to next block
        else {
          // last (rightmost) block
          // closer to this block's right bound, or the cmd's right bound?
          if (cmdBounds[R] - clientX < clientX - blockBounds[R]) {
            cursor.insRightOf(cmd);
          } else cursor.insAtRightEnd(block);
        }
        return undefined;
      } else {
        block.seek(clientX, cursor);
        return false;
      }
    });

    return undefined;
  }

  numBlocks() {
    return this.domView.childCount;
  }

  /**
   * Render the entire math subtree rooted at this command to a DOM node. Assumes `this.domView` is defined.
   *
   * See dom.test.js for example templates and intended outputs.
   */
  html(): Element | DocumentFragment {
    const blocks = this.blocks;
    pray('domView is defined', this.domView);
    const template = this.domView;
    const dom = template.render(blocks || []);
    // Add aria-hidden (for screen reader users) to all top-level elements
    let node: ChildNode | null =
      dom instanceof DocumentFragment ? dom.childNodes[0] : dom;
    while (node) {
      if (node instanceof Element) {
        this.joinFrag(domFrag(node));
        NodeBase.linkElementByCmdNode(node, this);
      }
      node = node.nextSibling;
    }
    return dom;
  }

  // methods to export a string representation of the math tree
  latex() {
    return this.foldChildren(this.ctrlSeq || '', function (latex, child) {
      return latex + '{' + (child.latex() || ' ') + '}';
    });
  }
  textTemplate = [''];
  text() {
    let cmd = this,
      i = 0;
    return cmd.foldChildren(cmd.textTemplate[i], function (text, child) {
      i += 1;
      let child_text = child.text();
      if (
        text &&
        cmd.textTemplate[i] === '(' &&
        child_text[0] === '(' &&
        child_text.slice(-1) === ')'
      )
        return text + child_text.slice(1, -1) + cmd.textTemplate[i];
      return text + child_text + (cmd.textTemplate[i] || '');
    });
  }
  mathspeakTemplate = [''];
  mathspeak() {
    let cmd = this,
      i = 0;
    return cmd.foldChildren(
      cmd.mathspeakTemplate[i] || 'Start' + cmd.ctrlSeq + ' ',
      function (speech, block) {
        i += 1;
        return (
          speech +
          ' ' +
          block.mathspeak() +
          ' ' +
          (cmd.mathspeakTemplate[i] + ' ' || 'End' + cmd.ctrlSeq + ' ')
        );
      }
    );
  }
}

/**
 * Lightweight command without blocks or children.
 */
export class MQSymbol extends MathCommand {
  constructor(
    ctrlSeq?: string,
    html?: HTMLElement,
    text?: string,
    mathspeak?: string
  ) {
    super();
    this.setCtrlSeqHtmlTextAndMathspeak(
      ctrlSeq,
      html
        ? new DOMView(0, () => html.cloneNode(true) as HTMLElement)
        : undefined,
      text,
      mathspeak
    );
  }

  setCtrlSeqHtmlTextAndMathspeak(
    ctrlSeq?: string,
    html?: DOMView,
    text?: string,
    mathspeak?: string
  ) {
    if (!text && !!ctrlSeq) {
      text = ctrlSeq.replace(/^\\/, '');
    }

    this.mathspeakName = mathspeak || text;
    super.setCtrlSeqHtmlAndText(ctrlSeq, html, [text || '']);
  }

  parser(): Parser<MQNode | Fragment> {
    return Parser.succeed(this);
  }

  numBlocks() {
    return 0 as const;
  }

  replaces(replacedFragment: Fragment) {
    replacedFragment.remove();
  }
  createBlocks() {}

  moveTowards(dir: Direction, cursor: Cursor) {
    cursor.domFrag().insDirOf(dir, this.domFrag());
    cursor[-dir as Direction] = this;
    cursor[dir] = this[dir];
    cursor.controller.aria.queue(this);
  }
  deleteTowards(dir: Direction, cursor: Cursor) {
    cursor[dir] = this.remove()[dir];
  }
  seek(clientX: number, cursor: Cursor) {
    // insert at whichever side the click was closer to
    const el = this.domFrag().oneElement();
    const left = getBoundingClientRect(el).left;
    if (clientX - left < el.offsetWidth / 2) cursor.insLeftOf(this);
    else cursor.insRightOf(this);

    return cursor;
  }

  latex() {
    return this.ctrlSeq || '';
  }
  text() {
    return this.textTemplate.join('');
  }
  mathspeak(_opts?: MathspeakOptions) {
    return this.mathspeakName || '';
  }
  placeCursor() {}
  isEmpty() {
    return true;
  }
}
export class VanillaSymbol extends MQSymbol {
  constructor(ch: string, html?: ChildNode, mathspeak?: string) {
    super(ch, h('span', {}, [html || h.text(ch)]), undefined, mathspeak);
  }
}
export function bindVanillaSymbol(
  ch: string,
  htmlEntity?: string,
  mathspeak?: string
) {
  return () =>
    new VanillaSymbol(
      ch,
      htmlEntity ? h.entityText(htmlEntity) : undefined,
      mathspeak
    );
}

export class BinaryOperator extends MQSymbol {
  constructor(
    ctrlSeq?: string,
    html?: ChildNode,
    text?: string,
    mathspeak?: string,
    treatLikeSymbol?: boolean
  ) {
    if (treatLikeSymbol) {
      super(
        ctrlSeq,
        h('span', {}, [html || h.text(ctrlSeq || '')]),
        undefined,
        mathspeak
      );
    } else {
      super(
        ctrlSeq,
        h('span', { class: 'mq-binary-operator' }, html ? [html] : []),
        text,
        mathspeak
      );
    }
  }
}
export function bindBinaryOperator(
  ctrlSeq?: string,
  htmlEntity?: string,
  text?: string,
  mathspeak?: string
) {
  return () =>
    new BinaryOperator(
      ctrlSeq,
      htmlEntity ? h.entityText(htmlEntity) : undefined,
      text,
      mathspeak
    );
}

/**
 * Children and parent of MathCommand's. Basically partitions all the
 * symbols and operators that descend (in the Math DOM tree) from
 * ancestor operators.
 */
export class MathBlock extends MathElement {
  controller?: Controller;

  join(methodName: JoinMethod) {
    return this.foldChildren('', function (fold, child) {
      return fold + child[methodName]();
    });
  }
  html() {
    const fragment = document.createDocumentFragment();
    this.eachChild((el) => {
      const childHtml = el.html();
      fragment.appendChild(childHtml);
      return undefined;
    });
    return fragment;
  }
  latex() {
    return this.join('latex');
  }
  text() {
    let endsL = this.getEnd(L);
    let endsR = this.getEnd(R);
    return endsL === endsR && endsL !== 0 ? endsL.text() : this.join('text');
  }
  mathspeak() {
    let tempOp = '';
    let autoOps: CursorOptions['autoOperatorNames'] = {};
    if (this.controller) autoOps = this.controller.options.autoOperatorNames;
    return (
      this.foldChildren<string[]>([], function (speechArray, cmd) {
        if (cmd.isPartOfOperator) {
          tempOp += cmd.mathspeak();
        } else {
          if (tempOp !== '') {
            if (autoOps._maxLength! > 0) {
              let x = autoOps[tempOp.toLowerCase()];
              if (typeof x === 'string') tempOp = x;
            }
            speechArray.push(tempOp + ' ');
            tempOp = '';
          }
          let mathspeakText = cmd.mathspeak();
          let cmdText = cmd.ctrlSeq;
          if (
            isNaN(cmdText as any) && // TODO - revisit this to improve the isNumber() check
            cmdText !== '.' &&
            (!cmd.parent ||
              !cmd.parent.parent ||
              !cmd.parent.parent.isTextBlock())
          ) {
            mathspeakText = ' ' + mathspeakText + ' ';
          }
          speechArray.push(mathspeakText);
        }
        return speechArray;
      })
        .join('')
        .replace(/ +(?= )/g, '')
        // For Apple devices in particular, split out digits after a decimal point so they aren't read aloud as whole words.
        // Not doing so makes 123.456 potentially spoken as "one hundred twenty-three point four hundred fifty-six."
        // Instead, add spaces so it is spoken as "one hundred twenty-three point four five six."
        .replace(/(\.)([0-9]+)/g, function (_match, p1, p2) {
          return p1 + p2.split('').join(' ').trim();
        })
    );
  }

  ariaLabel = 'block';

  keystroke(key: string, e: KeyboardEvent, ctrlr: Controller) {
    if (
      ctrlr.options.spaceBehavesLikeTab &&
      (key === 'Spacebar' || key === 'Shift-Spacebar')
    ) {
      e.preventDefault();
      ctrlr.escapeDir(key === 'Shift-Spacebar' ? L : R, key, e);
      return;
    }
    return super.keystroke(key, e, ctrlr);
  }

  // editability methods: called by the cursor for editing, cursor movements,
  // and selection of the MathQuill tree, these all take in a direction and
  // the cursor
  moveOutOf(dir: Direction, cursor: Cursor, updown?: 'up' | 'down') {
    let updownInto: NodeRef | undefined;
    if (updown === 'up') {
      updownInto = this.parent.upInto;
    } else if (updown === 'down') {
      updownInto = this.parent.downInto;
    }

    if (!updownInto && this[dir]) {
      const otherDir = -dir as Direction;
      cursor.insAtDirEnd(otherDir, this[dir] as MQNode);
      cursor.controller.aria.queueDirEndOf(otherDir).queue(cursor.parent, true);
    } else {
      cursor.insDirOf(dir, this.parent);
      cursor.controller.aria.queueDirOf(dir).queue(this.parent);
    }
  }
  selectOutOf(dir: Direction, cursor: Cursor) {
    cursor.insDirOf(dir, this.parent);
  }
  deleteOutOf(_dir: Direction, cursor: Cursor) {
    cursor.unwrapGramp();
  }
  seek(clientX: number, cursor: Cursor) {
    let node = this.getEnd(R);
    if (!node) return cursor.insAtRightEnd(this);
    const el = node.domFrag().oneElement();
    const left = getBoundingClientRect(el).left;
    if (left + el.offsetWidth < clientX) {
      return cursor.insAtRightEnd(this);
    }

    let endsL = this.getEnd(L) as MQNode;
    if (clientX < getBoundingClientRect(endsL.domFrag().oneElement()).left)
      return cursor.insAtLeftEnd(this);
    while (clientX < getBoundingClientRect(node.domFrag().oneElement()).left)
      node = node[L] as MQNode;
    return node.seek(clientX, cursor);
  }
  chToCmd(ch: string, options: CursorOptions) {
    let cons;
    // exclude f because it gets a dedicated command with more spacing
    if (ch.match(/^[a-eg-zA-Z]$/)) return new Letter(ch);
    else if (/^\d$/.test(ch)) return new Digit(ch);
    else if (options && options.typingSlashWritesDivisionSymbol && ch === '/')
      return (LatexCmds as LatexCmdsSingleCharBuilder)['÷'](ch);
    else if (options && options.typingAsteriskWritesTimesSymbol && ch === '*')
      return (LatexCmds as LatexCmdsSingleCharBuilder)['×'](ch);
    else if (options && options.typingPercentWritesPercentOf && ch === '%')
      return (LatexCmds as LatexCmdsSingleCharBuilder).percentof(ch);
    else if (
      (cons = (CharCmds as CharCmdsAny)[ch] || (LatexCmds as LatexCmdsAny)[ch])
    ) {
      if (cons.constructor) {
        return new cons(ch);
      } else {
        return cons(ch);
      }
    } else return new VanillaSymbol(ch);
  }
  write(cursor: Cursor, ch: string) {
    let cmd = this.chToCmd(ch, cursor.options);
    if (cursor.selection) cmd.replaces(cursor.replaceSelection());
    if (!cursor.isTooDeep()) {
      cmd.createLeftOf(cursor.show());
      // special-case the slash so that fractions are voiced while typing
      if (ch === '/') {
        cursor.controller.aria.alert('over');
      } else {
        cursor.controller.aria.alert(cmd.mathspeak({ createdLeftOf: cursor }));
      }
    }
  }

  writeLatex(cursor: Cursor, latex: string) {
    let all = Parser.all;
    let eof = Parser.eof;

    let block = latexMathParser
      .skip(eof)
      .or(all.result<false>(false))
      .parse(latex);

    if (block && !block.isEmpty() && block.prepareInsertionAt(cursor)) {
      block
        .children()
        .adopt(cursor.parent, cursor[L] as NodeRef, cursor[R] as NodeRef); // TODO - masking undefined. should be 0
      domFrag(block.html()).insertBefore(cursor.domFrag());
      cursor[L] = block.getEnd(R);
      block.finalizeInsert(cursor.options, cursor);
      let blockEndsR = block.getEnd(R);
      let blockEndsL = block.getEnd(L);
      let blockEndsRR = (blockEndsR as MQNode)[R];
      let blockEndsLL = (blockEndsL as MQNode)[L];
      if (blockEndsRR) blockEndsRR.siblingCreated(cursor.options, L);
      if (blockEndsLL) blockEndsLL.siblingCreated(cursor.options, R);
      cursor.parent.bubble(function (node) {
        node.reflow();
        return undefined;
      });
    }
  }

  focus() {
    this.domFrag().addClass('mq-hasCursor');
    this.domFrag().removeClass('mq-empty');

    return this;
  }
  blur(cursor: Cursor) {
    this.domFrag().removeClass('mq-hasCursor');
    if (this.isEmpty()) {
      this.domFrag().addClass('mq-empty');
      if (
        cursor &&
        this.isQuietEmptyDelimiter(cursor.options.quietEmptyDelimiters)
      ) {
        this.domFrag().addClass('mq-quiet-delimiter');
      }
    }
    return this;
  }
}

Options.prototype.mouseEvents = true;
API.StaticMath = function (APIClasses: APIClasses) {
  return class StaticMath extends APIClasses.AbstractMathQuill {
    innerFields: InnerFields;
    static RootBlock = MathBlock;

    __mathquillify(opts: CursorOptions, _interfaceVersion: number) {
      this.config(opts);
      super.mathquillify('mq-math-mode');
      if (this.__options.mouseEvents) {
        this.__controller.removeMouseEventListener();
        this.__controller.staticMathTextareaEvents();
      }
      return this;
    }
    constructor(el: Controller) {
      super(el);
      let innerFields = (this.innerFields = []);
      this.__controller.root.postOrder(function (node: MQNode) {
        node.registerInnerField(innerFields, APIClasses.InnerMathField);
      });
    }
    latex() {
      let returned = super.latex.apply(this, arguments as unknown as [string]);
      if (arguments.length > 0) {
        let innerFields = (this.innerFields = []);
        this.__controller.root.postOrder(function (node: MQNode) {
          node.registerInnerField(innerFields, APIClasses.InnerMathField);
        });
        // Force an ARIA label update to remain in sync with the new LaTeX value.
        this.__controller.updateMathspeak();
      }
      return returned;
    }
    setAriaLabel(ariaLabel: string) {
      this.__controller.setAriaLabel(ariaLabel);
      return this;
    }
    getAriaLabel() {
      return this.__controller.getAriaLabel();
    }
  };
};

export class RootMathBlock extends MathBlock {}
RootBlockMixin(RootMathBlock.prototype); // adds methods to RootMathBlock

API.MathField = function (APIClasses: APIClasses) {
  return class MathField extends APIClasses.EditableField {
    static RootBlock = RootMathBlock;

    __mathquillify(opts: CursorOptions, interfaceVersion: number) {
      this.config(opts);
      if (interfaceVersion > 1) this.__controller.root.reflow = noop;
      super.mathquillify('mq-editable-field mq-math-mode');
      // TODO: Why does this need to be deleted (contrary to the type definition)? Could we set it to `noop` instead?
      delete (this.__controller.root as any).reflow;
      return this;
    }
  };
};

API.InnerMathField = function (APIClasses: APIClasses) {
  pray('MathField class is defined', APIClasses.MathField);
  return class extends APIClasses.MathField {
    makeStatic() {
      this.__controller.editable = false;
      this.__controller.root.blur();
      this.__controller.unbindEditablesEvents();
      domFrag(this.__controller.container).removeClass('mq-editable-field');
    }
    makeEditable() {
      this.__controller.editable = true;
      this.__controller.editablesTextareaEvents();
      this.__controller.cursor.insAtRightEnd(this.__controller.root);
      domFrag(this.__controller.container).addClass('mq-editable-field');
    }
  };
};
