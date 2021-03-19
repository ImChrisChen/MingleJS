import './src/App.scss';
import 'antd/dist/antd.compact.less'; // 紧凑模de式
import React from 'react';
import { message, notification } from 'antd';
import App from './src/App';
import $ from 'jquery';
import { Mingle } from './src/core/Mingle';

App.globalEventListener();

window['$'] = $;
window['Message'] = message;
window['Notice'] = notification;
window['Mingle'] = Mingle;
window['App'] = App;
window['React'] = React;
