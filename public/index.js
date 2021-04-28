/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/24
 * Time: 9:56 下午
 */


// 每次打包后版本号会通过 script.js 进行 io 修改;
(function (document) {
    let development = Number.parseInt(url2Obj(window.location.href).development) === 1;
    let date = new Date().getTime();            // 使依赖js自动更新
    let currentScript = document.currentScript;
    // let [version] = currentScript.src.match(/(\d+)\.(\d+)\.(\d+)(-\w+)?/);     // 获取当前版本号  1.15.1  1.15.1-beat
    
    let files = getUrls();
    
    console.table(files);
    // console.log(`%c MingleJS 当前版本: ${ version }`, 'color:red');
    console.log(`%c 最后一次更新的时间: ${ date }`, 'color:orange');
    
    //TODO 如果是开发环境则不用生成css
    const scripts = files.map(file => {
        let url = `${ file }?date=${ date }`;
        
        if (isJavascript(file)) {
            return createScript(file, url);
        } else {
            return development ? undefined : createStyle(file, url);        // 开发环境不需要引入css,都是集成在js中的
        }
    }).filter(t => t);
    
    document.body.parentElement.append(...scripts);
    
    function getLibs() {
        let imports = currentScript.getAttribute('import') || '';
        let libNames = (imports ? imports.split(',') : []).filter(e => e);
        
        const libsMap = {
            charts: `https://g.alicdn.com/code/lib/bizcharts/4.1.9/BizCharts.min.js`,
            icfonts: `https://at.alicdn.com/t/font_2482718_zdd9kkd89lm.css`,
        };
        return (libNames.length > 0) ? libNames.map(name => libsMap[name]).filter(t => t) : [];
    }
    
    function getUrls() {
        const react = `https://g.alicdn.com/code/lib/react/16.13.1/umd/react.production.min.js`;
        const reactdom = `https://g.alicdn.com/code/lib/react-dom/16.13.1/umd/react-dom.production.min.js`;
        const jquery = `https://cdn.bootcdn.net/ajax/libs/jquery/3.5.1/jquery.min.js`;
        
        const antdcss = `https://cdn.bootcdn.net/ajax/libs/antd/4.15.1/antd.compact.min.css`;
        const antdjs = `https://cdn.bootcdn.net/ajax/libs/antd/4.15.1/antd.min.js`;
        
        // http://mingle-test.local.aidalan.com/latest 
        // http://mingle-test.local.aidalan.com/0.10.14
        let url = currentScript.src;
        url = url.split('/');
        url.pop();
        url = url.join('/');
        
        const hostname = development ? 'http://mingle-test.local.aidalan.com/' : `${ url }/`;
        const antdIcons = `https://cdn.bootcdn.net/ajax/libs/ant-design-icons/4.5.0/index.umd.min.js`;
        const hljs = `https://cdn.bootcdn.net/ajax/libs/highlight.js/10.6.0/highlight.min.js`;
        const dataset = `https://unpkg.com/@antv/data-set@0.11.8/build/data-set.js`;
        
        return [
            `${ hostname }main.css`,
            `${ hostname }manifest.css`,
            antdcss,
            react,
            reactdom,
            antdjs,
            jquery,
            // AntdCompactCSS,
            antdIcons,
            dataset,
            hljs,
            ...getLibs(),
            `${ hostname }main.min.js`,
            `${ hostname }manifest.min.js`,
            // `${ hostname }data-set.js`
        
        ];
    }
    
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
