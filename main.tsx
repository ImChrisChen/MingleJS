// import './src/App.less';
import './src/App.scss';
import 'antd/dist/antd.compact.less'; // 紧凑模de式
import React from 'react';
import { ConfigProvider, message, notification } from 'antd';
import App from './src/App';
import $ from 'jquery';
import ReactDOM from 'react-dom';
import Document from '@src/pages/document/Document'; // https://www.cnblogs.com/cckui/p/11490372.html
import { HashRouter } from 'react-router-dom';
import { globalComponentConfig } from './config/component.config';
import { Mingle } from './src/core/Mingle';

let docs = document.querySelector('#__MINGLE_DOCS__');

if (docs) {
    ReactDOM.render(
        <ConfigProvider { ...globalComponentConfig }>
            <HashRouter>
                <Document/>
            </HashRouter>
        </ConfigProvider>,
        docs);
}

// window.addEventListener('load', async () => {
//     new App(document.body);
//     Monitor.getPerformanceTimes(times => {
//         Monitor.performanceLogger(times);
//     });
// });


App.globalEventListener();

window['$'] = $;
window['Message'] = message;
window['Notice'] = notification;
window['Mingle'] = Mingle;
window['App'] = App;
window['React'] = React;
