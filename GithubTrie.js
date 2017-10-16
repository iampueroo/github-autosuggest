console.log('Ignacio: running GithubTrie');
(function() {

	const HEIGHT = 31;
	const CLEAN_REGEX = /\(|\)|\[|\]|{|}|\.|,|`|\n|;/g;

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


	class Node {

		constructor(char) {
			this.char = char
			this.children = {};
		}

		isWord() {
			return this._isWord === true;
		}

		setIsWord(_) {
			this._isWord = !!_;
		}

		words() {
			const words = [];
			if (this.isWord()) {
				words.push(this.char);
			}
			for (const key of Object.keys(this.children)) {
				for (const word of this.children[key].words()) {
					words.push(this.char + word);
				}
			}
			return words;
		}
	}

	class Trie {

		constructor() {
			this.root = new Node('');
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
		}

		contains(word) {
			const node = this.get(word);
			return node && node.isWord();
		}

		find(prefix) {
			const node = this.get(prefix);
			prefix = prefix.substr(0, prefix.length - 1);
			return (node ? node.words() : []).map(w => prefix + w);
		}

		get(word) {
			let node = this.root;
			for (const char of word) {
				if (!node.children[char]) {
					return;
				}
				node = node.children[char];
			}
			return node;
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
				currentWord = currentWord.replace(CLEAN_REGEX, ' ').split(' ');
				return currentWord[currentWord.length - 1];
			}
			charIndex += word.length + 1; // 1 due to the space
		}
	};

	const replaceCurrentWord = (textarea, replace) => {
		const startIndex = textarea.selectionStart;
		let charIndex = 0;
		let currentValue = textarea.value.replace(CLEAN_REGEX, ' ').split(' ');
		for (const word of currentValue) {
			if (startIndex >= charIndex && startIndex <= charIndex + word.length) {
				let splitValue = textarea.value.split('');
				splitValue.splice(charIndex, word.length, ...replace.split(''));
				return splitValue.join('');
			}
			charIndex += word.length + 1; // 1 due to the space
		}
		throw new Error('FUCK');
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
		e.target.value = replaceCurrentWord(e.target, words[0]);
		clearToolTip();
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

	const clearToolTip = () => {
		const tooltip = getToolTip();
		tooltip.innerHTML = '';
		tooltip.classList.add('ignacio-hidden');
	}

	const buildTrie = () => {
		var names = Array.prototype.slice.call(document.querySelectorAll('.pl-c1, .pl-smi')).map(e => e.innerHTML);
		var trie = new Trie();
		for (const name of names) {
			trie.addWord(name);
		}
		var lines = Array.prototype.slice.call(document.querySelectorAll('.pl-s1')).forEach(e => {
			const words = e.textContent.replace(CLEAN_REGEX, ' ').trim().split(' ');
			for (const word of words) {
				if (word.length > 3) {
					trie.addWord(word);
				}
			}
		});
		return trie;
	};

	const onFocus = event => {
		console.log('On focus');
		if (!event.target || !event.target.classList.contains('comment-form-textarea')) {
			return;
		}
		const start = time();
		console.log('Building trie...');
		const trie = buildTrie();
		console.log(`trie built ${time() - start}ms (${trie.root.words().length} words)`);
		event.target.addEventListener('keydown', onEnter)
		event.target.addEventListener('keyup', onKeyUp(trie))
	};

	const onKeyUp = trie => event => {
		words = [];
		const tooltip = getToolTip();
		if (!event.target || !event.target.classList.contains('comment-form-textarea')) {
			tooltip.innerHTML = '';
			return;
		}

		const currentWord = getCurrentWord(event);

		if (!currentWord) {
			tooltip.innerHTML = '';
			return;
		}

		words = trie.find(currentWord);
		if (words.length && words[0] !== currentWord) {
			showToolTip(words[0], event.target);
		} else {
			clearToolTip();
		}
		console.log(`Current word: ${currentWord}. Found word: ${words[0] || ''}`);
	}

	document.addEventListener('focusin', onFocus);

})();
