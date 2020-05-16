import { explodeByTokens, makeRegex } from '../js/Tokenizer.js';

describe('explode by tokens test', () => {

	it('Should split and include space tokens', () => {
		expect(
			explodeByTokens('test and this', [' ']).map(t => t.token)
		).toEqual(['test', ' ', 'and', ' ', 'this']);
	});	

	it('Should split and include multiple tokens', () => {
		expect(
			explodeByTokens('var a = func();', [' ', '=', '(', ')']).map(t => t.token)
		).toEqual(['var', ' ', 'a', ' ', '=' , ' ', 'func', '(', ')', ';']);
	});	

	it('Should two empty spaces into two', () => {
		expect(
			explodeByTokens('  ', [' ', '=', '(', ')']).map(t => t.token)
		).toEqual([' ', ' ']);
	});	

});


describe('creating regex', () => {

	it('should make expected regex string from single tokens', () => {
		expect(
			makeRegex(['(',')','[',']','{','}','.',',','`',';']).toString()
		).toBe("/(\\(|\\)|\\[|\\]|\\{|\\}|\\.|\\,|\\`|\\;)/g")
	});

	it('should handle lookahead correctly', () => {
		const parensRegex = ['\\((?!\\))', '(?<!\\()\\)'];
		const regex = makeRegex(parensRegex);
		expect(regex.test('()hello')).toBe(false)
		expect(regex.test('hello()')).toBe(false)
		expect(regex.test('(hello')).toBe(true)
		expect(regex.test('hello)')).toBe(true)
		expect(regex.test('(hello)')).toBe(true)
	});
});