import * as Utils from '../Utils';

const TOKEN_CLASSES = [
    'na', // js object property
    'nb', // js native function
    'nx', // js variable
    's1', // js hardcoded string
    'kd', // js key words like "var"
    'k',  // js keyword "return"
    'nv', // something...
    'n',  // php function name (no highlight)
    'kt', // php key words,
    'nf', // php static functions
    'nd', // Java class
    'nc', // Java annotations
    'kn', // Java key word "import"
];

export default {

  HOST: 'gitlab.com',

  isCommentTextArea: el => el.nodeName === 'TEXTAREA' && el.classList.contains('note-textarea'),

  getCommentLine: textarea => {
    const inline_comment_div = Utils.getFirstParent(
        textarea,
        '.notes_holder' // <div> container of the textarea below the commented line
    );
    return inline_comment_div ? inline_comment_div.previousElementSibling : null;
  },

  getWords: element => {
      const selector = Utils.toSelector(TOKEN_CLASSES);
      return Array.from(element.querySelectorAll(selector)).map(
          e => e.textContent
      );
  },
};