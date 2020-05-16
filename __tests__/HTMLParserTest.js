import { tokenize, subtokenize } from '../js/HTMLParser';
import { getTokenFromStringByIndex } from '../js/Textarea';

describe('should test tokenize', () => {
	const table = [
		[
			'const table = getTable();',
			['const', 'table', '=', 'getTable()', ';']],
		[
			'$result = NumberFormatter::parse($this->getValue())',
			['$result', '=', 'NumberFormatter::parse', '(', '$this->getValue()', ')']
		]
	];
	test.each(table)(
		'Tokenize: %s',
		(input, expected) => expect(tokenize(input).map(t => t.token)).toEqual(expected)
	)
});

		
describe('should test split', () => {
	const table = [
		['NumberFormatter::parse', ['NumberFormatter', 'parse']],
		['$this->getValue()', ['$this', 'getValue()']],
	];

	test.each(table)(
		'Subtokenize: %s',
		(input, expected) => expect(subtokenize(input)).toEqual(expected)
	)	
})

describe('should identify current word', () => {
	const data = [
		[
			'This is a SELECTED example',
			15,
			'SELECTED'
		],
		[
			'This is a SELECTED example',
			26,
			'example'
		],
		[
			'This is a SELECTED example',
			'This is a SELECTED example '.length,
			''
		],
		[
			'`test`',
			'`test`'.length,
			'`test`'
		],
		[
			'`test`',
			3,
			'`test`'
		],
		[
			' testing',
			0,
			' '
		],
		[
			'',
			0,
			''
		],
		[
			' testing',
			8,
			'testing'
		],
		[
			' testing',
			1,
			'testing'
		],
	];
	test.each(data)(
		'getTokenFromStringByIndex %s',
		(line, index, expected) => expect(
			getTokenFromStringByIndex(line, index).token
		).toEqual(expected)

	)	
});