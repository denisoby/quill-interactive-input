import Emitter from 'quill/core/emitter.js';
import { Range } from 'quill/core/selection.js';
import BaseTheme, { BaseTooltip } from 'quill/themes/base.js';
import LinkBlot from 'quill/formats/link.js';

export default class VirtualLinkTooltip extends BaseTooltip {
    constructor(quill, bounds) {
        super(quill, bounds);
        this.preview = this.root.querySelector('a.ql-preview');
        this.linkChange = this.root.querySelector('.ql-doLinkChange');
        this.linkRemove = this.root.querySelector('.ql-doLinkRemove');
        this.linkSeparator = this.root.querySelector('.linkSeparator');

        //to get etherpad styles
        this.root.classList.add('ep-links-bubble');

        this.hideControls();
    }


    hide() {
        this.hideElement(this.root);

        this.range = null;
    }

    _setHandler(name, options){
        let link = this["link" + name];
        let eventName = "on" + name;

        if (options[eventName]) {
            link.onclick = options[eventName];
            link.classList.remove('ql-hidden');
            return true;
        }
        else{
            link.classList.add('ql-hidden');
            return false;
        }
    }

    getRange(){
        return this.range;
    }

    setRange(range){
        this.range = range;
    }

    hideControls(){
        this.setHandlers(null);
    }

    setHandlers(options){
        options = options || {};

        let removeEnabled = this._setHandler("Remove", options);
        let changeEnabled = this._setHandler("Change", options);

        if (changeEnabled && removeEnabled){
            this.showElement(this.linkSeparator);
        }
        else{
            this.hideElement(this.linkSeparator);
        }
    }

    show() {
        // todo check what is it
        //this.root.classList.remove('ql-editing');
        this.showElement(this.root);
    }


    //todo move to proper class
    hideElement(el){
        el.classList.add('ql-hidden');
    }

    showElement(el){
        el.classList.remove('ql-hidden');
    }
}

VirtualLinkTooltip.TEMPLATE = [
    '<a class="ql-preview" rel="nofollow noreferrer noopener" target="_blank" title="" href="about:blank"></a>'+
    '<span>'+
    ' &ndash; '+

    '<span class="ep-links-bubble-link ql-doLinkChange" rel="change" unselectable="on">Change</span>'+
    '<span class="linkSeparator"> | </span>'+
    '<span class="ep-links-bubble-link ql-doLinkRemove" rel="remove" unselectable="on">Remove</span>'+
    '</span>',

    //BaseTooltip requirement
    '<input type="text" data-formula="e=mc^2" data-link="https://quilljs.com" data-video="Embed URL">'
].join('');