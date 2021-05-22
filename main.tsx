import './src/defaultClass.less';
import './src/App.scss';
import 'antd/dist/antd.compact.less'; // 紧凑模de式
import React from 'react';
import { ConfigProvider, message, notification } from 'antd';
import $ from 'jquery';
import ReactDOM from 'react-dom';
import Document from '@src/pages/document/Document'; // https://www.cnblogs.com/cckui/p/11490372.html
import { HashRouter } from 'react-router-dom';
import { globalComponentConfig } from './src/config/interface';
import { MingleJS } from './src/core/MingleJS';
import App from './src/App';

let container = document.querySelector('#__MINGLE_DOCS__');
container && ReactDOM.render(
    <ConfigProvider { ...globalComponentConfig }>
        <HashRouter>
            <Document/>
        </HashRouter>
    </ConfigProvider>,
    container);

// window.addEventListener('load', async () => {
//     new App(document.body);
//     Monitor.getPerformanceTimes(times => {
//         Monitor.performanceLogger(times);
//     });
// });

MingleJS.globalEventListener();
window['$'] = $;
window['App'] = App;
window['Message'] = message;
window['Notice'] = notification;
window['Mingle'] = MingleJS;
