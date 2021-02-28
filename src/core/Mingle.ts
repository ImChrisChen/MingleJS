/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/2/9
 * Time: 10:59 上午
 */

import App from '@src/App';
import { Inject } from 'typescript-ioc';
import { ParserElementService } from '@services/ParserElement.service';
import { HttpClientService } from '@services/HttpClient.service';
import { message } from 'antd';
import { ProxyData } from '@src/core/ProxyData';
import { getVNode } from '@utils/trans-dom';

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

    @Inject private readonly parserElementService: ParserElementService;
    @Inject private readonly httpClientService: HttpClientService;

    constructor(options: IMingleOptions) {
        let defaultOptions = {
            el     : 'body',
            data   : {},
            created: function () {
            },
            mounted: function () {
            },
            methods: {},
        };
        this.run(Object.assign(defaultOptions, options));
    }

    // TODO 变量式声明函数才可以被代理 ，否则会被解析到prototype属性上无法被Proxy代理到
    public $get = async (url, ...args) => {
        return Mingle.httpResponseInterceptor(await this.httpClientService.get(url, ...args));
    };

    public $post = async (url, ...args) => {
        return Mingle.httpResponseInterceptor(await this.httpClientService.post(url, ...args));
    };

    public $delete = async (url, ...args) => {
        return Mingle.httpResponseInterceptor(await this.httpClientService.delete(url, ...args));
    };

    public $put = async (url, ...args) => {
        return Mingle.httpResponseInterceptor(await this.httpClientService.put(url, ...args));
    };

    public $jsonp = async (url) => {
        return Mingle.httpResponseInterceptor(await this.httpClientService.jsonp(url));
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

        let container = document.querySelector(el) as HTMLElement;
        let o = Object.assign(data, methods, this);
        o = new ProxyData(o);

        await created?.call(o);     // 很有可能会修改到 data里面的数据,所以等 created 执行完后才解析模版

        let node = this.parserElementService.parseElement(container, data, {
            methods : methods,
            callthis: o,
        });
        
        console.log(node);
        let vnode = getVNode(node as HTMLElement)
        console.log(vnode);

        await this.render(node);
        await mounted?.call(o);
    }

    render(node: HTMLElement | Array<HTMLElement>) {
        new App(node);
    }
}


