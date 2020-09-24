/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/24
 * Time: 9:56 下午
 */

// 每次打包后版本号会通过 script.js 进行 io 修改;
let version = new Date().getTime();

let __files__ = ['main.min.js', 'manifest.min.js', 'chart.min.js'];
let __scripts__ = __files__.map(file => {
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = file + '?v=' + version;
    return script;
});
document.body.append(...__scripts__);