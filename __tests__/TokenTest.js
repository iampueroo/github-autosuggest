import Token from '../js/Token.js';

describe('Test Token', () => {

	it('should have valid token functions', () => {
		const line = 'This is a line';
		const token = new Token('is', line, 5, 7);
		expect(token.isEmpty).toBe(false);
		expect(token.is('is')).toBe(true);
		expect(token.is('isnot')).toBe(false);
		expect(token.isIndexAtEnd(6)).toBe(false);
		expect(token.isIndexAtEnd(7)).toBe(true);
	})

});