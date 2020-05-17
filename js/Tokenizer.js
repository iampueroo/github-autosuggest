import Token from './Token';

export const explodeByTokens = (s, delimiters) => {
  const token = new Token(s, s, 0, s.length);
  return tokenizeToken(token, delimiters);
};

export const tokenizeToken = (token, delimiters) => {
  const regex = makeRegex(delimiters);
  const tokens = token.token.split(regex).filter(t => t !== '');
  let index = token.startIndex;
  return tokens.map(token => {
    const newToken = new Token(
      token,
      token.fullString,
      index,
      index + token.length
    );
    index += token.length;
    return newToken;
  });
};

export const makeRegex = delimiters => {
  const tokenRegex = delimiters
    .map(t => {
      return t.length > 1 ? t : `\\${t}`;
    })
    .join('|');
  return new RegExp(`(${tokenRegex})`, 'g');
};
