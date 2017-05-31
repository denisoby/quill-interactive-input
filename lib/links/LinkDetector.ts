import UrlHelper from './UrlHelper.ts';
import VirtualLink from './VirtualLink.js';
import Quill from 'quill/core/quill.js';

let LINK_FORMAT = "link";

export default class LinkDetector{
    static init(){
        Quill.register(VirtualLink);

        VirtualLink.addLinkResolver(function (node, url, callback) {
            let googleDocs = /^(https:\/\/)?(www\.)?docs\.google\.com\/spreadsheets\/d\/.+/gi;
            if (googleDocs.test(url)) {
                console.log("Google Docs link!");

                // set timeout is necessary only to emulate network api delays
                setTimeout(function () {

                    node.textContent = '';
                    node.setAttribute('target', '');
                    node.classList.add('resource-link-task');
                    node.setAttribute('contenteditable', 'false');

                    let widget = document.createElement("span");
                    node.appendChild(widget);

                    widget.innerHTML = '<img style="height: 20px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAAilBMVEUPnVf///8Tn1r7/fwQnFh+yacQp12n28ILdkEAl0wFmVC/5dIQpFuS07Mnp2im28Cz4MrN6twcomA5rnXb7+YxkmOG0a/z+vYEcTu92swLe0R+yKe44s4AkUPr9/FKtYGb1rlgvo9wxJsQrWDL6tpVuYfU7eCN1rYxm2jS5twFgUQPj1APjU5hvpBIPQxjAAAB7UlEQVRYhe2Y21LCMBBANxeITbHcKii0BbWiAv7/79mmSyU1zcXOOD54XthhJofNbnpZgCDrpwSAmwFIDoQRI4CfxXIMFhar1Ly+Fbw8c6tg1GdAwWFCbethse0zKAEjYuwQjJTBUAd/QU8OARmYcwgQmA0hgpFpF0ECUw5hAoMhUPB9F6GCbzkEC7qGcEFnFz8Q6Dn8RKDl4CvYrnRe0zABfbvr8h4kAHm819k8NGXwFVB6utEIFQCnp80gAXDgx0GCygDnQYK6Eie3gNrhG5cgcgBHq0Amtw4WWAizgMolcZDIphC9AsYO5VxRFqzAEClTtk4kqEJYMthFWA1BskhrQvRIakHVz6NVIJu4Fsjr7lIU1JztAoVUgmvkx0XAJ7xfsMxl3S+ZT8msCRGZv7QZwDjuFWT7qWKfkhRDZB9/CSb9Ais+gnmMFKSIdQ5egmUkFbkgMwyR6xpYBF5tdAicbbRvwauNFkEsZgqRkgJDRJS/08by8oNVG2c6fhkMroGlC0Pb6HkOqi20JzEPP4mMlVlz8LPqlpZpl0I2Z4PbSOyC6rYuRHv5i6v48tV0AVaBx4PFJXA82qhT4Mu/4M8J6sHTOrgaoEWz0nP07cD58xO+r3sO313GuzXRM6jHf9o7/3f+DKDJqh1ZPgGetkd7C1A2gwAAAABJRU5ErkJggg==" /> ' +
                        'Supercharge Time Calculator';

                    callback(false);
                }, 1000);
            }
            else{
                callback(true);
            }
        });
    }

    static textProcessor(quill, changeStartOffset, text) : boolean{

        //let [range, ] = _quill.selection.getRange();
        //console.warn(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> selection before: ", range);

        var urls = UrlHelper.find(text) || [];

        let hasMarkedUrls;

        if (urls.length) {
            console.log("urls: " + urls);
            hasMarkedUrls = LinkDetector.markUrls(quill, urls, changeStartOffset);
        }

        //if (hasMarkedUrls) {
        //    let [range,] = _quill.selection.getRange();
        //    console.warn(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> selection AFTER: ", range);
        //}

        return !hasMarkedUrls;
    }

    static markUrls(quill, urls, changeStartOffset){
        let hasMarkedUrls;

        function isAutomarkup(child) {
            return child.isAutoMarkup && child.isAutoMarkup();
        }

        for (var i = 0; i < urls.length; i++) {
            let [inChangeOffset, url] = urls[i];
            let urlOffset = changeStartOffset + inChangeOffset;
            let value = {
                url: url,
                automarkup: true
            };


            let urlsAlreadyMarked = quill.editor.scroll.descendants(isAutomarkup, urlOffset, url.length);

            //todo optimize this logic, put it to module
            let isMarkedUrl = urlsAlreadyMarked.length && (urlsAlreadyMarked[0].value() === url);

            if (!isMarkedUrl){
                console.log("Processing url '" + url + "'");
                hasMarkedUrls = true;
                quill.formatText(urlOffset, url.length, LINK_FORMAT, value, "api");
            }
            else{
                console.log("Skipping already marked url '" + url + "'");
            }
        }

        //temprorary disabled
        //return hasMarkedUrls;
    }
}
