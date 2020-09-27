import 'antd/dist/antd.compact.less' // 紧凑模de式

import './src/App.scss';
import React from 'react';
import App from './src/App';
import { message } from "antd";
// import 'antd/dist/antd.dark.css'

// 判断是否是深色模式
const darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
// 判断是否匹配深色模式
if (darkMode && darkMode.matches) {

}

// 监听主题切换事件
darkMode && darkMode.addEventListener('change', e => {
    // e.matches true 深色模式
});


let env = process.env.NODE_ENV;
console.log(env);
// if (env !== 'development') {
//     // docs
//     ReactDOM.render(
//         <Router>
//             <Document/>
//         </Router>,
//         document.querySelector('#App'));
// } else {
//     // window.onload = function () {
//     // 类数组转成数组 NodeListOf<HTMLElement>  => Array<HTMLElement>
//     // };
// }


window.onload = function () {
    let elements: Array<HTMLElement> = Array.from(document.querySelectorAll(`[data-fn]`));
    new App(elements);
    window['Message'] = message
};
