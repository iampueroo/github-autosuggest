import Trie from './Trie';
import { getWords, tokenize } from './GithubHTMLParser';
import * as Utils from './Utils';
import getCaretCoordinates from './textarea-caret-position';

function time() {
	return (new Date()).getTime();
}

let words = [];

const getCurrentWord = textarea => {
	const startIndex = textarea.selectionStart;
	let charIndex = 0;
	for (const word of textarea.value.split(' ')) {
		if (startIndex >= charIndex && startIndex <= charIndex + word.length) {
			let currentWord = tokenize(word).filter(w => w !== '');
			return currentWord[currentWord.length - 1];
		}
		charIndex += word.length + 1; // 1 due to the space
	}
	throw new Error('shit');
};

const getNextCharacter = textarea => {
	return textarea.value[textarea.selectionStart];
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
}

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
	return value.slice(index).split(/`/g).length % 2 === 1 &&
		value.slice(0, index).split(/`/g).length % 2 === 1;
}

let justAdded = false;
let prevState = null; // { value, index }
let currentValue = '';
const onEnter = e => {
	if (e.keyCode !== 13 || !words.length || !words[0].length) {
		return;
	}
	if (words[0] === getCurrentWord(e.target)) {
		return;
	}

	e.preventDefault();
	e.stopImmediatePropagation();
	let word = words[0];
	if (needsClosingBacktick(e.target)) {
		word += '`';
	} else if (needsBothBackticks(e.target)) {
		word = '`' + word + '`';
	}

	prevState = { value: e.target.value, index: e.target.selectionEnd };
	e.target.value = replaceCurrentWord(e.target, word);
	e.target.selectionEnd = e.target.selectionEnd - 1;
	currentValue = e.target.value;
	removeTooltip();
	words = [];
	justAdded = true;
}

const onBackTick = e => {
	if (justAdded && getNextCharacter(e.target) === '`') {
		e.stopImmediatePropagation();
		e.preventDefault();
		e.target.selectionEnd = e.target.selectionEnd + 1;
		e.target.selectionStart = e.target.selectionEnd;
	}
};

const getToolTip = () => {
	const id = 'ignacio';
	let element = document.querySelector(`.${id}`);
	if (!element) {
		const div = document.createElement('div');
		div.classList.add(id);
		div.style.position = 'absolute';
		div.innerHTML = '{word}';
		document.body.appendChild(div);
		element = div;
	}
	return element;
}

const showToolTip = (word, textarea) => {
	const textareaOffset = Utils.totalOffset(textarea);
	const caretOffset = getCaretCoordinates(textarea, textarea.selectionEnd);
	const tooltip = getToolTip();
	tooltip.classList.add('ignacio-hidden');
	tooltip.innerHTML = word;
	const widthOffset = -1 * tooltip.getBoundingClientRect().width / 2;
	tooltip.style.left = (textareaOffset.left + caretOffset.left + widthOffset) + 'px';
	tooltip.style.top = (textareaOffset.top + caretOffset.top - 31) + 'px';
	tooltip.classList.remove('ignacio-hidden');
}

const removeTooltip = () => {
	const tooltip = getToolTip();
	tooltip.innerHTML = '';
	tooltip.classList.add('ignacio-hidden');
	tooltip.remove();
}

const onKeyUp = trie => event => {
	words = [];
	const tooltip = getToolTip();
	if (!event.target || !event.target.classList.contains('comment-form-textarea')) {
		removeTooltip();
		return;
	}

	const currentWord = getCurrentWord(event.target);

	if (!currentWord) {
		removeTooltip();
		return;
	}

	words = trie.find(currentWord);
	if (words.length && words[0] !== currentWord) {
		showToolTip(words[0], event.target);
	} else {
		removeTooltip();
	}
	Utils.log(`Current word: ${currentWord} Found ${words.length} words`, words);
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
	}
};

const onFocus = event => {
	if (!event.target || !event.target.classList.contains('comment-form-textarea')) {
		return;
	}
	const start = time();
	const trie = new Trie();
	const words = getWords(window.document);
	trie.addWords(words);
	const inline_comment_div = Utils.getFirstParent(event.target, 'tr.inline-comments');
	if (inline_comment_div && inline_comment_div.previousSibling) {
		const special_words = getWords(inline_comment_div.previousSibling);
		trie.markSpecial(special_words);
	}
	Utils.log(`Trie built ${time() - start}ms (${trie.size} words)`);
	event.target.addEventListener('keydown', e => {
		if (e.keyCode === 13) {
			onEnter(e);
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
	})
	event.target.addEventListener('keyup', onKeyUp(trie))
};

document.addEventListener('focusin', onFocus);
