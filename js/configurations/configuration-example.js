import * as Utils from '../Utils';

export default {

  /**
   * The host (ex: github.com) that this configuration is for.
   **/
  HOST: 'example.com',

  /**
   *
   * @param {HTMLElement} el
   * @returns {boolean} Boolean indicating if the HTMLElement is the comment textarea
   */
  isCommentTextArea: el => el,

  /**
   *
   * @param {HTMLElement} textarea: The comment <textarea> element
   * @returns {HTMLElement|null} wrapper of the line that the <textarea> element is commenting on
   */
  getCommentLine: textarea => null,

  /**
   * This is the main function that takes in a generic HTMLElement and returns the tokens
   * that will be suggested on the <textarea> autosuggest.
   *
   * @param {HTMLElement} element
   * @returns {String[]} words to suggest
   */
  getWords: element => [],

};