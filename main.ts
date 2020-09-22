import 'antd/dist/antd.css';
import './src/App.scss';
import App from './src/App';

// window.onload = function () {
// 类数组转成数组 NodeListOf<HTMLElement>  => Array<HTMLElement>
let elements: Array<HTMLElement> = Array.from(document.querySelectorAll(`[data-fn]`));
new App(elements);
// };
