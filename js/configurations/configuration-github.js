import * as Utils from '../Utils';

export default {
  HOST: 'github.com',
  BEST_CLASSES: ['pl-smi', 'pl-c1', 'pl-k', 'pl-en', 'pl-e', 'pl-v'],
  COMMENT_CLASSES: ['pl-c'],
  isCommentTextArea: el => el && el.classList.contains('comment-form-textarea'),
  getCommentLine: textarea => {
    const inline_comment_div = Utils.getFirstParent(
      textarea,
      'tr.inline-comments'
    );
    return inline_comment_div ? inline_comment_div.previousElementSibling : null;
  },
};