import type { AutoDict, HandlerOptions } from "./shared_types";
import type { Controller } from "./services/textarea";

export type SubstituteKeyboardEvents = (
    el: JQuery,
    controller: Controller
  ) => {
    select: (text: string) => void;
  };
  

export class Options {
    constructor(public version: 1 | 2) {}
    ignoreNextMousedown: (_el: JQuery.Event) => boolean;
    substituteTextarea: () => HTMLElement;
    /** Only used in interface version 1. */
    substituteKeyboardEvents: SubstituteKeyboardEvents;
  
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