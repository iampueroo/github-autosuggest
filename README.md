# github-autosuggest
Autosuggest for commit comments. 
# github-autosuggest

A dynamic autosuggest/autocomplete browser extension for Github comments, built on-the-fly from the diff. Use it for speedier commit comments and pull request reviews.

![](https://media.giphy.com/media/3ohhwqYt4w4G4ZGfpS/giphy.gif)

### Prerequisites
To installing the extension, all you need is an up-to-date Chrome browser (I'll get to Firefox and Safari soon, apologies). 
For development, you need to have `yarn` installed. Why `yarn` and not `npm`? Literally no specific reason, I just wanted to try `yarn` out. 

### Installing

#### Via Chrome Web Store
Install it from here [from the Chrome Store](https://chrome.google.com/webstore/detail/github-comment-autosugges/cckhnpaedijpapngkpjodffjfiemhlnf). As you can tell by lack of logos or pictures, **the extension is still in beta, so there may be bugs.** Feel free to submit issues or pull requests to this repository! If you'd like to disable the extension, navigate to `chrome://extensions` and disable the extension by clicking the checkbox.

#### Installing the extension from the source
For Chrome, you need to manually load the extension, see the instructions [here](https://developer.chrome.com/extensions/getstarted#unpacked). Point "the directory in which your extension files live" to the `/static` directory. The `/static` directory actually includes the bundled code, which usually is not under version control. I'm including it so it's easier for anyone to "install" the extension without actually installing it via the chrome store, in case they have any concerns about the security of executing auto-updating third-party code on private source code.


## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development ~~and testing purposes~~. 

1. Fork the project 
2. Run `yarn install` in the top level directory (TLD) of the project. I have three devDependencies, all for bundling/linting/minifying. After this, congrats you have installed everything! Two more steps are needed to begin developing.
3. Run `yarn dev`, this just runs `webpack --watch` so your js changes are automatically written to the `/static` directory.
4. After leaving `yarn dev` running, follow the **Installing the extension from the source** instructions above. After completing the step you have successfully installed the local copy of the extension in Chrome.
5. While `yarn dev` automatically bundles your changes, **it does not update the extension in chrome**. You unfortunately need to do this manually. Either a) Refresh the `chrome://extensions` page or b) use [this lovely little extension](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid)


## Using
* [component/text-area-caret-position](https://github.com/component/textarea-caret-position)
* [yarn](https://yarnpkg.com/en/) - JS module manager
* [webpack]https://webpack.github.io/) - JS bundler
* [babel-minify](https://github.com/babel/minify) - ES6 minifier just cause I want this extension to be teeny

## Contributing

TBD, free for all for now.

## Versioning

Using [SemVer](http://semver.org/) for versioning, but not very well.

## License

This project is licensed under the MIT License
