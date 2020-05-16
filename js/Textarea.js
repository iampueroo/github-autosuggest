import { tokenize, TOKENIZE_CHARACTERS } from './HTMLParser';
import { explodeByTokens } from './Tokenizer';
import Token from './Token';

export const getCurrentToken = textarea => {
  const startIndex = textarea.selectionStart;
  return getTokenFromStringByIndex(textarea.value, startIndex);
};

export const getTokenFromStringByIndex = (s, index) => {
  let charIndex = 0;
  let tokens = explodeByTokens(s, [' ']);
  for (const token of tokens) {
    const indexAfterToken = charIndex + token.length; // Index after token
    if (index >= charIndex && index < indexAfterToken) {
      return token;
    }
    if (index === indexAfterToken && !token.is(' ')) {
      // If index is at the end of the word, still use the word
      // unless it's an empty space
      return token;
    }
    charIndex += token.length;
  }
  // Return empty token at end of string index
  return new Token('', s, s.length, s.length);
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
