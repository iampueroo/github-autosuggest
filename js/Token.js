export default function(_token, _fullString, _startIndex, _endIndex) {
  return {
    token: _token,
    length: _token.length,
    startIndex: _startIndex,
    endIndex: _endIndex,
    fullString: _fullString,
    get isEmpty() {
      return _token.length === 0;
    },

    is: word => word === _token,
    isIndexAtEnd: index => index === _endIndex,
  };
}
