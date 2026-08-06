/**
 * On webkit, we're seeing a bug where 1000 inline-block elements inside an inline-block parent
 * would be spaced well, but the parent gets sized incorrectly by a few dozen pixels. This
 * is likely due to some error in sub-pixel accumulation. True if that problem is detected.
 *
 * Computed only once.
 */
const HAS_SPACING_BUG = hasSpacingBug();

const SPACING_BUG_CLASS_APPEND = HAS_SPACING_BUG ? ' mq-has-spacing-bug' : '';

function hasSpacingBug() {
  const parent = document.createElement('span');
  parent.style.display = 'inline-block';
  for (let i = 0; i < 9; i++) {
    makeChild(parent);
  }
  const lastChild = makeChild(parent);
  document.body.appendChild(parent);
  const diff =
    parent.getBoundingClientRect().right -
    lastChild.getBoundingClientRect().right;
  parent.remove();
  // `diff` is 0 for most browsers, and 0.15625 when I test on Safari.
  return diff > 0.05;
}

function makeChild(parent: HTMLElement) {
  const child = document.createElement('span');
  child.style.display = 'inline-block';
  child.innerText = '0';
  // The exact margin doesn't really matter as long as it's not a multiple of 0.5px.
  child.style.marginLeft = '0.7px';
  parent.appendChild(child);
  return child;
}
