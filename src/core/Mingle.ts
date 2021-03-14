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
import { MVVM } from '@src/core/MVVM';

interface IMingleOptions {
    el: string
    data?: object
    created?: (...args) => any
    methods?: {
        [key: string]: (...args: any) => any
    }
    mounted?: (...args) => any
}

/**
 * 判断vnode 是否是元素节点
 * @param vnode
 */
function isElem(vnode: IMingleVnode): boolean {
    return vnode.value === null;
}

/**
 * 判断vnode 是否是文本节点
 * @param vnode
 */
function isText(vnode: IMingleVnode): boolean {
    return typeof vnode.value === 'undefined';
}

export class Mingle {

    @Inject private readonly parserElementService: ParserElementService;
    @Inject private readonly httpClientService: HttpClientService;
    @Inject private readonly virtualDOM: VirtualDOM;
    @Inject private readonly mvvm: MVVM;
    private oldVnode;

    private containerNode;

    constructor(options: IMingleOptions) {

        let defaultOptions = {
            el  : 'body',
            data: {},
            created() {
                // console.log('数据已经收集，页面还未生成');
            },
            mounted() {
                // console.log('组件挂载完毕');
            },
            updated() {
                // console.log('组件更新');
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
        new App(node);
    }

    async renderView(container, data, methods, proxyData) {
        let funcs = { methods: methods, callthis: proxyData };

        // 虚拟DOM实现
        let vnode: IMingleVnode = this.virtualDOM.getVnode(this.containerNode as HTMLElement, data, funcs);
        let node = this.virtualDOM.vnodeToHtml(vnode);
        $(container).html('');
        for (const child of [...node.childNodes]) {
            container.append(child);
        }
        this.render(container);

        // if (this.oldVnode) {
        //     this.mvvm.patch(this.oldVnode, vnode);
        // } else {
        //     let node = this.virtualDOM.vnodeToHtml(vnode);
        //     $(container).html('');
        //     for (const child of [...node.childNodes]) {
        //         container.append(child);
        //     }
        //     this.render(container);
        // }

        // this.oldVnode = vnode;
        // vnode = this.mvvm.patch2(this.oldVnode, vnode);
        // let node = this.virtualDOM.vnodeToHtml(vnode);

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
                    console.log('props => props');
                }
            } else {
                el.removeAttribute(key);
                vnode.isChanged = true;
                console.log('props => 空 ');
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
            if (isElem(newCh)) {
                if (oldCh) {
                    if (isElem(oldCh)) {
                        //    都是节点的情况下
                        // console.log('el => el');

                        if (newCh.children.length === oldCh.children.length) {
                            console.log('el.length === el.length');
                            // vnode.isChanged = true;
                        } else {
                            console.log('el.length !== el.length');
                            // console.log('长度不一样，判断是否需要更新或者移动');
                        }
                    }

                    if (isText(oldCh)) {
                        console.log('text => el');
                        el.textContent = '';
                        vnode.isChanged = true;
                        // 创建新的节点并,追加到children
                    }
                } else {
                    console.log(' 空 => el');
                }
            }

            // 文本
            if (isText(newCh)) {

                if (isElem(oldCh)) {
                    //    节点变成字符串
                    el.textContent = newCh.value;
                    vnode.isChanged = true;
                    console.log('el => text');
                }

                if (isText(oldCh)) {
                    if (oldCh.value !== newCh.value) {
                        el.textContent = newCh.value;
                        vnode.isChanged = true;
                        console.log('text => text');
                    }
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
        let { el, data, created, methods, mounted, updated } = options;

        let container = document.querySelector(el) as HTMLElement;
        this.containerNode = container.cloneNode(true);     // 缓存节点模版

        let o = Object.assign(data, methods, this);
        let proxyData = new ProxyData(o, () => {
            this.renderView(container, data, methods, proxyData);
            updated?.();
        });

        await created?.call(proxyData);     // 很有可能会修改到 data里面的数据,所以等 created 执行完后才解析模版

        await this.renderView(container, data, methods, proxyData);

        await mounted?.call(proxyData);


    }
}


