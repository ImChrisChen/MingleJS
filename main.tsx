// import 'antd/dist/antd.compact.less' // 紧凑模de式
import './src/App.less';
import './src/App.scss';
import React from 'react';
import { ConfigProvider, message, notification } from 'antd';
import App from './src/App';
import $ from 'jquery';
import ReactDOM from 'react-dom';
import Document from '@src/pages/document/Document'; // https://www.cnblogs.com/cckui/p/11490372.html
import { HashRouter } from 'react-router-dom';
import { globalComponentConfig } from './config/component.config';
import { jsonp } from './utils/request/request';
import { Monitor } from './src/services/Monitor';

let docs = document.querySelector('#__MINGLE_DOCS__');

if (docs) {
    // docs
    ReactDOM.render(
        <ConfigProvider { ...globalComponentConfig }>
            <HashRouter>
                <Document/>
            </HashRouter>
        </ConfigProvider>,
        docs);
} else {
    // public/index.html
    window.addEventListener('load', () => {
        new App(document.body);
    });
}

window.addEventListener('load', async () => {
    Monitor.getPerformanceTimes(times => {
        // console.table(times);
        // Monitor.performances = times;
        Monitor.performanceLogger(times);
    });
});

App.globalEventListener();
window['$'] = $;
window['Message'] = message;
window['Notice'] = notification;
window['jsonp'] = jsonp;
