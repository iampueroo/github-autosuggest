import Trie from '../js/Trie.js';
describe('Testing Trie Build', () => {

	it('Should initialize empty Trie', () => {
		const trie = new Trie();
		expect(trie.contains('test')).toBe(false);
		expect(trie.find('test')).toEqual([]);
		expect(trie.get('undefined')).toEqual(null);
		expect(trie.size).toEqual(0);
	});

	it('should return falsey values for null arguments passed', () => {
		const trie = new Trie();
		expect(trie.get()).toEqual(null);
		expect(trie.find()).toEqual([]);
		expect(trie.contains()).toEqual(false);
	})

});

describe('Testing simple inserts and lookups', () => {

	let trie;

	beforeAll(() => {
		trie = new Trie();
		trie.addWords([
			'dogs',
			'cats',
			'dollar',
			'money',
			'cars',
			'currency',
			'doing',
			'delivery'
		]);
	});

	it('should have valid count', () => {
		expect(trie.size).toBe(8);
	});

	it('should return true for contained words', () => {
		expect(trie.contains('dogs')).toBe(true);
		expect(trie.contains('dog')).toBe(false);
		expect(trie.contains('dogss')).toBe(false);
	});
	it('should return false for case insensitive contains', () => {
		expect(trie.contains('Dogs')).toBe(false);
	});

	it('should return valid find', () => {
		expect(trie.find('dogs')).toEqual(['dogs']);
		expect(trie.find('dog')).toEqual(['dogs']);
		expect(trie.find('d')).toEqual(['dogs', 'dollar', 'doing', 'delivery']);
	});

});