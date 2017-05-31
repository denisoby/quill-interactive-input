//todo process new lines

import Parchment from 'parchment';
import Block from 'quill/blots/block.js';

let _quill = null;
let _modules = [];

export default class ChangeDetector {
    static registerEditor(quill){
        _quill = quill;
        quill.on('text-change', ChangeDetector.textChangeListener);
    }

    static registerHandler(module){
        _modules.push(module);
        module.init();
    }

    static callHandlers(changeStartOffset, text){
        for (let i = 0; i < _modules.length; i++) {

            let handler = _modules[i].textProcessor;

            let result = handler(_quill, changeStartOffset, text);
            if (result === false){
                break;
            }
        }
    }

    static getChangeBoundaries(delta, oldDelta){
        let boundaries = null;
        let opsLength = delta.ops.length;

        if (opsLength ==1 || opsLength == 2) {
            let [op0, op1] = delta.ops;
            if (!op1) {
                //no content before, this is first insert operation
                op1 = op0;
                op0 = {};
            }

            let insertOp = op1.insert;

            if (op1 && op1.attributes && !op1.delete && !insertOp) {
                console.log("attribs applied, no content changed - do not process this");
                return boundaries = null;
            }
            else{
                var offsetFrom = op0.retain || 0;
                var insertLength = insertOp ? insertOp.length : 0;

                boundaries = [offsetFrom, offsetFrom + insertLength];
            }
        }
        else if (opsLength > 2){
            // in normal cases of user editing text - there are 1 or 2 ops
            // more ops means that text was updated with api (even source == "user")
            // and may contain multiple changed area - they can be calculated
            // to optimize check, but at the moment it is easier to recheck all the text
            console.log("opsLength > 2 - rechecking all text");
            boundaries = [0, Number.POSITIVE_INFINITY];
        }
        else{
            console.warn("Empty delta change received");
        }


        return boundaries;
    }

    static textChangeListener(delta, oldDelta, source){
        console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
        console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
        console.log("textChangeListener: ", JSON.stringify(arguments[0]), arguments);

        //console.log("textChangeListener launched: ", delta, oldDelta, source);

        let [changeStartOffset, text] = ChangeDetector.getChangedText(delta, oldDelta);

        if (!text){
            return; //everything was deleted, or empty/spaces change
        }
        console.log("Changed text: '" + text + "'");

        ChangeDetector.callHandlers(changeStartOffset, text);

        console.log('#########################################################################')
        console.log('#########################################################################')
    }

    static _goTillNextSpace(text: string, offset: number, directionSign: number){
        //todo refactor replace with more readable code
        while (((directionSign == -1 && offset > 0) ||
        (directionSign == +1 && offset < text.length))
        && text[offset] != ' '){ //todo what to do with new lines?
            offset+=directionSign;
        }

        return offset;
    }

    static extendBoundaries(text: string, boundaries: number[]){
        // include all affected words to the left and right
        var left = ChangeDetector._goTillNextSpace(text, boundaries[0], -1);
        var right = ChangeDetector._goTillNextSpace(text, boundaries[1], +1);
        return [left, right];
    }

    static getChangedText(delta, oldDelta): object{
        var text = '', textStartOffset;
        let boundaries = ChangeDetector.getChangeBoundaries(delta, oldDelta);

        //console.log("change boundaries: ", boundaries);

        if (boundaries) {
            text = _quill.getText();
            var [textStartOffset, textEndOffset] = ChangeDetector.extendBoundaries(text, boundaries);

            console.log("extended boundaries: ", boundaries);

            text = text.substring(textStartOffset, textEndOffset);

            //todo is it still necessary?
            if (text.length && text[text.length - 1] == '\n') {
                text = text.substr(0, text.length - 1);
            }
        }
        return [textStartOffset, text];
    }
}