// L = 'left'
// R = 'right'
//
// the contract is that they can be used as object properties
// and (-L) === R, and (-R) === L.
export type L = -1;
export type R = 1;
export const L: L = -1;
export const R: R = 1;
export type Direction = L | R;

if (!(window as any).jQuery)
  throw 'MathQuill requires jQuery 1.5.2+ to be loaded first';

export function noop() {}

/**
 * a development-only debug method.  This definition and all
 * calls to `pray` will be stripped from the minified
 * build of mathquill.
 *
 * This function must be called by name to be removed
 * at compile time.  Do not define another function
 * with the same name, and only call this function by
 * name.
 */
export function pray(message: string, cond?: any): asserts cond {
  if (!cond) throw new Error('prayer failed: ' + message);
}

export function prayDirection(dir: Direction) {
  pray('a direction was passed', dir === L || dir === R);
}
