/**
 * The minimum length in characters of a token to be considered
 * as a suggestion.
 * @type {Number}
 */
const MIN_LENGTH_OF_TOKEN = 5;

/**
 * Delimeters of the code to split the text content of DOM elements by.
 * These characters will never show up in the suggested values.
 * @type {String[]}
 */
const TOKENIZE_CHARACTERS = [
  '(',
  ')',
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
const SPLIT_REGEX = /::|->|=>|\!/g;

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
  const replaceString = '()';
  const replaceWith = '$IGNACIO$';
  const replaced = s.replace(replaceString, replaceWith);
  const regex = new RegExp(
    TOKENIZE_CHARACTERS.map(c => `\\${c}`).join('|'),
    'g'
  );
  return replaced
    .replace(regex, ' ')
    .replace(replaceWith, replaceString)
    .split(' ');
}

/**
 * [getWords description]
 * @param  {HTMLElement} node - Parent HTMLElement to search for content inside.
 * @param  {Object} configuration - Object with information of important classes
 * @return {String[]} array of words to suggest in the content of the given node
 */
export function getWords(node, configuration) {
  // First start with the best content, these are language constructs or functions
  const best_classes = configuration.BEST_CLASSES;
  let words = Array.from(node.querySelectorAll(toSelector(best_classes))).map(
    e => e.textContent
  );
  // Second best content, but we need to remove comments it
  const pl_s1_content = Array.from(node.querySelectorAll('.pl-s1')).map(el => {
    let content = el.textContent;
    for (let i = 0; i < el.children.length; i++) {
      // Remove textContent from comments, as they're not helpful
      if (el.children[i].classList.contains('pl-c')) {
        content = content.replace(el.children[i].textContent, '');
      }
    }
    return content;
  });
  // .blob-code-inner sometimes contains words we want to add to the trie,
  // but they're text nodes. Here we look for text nodes of .blob-code-inner
  // to add to the trie. We need .blob-code-hunk to filter away the .blob-code-inners
  // that aren't actual code (but compressed code)
  const blob_content = Array.from(
    node.querySelectorAll('.blob-code-inner:not(.blob-code-hunk)')
  ).map(el => {
    let content = el.textContent;
    for (let i = 0; i < el.childNodes.length; i++) {
      // Remove non-text node content as they've already been added to the trie
      if (el.childNodes[i].nodeType !== el.TEXT_NODE) {
        content = content.replace(el.childNodes[i].textContent, '');
      }
    }
    return content;
  });

  pl_s1_content.concat(blob_content).forEach(content => {
    const tokens = tokenize(content).map(t => t.trim());
    for (const token of tokens) {
      if (token.length < MIN_LENGTH_OF_TOKEN) {
        continue;
      }
      words.push(token);
      const split_words = token.split(SPLIT_REGEX);
      if (split_words.length > 1) {
        split_words.forEach(w => words.push(w.trim()));
      }
    }
  });
  return words;
}
