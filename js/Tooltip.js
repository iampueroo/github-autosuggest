import getCaretCoordinates from './textarea-caret-position';
import { totalOffset } from './Utils';

const CLASSNAME = 'ignacio';
const HIDDEN_CLASSNAME = 'ignacio-hidden';
let el;

const get = () => {
  if (!el) {
    const div = document.createElement('div');
    div.classList.add(CLASSNAME);
    div.style.position = 'absolute';
    document.body.appendChild(div);
    el = div;
  }
  return el;
};

export const hide = () => {
  get().classList.add(HIDDEN_CLASSNAME);
};

export const unhide = () => {
  get().classList.remove(HIDDEN_CLASSNAME);
};

export const render = (word, textarea) => {
  const textareaOffset = totalOffset(textarea);
  const caretOffset = getCaretCoordinates(textarea, textarea.selectionEnd);
  const tooltip = get();
  hide();
  tooltip.innerText = word;
  const widthOffset = -1 * tooltip.getBoundingClientRect().width / 2;
  const left = textareaOffset.left + caretOffset.left + widthOffset;
  tooltip.style.left = `${Math.max(left, 0)}px`;
  tooltip.style.top = `${textareaOffset.top + caretOffset.top - 31}px`;
  unhide();
};

export const remove = () => {
  if (el) {
    el.remove();
    el = null;
  }
};
