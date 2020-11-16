import React, { ReactInstance } from 'react';
import ReactDOM from 'react-dom';
import { loadModules } from '@src/core/base';
import { parserAttrs, parserProperty } from '@utils/parser-property';
import $ from 'jquery';
import { ConfigProvider, message } from 'antd';
import { deepEachElement } from '@utils/util';
import { isFunc } from '@utils/inspect';
import { globalComponentConfig, IComponentConfig } from '@root/config/component.config';
import * as antdIcons from '@ant-design/icons';

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
        value?: any
    }
}

interface IModules {
    // { element, Component, container, elChildren }
    element: HTMLElement            //  调用组件的元素，拥有data-fn属性的
    elChildren: Array<HTMLElement>  //  组件被渲染之前，@element 中的模版中的子节点(只存在于容器元素中/如非input)
    elChildNodes: any | Array<HTMLElement | Node>
    Component: any                  //  被调用的组件
    container: HTMLElement          //  组件渲染的React容器
    containerWrap: HTMLElement      //  组件根容器
    hooks: object                   //  钩子
    componentMethod: string         //  组件方法
    defaultProperty: IModuleProperty         //  组件默认值
    config: IComponentConfig        // 组件配置
    componentUID: string            // 组件uid
}

interface IAttributes extends NamedNodeMap {
    style?: any | string

    [key: string]: any
}

interface W extends Window {
    // [key: string]: any
}

interface IInstances {
    module: IModules
    instance: ReactInstance
}

export type PropertyType = 'dataset' | 'attribute';

// 组件生命周期
enum Hooks {
    load = 'load',
    beforeLoad = 'before-load',
    update = 'update',
    beforeUpdate = 'before-update'
}

export default class App {
    modules: Array<IModules> = [];
    private instances = {};      // 组件实例
    $tempContainer: any;

    constructor(rootElement: HTMLElement/*private readonly elements: Array<HTMLElement>*/) {

        this.$tempContainer = $(`<div data-template-element></div>`);
        if ($(`[data-template-element]`).length === 0) {
            $('body').append(this.$tempContainer);
        }

        try {
            this.init(rootElement).then(r => {
            });
        } catch (e) {
            console.error(e);
        }
    }

    async init(rootElement: HTMLElement) {
        this.renderIcons(rootElement);
        deepEachElement(rootElement, async (element) => {
            let attributes = element.attributes;
            if (attributes['data-fn']) {
                let container: HTMLElement, containerWrap: HTMLElement;

                // 处理组件容器
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
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

                    // TODO 设置组件唯一ID
                    let componentUID = App.getUUID();
                    containerWrap.setAttribute('data-component-uid', componentUID);

                    for (const componentName of componentNames.split(' ')) {

                        if (componentName.startsWith('self-')) {
                            console.error(`${ componentName } 模块不属于MingleJS`);
                        } else {

                            let keysArr = componentName.split('-');
                            // TODO 例如: `<div data-fn="layout-window-open"></div>` 调用到 LayoutWindow实例的open方法
                            let [ , , componentMethod ] = keysArr;

                            const Modules = await loadModules(keysArr);
                            const Component = Modules.component.default;            // React组件
                            const config = Modules.config;

                            let defaultProperty = Modules.property;
                            let el = element.cloneNode(true);
                            let elChildNodes = el.childNodes;

                            // TODO 组件内的render是异步渲染的,所以需要在执行render之前获取到DOM子节点
                            let elChildren: Array<HTMLElement | any> = [];

                            elChildren = Array.from(element.children ?? []);
                            elChildren.pop();       // 去掉自己本身

                            let hooks = this.formatHooks(attributes);

                            let module: IModules = {
                                Component,
                                element,
                                container,
                                containerWrap,
                                elChildren,
                                elChildNodes,
                                hooks,
                                componentMethod,
                                defaultProperty,
                                config,
                                componentUID,
                            };
                            this.modules.push(module);

                            this.renderComponent(module, (hooks) => {
                                hooks[Hooks.beforeLoad]?.();
                            }, (hooks, instance: ReactInstance) => {
                                hooks[Hooks.load]?.();
                                // Array.from(this.$tempContainer.children()).forEach((el: any) => { //     $(element).append(el).show();
                                // });
                            });
                            this.eventListener(module);
                        }
                    }
                }
            }
        });
    }

    static getUUID() { // 获取唯一值
        return 'xxx-xxxx-4xxx-yxxx-xxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    static async parseElementProperty(el: HTMLElement): Promise<object> {
        let componentName = el.getAttribute('data-fn') ?? '';
        let componentModule = await loadModules(componentName.split('-'));
        let defaultProperty = componentModule.property;
        return parserProperty(el.dataset, defaultProperty);
    }

    renderIcons(rootElement: HTMLElement) {
        let elements = [ ...rootElement.querySelectorAll('icon') ] as Array<any>;
        for (const icon of elements) {
            let { type, color, size } = icon.attributes;
            let Icon = antdIcons[type.value];
            if (!Icon) {
                console.warn(`没有${ type.value }这个icon图标`);
                continue;
            }
            ReactDOM.render(<Icon style={ { color: color?.value, fontSize: size?.value + 'px' } }/>, icon);
        }
    }

    formatHooks(attributes: IAttributes): object {
        let hooks: { [key: string]: any } = {};
        Array.from(attributes).forEach(({ name, value: fnName }: { name: string, value: string }) => {
            let [ , hookName ] = name.split('@');
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

    dynamicReloadComponents(element: HTMLInputElement) {
        // TODO input调用的元素,外层才是 [data-component-uid]
        let $formItems = $(element).closest('form').find('[data-fn][name]');
        [ ...$formItems ].forEach(formItem => {
            let dataset = formItem.dataset;
            let $formItemBox = $(formItem).parent('[data-component-uid]');
            let uid = $formItemBox.attr('data-component-uid') ?? '';

            for (const key in dataset) {
                if (!dataset.hasOwnProperty(key)) continue;
                let tpl = dataset[key] ?? '';
                let inputName = element.name;
                let regExp = new RegExp(`<{(.*?)${ inputName }(.*?)}>`);
                if (inputName && regExp.test(tpl)) {
                    let { module }: IInstances = this.instances[uid];
                    // https://zh-hans.reactjs.org/docs/react-dom.html#unmountcomponentatnode
                    ReactDOM.unmountComponentAtNode(module.container);  // waring 错误不必理会
                    this.renderComponent(module,
                        hooks => hooks[Hooks.beforeUpdate]?.(),
                        (hooks) => {
                            hooks[Hooks.update]?.();
                            // this.dynamicReloadComponents(element);
                        },
                    );
                }
            }

        });
    }

    private eventListener(module: IModules) {
        let { element } = module;

        // https://developer.mozilla.org/zh-CN/docs/Web/Events#%E5%8F%82%E8%A7%81

        if (element.tagName === 'INPUT') {

            // TODO onchange用于 ( 统一处理 ) 监听到自身值修改后,重新去渲染模版 <{}> 确保组件中每次都拿到的是最新的解析过的模版
            $(element).on('change', (e) => {
                message.success(`onchange - value:${ $(element).val() }`);

                // 组件发生改变的时候重新出发组件渲染，达到值的改变
                this.renderComponent(module, hooks => {
                    hooks[Hooks.beforeUpdate]?.();
                }, (hooks, instance: ReactInstance /*获取到的组件实例*/) => {
                    hooks[Hooks.update]?.();
                    this.dynamicReloadComponents(element as HTMLInputElement);
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

    private renderComponent(module: IModules, beforeCallback: (h) => any, callback: (h, instance: ReactInstance) => any) {
        let {
            element, defaultProperty, Component, container, elChildren, containerWrap, hooks, componentMethod,
            elChildNodes,
            config, componentUID,
        } = module;
        let { dataset: defaultDataset, hook, ...defaultAttrs } = defaultProperty;

        // 处理 data-* 属性
        let dataset = (element as (HTMLInputElement | HTMLDivElement)).dataset;
        let parsedDataset = parserProperty(dataset, defaultDataset ?? {});

        // 普通属性
        let attrs = {};     // key value
        [ ...element.attributes ].forEach(item => {
            if (!item.name.includes('data-')) attrs[item.name] = item.value;
        });
        let parsedAttrs = parserAttrs(attrs, defaultAttrs, parsedDataset);

        let instance: any = null;
        let props = {
            el        : element,
            elChildren: elChildren ?? [],
            elChildNodes,
            box       : containerWrap,
            dataset   : parsedDataset,
            ...parsedAttrs,
            ref       : componentInstance => {        // 组件实例
                componentMethod && componentInstance[componentMethod]();
                instance = componentInstance;
                this.instances[componentUID] = {
                    instance: componentInstance, module,
                };
                return componentInstance;
            },
        };

        // 处理 value 属性
        let defaultValue = typeof defaultProperty?.value?.value === 'function'
            ? defaultProperty.value.value(config)
            : defaultProperty?.value?.value ?? '';
        // TODO 因为input的value默认为 ""(页面上不写value值也是"") , 所以这里不能使用 '??' 操作符,否则无法获取到 defaultValue
        let value = element['value'] || defaultValue;

        // 触发 beforeLoad 钩子
        beforeCallback(hooks);

        // 组件渲染
        try {
            // 组件名必须大写
            ReactDOM.render(
                <ConfigProvider { ...globalComponentConfig } >
                    <Component { ...props } value={ value }/>
                </ConfigProvider>
                , container, () => callback(hooks, instance),
            );
        } catch (e) {
            console.error(e);
        }
    }

}


