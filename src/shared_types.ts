import { MQNode } from "./services/keystroke"
import { TempSingleCharNode } from "./services/latex"
import { saneKeyboardEvents } from "./services/saneKeyboardEvents.util"
import { Cursor } from "./cursor"
import { Controller } from "./services/textarea"
import { LatexFragment } from "./commands/math/basicSymbols"
import { Options } from "./options"
import { AutoDict, HandlerOptions } from "./pure_types"

export type NodeRef = MQNode | 0;

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

export type ControllerRoot = MQNode & {
  controller: Controller;
  cursor?: Cursor;
  latex: () => string;
};

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