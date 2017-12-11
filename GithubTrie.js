const HEIGHT = 31;
const CLEAN_REGEX = /\([^\)]{1}|(?<!\()\)|\[|\]|{|}|\.|,|`|\n|;/g;
const SPLIT_REGEX = /->|=>|\!/g;

function getFirstParent(el, selector) {
	if (!el.parentElement) {
		return false;
	} else if (el.parentElement.matches(selector)) {
		return el.parentElement;
	}
	return getFirstParent(el.parentElement, selector);
}

function log(...args) {
	if (window.logmeplease) {
		console.log(...args);
	}
}

function time() {
	return (new Date()).getTime();
}

function totalOffset(element) {
	const offset = { top: 0, left: 0 };
	while (element) {
		offset.left += element.offsetLeft || 0;
		offset.top += element.offsetTop || 0;
		element = element.offsetParent;
	}
	return offset;
}

function clean(s) {
	return s.replace(CLEAN_REGEX, ' ');
}

class Node {

	constructor(char) {
		this.char = char
		this.lowerChar = char.toLowerCase();
		this.children = {};
		this.count = 1;
		this.priority = 0; // Binary weights
	}

	setPriority(_) {
		this.priority = _;
	}

	isWord() {
		return this._isWord === true;
	}

	setIsWord(_) {
		this._isWord = !!_;
	}

	upCount() {
		this.count++;
	}

	wordNodes() {
		const words = []; // ordered list of { node, string}
		if (this.isWord()) {
			words.push({
				s: this.char, // string
				n: this, // node
			})
		}
		for (const key of Object.keys(this.children)) {
			const childNodes = this.children[key].wordNodes();
			for (const d of childNodes) {
				words.push({
					s: this.char + d.s,
					n: d.n,
				});
			}
		}
		return words;
	}
}

class Trie {

	constructor() {
		this.root = new Node('');
		this.size = 0;
	}

	addWords(words) {
		words.forEach(w => this.addWord(w));
	}

	addWord(word) {
		let node = this.root;
		for (const char of word) {
			if (!node.children[char]) {
				node.children[char] = new Node(char);
			}
			node = node.children[char];
		}
		node.setIsWord(true);
		node.upCount();
		this.size++;
	}

	markSpecial(words) {
		if (typeof words === 'string') {
			words = [words];
		}
		words.forEach(w => {
			if (!this.get(w)) {
				this.addWord(w);
			}
			this.get(w).setPriority(1);
		})
	}

	contains(word) {
		const node = this.get(word);
		return node && node.isWord();
	}

	find(prefix) {
		if (!prefix) {
			return '';
		}
		const node = this.get(prefix);
		const words = node ? node.wordNodes() : [];
		prefix = prefix.substr(0, prefix.length - 1);
		return words.sort((a,b) => b.n.priority - a.n.priority).map(w => prefix + w.s);
	}

	get(word) {
		let node = this.root;
		let lowerChar;
		for (const char of word) {
			let lowerChar = char.toLowerCase();
			if (node.children[char]) {
				node = node.children[char];
			} else if (node.children[lowerChar]) {
				node = node.children[lowerChar];
			} else {
				return;
			}
		}
		return node;
	}

	size() {
		return this.size;
	}
}

let words = [];

const getCurrentWord = event => {
	const textarea = event.target;
	const startIndex = textarea.selectionStart;
	let charIndex = 0;
	for (const word of textarea.value.split(' ')) {
		if (startIndex >= charIndex && startIndex <= charIndex + word.length) {
			let currentWord = word;
			currentWord = clean(currentWord).split(' ');
			return currentWord[currentWord.length - 1];
		}
		charIndex += word.length + 1; // 1 due to the space
	}
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
	throw new Error('FUCK');
}

const is_in_block_format = (textarea) => {
	return textarea.value.split(/`|``/g).length % 2 === 0;
}

const onEnter = e => {
	if (event.keyCode !== 13 || !words.length || !words[0].length) {
		return;
	}
	if (words[0] === getCurrentWord(e)) {
		return;
	}

	e.preventDefault();
	e.stopImmediatePropagation();
	let word = words[0];
	if (is_in_block_format(e.target)) {
		word += '`';
	} else {
		word = '`' + word + '`';
	}
	e.target.value = replaceCurrentWord(e.target, word);
	removeTooltip();
	words = [];
}

var getToolTip = () => {
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
	const textareaOffset = totalOffset(textarea);
	const caretOffset = window.getCaretCoordinates(textarea, textarea.selectionEnd);
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
	const names = Array.prototype.slice.call(node.querySelectorAll('.pl-c1, .pl-smi')).map(e => e.innerHTML);
	const trie = new Trie();
	for (const name of names) {
		words.push(name);
	}
	const lines = Array.prototype.slice.call(node.querySelectorAll('.pl-s1')).forEach(e => {
		const tokens = clean(e.textContent).trim().split(' ');
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

const onFocus = event => {
	log('On focus');
	if (!event.target || !event.target.classList.contains('comment-form-textarea')) {
		return;
	}
	const start = time();
	log('Building trie...');
	const trie = new Trie();
	const words = getWords(window.document);
	trie.addWords(words);
	const inline_comment_div = getFirstParent(event.target, 'tr.inline-comments');
	if (inline_comment_div && inline_comment_div.previousSibling) {
		const special_words = getWords(inline_comment_div.previousSibling);
		trie.markSpecial(special_words);
	}
	log(`trie built ${time() - start}ms (${trie.size} words)`);
	event.target.addEventListener('keydown', onEnter)
	event.target.addEventListener('keyup', onKeyUp(trie))
};

const onKeyUp = trie => event => {
	words = [];
	const tooltip = getToolTip();
	if (!event.target || !event.target.classList.contains('comment-form-textarea')) {
		removeTooltip();
		return;
	}

	const currentWord = getCurrentWord(event);

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
	log(`Current word: ${currentWord}. Found ${words.length} words`);
	words.forEach(w => log(`\n${w}`));
}

document.addEventListener('focusin', onFocus);