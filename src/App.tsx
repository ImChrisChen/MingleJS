import React from 'react';
import { render } from 'react-dom';
import { loadModules } from '@utils/relation-map';
import { parseDataAttr } from '@utils/parse-data-attr';
import $ from 'jquery';
import { message } from 'antd';
import { DeepEachElement, isFunc } from '@utils/util';
import { parseLineStyle, parseTpl } from '@utils/tpl-parse';

// typescript 感叹号(!) 如果为空，会丢出断言失败。
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#strict-class-initialization

interface IModuleProperty {
    dataset: object | any
    hook: {
        load?: object
        beforeLoad?: object
        update?: object
        beforeUpdate?: object
    }
    value: {
        el: string
        options?: Array<{ label: string, value: any }>
        label?: string
        value: string
    }
}

interface IModules {
    // { element, Component, container, elChildren }
    element: HTMLElement            //  调用组件的元素，拥有data-fn属性的
    elChildren: Array<HTMLElement>  //  组件被渲染之前，@element 中的模版中的子节点(只存在于容器元素中/如非input)
    Component: any                  //  被调用的组件
    container: HTMLElement          //  组件渲染的React容器
    containerWrap: HTMLElement      //  组件根容器
    hooks: object                   //  钩子
    style: string                   //  行内样式
    componentMethod: string         //  组件方法
    defaultProperty: IModuleProperty         //  组件默认值
}

interface IAttributes extends NamedNodeMap {
    style?: any | string

    [key: string]: any
}

interface W extends Window {
    // [key: string]: any
}

// 组件生命周期
enum Hooks {
    load = 'load',
    beforeLoad = 'beforeLoad',
    update = 'update',
    beforeUpdate = 'beforeUpdate'
}

export default class App {
    private modules: Array<IModules> = [];
    $tempContainer: any;

    constructor(elementContainer/*private readonly elements: Array<HTMLElement>*/) {
        this.$tempContainer = $(`<div role="mingle-component-working-temp"></div>`);
        if ($(`[role="mingle-component-working-temp"]`).length === 0) {
            $('body').append(this.$tempContainer);
        }
        this.init(elementContainer).then(() => {
            // this.globalEventListener();
        });
    }

    async init(elementContainer) {
        DeepEachElement(elementContainer, async element => {
            if (element.attributes['data-fn']) {
                let container: HTMLElement, containerWrap: HTMLElement;
                let attributes = element.attributes;

                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    // element.setAttribute('type', 'hidden');

                    let elementWrap: HTMLElement = document.createElement('div');
                    container = document.createElement('div');
                    element.after(elementWrap);
                    elementWrap.appendChild(element);
                    elementWrap.appendChild(container);
                    containerWrap = elementWrap;

                } else {
                    let reactContainer: HTMLElement = document.createElement('div');
                    element.appendChild(reactContainer);
                    container = reactContainer;

                    containerWrap = element;
                }

                let componentNames: string = element.getAttribute('data-fn') ?? '';

                if (componentNames) {

                    containerWrap.setAttribute('data-component-container', componentNames);

                    for (const componentName of componentNames.split(' ')) {

                        if (componentName.startsWith('self-')) {
                            console.error(`${ componentName } 模块不属于MingleJS`);
                        } else {

                            let keysArr = componentName.split('-');
                            let componentMethod: string = '';
                            if (keysArr.length === 3) {
                                componentMethod = keysArr.pop() as string;
                            }

                            const Modules = await loadModules(keysArr);
                            const Component = Modules.component.default;
                            let defaultProperty = Modules.property;

                            // TODO 组件内的render是异步渲染的,所以需要在执行render之前获取到DOM子节点
                            let elChildren: Array<HTMLElement | any> = [];

                            if (element.children.length !== 0) { // 有子节点的时候克隆当前父节点(然后获取到子节点)
                                // elChildren = Array.from(element.cloneNode(true)?.['children'] ?? []);
                                elChildren = Array.from(element.children ?? []);
                                elChildren.pop();       // 去掉自己本身

                                elChildren.forEach(el => {
                                    // this.$tempContainer.append(el).hide();
                                });
                            }

                            let hooks = this.formatHooks(attributes);
                            let style = this.formatInLineStyle(attributes);
                            let module: IModules = {
                                style,
                                Component,
                                element,
                                container,
                                containerWrap,
                                elChildren,
                                hooks,
                                componentMethod,
                                defaultProperty,
                            };
                            this.modules.push(module);

                            this.renderComponent(module, (hooks) => {
                                // console.log('-----------beforeLoad');
                                hooks['beforeLoad']?.();
                            }, (hooks) => {
                                // console.log('--------------load');
                                hooks['load']?.();
                                Array.from(this.$tempContainer.children()).forEach((el: any) => {
                                    // $(element).append(el).show();
                                });

                            });
                            this.eventListener(module);
                        }
                    }
                }
            }
        });
    }

    // 模版渲染
    formatInnerHTML(el: HTMLElement, model): string {
        let innerHTML = el.innerHTML;
        return parseTpl(innerHTML);
    }

    formatHooks(attributes: IAttributes): object {
        let hooks: { [key: string]: any } = {};
        Array.from(attributes).forEach(({ name, value: fnName }: { name: string, value: string }) => {
            let [ , hookName ] = name.split('hook:');
            if (hookName && isFunc((window as W)[fnName])) {
                hooks[hookName] = (window as W)[fnName];
            }
        });
        return hooks;
    }

    formatInLineStyle(attributes: IAttributes): string {
        if (attributes['style']) {
            let { _, value } = attributes['style'];
            return value;
        }
        return '';
    }

    async render() {
        this.modules.forEach(module => {
            // 组件初始化
            this.renderComponent(module, function (hooks) {
                // console.log('-----------beforeLoad');
                hooks['beforeLoad']?.();
            }, function (hooks) {
                // console.log('--------------load');
                hooks['load']?.();
            });
            this.eventListener(module);
        });
    }

    private eventListener(module: IModules) {
        let { element } = module;

        // https://developer.mozilla.org/zh-CN/docs/Web/Events#%E5%8F%82%E8%A7%81

        if (element.tagName === 'INPUT') {

            // TODO onchange用于 ( 统一处理 ) 监听到自身值修改后,重新去渲染模版 <{}> 确保组件中每次都拿到的是最新的解析过的模版
            $(element).on('change', (e) => {
                this.renderComponent(module, function (hooks) {
                    // console.log('-----------------beforeUpdate');
                    hooks['beforeUpdate']?.();
                }, function (hooks) {
                    // console.log('---------------update');
                    hooks['update']?.();
                });
            });
        }

        // element.addEventListener('DOMNodeInserted', function () {
        //     console.log('DOMNodeInserted');
        //
        // });
        //
        // element.addEventListener('DOMNodeRemoved', function () {
        //     console.log('DOMNodeRemoved');
        //
        // });
        //
        // element.addEventListener('DOMNodeRemoved', function () {
        //     console.log('DOMNodeRemoved');
        //
        // });
        //
        // element.addEventListener('DOMAttrModified', function () {
        //     console.log('DOMAttrModified');
        //
        // });
        //
        // element.addEventListener('DOMAttributeNameChanged', function () {
        //     console.log('DOMAttributeNameChanged');
        //
        // });
        //
        // element.addEventListener('DOMElementNameChanged ', function () {
        //     console.log('DOMElementNameChanged');
        //
        // });
        //
        // element.addEventListener('DOMSubtreeModified', function () {
        //     console.log('DOMSubtreeModified');
        //
        // });

        // 文本节点发生变化时
        // element.addEventListener('DOMCharacterDataModified', function () {
        //
        // });

    }

    static globalEventListener() {

        window.addEventListener('online', function () {
            message.success('浏览器已获得网络链接');
        });

        window.addEventListener('offline', function () {
            message.error('浏览器失去网络链接');
        });

        window.addEventListener('copy', function () {
            message.success('复制成功');
        });

        window.addEventListener('cut', function (event) {
            message.success('剪切成功');
        });
    }

    private renderComponent(module: IModules, beforeCallback: (h) => any, callback: (h) => any) {
        let { element, defaultProperty, Component, container, elChildren, containerWrap, hooks, style, componentMethod } = module;
        let dataset = (element as (HTMLInputElement | HTMLDivElement)).dataset;
        beforeCallback(hooks);
        let jsxStyle = parseLineStyle(style);
        let parsedDataset = parseDataAttr(dataset, defaultProperty?.dataset ?? {});

        // 组件名必须大写
        render(<Component
                el={ element }
                elChildren={ elChildren }
                box={ containerWrap }
                style={ jsxStyle }
                dataset={ parsedDataset }
                value={ element['value'] }
                role="mingle-component"
                ref={ componentInstance => {        // 组件实例
                    componentMethod && componentInstance[componentMethod]();
                    return componentInstance;
                } }
            />, container, () => callback(hooks),
        );


    }

}

