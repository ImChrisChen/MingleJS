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
import DataPanel from './src/component/data/panel/DataPanel';
import { isFunc, isString } from './utils/inspect';
import axios from 'axios';

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

    public $axios = axios;
    public $get = axios.get;
    public $post = axios.post;
    public $jsonp = jsonp;

    constructor(private readonly options: IMingleOptions) {
        this.run();
    }

    private async run() {
        let { el, data, created, methods, mounted } = this.options;
        data = data || {};
        methods = methods || {};
        let o = Object.assign(data, methods, this);
        let proxyData = new Proxy(o, {
            // get(target: object & { [p: string]: (...args: any) => any }, p: PropertyKey, receiver: any): any {
            //     console.log(target, p);
            // },
            //
            // set(target: object & { [p: string]: (...args: any) => any }, p: PropertyKey, value: any, receiver: any): boolean {
            //     console.log(target, p);
            //     return true;
            // },
        });

        await created?.call(proxyData);
        let container = document.querySelector(el) as HTMLElement;
        let node = DataPanel.parseElement(container, data);
        await Mingle.render(node);
        await mounted?.call(proxyData);
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
