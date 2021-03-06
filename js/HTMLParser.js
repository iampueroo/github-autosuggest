import { explodeByTokens, tokenizeToken, makeRegex } from './Tokenizer';
import Token from './Token';

/**
 * The minimum length in characters of a token to be considered
 * as a suggestion.
 * @type {Number}
 */
const MIN_LENGTH_OF_TOKEN = 3;

/**
 * Delimiter of a word
 */
const WORD_TOKENIZER = ' ';

/**
 * Delimeters of the code to split the text content of DOM elements by.
 * These characters will never show up in the suggested values.
 * @type {String[]}
 */
export const TOKENIZE_CHARACTERS = [
  '\\((?!\\))', // "(" but with negative lookahead for ")"
  '(?<!\\()\\)', // ")" but with negative lookbehind for "("
  ' ',
  '[',
  ']',
  '{',
  '}',
  '.',
  ',',
  '`',
  '\n',
  ';',
];

/**
 * Regex to split up values whose exploded strings should be considered
 * for suggesting.
 *
 * @type {RegExp}
 */
const SPLIT_REGEX = ['\\:\\:', '\\-\\>', '\\=\\>', '\\!', '\\.'];

/**
 * Utility function that returns a selector for all given classes.
 * No nesting.
 *
 * @param  {String[]} classes - array of class names to select
 * @return {String} joined selector for all given classes
 */
const toSelector = classes => classes.map(c => `.${c}`).join(',');

/**
 * Convert a string
 * @param  {String} s - string to tokenize
 * @return {String[]} - array of string tokens
 */
export function tokenize(s) {
  return explodeByTokens(s, TOKENIZE_CHARACTERS).filter(
    t => t.token.trim() !== ''
  );
}

/**
 * Splits a token into subtokens for additional elements to add to trie
 * @param  {String} s - token to split
 * @return {String[]} - array of string tokens
 */
export function subtokenizeFromString(string) {
  const token = new Token(string, string, 0, string.length);
  return subtokenize(token);
}

/**
 * Splits a token into subtokens for additional elements to add to trie
 * @param  {String} s - token to split
 * @return {String[]} - array of string tokens
 */
export function subtokenize(token) {
  const subtokens = tokenizeToken(token, SPLIT_REGEX);
  const regex = makeRegex(SPLIT_REGEX);
  if (subtokens.length === 1) {
    return [];
  }
  return subtokens.filter(t => !regex.test(t.token));
}

export function process(s) {
  const words = [];
  const tokens = tokenize(s);
  for (const token of tokens) {
    if (token.length < MIN_LENGTH_OF_TOKEN) {
      continue;
    }
    words.push(token.token);
    const split_words = subtokenize(token);
    if (split_words.length) {
      split_words.forEach(w => words.push(w.token.trim()));
    }
  }
  return words;
}

/**
 * [getWords description]
 * @param  {HTMLElement} node - Parent HTMLElement to search for content inside.
 * @param  {Object} configuration - Object with information of important classes
 * @return {String[]} array of words to suggest in the content of the given node
 */
export function getWords(node, configuration) {
  // First start with the best content, these are language constructs or functions
  let words = [];
  const pageWords = new window.Set(configuration.getWords(node));
  pageWords.forEach(word => {
    if (Boolean(word.trim())) {
      words = words.concat(process(word));
    }
  });
  return words;
}
