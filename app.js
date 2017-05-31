import Quill from 'quill/core';

import Toolbar from 'quill/modules/toolbar';
import Snow from 'quill/themes/snow';

import Bold from 'quill/formats/bold';
import Italic from 'quill/formats/italic';
import Header from 'quill/formats/header';

import ChangeDetector from './lib/ChangeDetector.ts';
import LinkDetector from './lib/links/LinkDetector.ts';
import EmojiDetector from './lib//emoji/EmojiDetector.ts';

Quill.register({
    'modules/toolbar': Toolbar,
    'themes/snow': Snow,
    'formats/bold': Bold,
    'formats/italic': Italic,
    'formats/header': Header
});

window.quill = new Quill('#editor', {
    modules: {
        toolbar: true    // Snow includes toolbar by default
    },
    theme: 'snow'
});

if (!~document.location.search.indexOf('disable')){
    ChangeDetector.registerEditor(quill);
}

ChangeDetector.registerHandler(LinkDetector);
ChangeDetector.registerHandler(EmojiDetector);

quill.on(Quill.events.SCROLL_OPTIMIZE, () => {
    //ChangeDetector.applyPendingListener();
});


/*
quill.on('editor-change', function(eventName, range, oldRange, source) {
    if (eventName == 'selection-change') {
        ChangeDetector.applyPendingListener();
    }
});
*/

quill.on('editor-change', function(eventName, range, oldRange, source) {
    //console.log("Editor-change: " + eventName, arguments);

    if (eventName == 'selection-change') {
        if (range) {
            if (range.length == 0) {
                console.log('====================================================================');
                console.log('--------------------------------------------------------------------');
                console.log('[' + source + '] User cursor is on', range.index);
                console.log(window.getSelection().getRangeAt(0));

                if (range.index == 3){
                    //debugger;
                }

                console.log('--------------------------------------------------------------------');
                console.log('====================================================================');
            } else {
                var text = quill.getText(range.index, range.length);
                console.log('User has highlighted "' + text + '" in ' + JSON.stringify(range));
            }

        } else {
            console.log('Cursor not in the editor');
        }
    }
});

quill.setContents([
    { insert: 'Text with  :( ;) :), and links www.almost-links.com' },
    { insert: ' and document https://docs.google.com/spreadsheets/d/19khEGozqREIoAN6hd440o4qrzS2ADMVokv8G5FWmWSk/edit#gid=488708073 and more text' }
]);

//window.enableDebug = function (debug){
//    window.debug = debug === false ? false : true;
//};

export default Quill;
