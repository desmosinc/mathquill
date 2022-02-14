/***********************************************
 * Horizontal panning for editable fields that
 * overflow their width
 **********************************************/

import { getBoundingClientRect } from "../browser"
import { L, R } from "../utils"
import { Controller_mouse } from "./mouse";

export class Controller_scrollHoriz extends Controller_mouse {
  private cancelScrollHoriz: (() => void) | undefined;
  setOverflowClasses() {
    let root = this.root.domFrag().oneElement();
    let shouldHaveOverflowRight = false;
    let shouldHaveOverflowLeft = false;
    if (!this.blurred) {
      let width = getBoundingClientRect(root).width;
      let scrollWidth = root.scrollWidth;
      let scroll = root.scrollLeft;
      shouldHaveOverflowRight = scrollWidth > width + scroll;
      shouldHaveOverflowLeft = scroll > 0;
    }
    if (
      root.classList.contains('mq-editing-overflow-right') !==
      shouldHaveOverflowRight
    )
      root.classList.toggle('mq-editing-overflow-right');
    if (
      root.classList.contains('mq-editing-overflow-left') !==
      shouldHaveOverflowLeft
    )
      root.classList.toggle('mq-editing-overflow-left');
  }
  scrollHoriz() {
    let cursor = this.cursor,
      seln = cursor.selection;
    let scrollBy: number;
    let rootRect = getBoundingClientRect(this.root.domFrag().oneElement());
    if (cursor.domFrag().isEmpty() && !seln) {
      if (this.cancelScrollHoriz) {
        this.cancelScrollHoriz();
        this.cancelScrollHoriz = undefined;
      }

      const rootElt = this.root.domFrag().oneElement();
      const start = rootElt.scrollLeft;
      animate(100, (progress, scheduleNext, cancel) => {
        if (progress >= 1) {
          this.cancelScrollHoriz = undefined;
          rootElt.scrollLeft = 0;
          this.setOverflowClasses();
        } else {
          this.cancelScrollHoriz = cancel;
          scheduleNext();
          rootElt.scrollLeft = Math.round((1 - progress) * start);
        }
      });

      return;
    } else if (!seln) {
      let x = getBoundingClientRect(cursor.domFrag().oneElement()).left;
      if (x > rootRect.right - 20) scrollBy = x - (rootRect.right - 20);
      else if (x < rootRect.left + 20) scrollBy = x - (rootRect.left + 20);
      else return;
    } else {
      let rect = getBoundingClientRect(seln.domFrag().oneElement());
      let overLeft = rect.left - (rootRect.left + 20);
      let overRight = rect.right - (rootRect.right - 20);
      if (seln.getEnd(L) === cursor[R]) {
        if (overLeft < 0) scrollBy = overLeft;
        else if (overRight > 0) {
          if (rect.left - overRight < rootRect.left + 20)
            scrollBy = overLeft;
          else scrollBy = overRight;
        } else return;
      } else {
        if (overRight > 0) scrollBy = overRight;
        else if (overLeft < 0) {
          if (rect.right - overLeft > rootRect.right - 20)
            scrollBy = overRight;
          else scrollBy = overLeft;
        } else return;
      }
    }

    let root = this.root.domFrag().oneElement();
    if (scrollBy < 0 && root.scrollLeft === 0) return;
    if (scrollBy > 0 && root.scrollWidth <= root.scrollLeft + rootRect.width)
      return;

    if (this.cancelScrollHoriz) {
      this.cancelScrollHoriz();
      this.cancelScrollHoriz = undefined;
    }

    const rootElt = this.root.domFrag().oneElement();
    const start = rootElt.scrollLeft;
    animate(100, (progress, scheduleNext, cancel) => {
      if (progress >= 1) {
        this.cancelScrollHoriz = undefined;
        rootElt.scrollLeft = Math.round(start + scrollBy);
        this.setOverflowClasses();
      } else {
        this.cancelScrollHoriz = cancel;
        scheduleNext();
        rootElt.scrollLeft = Math.round(start + progress * scrollBy);
      }
    });
  }
}
