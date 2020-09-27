import 'antd/dist/antd.css';
import './src/App.scss';
import React from 'react';
import App from './src/App';
import { message } from "antd";

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
