import { MQNode } from "./services/keystroke"
import { Options, AutoDict } from "./publicapi"
import { TempSingleCharNode } from "./services/latex"
import { saneKeyboardEvents } from "./services/saneKeyboardEvents.util"
import { Cursor } from "./cursor"
import { Controller } from "./services/textarea"
import { L, R } from "./utils"
import { LatexFragment } from "./commands/math/basicSymbols"

export type NodeRef = MQNode | 0;
export type ControllerEvent =
  | 'move'
  | 'upDown'
  | 'replace'
  | 'edit'
  | 'select'
  | undefined;
export type JoinMethod = 'mathspeak' | 'latex' | 'text';

export type CursorOptions = Options;

export type ConfigOptions = ConfigOptionsV1 | ConfigOptionsV2;

export interface ConfigOptionsV1 {
  ignoreNextMousedown: (_el: MouseEvent) => boolean;
  substituteTextarea: () => HTMLElement;
  substituteKeyboardEvents: typeof saneKeyboardEvents;

  restrictMismatchedBrackets?: boolean;
  typingSlashCreatesNewFraction?: boolean;
  charsThatBreakOutOfSupSub: string;
  sumStartsWithNEquals?: boolean;
  autoSubscriptNumerals?: boolean;
  supSubsRequireOperand?: boolean;
  spaceBehavesLikeTab?: boolean;
  typingAsteriskWritesTimesSymbol?: boolean;
  typingSlashWritesDivisionSymbol: boolean;
  typingPercentWritesPercentOf?: boolean;
  resetCursorOnBlur?: boolean | undefined;
  leftRightIntoCmdGoes?: 'up' | 'down';
  enableDigitGrouping?: boolean;
  mouseEvents?: boolean;
  maxDepth?: number;
  disableCopyPaste?: boolean;
  statelessClipboard?: boolean;
  onPaste?: () => void;
  onCut?: () => void;
  overrideTypedText?: (text: string) => void;
  overrideKeystroke: (key: string, event: KeyboardEvent) => void;
  autoOperatorNames: AutoDict;
  autoCommands: AutoDict;
  autoParenthesizedFunctions: AutoDict;
  quietEmptyDelimiters: { [id: string]: any };
  disableAutoSubstitutionInSubscripts?: boolean;
  handlers: HandlerOptions;
}

export interface ConfigOptionsV2 {
  ignoreNextMousedown: (_el: MouseEvent) => boolean;
  substituteTextarea: () => HTMLElement;

  restrictMismatchedBrackets?: boolean;
  typingSlashCreatesNewFraction?: boolean;
  charsThatBreakOutOfSupSub: string;
  sumStartsWithNEquals?: boolean;
  autoSubscriptNumerals?: boolean;
  supSubsRequireOperand?: boolean;
  spaceBehavesLikeTab?: boolean;
  typingAsteriskWritesTimesSymbol?: boolean;
  typingSlashWritesDivisionSymbol: boolean;
  typingPercentWritesPercentOf?: boolean;
  resetCursorOnBlur?: boolean | undefined;
  leftRightIntoCmdGoes?: 'up' | 'down';
  enableDigitGrouping?: boolean;
  mouseEvents?: boolean;
  maxDepth?: number;
  disableCopyPaste?: boolean;
  statelessClipboard?: boolean;
  onPaste?: () => void;
  onCut?: () => void;
  overrideTypedText?: (text: string) => void;
  overrideKeystroke: (key: string, event: KeyboardEvent) => void;
  autoOperatorNames: AutoDict;
  autoCommands: AutoDict;
  autoParenthesizedFunctions: AutoDict;
  quietEmptyDelimiters: { [id: string]: any };
  disableAutoSubstitutionInSubscripts?: boolean;
  handlers: HandlerOptions;
}

export type MathspeakOptions = {
  createdLeftOf?: Cursor;
  ignoreShorthand?: boolean;
};
export type EmbedOptions = {
  latex?: () => string;
  text?: () => string;
  htmlString?: string;
};

export type InequalityData = {
  ctrlSeq: string;
  ctrlSeqStrict: string;
  htmlEntity: string;
  htmlEntityStrict: string;
  text: string;
  textStrict: string;
  mathspeak: string;
  mathspeakStrict: string;
};

export type HandlerOptions = any;
export type ControllerData = any;
export type ControllerRoot = MQNode & {
  controller: Controller;
  cursor?: Cursor;
  latex: () => string;
};
export type HandlerName = any;
export type JQ_KeyboardEvent = KeyboardEvent & {
  originalEvent?: KeyboardEvent;
};
export type RootBlockMixinInput = any;
export type BracketSide = L | R | 0;

export type InnerMathField = any;
export type InnerFields = any;
export type EmbedOptionsData = any;
export type MQ = any;
export type LatexCmdsAny = any;
export type CharCmdsAny = any;
export type LatexCmdsSingleCharBuilder = Record<string, (char: string) => MQNode>;
export type LatexCmdsSingleChar = Record<
  string,
  undefined | typeof TempSingleCharNode | ((char: string) => TempSingleCharNode)
>;

export type LatexFragmentBuilderNoParam = () => LatexFragment;
export type MQNodeBuilderNoParam = () => MQNode;
export type MQNodeBuilderOneParam = (string: string) => MQNode;

export type LatexCmd =
  | typeof MQNode
  | MQNodeBuilderNoParam
  | MQNodeBuilderOneParam
  | LatexFragmentBuilderNoParam;
export type LatexCmdsType = Record<string, LatexCmd>;
export type CharCmdsType = Record<string, LatexCmd>;

export type JQSelector =
  | $
  | HTMLElement
  | null
  | Window
  | NodeListOf<ChildNode>
  | HTMLElement[]
  | EventTarget;

export interface $ {
  (selector?: JQSelector): $;
  select(): $;
  val(val: string): $;
  html(t: string): $;
  text(str: string): $;
  closest(selector: JQSelector): $;
  length: number;
  [index: number]: HTMLElement; // TODO - this can be undefined. Either fix uses or wait until removing jquery
}
