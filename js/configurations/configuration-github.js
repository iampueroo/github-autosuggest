import * as Utils from '../Utils';

const best_classes = ['pl-smi', 'pl-c1', 'pl-k', 'pl-en', 'pl-e', 'pl-v'];

export default {
  HOST: 'github.com',
  COMMENT_CLASSES: ['pl-c'],
  isCommentTextArea: el => el && el.classList.contains('comment-form-textarea'),
  getCommentLine: textarea => {
    const inline_comment_div = Utils.getFirstParent(
      textarea,
      'tr.inline-comments'
    );
    return inline_comment_div ? inline_comment_div.previousElementSibling : null;
  },
  getWords: function(node) {
    const selector = Utils.toSelector(best_classes);
    let words = Array.from(node.querySelectorAll(selector)).map(
      e => e.textContent
    );
    // Second best content, but we need to remove comments it
    const pl_s1_content = Array.from(node.querySelectorAll('.pl-s1')).map(el => {
      let content = el.textContent;
      for (let i = 0; i < el.children.length; i++) {
        // Remove textContent from comments, as they're not helpful
        if (el.children[i].classList.contains('pl-c')) {
          content = content.replace(el.children[i].textContent, '');
        }
      }
      return content;
    });
    return words.concat(pl_s1_content.concat(this.getAdditionalTokens(node)));
  },
  getAdditionalTokens: function(node) {
    // .blob-code-inner sometimes contains words we want to add to the trie,
    // but they're text nodes. Here we look for text nodes of .blob-code-inner
    // to add to the trie. We need .blob-code-hunk to filter away the .blob-code-inners
    // that aren't actual code (but compressed code)
    const blobs = node.querySelectorAll('.blob-code-inner:not(.blob-code-hunk)');
    const blob_content = Array.from(blobs).map(el => {
      let content = el.textContent;
      for (let i = 0; i < el.childNodes.length; i++) {
        // Remove non-text node content as they've already been added to the trie
        if (el.childNodes[i].nodeType !== el.TEXT_NODE) {
          content = content.replace(el.childNodes[i].textContent, '');
        }
      }
      return content;
    });
    return blob_content;
  },
};