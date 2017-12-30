import Trie from './Trie';
import getCaretCoordinates from './textarea-caret-position';
import * as Tooltip from './Tooltip';
import * as Utils from './Utils';
import { getWords, tokenize } from './GithubHTMLParser';

const getCurrentWord = textarea => {
  const startIndex = textarea.selectionStart;
  let charIndex = 0;
  for (const word of textarea.value.split(/\s/)) {
    if (startIndex >= charIndex && startIndex <= charIndex + word.length) {
      let currentWord = tokenize(word).filter(w => w !== '');
      return currentWord[currentWord.length - 1];
    }
    charIndex += word.length + 1; // 1 due to the space
  }
  throw new Error('shit');
};

const replaceCurrentWord = (textarea, replace) => {
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

const isInOpenBacktick = textarea => {
  return textarea.value.split(/`/g).length % 2 === 0;
};

const needsClosingBacktick = textarea => {
  const string_after_cursor = textarea.value.slice(textarea.selectionStart);
  return string_after_cursor.indexOf('`') < 0 && isInOpenBacktick(textarea);
};

const needsBothBackticks = textarea => {
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

let suggestedWord = '';
let justAdded = false;
let prevState = null; // { value, index }
let currentValue = '';

const onEnter = (event, trie) => {
  if (event.keyCode !== 13 || !suggestedWord) {
    return;
  }
  const textarea = event.target;
  if (suggestedWord === getCurrentWord(textarea)) {
    return;
  }
  // We're taking over the event.
  event.preventDefault();
  event.stopImmediatePropagation();
  let word = suggestedWord;
  if (needsClosingBacktick(textarea)) {
    word += '`';
  } else if (needsBothBackticks(textarea)) {
    word = '`' + word + '`';
  }
  prevState = { value: textarea.value, index: textarea.selectionEnd };
  textarea.value = replaceCurrentWord(textarea, word);
  textarea.selectionEnd = textarea.selectionEnd - 1;
  currentValue = event.target.value;
  Tooltip.hide();
  suggestedWord = '';
  justAdded = true;
  suggest(textarea, trie);
};

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
  const currentWord = getCurrentWord(textarea);

  if (!currentWord) {
    Tooltip.hide();
    return;
  }

  let words = trie.find(currentWord);
  if (words[0] === currentWord) {
    words = words.slice(1);
  }
  if (words[0]) {
    suggestedWord = words[0];
    Tooltip.render(suggestedWord, textarea);
  } else {
    Tooltip.hide();
  }
  Utils.log(`Current word: ${currentWord} Found ${words.length} words`, words);
};

const onKeyUp = (textarea, trie) => {
  suggestedWord = '';
  if (!textarea || !textarea.classList.contains('comment-form-textarea')) {
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
  if (!Utils.isCommentTextArea(event.target)) {
    return;
  }
  if (textarea.__github_autosugges_trie) {
    // We already have processed this
    return;
  }

  const start = Utils.time();
  const trie = new Trie();
  const words = getWords(window.document);
  trie.addWords(words);
  const inline_comment_div = Utils.getFirstParent(
    textarea,
    'tr.inline-comments'
  );
  if (inline_comment_div && inline_comment_div.previousSibling) {
    const special_words = getWords(inline_comment_div.previousSibling);
    trie.markSpecial(special_words);
  }

  Utils.log(`Trie built ${Utils.time() - start}ms (${trie.size} words)`);

  textarea.addEventListener('keydown', e => {
    if (e.keyCode === 13) {
      onEnter(e, trie);
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
  textarea.__github_autosugges_trie = true;
};

const onFocusOut = event => {
  if (!Utils.isCommentTextArea(event.target)) {
    return;
  }
  Tooltip.hide();
};

document.addEventListener('focusin', onFocus);
document.addEventListener('focusout', onFocusOut);
