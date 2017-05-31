# Quill Interactive input example

Sample of plugins for quill that automatically highlights links in text, replace smiles in text with emoji.

## Demo
https://jsfiddle.net/ox5ty132/

*Before*
![Before plugin](https://raw.githubusercontent.com/denis-aes/quill-interactive-input/master/demo/0_without_plugin.png)

*After*
![After plugin](https://raw.githubusercontent.com/denis-aes/quill-interactive-input/master/demo/1_with_plugin.png)

The main idea is to automatically detect and customly render specific content to be more user friendly, without changing document delta or with changes in formats.    

In this example - there are three types of such auto replaced content:    
- smiles / emojies replaced with images
- normal links that are highlighted
- google sheets links are replaced with hardcoded possible widget example

**This code is experimental and is not expected for production use at the moment.***

## Run
```bash
npm install
npm run build
```

## Debug run
./node_modules/.bin/webpack-dev-server

open http://localhost:8080 

### License

MIT
