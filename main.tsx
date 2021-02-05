// import './src/App.less';
import './src/App.scss';
import 'antd/dist/antd.compact.less'; // 紧凑模de式
// import 'antd/dist/antd.dark.less'
import React from 'react';
import { ConfigProvider, message, notification } from 'antd';
import App from './src/App';
import $ from 'jquery';
import ReactDOM from 'react-dom';
import Document from '@src/pages/document/Document'; // https://www.cnblogs.com/cckui/p/11490372.html
import { HashRouter } from 'react-router-dom';
import { globalComponentConfig } from './config/component.config';
import { jsonp } from '@utils/request/request';
import { Monitor } from '@services/Monitor';
import DataPanel from './src/component/data/panel/DataPanel';
import axios from 'axios';

let docs = document.querySelector('#__MINGLE_DOCS__');

// HTMLElement.prototype.setStore = function (key: string, value: any) {
//     if (!key) {
//         console.log(`${ key }格式有误`);
//         return;
//     }
//
//     if (!isObject(this.store)) {
//         this.store = {};
//     }
//
//     console.log(this.store, key, value);
//
//     this.store[key] = value;
// };
//
// HTMLElement.prototype.getStore = function (key: string) {
//     return this.store?.[key];
// };

if (docs) {
    // docs;
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
    // new App(document.body);
    Monitor.getPerformanceTimes(times => {
        // console.table(times);
        // Monitor.performances = times;
        Monitor.performanceLogger(times);
    });
});

interface IMingleOptions {
    el: string
    data?: object
    created?: (...args) => any
    methods?: {
        [key: string]: (...args: any) => any
    }
    mounted?: (...args) => any
}

export class Mingle {

    constructor(options: IMingleOptions) {
        this.run(options);
    }

    // TODO 变量式声明函数才可以被代理 ，否则会被解析到prototype属性上无法被Proxy代理到
    public $get = async (url, ...args) => {
        return Mingle.httpResponseInterceptor(await axios.get(url, ...args));
    };

    public $post = async (url, ...args) => {
        return Mingle.httpResponseInterceptor(await axios.post(url, ...args));
    };

    public $delete = async (url, ...args) => {
        return Mingle.httpResponseInterceptor(await axios.delete(url, ...args));
    };

    public $put = async (url, ...args) => {
        return Mingle.httpResponseInterceptor(await axios.put(url, ...args));
    };

    public $jsonp = async (url) => {
        return Mingle.httpResponseInterceptor(await jsonp(url));
    };

    private static async httpResponseInterceptor(res) {
        if (res?.status) {
            return res.data;
        } else {
            message.error(res?.msg ?? res?.message ?? 'request error !');
            return [];
        }
    }

    private async run(options) {
        let { el, data, created, methods, mounted } = options;
        data = data || {};
        methods = methods || {};
        let o = Object.assign(data, methods, this);
        let proxyData = new Proxy(o, {});       // Proxy

        await created?.call(proxyData);
        let container = document.querySelector(el) as HTMLElement;
        if (!container) return;

        container.hidden = true;
        let node = DataPanel.parseElement(container, proxyData);
        await Mingle.render(node);
        await mounted?.call(proxyData);
        container.hidden = false;
    }

    public static render(node: HTMLElement | Array<HTMLElement>) {
        new App(node);
    }

}

App.globalEventListener();
window['$'] = $;
window['Message'] = message;
window['Notice'] = notification;
window['jsonp'] = jsonp;
window['Mingle'] = Mingle;
window['App'] = App;
