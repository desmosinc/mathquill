/*************************************************
 * Base classes of edit tree-related objects
 *
 * Only doing tree node manipulation via these
 * adopt/ disown methods guarantees well-formedness
 * of the tree.
 ************************************************/

import { L, R } from "./utils"
import { MQNode } from "./services/keystroke"
import { NodeRef } from "./shared_types"


/** A cursor-like location in an mq node tree. */
export class Point {
  /** The node to the left of this point (or 0 for the position before a first child) */
  [L]: NodeRef;
  /** The node to the right of this point (or 0 for the position after a last child) */
  [R]: NodeRef;
  parent: MQNode;

  constructor(parent: MQNode, leftward: NodeRef, rightward: NodeRef) {
    this.init(parent, leftward, rightward);
  }

  // keeping init around only for tests
  init(parent: MQNode, leftward: NodeRef, rightward: NodeRef) {
    this.parent = parent;
    this[L] = leftward;
    this[R] = rightward;
  }

  static copy(pt: Point) {
    return new Point(pt.parent, pt[L], pt[R]);
  }
}

/**
 * MathQuill virtual-DOM tree-node abstract base class
 */
export const defaultJQ = $();

export function isMQNodeClass(cmd: any): cmd is typeof MQNode {
  return cmd && cmd.prototype instanceof MQNode;
}
