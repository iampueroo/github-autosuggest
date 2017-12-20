export function getFirstParent(el, selector) {
  if (!el.parentElement) {
    return false;
  } else if (el.parentElement.matches(selector)) {
    return el.parentElement;
  }
  return getFirstParent(el.parentElement, selector);
}

export function log(...args) {
  if (window.logmeplease) {
    console.log(...args);
  }
}

export function time() {
  return new Date().getTime();
}

export function totalOffset(element) {
  const offset = { top: 0, left: 0 };
  while (element) {
    offset.left += element.offsetLeft || 0;
    offset.top += element.offsetTop || 0;
    element = element.offsetParent;
  }
  return offset;
}

export function clean(s) {
  return s.replace(CLEAN_REGEX, ' ');
}

export function isCommentTextArea(el) {
  return el && el.classList.contains('comment-form-textarea');
}

export function getNextCharacter(textarea) {
  return textarea.value[textarea.selectionStart];
}
