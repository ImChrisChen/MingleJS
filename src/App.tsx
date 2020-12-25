import React, { ReactInstance } from 'react';
import ReactDOM from 'react-dom';
import { loadModules } from '@src/core/base';
import { parserAttrs, parserDataset } from '@utils/parser-property';
import $ from 'jquery';
import { ConfigProvider, message } from 'antd';
import { deepEachElement } from '@utils/util';
import { isArray, isFunc, isUndefined } from '@utils/inspect';
import { globalComponentConfig, IComponentConfig } from '@root/config/component.config';
import * as antdIcons from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import { elementWrap } from '@utils/parser-dom';
import { trigger } from '@utils/trigger';
import { Hooks } from '@root/config/directive.config';

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
    // elChildNodes: any | Array<HTMLElement | Node>
    Component: any                  //  被调用的组件
    container: HTMLElement          //  组件渲染的React容器
    containerWrap: HTMLElement      //  组件根容器
    hooks: object                   //  钩子
    componentMethod: string         //  组件方法
    defaultProperty: IModuleProperty         //  组件默认值
    config: IComponentConfig        // 组件配置
    componentUID: string            // 组件uid
    beforeElement: HTMLElement
}

interface IAttributes extends NamedNodeMap {
    style?: any | string

    [key: string]: any
}

interface W extends Window {
    // [key: string]: any
}

interface IInstances {
    module?: IModules
    instance?: ReactInstance
}

export default class App {
    modules: Array<IModules> = [];
    static instances: IInstances = {};      // 组件实例
    $tempContainer: any;

    constructor(root: HTMLElement | Array<HTMLElement>, private readonly force: boolean = false) {
        if (!root) return;
        let rootElement: HTMLElement = isArray(root) ? elementWrap(root) : root;

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
        deepEachElement(rootElement, async (element, parentNode) => {
            let beforeElement = element.cloneNode(true) as HTMLElement;
            let elChildren: Array<HTMLElement | any> = Array.from(element.children ?? []);

            let attributes = element.attributes;
            if (attributes['data-fn']) {

                // if (!this.force && (parentNode?.attributes?.['data-fn']?.value === 'data-panel')) {
                if (!this.force
                    && $(element).closest('[data-fn=data-panel]').length > 0
                    && attributes['data-fn'].value !== 'data-panel'
                ) {

                    console.warn('上一个是data-panel,当前元素不解析', element);

                } else {

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

                        if (!containerWrap.getAttribute('data-component-uid')) {


                            // TODO 设置组件唯一ID
                            let componentUID = App.getUUID();
                            containerWrap.setAttribute('data-component-uid', componentUID);

                            for (const componentName of componentNames.split(' ')) {

                                if (componentName.startsWith('self-')) {
                                    console.error(`${ componentName } 模块不属于MingleJS`);
                                } else {

                                    let keysArr = componentName.trim().split('-');
                                    // TODO 例如: `<div data-fn="layout-window-open"></div>` 调用到 LayoutWindow实例的open方法
                                    let [ , , componentMethod ] = keysArr;

                                    const Modules = await loadModules(keysArr);
                                    const Component = Modules.component.default;            // React组件
                                    const config = Modules.config;

                                    let defaultProperty = Modules.property;

                                    // TODO 组件内的render是异步渲染的,所以需要在执行render之前获取到DOM子节点
                                    // let elChildren: Array<HTMLElement | any> = [];

                                    let hooks = this.formatHooks(attributes);

                                    let module: IModules = {
                                        Component,
                                        element,
                                        beforeElement,
                                        container,
                                        containerWrap,
                                        elChildren,
                                        hooks,
                                        componentMethod,
                                        defaultProperty,
                                        config,
                                        componentUID,
                                    };
                                    this.modules.push(module);

                                    this.renderComponent(module, (hooks, instance) => {
                                        hooks[Hooks.beforeLoad]?.(instance);
                                    }, (hooks, instance) => {
                                        hooks[Hooks.load]?.(instance);
                                        element.style.opacity = '1';
                                    });
                                    this.eventListener(module);
                                }
                            }
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

    // 通过 Element 获取到组件解析后的 dataset 属性
    static async parseElementProperty(el: HTMLElement): Promise<any> {
        let componentName = el.getAttribute('data-fn') ?? '';
        let componentModule = await loadModules(componentName.split('-'));
        let defaultProperty = componentModule.property;
        let { dataset, hook, ...attrs } = defaultProperty;     // default

        // dataset
        let parsedDataset = parserDataset(el.dataset, dataset);

        // 普通属性
        let elAttrs = {};     // key value
        [ ...el.attributes ].forEach(item => {
            if (!item.name.includes('data-')) attrs[item.name] = item.value;
        });
        let parsedAttrs = parserAttrs(elAttrs, attrs, parsedDataset);

        // 处理 value 属性
        let defaultValue = typeof defaultProperty?.value?.value === 'function'
            ? defaultProperty.value.value(parsedDataset)
            : defaultProperty?.value?.value ?? '';

        // TODO 因为input的value默认为 ""(页面上不写value值也是"") , 所以这里不能使用 '??' 操作符,否则无法获取到 defaultValue
        parsedAttrs.value = el['value'] || defaultValue;

        return {
            dataset: { ...parsedDataset },
            ...parsedAttrs,
        };
    }

    // 通过 Element 获取到组件解析后的 普通 属性
    static async parseElementAttrs() {

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
            // @ts-ignore
            let hook = Object.values(Hooks).includes(name);
            if (hook) {
                if (name && isFunc((window as W)[fnName])) {
                    hooks[name] = (window as W)[fnName];
                }
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

    // 重载组件
    dynamicReloadComponents(element: HTMLInputElement) {
        // TODO input调用的元素,外层才是 [data-component-uid]
        let $formItems = $(element).closest('form').find('[data-fn][name]');

        [ ...$formItems ].forEach(formItem => {
            let dataset = formItem.dataset;
            let $formItemBox = $(formItem).parent('[data-component-uid]');
            let uid = $formItemBox.attr('data-component-uid') ?? '';
            let selfInputName = element.name;
            let regExp = new RegExp(`<{(.*?)${ selfInputName }(.*?)}>`);
            let { module } = App.instances[uid];

            for (const key in dataset) {
                if (!dataset.hasOwnProperty(key)) continue;
                let value = dataset[key] ?? '';

                // 只有和模版关联的input框组件才会重载
                if (regExp.test(value)) {
                    // https://zh-hans.reactjs.org/docs/react-dom.html#unmountcomponentatnode

                    ReactDOM.unmountComponentAtNode(module.container);  // waring 错误不必理会
                    (module.element as HTMLInputElement).value = '';
                    setTimeout(() => {
                        this.renderComponent(module,
                            (hooks, instance) => hooks[Hooks.beforeUpdate]?.(instance),
                            (hooks, instance) => {
                                hooks[Hooks.update]?.(instance);
                            },
                        );
                    });
                    break;
                }
            }
        });
    }

    eventListener(module: IModules) {
        let { element } = module;

        // https://developer.mozilla.org/zh-CN/docs/Web/Events#%E5%8F%82%E8%A7%81

        if (element.tagName === 'INPUT') {

            // TODO onchange用于 ( 统一处理 ) 监听到自身值修改后,重新去渲染模版 <{}> 确保组件中每次都拿到的是最新的解析过的模版
            $(element).on('change', (e) => {
                // message.success(`onchange - value:${ $(element).val() }`);
                console.log(`onchange - value:${ $(element).val() }`);

                // 组件发生改变的时候重新出发组件渲染，达到值的改变
                this.renderComponent(module, (hooks, instance) => {
                    hooks[Hooks.beforeUpdate]?.(instance);
                }, (hooks, instance: ReactInstance /*获取到的组件实例*/) => {
                    hooks[Hooks.update]?.(instance);
                    this.dynamicReloadComponents(element as HTMLInputElement);

                    let exec = element.dataset.exec;
                    if (!isUndefined(exec)) {
                        // TODO 简陋的实现，后续待调整
                        let formElement = $(element).closest('form[data-fn=form-action]');
                        let submitBtn = formElement.find('[type=submit]');
                        if (submitBtn.length > 0) {
                            submitBtn.click();
                        } else {
                            formElement.append(`<button type="submit" style="display: none;"/>`).find('[type=submit]').click();
                        }
                    }

                    let groupname = element.getAttribute('data-group');
                    let formElement = $(element).closest('form[data-fn]');
                    let groups = [ ...formElement.find(`input[data-fn][data-group=${ groupname }]`) ];
                    groups.forEach(el => {
                        if (el !== element) {
                            console.log(el);
                        }
                    });
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

    static async globalEventListener() {

        // 判断是否是深色模式
        const darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');

        // 判断是否匹配深色模式
        if (darkMode && darkMode.matches) {
            console.log('深色模式');
        }

        // 监听主题切换事件
        darkMode && darkMode.addEventListener('change', e => {
            // e.matches true 深色模式
            let darkMode = e.matches;
            message.success(`系统颜色发生了变化，当前系统色为 ${ darkMode ? '深色🌙' : '浅色☀️' }`);
        });

        window.addEventListener('error', async function (e) {
            let msg = e?.message ?? '';        // 错误
            let stack = e?.error?.stack ?? '';
            let date = moment().format('YYYY-MM-DD/HH:mm:ss');
            let url = window.location.href;
            let log = { message: msg, stack, date, url };

            let error_log: string = localStorage.getItem('error_log') || '';

            if (error_log) {
                let logs: Array<object> = JSON.parse(error_log);
                logs.unshift(log);
                localStorage.setItem('error_log', JSON.stringify(logs));
            } else {
                localStorage.setItem('error_log', JSON.stringify([ log ]));
            }
            await axios.post('/server/log', log);
            message.error(`error, ${ msg }`);
        });

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

    renderComponent(module: IModules, beforeCallback: (h, instance: ReactInstance) => any, callback: (h, instance: ReactInstance) => any) {
        let {
            element, defaultProperty, Component, container, elChildren, containerWrap, hooks, componentMethod,
            config, componentUID, beforeElement,
        } = module;

        let { dataset: defaultDataset, hook, ...defaultAttrs } = defaultProperty;

        // 处理 data-* 属性
        let dataset = (element as (HTMLInputElement | HTMLDivElement)).dataset;
        let parsedDataset = parserDataset(dataset, defaultDataset ?? {});

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
            beforeElement,
            box       : containerWrap,
            dataset   : parsedDataset,
            ...parsedAttrs,
            ref       : componentInstance => {        // 组件实例
                componentMethod && componentInstance[componentMethod]();
                instance = componentInstance;
                App.instances[componentUID] = {
                    instance: componentInstance, module,
                };
                return componentInstance;
            },
        };

        // 处理 value 属性
        let defaultValue = typeof defaultProperty?.value?.value === 'function'
            ? defaultProperty.value.value(parsedDataset)
            : defaultProperty?.value?.value ?? '';
        // TODO 因为input的value默认为 ""(页面上不写value值也是"") , 所以这里不能使用 '??' 操作符,否则无法获取到 defaultValue
        let value = element['value'] || defaultValue;

        // TODO 如果值不相等，说明使用了默认值，这时要改变到 input element 的value,只有 form表单元素才会触发
        // TODO 值不相等时，才触发trigger ，重新渲染
        if (!isUndefined(element['value']) && value !== element['value']) {
            trigger(element, value);
        }

        // 触发 beforeLoad 钩子
        beforeCallback(hooks, instance);

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


