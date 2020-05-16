import Token from './Token';

export const explodeByTokens = (s, delimiters) => {
  const tokenRegex = delimiters.map(t => `\\${t}`).join('|');
  const regex = new RegExp(`(${tokenRegex})`, 'g');
  const tokens = s.split(regex).filter(t => t !== '');
  let index = 0;
  return tokens.map(token => {
    const newToken = new Token(token, s, index, index + token.length);
    index += token.length;
    return newToken;
  });
};
