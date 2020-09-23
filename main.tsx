import 'antd/dist/antd.css';
import './src/App.scss';
import App from './src/App';
import ReactDOM from 'react-dom';
import React from 'react';
import { Document } from '@src/document/Document';
import { BrowserRouter as Router } from 'react-router-dom';

let env = process.env.NODE_ENV;
console.log(env);
if (env !== 'development') {
    // docs
    ReactDOM.render(
        <Router>
            <Document/>
        </Router>,
        document.querySelector('#App'));
} else {
    // window.onload = function () {
    // 类数组转成数组 NodeListOf<HTMLElement>  => Array<HTMLElement>
    let elements: Array<HTMLElement> = Array.from(document.querySelectorAll(`[data-fn]`));
    new App(elements);
    // };
}
