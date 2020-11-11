/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/24
 * Time: 9:56 下午
 */

// 每次打包后版本号会通过 script.js 进行 io 修改;
let version = new Date().getTime();

let __files__ = ['main.min.js', 'manifest.min.js', 'chart.min.js', 'main.css', 'manifest.css'];
let __scripts__ = __files__.map(file => {
    let hostname = 'http://mingle.local.aidalan.com/';
    if (isJavascript(file)) {
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = hostname + file + '?date=' + version;
        return script;
    } else {
        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = hostname + file + '?date=' + version;
        return link;
    }
});

document.body.append(...__scripts__);

function isJavascript(file) {
    return file.split('.')[1] === 'js';
}

