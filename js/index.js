import Trie from './Trie.js';
import * as Utils from './Utils.js';
import getCaretCoordinates from './textarea-caret-position.js';

// const HEIGHT = 31;
// const CLEAN_REGEX = /\((?!\))|(?<!\()\)|\[|\]|{|}|\.|,|`|\n|;/g;
const CLEAN_REGEX = /\((?!\))|\[|\]|{|}|\.|,|`|\n|;/g;
const SPLIT_REGEX = /->|=>|\!/g;

function time() {
	return (new Date()).getTime();
}

function clean(s) {
	const replaceString = '()';
	const replaceWith = '$IGNACIO$';
	const replaced = s.replace(replaceString, replaceWith);
	var splitChars = ['(', ')', '[', ']', '{', '}', '.', ',', '`', '\\n'];
	var regex = new RegExp(splitChars.map(c => `\\${c}`).join('|'));
	return s.replace(regex, ' ').replace(replaceWith, replaceString);
}

let words = [];

const getCurrentWord = (textarea) => {
	const startIndex = textarea.selectionStart;
	let charIndex = 0;
	for (const word of textarea.value.split(' ')) {
		if (startIndex >= charIndex && startIndex <= charIndex + word.length) {
			let currentWord = clean(word).split(' ').filter(w => w !== '');
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
	let currentValue = clean(textarea.value).split(' ');
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

const isInOpenBacktick = (textarea) => {
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

const getWords = (node) => {
	const words = [];
	const names = Array.prototype.slice.call(node.querySelectorAll('.pl-c1, .pl-smi, .pl-en')).map(e => e.innerHTML);
	for (const name of names) {
		words.push(name);
	}
	const lines = Array.prototype.slice.call(node.querySelectorAll('.pl-s1')).forEach(e => {
		let content = e.textContent;
		for (let i = 0; i < e.children.length; i++) {
			// Remove textContent from comments, as they're not helpful
			if (e.children[i].classList.contains('pl-c')) {
				content = content.replace(e.children[i].textContent, '');
			}
		}
		const tokens = clean(content).trim().split(' ');
		for (const token of tokens) {
			if (token.length < 5) {
				continue;
			}
			words.push(token);
			const split_words = token.split(SPLIT_REGEX);
			if (split_words.length > 1) {
				split_words.forEach(w => words.push(w));
			}
		}
	});
	return words;
};

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
	Utils.log(`Current word: ${currentWord}. Found ${words.length} words`);
	words.forEach(w => Utils.log(`\n${w}`));
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
	Utils.log('Building trie...');
	const trie = new Trie();
	const words = getWords(window.document);
	trie.addWords(words);
	const inline_comment_div = Utils.getFirstParent(event.target, 'tr.inline-comments');
	if (inline_comment_div && inline_comment_div.previousSibling) {
		const special_words = getWords(inline_comment_div.previousSibling);
		trie.markSpecial(special_words);
	}
	Utils.log(`trie built ${time() - start}ms (${trie.size} words)`);
	event.target.addEventListener('keydown', e => {
		if (e.keyCode === 13) {
			onEnter(e);
			// We need to stop this here and not count
			// it as a regular keydown
			return;
		}
		if (e.keyCode === 192) {
			onBackTick(e);
		}
		if (e.metaKey && e.keyCode == 90) {
			onUndo(e);
		}
		justAdded = false;
	})
	event.target.addEventListener('keyup', onKeyUp(trie))
};
document.addEventListener('focusin', onFocus);