import TrieNode from './TrieNode.js';

export default class Trie {
  constructor() {
    this.root = new TrieNode('');
    this.size = 0;
  }

  addWords(words) {
    words.forEach(w => this.addWord(w));
  }

  addWord(word) {
    let node = this.root;
    for (const char of word) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode(char);
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
    });
  }

  contains(word) {
    const node = this.get(word);
    return node && node.isWord();
  }

  find(prefix) {
    if (!prefix) {
      return [];
    }
    const node = this.get(prefix, { case_insensitive: true });
    const words = node ? node.wordNodes() : [];
    const real_prefix = node ? node.real_word.slice(0, -1): '';
    return words
      .sort((a, b) => b.n.priority - a.n.priority)
      .map(w => real_prefix + w.s);
  }

  get(word, {case_insensitive} = {case_insensitive: false}) {
    let node = this.root;
    let real_word = '';
    for (const char of word) {
      if (node.children[char]) {
        node = node.children[char];
        real_word += char;
      } else if (case_insensitive) {
        const upper = char.toUpperCase();
        const lower = char.toLowerCase();
        if (node.children[lower]) {
          node = node.children[lower];
          real_word += lower;
        } else if (node.children[upper]) {
          node = node.children[upper];
          real_word += upper
        } else {
          return;
        }
      } else {
        return;
      }
    }
    if (case_insensitive) {
      // Not pretty but I need this.
      node.real_word = real_word;
    }
    return node;
  }

  size() {
    return this.size;
  }
}
