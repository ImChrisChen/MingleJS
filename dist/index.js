/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/24
 * Time: 9:56 下午
 */

// 每次打包后版本号会通过 script.js 进行 io 修改;
(function (document) {
    
    const development = Number.parseInt(formatUrl2Object(window.location.href).development) === 1;
    const hostname = development ? 'http://mingle-test.local.aidalan.com/' : 'http://mingle.local.aidalan.com/';
    const files = ['main.min.js', 'manifest.min.js', 'chart.min.js', 'main.css', 'manifest.css'];
    const version = new Date().getTime();
    
    let scripts = files.map(file => {
        let url = hostname + file + '?date=' + version;
        if (isJavascript(file)) {
            return createScript(file, url);
        } else {
            return createStyle(file, url);
        }
    });
    
    document.body.append(...scripts);
    
    // 判读文件后缀是否是js
    function isJavascript(file) {
        return lastItem(file.split('.')) === 'js';
    }
    
    function lastItem(array) {
        let lastIndex = array.length - 1;
        return array[lastIndex];
    }
    
    function createScript(file, url) {
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        return script;
    }
    
    function createStyle(file, url) {
        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        return link;
    }
    
    function formatUrl2Object(url, o = {}) {
        let search = url;
        if (url.includes('?')) {
            [, search] = url.split('?');
        }
        search.split('&').forEach(kv => {
            if (kv) {
                let [k, v] = kv.split('=');
                o[k] = v;
            }
        });
        return o;
    }
    
    
})(window.document);
