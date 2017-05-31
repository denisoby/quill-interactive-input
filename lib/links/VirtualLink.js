import VirtualLinkTooltip from './VirtualLinkTooltip.ts';
import Emitter from 'quill/core/emitter';
import Embed from 'quill/blots/embed';
import UrlHelper from './UrlHelper.ts';
import * as Registry from 'registry';

let _tooltip;
let _linkResolvers = [];


export default class VirtualLink extends Embed {
    static create(value) {
        let url = value.url || value;

        let domNode = super.create(url);
        let textNode = document.createTextNode("");
        domNode.appendChild(textNode);

        return domNode;
    }

    constructor(node, value){
        if (value instanceof Text){
            value = value.data;
        }

        let url = value.url || value || "";

        super(node, url);

        this._automarkup = value.automarkup || false;
        this._url = url;
        this._widgetUrl = false;

        var self = this;

        this.statics.initTooltipSingleton();
        this.populateLink(url, this.domNode, true);

        this.resolveUrl(url);

        node.addEventListener('click', this.onClick.bind(this));
    }

    resolveUrl(url){
        let self = this;

        let fns = [].concat(_linkResolvers);
        let continueCallback = (canContinue) => {
            if (canContinue !== false){
                _chain(fns.shift());
            }
            else{
                //url is detected and customly rendered
                self._widgetUrl = true;
            }
        };

        function _chain(fn) {
            if(fn) {
                fn(self.domNode, url, continueCallback);
            }
        }

        _chain(fns.shift());
    }

    static initTooltipSingleton(){
        if (!_tooltip){
            _tooltip = new VirtualLinkTooltip(window.quill, /*this.options.bounds*/);

            _tooltip.setHandlers({
                // for auto markup "Change" button has no sense,
                // for manual attributed links - it will be done later
                //onChange: function () {
                //    alert('change')
                //},

                onRemove: function () {
                    var range = _tooltip.getRange();

                    if (range == null) return;
                    if (range.length !== 0/* && source === Emitter.sources.USER*/) {
                        return;
                    }
                    let links = window.quill.editor.scroll.descendants(VirtualLink, range.index, 1);

                    if (links && links[0]){
                        //todo remove format ?
                        alert("//todo remove format ?");
                    }
                }
            })

            window.quill.on(Emitter.events.SELECTION_CHANGE, (range, oldRange, source) => {
                if (range == null) return;
                _tooltip.hide();
            });
        }
    }

    showTooltip(){
        var range = window.quill.getSelection();

        if (range == null) return;
        if (range.length === 0/* && source === Emitter.sources.USER*/) {
            let url = this.valueSafe();
            _tooltip.preview.textContent = url;
            _tooltip.preview.setAttribute('href', url);
            _tooltip.show();
            _tooltip.setRange(range);
            _tooltip.position(_tooltip.quill.getBounds(range));
        }

        //todo hide tooltip on selection_change
        //_tooltip.hide();
    }

    onClick(e){
        if (!this._widgetUrl){
            e.preventDefault();
            e.stopPropagation();
            this.showTooltip();
            return false;
        }
    }

    updateLink(url, skipText){
        _tooltip.hide();

        console.log("Checking if expired link " + url);
        if (this.isTextReplacementNecessary(url)){
            console.log("Expired, replacing with text '" + url + "'");
            this.replaceWith("text", url);
        }
        else{
            console.log("NOT expired");
            //skipText because it is already updated
            this.populateLink(url, this.domNode, skipText);
        }
    }

    isAutoMarkup(){
        return this._automarkup;
    }

    update(mutations){
        var self = this;

        if (mutations.some((mutation) => {
                let isThisTarget = mutation.target === self.domNode || mutation.target.parentElement === self.domNode;
                return mutation.type === 'characterData' && isThisTarget;
            })) {
            //todo maybe update quills selection ?
            _tooltip.hide();

            this._url = this.statics.value(this.domNode);
            this.updateLink(this._url, true);
        }
    }


    isTextReplacementNecessary(newValue){
        console.log( "automarkup: " + this.isAutoMarkup()+  ", newValue: " + newValue);
        return this.isAutoMarkup() && !UrlHelper.isValid(newValue);
    }

    populateLink(url, domNode, skipText){
        domNode.setAttribute('data-value', url);

        let urlSafe = VirtualLink.sanitize(url);
        domNode.setAttribute('href', urlSafe);
        domNode.setAttribute('target', '_blank');

        //todo remove this hack?
        if (!skipText){
            domNode.firstChild.data = url;
        }
    }

    static value(domNode){
        //todo check textContent
        let text = domNode.firstChild.data;
        //if (text["normalize"]) text = text["normalize"]();
        return text;
    }

    static getUrlFromValue(value){
        let url = value.url || value;
        return url;
    }

    format(name, value) {
        console.log("this.format", arguments);
        if (name !== this.statics.blotName || !value) return super.format(name, value);
        let url = this.constructor.getUrlFromValue(value);
        this.populateLink(url, this.domNode, true);
    }

    static validateURL(link){
        var urlRegEx = /^((ht|f)tp(s?):\/\/|mailto:)/;
        return urlRegEx.test(link || "");
    }

    static sanitize(url) {
        if (!VirtualLink.validateURL(url)){
            url = 'http://' + url;
        }
        return url;
    }

    index(node, offset) {
        if (window.debug){
            //debugger;
        }

        if (node !== this.domNode && node.parentElement !== this.domNode){
            console.warn("this.index -1");
            return -1;
        }

        let index = Math.min(offset, this.value().length);

        console.log("this.index " + index + " for offset " + offset);
        return index;
    }

    value() {
        return this.domNode.getAttribute('data-value') || "";
    }

    valueSafe() {
        return VirtualLink.sanitize(this.value());
    }

    length() {
        // return this._value.length;
        return this.value().length;
    }

    appendChild(other) {
        console.log("this.appendChild", arguments);
        //let newValue = this.value() + other.value();
        //VirtualLink.populateLink(newValue, this.domNode);

        let text = other instanceof VirtualLink ? other._text() : other.value();

        //Text.wrap -> Link.AppendChild(Text)
        this.domNode.firstChild.data = this.domNode.firstChild.data + text;
        other.remove();

    }

    _setText(text){
        this.domNode.firstChild.data = text;
    }

    deleteAt(index, length) {
        console.log("this.deleteAt", arguments);

        let url = this.value();
        url = url.slice(0, index) + url.slice(index + length);
        this.updateLink(url, false)
    }

    position(index, inclusive){
        console.log("this.position", arguments);

        return [this.domNode.firstChild, index];
    }

    wrap() {
        return this._superCall("wrap", arguments);
    }

    split(index, /*force*/) {

        return this._superCall("split", arguments);

        /*
        //taken from TextBlot, todo check if necessary
        if (!force) {
            if (index === 0) return this;
            if (index === this.length()) return this.next;
        }
        */

        // in case of second split (for isolate) - we get empty text && exception here
        // todo fix split-isolate functions
        let value = this.domNode.firstChild.splitText(index);
        let after = Registry.create("link", value);
        this.parent.insertBefore(after, this.next);
        //this.text = this.statics.value(this.domNode);
        return after;
    }

    replaceWith() {
        return this._superCall("replaceWith", arguments);
    }

    replace() {
        return this._superCall("replace", arguments);
    }

    remove() {
        return this._superCall("remove", arguments);
    }

    _text(){
        return this.domNode.firstChild.data || "";
    }

    optimize() {
        super.optimize();
        if (!this._widgetUrl &&
            this._isNextSiblingLink(this.next) && this._isEqualLink(this.next)) {
            //this.insertAt(this.length(), (/*<VirtualLink>*/this.next)._text());
            this.appendChild(/*<VirtualLink>*/this.next);
        }
    }

    offset() {
        return this._superCall("offset", arguments);
    }

    isolate() {
        return this._superCall("isolate", arguments);
    }

    insertInto() {
        return this._superCall("insertInto", arguments);
    }

    insertAt() {
        return this._superCall("insertAt", arguments);
    }

    clone() {
        return this._superCall("clone", arguments);
    }

    attach() {
        return this._superCall("attach", arguments);
    }

    detach() {
        return this._superCall("detach", arguments);
    }

    formatAt(index, length, name, value) {
        //debugger;
        return this._superCall("formatAt", arguments);
    }

    _isNextSiblingLink(otherLink){
        // this.next.prev === this
        // WTF?! from text.ts
        return otherLink instanceof VirtualLink && otherLink.prev === this;
    }

    _isEqualLink(otherLink){
        let thisUrl = this.value();
        let otherUrl = otherLink.value();

        /*
            http://ya.ru == ya.ru
          */
        return VirtualLink.sanitize(thisUrl) == VirtualLink.sanitize(otherUrl);
    }

    _superCall(method, args){
        console.log("call super." + method, args);
        let r = super[method].apply(this, args);
        if (r){
            console.log("result super." + method, r);
        }
        return r;
    }

    // affects model
    // todo check - we need it?
    static formats(domNode) {
        return {
            'link' : domNode.getAttribute('data-value')
            // automarkup store and get here
        };
    }

    static addLinkResolver(callback){
        _linkResolvers.push(callback);
    }
}
VirtualLink.blotName = 'link';
VirtualLink.tagName = 'A';
VirtualLink.className = 'link-virtual';
// VirtualLink.order.push('virtual');
// VirtualLink.allowedChildren = [Text, Hidden];
// console.log(VirtualLink.order);