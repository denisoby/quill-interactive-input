import Quill from 'quill/core/quill.js';
import * as Embed from 'quill/blots/embed.js';

import EmojiBlog from './EmojiBlot.js';

let regexp = /:\)|;\)|:\(/g;
export default class EmojiDetector extends Embed{
    static init(){
        Quill.register(EmojiBlog, true);
    }

    static textProcessor(quill, changeStartOffset, text) : boolean{

        let emojiFound;
        regexp.lastIndex = 0;
        var execResult;
        while ((execResult = regexp.exec(text))) {
            emojiFound = true;
            var foundIndex = execResult.index;
            let foundText = execResult[0];
            let offset = changeStartOffset + foundIndex;
            quill.formatText(offset, foundText.length, "emoji", foundText, "api");
        }

        return !emojiFound;
    }
}
