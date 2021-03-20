import './src/App.scss';
import 'antd/dist/antd.compact.less'; // 紧凑模de式
import { Mingle } from './src/core/Mingle';
import { message, notification } from '_antd@4.14.0@antd';

window['Mingle'] = Mingle;
window['Message'] = message;
window['Notice'] = notification;
