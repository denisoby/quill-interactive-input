// combined regexp from cluster_src/liveeditor/static/js/linestylefilter.js
// + function _findUrls from etherpad-clustered-backend/cluster_src/liveeditor/static/js/pad_utils.js
export default class UrlHelper{
    static find(text: string) {
        // copied from ACE
        var REGEX_WORDCHAR = /[\u0030-\u0039\u0041-\u005A\u0061-\u007A\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF\u0100-\u1FFF\u3040-\u9FFF\uF900-\uFDFF\uFE70-\uFEFE\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFDC\|]/;
        var REGEX_URLCHAR = new RegExp('(' + /[-:@a-zA-Z0-9_.,~%+\/\\?=&#;$\*\!]/.source + '|' + REGEX_WORDCHAR.source + ')');
        var REGEX_URL = new RegExp(/(?:(?:https?|s?ftp|ftps|file|smb|afp|nfs|(x-)?man|gopher|txmt):\/\/|mailto:|www\.)/.source + REGEX_URLCHAR.source + '*(?![:.,;])' + REGEX_URLCHAR.source, 'g');

        // returns null if no URLs, or [[startIndex1, url1], [startIndex2, url2], ...]

        function _findURLs(text) {
            REGEX_URL.lastIndex = 0;
            var urls = null;
            var execResult;
            while ((execResult = REGEX_URL.exec(text))) {
                urls = (urls || []);
                var startIndex = execResult.index;
                var url = execResult[0];
                urls.push([startIndex, url]);
            }

            return urls;
        }

        return _findURLs(text);
    }

    static isValid(url){
        let urlsMatched = UrlHelper.find(url);
        let firstUrlFound = urlsMatched && urlsMatched[0][1];
        let isValidUrl =  firstUrlFound === url;

        return isValidUrl;
    }
}