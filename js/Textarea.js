import { tokenize, TOKENIZE_CHARACTERS } from './HTMLParser';
import { explodeByTokens, tokenizeToken, makeRegex } from './Tokenizer';
import Token from './Token';

export const getCurrentToken = textarea => {
  const startIndex = textarea.selectionStart;
  const token = getTokenFromStringByIndex(textarea.value, startIndex);
  if (token.isEmpty) {
    // Nothing to do.
    return token;
  }
  if (!token.isIndexAtEnd(startIndex)) {
    // Return "empty" token if selection index is not
    // at the end of the word
    return new Token('', textarea.value, startIndex, startIndex);
  }
  return cleanToken(textarea, token);
};

const cleanToken = (textarea, token) => {
  const humanFriendlyTokens = tokenizeToken(token, TOKENIZE_CHARACTERS);
  if (humanFriendlyTokens.length === 0) {
    return new Token(
      '',
      textarea.value,
      textarea.selectionStart,
      textarea.selectionStart
    );
  }
  if (humanFriendlyTokens.length === 1) {
    return token;
  }
  const lastToken = humanFriendlyTokens[humanFriendlyTokens.length - 1];
  if (makeRegex(TOKENIZE_CHARACTERS).test(lastToken.token)) {
    return new Token(
      '',
      textarea.value,
      textarea.selectionStart,
      textarea.selectionStart
    );
  }
  return lastToken;
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
  let tokens = tokenize(textarea.value);
  for (const token of tokens) {
    if (
      startIndex >= token.startIndex &&
      startIndex <= token.startIndex + token.length
    ) {
      let splitValue = textarea.value.split('');
      splitValue.splice(token.startIndex, token.length, ...replace.split(''));
      return splitValue.join('');
    }
  }
  throw new Error('Unexpected state when replacing textarea value');
};

export const isInOpenBacktick = textarea => {
  return textarea.value.split(/`/g).length % 2 === 0;
};
