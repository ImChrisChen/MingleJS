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
import { IMingleVnode, VirtualDOM } from '@src/core/VirtualDOM';

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
    @Inject private readonly virtualDOM: VirtualDOM;
    private oldVnode;

    private containerNode;

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

    // response
    private static async httpResponseInterceptor(res) {
        if (res?.status) {
            return res.data;
        } else {
            message.error(res?.msg ?? res?.message ?? 'request error !');
            return [];
        }
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

    render(node: HTMLElement) {
        console.log(node);
        new App(node);
    }

    async renderView(container, data, methods, proxyData) {
        let funcs = { methods: methods, callthis: proxyData };

        // 虚拟DOM实现
        let vnode = this.virtualDOM.getVnode(this.containerNode as HTMLElement, data, funcs);
        // let node = this.virtualDOM.vnodeToHtml(vnode);
        let node = this.diff(this.oldVnode, vnode);
        console.log('vnode:', vnode);
        console.log('node:', node);

        $(container).html('');
        for (const child of [ ...node.childNodes ]) {
            container.append(child);
        }
        this.render(container);

        // 原始DOM实现
        // let node = this.parserElementService.parseElement(container, data, funcs);
        // await this.render(node);
    }

    private diffProps(oldVnode: IMingleVnode, vnode: IMingleVnode) {
        let oldProps = oldVnode.data || {};
        let newProps = vnode.data || {};
        let el = vnode.el;

        for (const key in newProps) {
            if (!newProps.hasOwnProperty(key)) {
                continue;
            }

            //如果新的节点里有这个属性
            if (key in newProps) {
                let oldValue = oldProps[key];
                let newValue = newProps[key];

                if (oldValue !== newValue) {
                    //  并且新老节点属性不相等，则更新属性
                    el.setAttribute(key, newProps[key]);
                    vnode.isChanged = true;
                }
            } else {
                el.removeAttribute(key);
                vnode.isChanged = true;
            }

        }

    }

    private diffChildren(oldVnode: IMingleVnode, vnode: IMingleVnode) {
        let oldChildren = oldVnode.children;
        let newChildren = vnode.children;

        for (let i = 0; i < newChildren.length; i++) {
            let newCh = newChildren[i];
            let oldCh = oldChildren[i];
            let el = newCh.el;
            // 节点
            if (newCh.value === null) {

                if (oldCh) {

                    if (oldCh.value === null) {
                        //    都是节点的情况下
                        console.log('都是更新节点的情况下');

                        if (newCh.children.length === oldCh.children.length) {
                            console.log('节点长度都一样的情况');
                            // vnode.isChanged = true;

                        } else {

                            console.log('长度不一样，判断是否需要更新或者移动');

                        }


                    } else {
                        console.log('字符串变成节点');
                        el.textContent = '';
                        vnode.isChanged = true;
                        // 创建新的节点并,追加到children
                    }
                } else {
                    console.log('老节点没有，然后出现新节点');
                }

                // 文本
            } else {
                if (typeof oldCh.value === 'string') {
                    if (oldCh.value !== newCh.value) {
                        el.textContent = newCh.value;
                        vnode.isChanged = true;
                        console.log('字符串变成字符串');
                    }
                } else {
                    //    节点变成字符串
                    el.textContent = newCh.value;
                    vnode.isChanged = true;
                }
            }


        }

        for (const newChild of newChildren) {


        }

    }

    private diff(oldVnode: IMingleVnode, vnode: IMingleVnode) {
        let dom;

        // 虚拟DOM
        if (oldVnode) {
            if (oldVnode.tag === vnode.tag) {
                // 属性更新
                this.diffProps(oldVnode, vnode);
                this.diffChildren(oldVnode, vnode);

                // dom = this.virtualDOM.vnodeToHtml(vnode);
            } else {
                // dom = this.virtualDOM.vnodeToHtml(vnode);
            }

            // 真实DOM
        } else {
            // dom = this.virtualDOM.vnodeToHtml(vnode);
        }
        dom = this.virtualDOM.vnodeToHtml(vnode);
        this.oldVnode = vnode;
        return dom;
    }

    private async run(options) {
        let { el, data, created, methods, mounted } = options;

        let container = document.querySelector(el) as HTMLElement;
        this.containerNode = container.cloneNode(true);     // 缓存节点模版

        let o = Object.assign(data, methods, this);
        let proxyData = new ProxyData(o, () => {
            this.renderView(container, data, methods, proxyData);
            console.log('update');
        });

        await created?.call(proxyData);     // 很有可能会修改到 data里面的数据,所以等 created 执行完后才解析模版

        await this.renderView(container, data, methods, proxyData);

        await mounted?.call(proxyData);


    }
}


