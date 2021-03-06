import './src/App.scss';
import 'antd/dist/antd.compact.less'; // 紧凑模de式
import { MingleJS } from './src/core/MingleJS';
import { message, notification } from 'antd';
import App from './src/App';

window['MingleJS'] = MingleJS;
window['Message'] = message;
window['Notice'] = notification;
window['App'] = App;
