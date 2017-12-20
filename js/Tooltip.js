import getCaretCoordinates from './textarea-caret-position';
import { totalOffset } from './Utils';

const CLASSNAME = 'ignacio';
const CLASSNAME_LABEL = `${CLASSNAME}-label`;
const CLASSNAME_ARROW = `${CLASSNAME}-arrow`;
const HIDDEN_CLASSNAME = 'ignacio-hidden';
const ARROW_CSS_LEFT_PERCENT = 50;
let el;
let span;
let arrow;

const get = () => {
  if (!el) {
    const container = document.createElement('div');
    const text_span = document.createElement('span');
    const arrow_span = document.createElement('span');
    container.classList.add(CLASSNAME);
    text_span.classList.add(CLASSNAME_LABEL);
    arrow_span.classList.add(CLASSNAME_ARROW);
    container.appendChild(text_span);
    container.appendChild(arrow_span);
    document.body.appendChild(container);
    el = container;
  }
  return el;
};

const getSpan = () => {
  if (!span) {
    span = get().querySelector(`.${CLASSNAME_LABEL}`);
  }
  return span;
}


const getArrow = () => {
  if (!arrow) {
    arrow = get().querySelector(`.${CLASSNAME_ARROW}`);
  }
  return arrow;
}

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
  getSpan().innerText = word;
  const tooltipWidth = tooltip.getBoundingClientRect().width;
  const widthOffset = -1 * tooltipWidth / 2;
  let left = textareaOffset.left + caretOffset.left + widthOffset + 1;
  tooltip.style.left = `${Math.max(left, 0)}px`;
  tooltip.style.top = `${textareaOffset.top + caretOffset.top - 31}px`;
  if (left < 0) {
    const arrowOffset = Math.round(Math.abs(left) / tooltipWidth * 100);
    getArrow().style.left = `${ARROW_CSS_LEFT_PERCENT - arrowOffset}%`;
  }
  unhide();
};

export const remove = () => {
  if (el) {
    el.remove();
    el = null;
    span = null;
    arrow = null;
  }
};
