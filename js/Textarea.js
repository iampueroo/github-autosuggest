import { tokenize } from './GithubHTMLParser';

export const getCurrentWord = textarea => {
  const startIndex = textarea.selectionStart;
  let charIndex = 0;
  for (const word of tokenize(textarea.value)) {
    if (startIndex >= charIndex && startIndex <= charIndex + word.length) {
      return word;
    }
    charIndex += word.length + 1; // 1 due to the space
  }
  throw new Error('shit');
};

export const replaceCurrentWord = (textarea, replace) => {
  const startIndex = textarea.selectionStart;
  let charIndex = 0;
  let currentValue = tokenize(textarea.value);
  for (const word of currentValue) {
    if (startIndex >= charIndex && startIndex <= charIndex + word.length) {
      let splitValue = textarea.value.split('');
      splitValue.splice(charIndex, word.length, ...replace.split(''));
      return splitValue.join('');
    }
    charIndex += word.length + 1; // 1 due to the space
  }
  console.error('textarea', textarea.value);
  console.error('replace', replace);
  throw new Error('oops');
};

export const isInOpenBacktick = textarea => {
  return textarea.value.split(/`/g).length % 2 === 0;
};

export const needsClosingBacktick = textarea => {
  const string_after_cursor = textarea.value.slice(textarea.selectionStart);
  return string_after_cursor.indexOf('`') < 0 && isInOpenBacktick(textarea);
};

export const needsBothBackticks = textarea => {
  const value = textarea.value;
  if (value.indexOf('`') < 0) {
    return true;
  }
  const index = textarea.selectionStart;
  return (
    value.slice(index).split(/`/g).length % 2 === 1 &&
    value.slice(0, index).split(/`/g).length % 2 === 1
  );
};