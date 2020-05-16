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

export function warn(...args) {
  if (window.logmeplease) {
    console.warn(...args);
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

export function getNextCharacter(textarea) {
  return textarea.value[textarea.selectionStart];
}

/**
 * Utility function that returns a selector for all given classes.
 * No nesting.
 *
 * @param  {String[]} classes - array of class names to select
 * @return {String} joined selector for all given classes
 */
export function toSelector(classes) {
  return classes.map(c => `.${c}`).join(',');
}
