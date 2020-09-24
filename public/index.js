/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/24
 * Time: 9:56 下午
 */

let __files__ = ['main.min.js', 'manifest.min.js' ,'chart.min.js'];
let __scripts__ = __files__.map(file => {
    let script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = file;
    return script;
});
document.body.append(...__scripts__);
