// import 'antd/dist/antd.compact.less' // 紧凑模de式

import 'antd/dist/antd.css';

import './src/App.scss';
import React from 'react';
import { message } from 'antd';
import App from './src/App';
import $ from 'jquery';
import ReactDOM from 'react-dom';
// import 'antd/dist/antd.dark.css'
import { Document } from './src/document/Document';

import { BrowserRouter as Router } from 'react-router-dom'; // https://reactrouter.com/web/guides/quick-start

// const isDebug = true;
//
// console.log = (function (oriLogFunc) {
//     return function (str) {
//         if (isDebug) {
//             oriLogFunc.call(console, str);
//         }
//     };
// })(console.log);

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

const isDocument = false;

if (isDocument) {
    // docs
    ReactDOM.render(
        <Router>
            <Document/>
        </Router>,
        document.querySelector('#App'),
    );
} else {
    window.onload = function () {
        // let elements: Array<HTMLElement> = Array.from(document.querySelectorAll(`[data-fn]`));
        new App(document.body);
    };
}

window['Message'] = message;
window['$'] = $;
