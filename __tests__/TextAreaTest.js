import { getCurrentToken, replaceCurrentWord } from '../js/TextArea';

describe('Testing TextArea', () => {

	it('should only return current token when index is at end', () => {
		const textAreaNotAtEnd = {
			selectionStart: 10,
			value: "one two word"
		};
		const textAreaAtEnd = {
			selectionStart: "one two word".length,
			value: "one two word"
		};
		expect(getCurrentToken(textAreaNotAtEnd).token).toBe('');
		expect(getCurrentToken(textAreaAtEnd).token).toBe('word');
		expect(getCurrentToken(textAreaAtEnd).startIndex).toBe(8);
	});

	it('should deal with delimeter tokens', () => {
		const line = 'one `va';
		const textarea = {
			selectionStart: line.length,
			value: line, 
		};
		const currentToken = getCurrentToken(textarea);
		expect(currentToken.token).toBe('va');
		expect(currentToken.startIndex).toBe(5);
		expect(currentToken.endIndex).toBe(7);
	});

	it('should deal well with subtokens of more than 1', () => {
		const line = 'one `v`a';
		const textarea = {
			selectionStart: line.length,
			value: line, 
		};
		const currentToken = getCurrentToken(textarea);
		expect(currentToken.token).toBe('a');
		expect(currentToken.startIndex).toBe(7);
		expect(currentToken.endIndex).toBe(8);
	});
});

describe('Testing TextArea Insert', () => {
	
	const table = [
		['var a = g', 'getFunction()', 'var a = getFunction()', null],
		['Try `c', 'const', 'Try `const', null],
		['Try `compu', 'computer', 'Try `computer', 8],
		['Try `c', 'Trying', 'Trying `c', 3]
	];
	test.each(table)(
		"Inserting %",
		(value, replacer, expected, selectionStart) => {
			const textarea = {
				value,
				selectionStart: Number.isInteger(selectionStart) ? selectionStart : value.length,
			};
			const newValue = replaceCurrentWord(textarea, replacer);
			expect(newValue).toBe(expected);
		}
	);

});