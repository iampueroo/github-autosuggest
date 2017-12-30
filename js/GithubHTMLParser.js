const MIN_LENGTH_OF_TOKEN = 5; //
const BEST = ['pl-smi', 'pl-c1', 'pl-k', 'pl-en'];
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
];
const SPLIT_REGEX = /::|->|=>|\!/g;

const toSelector = classes => classes.map(c => `.${c}`).join(',');

export function tokenize(s) {
  const replaceString = '()';
  const replaceWith = '$IGNACIO$';
  const replaced = s.replace(replaceString, replaceWith);
  const regex = new RegExp(
    TOKENIZE_CHARACTERS.map(c => `\\${c}`).join('|'),
    'g'
  );
  return s
    .replace(regex, ' ')
    .replace(replaceWith, replaceString)
    .split(' ');
}

export function getWords(node) {
  // First start with the best content, these are language constructs or functions
  const words = Array.from(node.querySelectorAll(toSelector(BEST))).map(
    e => e.textContent
  );

  const lines = Array.from(node.querySelectorAll('.pl-s1')).forEach(e => {
    let content = e.textContent;
    for (let i = 0; i < e.children.length; i++) {
      // Remove textContent from comments, as they're not helpful
      if (e.children[i].classList.contains('pl-c')) {
        content = content.replace(e.children[i].textContent, '');
      }
    }
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
