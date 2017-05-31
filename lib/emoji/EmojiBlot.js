import Parchment from 'parchment';
import Registry from 'registry';
import Embed from 'quill/blots/embed.js';

export default class EmojiBlot extends Embed {
    static create(value) {
        let node = super.create(value);
        node.setAttribute('data-value', value || "");
        node.setAttribute('contenteditable', false);

        this.applyStyles(node);

        return node;
    }

    static value(domNode) {
        let value = domNode.getAttribute('data-value');
        return value;
    }

    value() {
        let value = EmojiBlot.value(this.domNode);
        return value;
    }

    length(){
        let length = this.value().length;
        return length;
    }

    appendChild(other) {
        let value = other.value();

        let stylePosition = {
            ":)" : "-20px -0px",
            ";)" : "-100px -0px",
            ":(" : "-380px -0px",
        };

        this.domNode.style["background-position"] = stylePosition[value];

        console.log("this.appendChild", arguments);
        other.remove();
    }

    static applyStyles(node){
        let styles = {
            "background-size": "540px 140px",
            "background-image": "url(//web.telegram.org/img/emojisprite_0.png)",
            "width": "20px",
            "height": "20px",
            "vertical-align": "middle",
            "margin": "-3px 0 0",
            "background-repeat": "no-repeat",
            "text-indent": "-9999px",
            "border": 0,
            "display": "inline-block"
        };

        for (let name in styles){
            if (styles.hasOwnProperty(name)){
                node.style[name] = styles[name];
            }
        }
    }

    index(node, offset) {
        return 1;
    }
}

EmojiBlot.blotName = 'emoji';
EmojiBlot.tagName = 'I';
