import Trie from './Trie';
import getCaretCoordinates from './textarea-caret-position';
import * as Tooltip from './Tooltip';
import * as Utils from './Utils';
import * as Textarea from './Textarea';
import { getWords, tokenize, getBlobWords } from './HTMLParser';
import getConfiguration from './getConfiguration';

const pageConfiguration = getConfiguration(window.location.host);

let suggestedWord = '';
let justAdded = false;
let prevState = null; // { value, index }
let currentValue = '';

Utils.log('Executing');

/**
 * On "enter" handler for the focus'd textarea div. If there is currently
 * a suggested word, will inject the word to where the cursor is in the
 * textarea and then call suggest() to trigger another suggestion of a
 * longer word that starts with the injected word.
 *
 * @param  {Event} event
 * @param  {HTMLElement} textarea
 * @param  {Trie} trie
 * @return {null}
 */
const onEnter = (event, textarea, trie) => {
  if (!suggestedWord) {
    return;
  }
  if (Textarea.getCurrentToken(textarea).is(suggestedWord)) {
    return;
  }
  // We're taking over the event.
  event.preventDefault();
  event.stopImmediatePropagation();

  let word = suggestedWord;
  let closedOffset = 0; // for new index
  prevState = { value: textarea.value, index: textarea.selectionEnd };
  textarea.value = Textarea.replaceCurrentWord(textarea, word);
  textarea.selectionEnd =
    prevState.index +
    (textarea.value.length - prevState.value.length) -
    closedOffset;
  currentValue = event.target.value;
  Tooltip.remove();
  suggestedWord = '';
  justAdded = true;
  suggest(textarea, trie);
};

/**
 * Since we inject backticks after the cursor at times, we need to
 * do "ignore" the immeidately following "`" keydown.
 *
 * @param  {Event} event
 * @return {null}
 */
const onBackTick = event => {
  if (justAdded && Utils.getNextCharacter(event.target) === '`') {
    // We're taking over the event
    event.stopImmediatePropagation();
    event.preventDefault();
    event.target.selectionEnd = event.target.selectionEnd + 1;
    event.target.selectionStart = event.target.selectionEnd;
  }
};

const suggest = (textarea, trie) => {
  const currentToken = Textarea.getCurrentToken(textarea);
  if (currentToken.isEmpty || /^:|^#|^@/.test(currentToken.token)) {
    Tooltip.remove();
    return;
  }
  const currentWord = currentToken.token;
  let words = trie.find(currentWord);
  if (words[0] === currentWord) {
    words = words.slice(1);
  }
  if (words[0]) {
    suggestedWord = words[0];
    Tooltip.render(suggestedWord, textarea);
  } else {
    Tooltip.remove();
  }
  Utils.log(`Current word: ${currentWord} Found ${words.length} words`, words);
};

const onKeyUp = (textarea, trie) => {
  suggestedWord = '';
  if (!pageConfiguration.isCommentTextArea(textarea)) {
    Tooltip.remove();
    return;
  }
  suggest(textarea, trie);
};

const onUndo = event => {
  const textarea = event.target;
  if (textarea.value === currentValue && prevState.value) {
    const newPrevState = {
      value: textarea.value,
      index: textarea.selectionEnd,
    };
    textarea.value = prevState.value;
    textarea.selectionStart = prevState.index;
    textarea.selectionEnd = prevState.index;
    prevState = newPrevState;
    currentValue = textarea.value;
    event.preventDefault();
    event.stopImmediatePropagation();
  }
};

const onFocus = event => {
  const textarea = event.target;
  if (!pageConfiguration.isCommentTextArea(event.target)) {
    return;
  }
  if (textarea.__github_autosuggest_trie) {
    // We already have processed this
    return;
  }
  const start = Utils.time();
  const trie = new Trie();
  trie.addWords(getWords(window.document, pageConfiguration));
  const commented_line = pageConfiguration.getCommentLine(textarea);
  if (commented_line) {
    const special_words = getWords(commented_line, pageConfiguration);
    Utils.log(`Found ${special_words.length} tokens from commented line`);
    trie.markSpecial(special_words);
  } else {
    Utils.warn('No commented line found');
  }

  Utils.log(`Trie built ${Utils.time() - start}ms (${trie.size} words)`);

  textarea.addEventListener('keydown', e => {
    if (e.keyCode === 13 || e.keyCode === 9) {
      // enter or tab
      onEnter(e, e.target, trie);
      // We need to stop this here and not count
      // it as a regular keydown
      return;
    }
    if (e.keyCode === 192) {
      onBackTick(e);
    } else if (e.keyCode == 90 && e.metaKey) {
      onUndo(e);
    }
    justAdded = false;
  });
  textarea.addEventListener('keyup', event => onKeyUp(event.target, trie));
  textarea.addEventListener('click', event => onKeyUp(event.target, trie));
  textarea.addEventListener('scroll', Tooltip.remove);
  Tooltip.onClick(event => onEnter(event, textarea, trie));
  textarea.__github_autosuggest_trie = true;
};

const onFocusOut = event => {
  if (!pageConfiguration.isCommentTextArea(event.target)) {
    return;
  }
  Tooltip.remove();
};

document.addEventListener('focusin', onFocus);
document.addEventListener('focusout', onFocusOut);
