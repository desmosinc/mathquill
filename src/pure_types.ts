export type HandlerOptions = any;

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