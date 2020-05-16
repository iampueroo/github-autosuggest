import { getCurrentToken } from '../js/TextArea.js';

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

});