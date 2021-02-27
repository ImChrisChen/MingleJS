/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/24
 * Time: 9:56 下午
 */

// 每次打包后版本号会通过 script.js 进行 io 修改;
(function (document) {
    
    const development = Number.parseInt(url2Obj(window.location.href).development) === 1;
    console.log(`是否开发环境:`, development);
    const hostname = development ? 'http://mingle-test.local.aidalan.com/' : 'http://mingle.local.aidalan.com/';
    const files = ['main.min.js', 'manifest.min.js', 'chart.min.js', 'main.css', 'manifest.css'];
    const version = new Date().getTime();
    
    //TODO 如果是开发环境则不用生成css
    const scripts = files.map(file => {
        let url = hostname + file + '?date=' + version;
        if (isJavascript(file)) {
            return createScript(file, url);
        } else {
            return development ? undefined : createStyle(file, url);        // 开发环境不需要引入css,都是集成在js中的
        }
    }).filter(t => t);
    
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
        script.async = false;       // TODO 使JavaScript同步加载,否则会影响到加载顺序
        return script;
    }
    
    function createStyle(file, url) {
        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = url;
        return link;
    }
    
    function url2Obj(url, o = {}) {
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
