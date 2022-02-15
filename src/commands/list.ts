import { LatexCmdsType, CharCmdsType } from "src/shared_types";

/**
 * Registry of LaTeX commands and commands created when typing
 * a single character.
 *
 * (Commands are all subclasses of Node.)
 */
export let LatexCmds: LatexCmdsType = {};
export let CharCmds: CharCmdsType = {};