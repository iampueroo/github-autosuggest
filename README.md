# github-autosuggest
<p align="center"><strong>Now with ✨Gitlab✨ support!</strong></p>
<p align="center">Quick install? Get it 👉 <a href="https://chrome.google.com/webstore/detail/github-code-review-autoco/cckhnpaedijpapngkpjodffjfiemhlnf">Chrome</a>. Firefox support coming soon (see <a href="https://github.com/iampueroo/github-autosuggest/issues/15">issue</a>).</p>
 

A dynamic autosuggest/autocomplete browser extension for Github and Gitlab comments, built on-the-fly from the diff. Use it for speedier commit comments and pull request reviews.

![](https://i.imgur.com/9RmUiL2.gif)

### Prerequisites
To install the extension, all you need is an up-to-date Chrome browser (I'll get to Firefox and Safari soon, apologies). 
For development, you need to have [`yarn`](https://yarnpkg.com/en/) installed. Why `yarn` and not `npm`? Literally no specific reason, I just wanted to try `yarn` out. 

### Installing

#### Via Chrome Web Store
Install it [here from the Chrome Store](https://chrome.google.com/webstore/detail/github-comment-autosugges/cckhnpaedijpapngkpjodffjfiemhlnf). As you can tell by lack of logos or pictures, **the extension is still in beta, so there may be bugs.** Feel free to submit issues or pull requests to this repository! If you'd like to disable the extension, navigate to `chrome://extensions` and disable the extension by clicking the checkbox.

#### Installing the extension from the source
For Chrome, you need to manually load the extension, see the instructions [here](https://developer.chrome.com/extensions/getstarted#unpacked). Point "the directory in which your extension files live" to the `/static` directory. The `/static` directory actually includes the bundled code, which usually is not under version control. I'm including it so it's easier for anyone to "install" the extension without actually installing it via the chrome store, in case they have any concerns about the security of executing auto-updating third-party code on private source code.


## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development

1. If you want to make changes, might as well just fork the repo, and clone your copy (see [here](https://help.github.com/articles/fork-a-repo/) if you're confused).
2. `cd github-autosuggest` (or whatever you named the directory)
3. `yarn install`. ([See here](https://yarnpkg.com/lang/en/docs/install/#mac-stable) if you don't have yarn). After this, congrats you have installed everything! Two more steps are needed to begin developing.
4. `yarn dev` (basically runs `webpack --watch`). Leave this running as it will automatically write your changes to the `/static` directory.
5. Run `yarn test --watch` to spin up Jest on auto-run mode. Note I am still far from 100% test coverage, and currently there is no testing on the main `index.js` file. To test the chrome extension on github....
6. ...you need to follow the [**Installing the extension from the source**](https://github.com/iampueroo/github-autosuggest#installing-the-extension-from-the-source) instructions above. After completing the step you have successfully installed the local copy of the extension in Chrome.
7. Make your changes! While `yarn dev` automatically bundles your changes, **it does not update the changes to chrome**. You unfortunately need to do this manually. Either a) Navigate to `chrome://extensions` page and click update on the loaded extension or b) use [this lovely little extension](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid)


## Using
* [component/text-area-caret-position](https://github.com/component/textarea-caret-position)
* [yarn](https://yarnpkg.com/en/) - JS module manager
* [webpack](https://webpack.github.io/) - JS bundler
* [babel-minify](https://github.com/babel/minify) - ES6 minifier just cause I want this extension to be teeny
* [Jest](https://jestjs.io/) - for JS testing

## Contributing

TBD, free for all for now.

## Versioning

Using [SemVer](http://semver.org/) for versioning, but not very well.

## License

This project is licensed under the MIT License
