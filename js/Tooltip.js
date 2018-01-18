import getCaretCoordinates from './textarea-caret-position';
import { totalOffset } from './Utils';
import { tokenize } from './GithubHTMLParser';
import { getCurrentWord } from './Textarea';


const CLASSNAME = 'ignacio';
const CLASSNAME_LABEL = `${CLASSNAME}-label`;
const HIDDEN_CLASSNAME = 'ignacio-hidden';
let el;
let span;
let clickHandler;

const get = () => {
  if (!el) {
    const container = document.createElement('div');
    const text_span = document.createElement('span');
    container.classList.add(CLASSNAME);
    text_span.classList.add(CLASSNAME_LABEL);
    container.appendChild(text_span);
    document.body.appendChild(container);
    el = container;
    el.addEventListener('mousedown', function(...args) {
      if (clickHandler) clickHandler(...args);
    });
  }
  return el;
};

const getSpan = () => {
  if (!span) {
    span = get().querySelector(`.${CLASSNAME_LABEL}`);
  }
  return span;
};

export const hide = () => {
  get().classList.add(HIDDEN_CLASSNAME);
};

export const unhide = () => {
  get().classList.remove(HIDDEN_CLASSNAME);
};

const getIndexOfStartOfWord = textarea => {
  return textarea.selectionEnd - getCurrentWord(textarea).length;
};

export const render = (word, textarea) => {
  const textareaOffset = totalOffset(textarea);
  const caretOffset = getCaretCoordinates(textarea, getIndexOfStartOfWord(textarea));
  const tooltip = get();
  hide();
  getSpan().innerText = word;
  const tooltipWidth = tooltip.getBoundingClientRect().width;
  // 4 is so it lines up with the text
  let left = textareaOffset.left + caretOffset.left - 4;
  tooltip.style.left = `${Math.max(left, 0)}px`;
  tooltip.style.top = `${textareaOffset.top + caretOffset.top - 31}px`;
  unhide();
};

export const onClick = handler => {
  clickHandler = handler;
};

export const remove = () => {
  if (el) {
    el.remove();
    el = null;
    span = null;
  }
};
