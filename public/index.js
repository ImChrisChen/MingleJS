/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/24
 * Time: 9:56 下午
 */


// 每次打包后版本号会通过 script.js 进行 io 修改;
(function (document) {
    let development = Number.parseInt(url2Obj(window.location.href).development) === 1;
    let currentScript = document.currentScript;
    let version = new Date().getTime();
    let files = getUrls();
    
    console.log(files);
    // console.log(`是否开发环境:`, development);
    
    //TODO 如果是开发环境则不用生成css
    const scripts = files.map(file => {
        let url = `${ file }?date=${ version }`;
        
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
        };
        return (libNames.length > 0) ? libNames.map(name => libsMap[name]) : [];
    }
    
    function getUrls() {
        const React = `https://g.alicdn.com/code/lib/react/16.13.1/umd/react.production.min.js`;
        const ReactDOM = `https://g.alicdn.com/code/lib/react-dom/16.13.1/umd/react-dom.production.min.js`;
        const JQuery = `https://cdn.bootcdn.net/ajax/libs/jquery/3.5.1/jquery.min.js`;
    
        // const AntdJS = `https://cdn.bootcdn.net/ajax/libs/antd/4.14.0/antd.min.js`;
        // const AntdCSS = `https://cdn.bootcdn.net/ajax/libs/antd/4.14.0/antd.min.css`;
        // let AntdCompactCSS = `https://cdn.bootcdn.net/ajax/libs/antd/4.14.0/antd.compact.min.css`;
    
        const AntdIcons = `https://cdn.bootcdn.net/ajax/libs/ant-design-icons/4.5.0/index.umd.min.js`;
    
        let hostname = development ? 'http://mingle-test.local.aidalan.com/' : 'http://mingle.local.aidalan.com/';
    
        const hljs = `https://cdn.bootcdn.net/ajax/libs/highlight.js/10.6.0/highlight.min.js`;
        const DataSet = `https://unpkg.com/@antv/data-set@0.11.8/build/data-set.js`;
    
        return [
            `${ hostname }main.css`,
            `${ hostname }manifest.css`,
    
            React,
            ReactDOM,
            JQuery,
            // AntdCompactCSS,
            AntdIcons,
            DataSet,
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
