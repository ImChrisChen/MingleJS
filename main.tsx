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
import { Monitor } from '@services/Monitor';
import { Inject } from 'typescript-ioc';
import { ParserElementService } from './src/services/ParserElement.service';
import { HttpClientService } from './src/services/HttpClient.service';

let docs = document.querySelector('#__MINGLE_DOCS__');

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
    Monitor.getPerformanceTimes(times => {
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

    @Inject private static parserElementService: ParserElementService;
    @Inject private static httpClientService: HttpClientService;

    constructor(options: IMingleOptions) {
        this.run(options);
    }

    // TODO 变量式声明函数才可以被代理 ，否则会被解析到prototype属性上无法被Proxy代理到
    public $get = async (url, ...args) => {
        return Mingle.httpResponseInterceptor(await Mingle.httpClientService.get(url, ...args));
    };

    public $post = async (url, ...args) => {
        return Mingle.httpResponseInterceptor(await Mingle.httpClientService.post(url, ...args));
    };

    public $delete = async (url, ...args) => {
        return Mingle.httpResponseInterceptor(await Mingle.httpClientService.delete(url, ...args));
    };

    public $put = async (url, ...args) => {
        return Mingle.httpResponseInterceptor(await Mingle.httpClientService.put(url, ...args));
    };

    public $jsonp = async (url) => {
        return Mingle.httpResponseInterceptor(await Mingle.httpClientService.jsonp(url));
    };

    public createComponent = (name: string, property: object) => {
        let element = document.createElement(name);
        for (const key in property) {
            if (!property.hasOwnProperty(key)) continue;
            let value = property[key];
            if (key === 'name' || key === 'value') {
                element['name'] = key;
                element['value'] = value;
            }
            element.setAttribute(key, value);
        }
        return element;
    };

    // response
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

        let node = Mingle.parserElementService.parseElement(container, data, methods);
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
window['Mingle'] = Mingle;
window['App'] = App;
