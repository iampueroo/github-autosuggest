import Trie from './Trie';
import getCaretCoordinates from './textarea-caret-position';
import * as Tooltip from './Tooltip';
import * as Utils from './Utils';
import * as Textarea from './Textarea';
import { getWords, tokenize, getBlobWords } from './GithubHTMLParser';

let suggestedWord = '';
let justAdded = false;
let prevState = null; // { value, index }
let currentValue = '';

const onEnter = (event, textarea, trie) => {
  if (!suggestedWord) {
    return;
  }
  if (suggestedWord === Textarea.getCurrentWord(textarea)) {
    return;
  }
  // We're taking over the event.
  event.preventDefault();
  event.stopImmediatePropagation();
  let word = suggestedWord;
  let closedOffset = 0; // for new index
  if (Textarea.needsClosingBacktick(textarea)) {
    word += '`';
    closedOffset = 1;
  } else if (Textarea.needsBothBackticks(textarea)) {
    word = '`' + word + '`';
    closedOffset = 1;
  }
  prevState = { value: textarea.value, index: textarea.selectionEnd };
  textarea.value = Textarea.replaceCurrentWord(textarea, word);
  textarea.selectionEnd =
    prevState.index + (textarea.value.length - prevState.value.length) - closedOffset;
  currentValue = event.target.value;
  Tooltip.remove();
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
  const currentWord = Textarea.getCurrentWord(textarea);

  if (!currentWord || /^:|^#|^@/.test(currentWord)) {
    Tooltip.remove();
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
    Tooltip.remove();
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
  trie.addWords(getWords(window.document));
  const inline_comment_div = Utils.getFirstParent(
    textarea,
    'tr.inline-comments'
  );
  if (inline_comment_div && inline_comment_div.previousElementSibling) {
    const special_words = getWords(inline_comment_div.previousElementSibling);
    trie.markSpecial(special_words);
  }

  Utils.log(`Trie built ${Utils.time() - start}ms (${trie.size} words)`);

  textarea.addEventListener('keydown', e => {
    if (e.keyCode === 13 || e.keyCode === 9) { // enter or tab
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
  textarea.__github_autosugges_trie = true;
};

const onFocusOut = event => {
  if (!Utils.isCommentTextArea(event.target)) {
    return;
  }
  Tooltip.remove();
};

document.addEventListener('focusin', onFocus);
document.addEventListener('focusout', onFocusOut);
