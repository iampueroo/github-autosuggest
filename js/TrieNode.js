export default class TrieNode {
  constructor(char) {
    this.char = char;
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
      });
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
