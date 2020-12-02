// import 'antd/dist/antd.compact.less' // 紧凑模de式

import 'antd/dist/antd.css';

import './src/App.scss';
import React from 'react';
import { ConfigProvider, message, notification } from 'antd';
import App from './src/App';
import $ from 'jquery';
import ReactDOM from 'react-dom';
// import 'antd/dist/antd.dark.css'
import Document from '@src/pages/document/Document';
// https://www.cnblogs.com/cckui/p/11490372.html
import { HashRouter } from 'react-router-dom';
import { globalComponentConfig } from './config/component.config';
import axios from 'axios';

// 判断是否是深色模式
const darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');

// 判断是否匹配深色模式
if (darkMode && darkMode.matches) {
}

// 监听主题切换事件
darkMode && darkMode.addEventListener('change', e => {
    // e.matches true 深色模式
    let darkMode = e.matches;
    message.success(`系统颜色发生了变化，当前系统色为 ${ darkMode ? '深色🌙' : '浅色☀️' }`);
});

let env = process.env.NODE_ENV;

let docs = document.querySelector('#__MINGLE_DOCS__');

if (docs) {
    // docs
    ReactDOM.render(
        <ConfigProvider { ...globalComponentConfig }>
            <HashRouter>
                <Document/>
            </HashRouter>,
        </ConfigProvider>,
        docs,
    );
} else {
    // public/index.html
    window.onload = () => new App(document.body);
}


App.globalEventListener();
window['$'] = $;
window['Message'] = message;
window['Notice'] = notification;

