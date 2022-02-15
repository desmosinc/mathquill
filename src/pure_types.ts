/**
 * All types that derive from nothing or other pure modules.
 */

import { L, R } from "./utils";

export type BracketSide = L | R | 0;

export type HandlerOptions = any;

export type KIND_OF_MQ = 'StaticMath' | 'MathField' | 'InnerMathField' | 'TextField';

export type ControllerEvent =
  | 'move'
  | 'upDown'
  | 'replace'
  | 'edit'
  | 'select'
  | undefined;

export type JoinMethod = 'mathspeak' | 'latex' | 'text';

export type AutoDict = {
    _maxLength?: number;
    [id: string]: any;
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

export type InnerMathField = any;
export type InnerFields = any;
export type EmbedOptionsData = any;
export type MQ = any;
export type LatexCmdsAny = any;
export type CharCmdsAny = any;

export type HandlerName = any;
export type JQ_KeyboardEvent = KeyboardEvent & {
  originalEvent?: KeyboardEvent;
};
export type RootBlockMixinInput = any;
export type ControllerData = any;

export type JQSelector =
  | JQuery
  | HTMLElement
  | null
  | Window
  | NodeListOf<ChildNode>
  | HTMLElement[]
  | EventTarget;