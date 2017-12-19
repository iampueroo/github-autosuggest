import Node from './Node.js';

export default class Trie {

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