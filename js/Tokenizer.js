import Token from './Token';

export const explodeByTokens = (s, delimiters) => {
  const regex = makeRegex(delimiters);
  const tokens = s.split(regex).filter(t => t !== '');
  let index = 0;
  return tokens.map(token => {
    const newToken = new Token(token, s, index, index + token.length);
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
