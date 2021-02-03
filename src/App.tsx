import React, { ReactInstance } from 'react';
import ReactDOM from 'react-dom';
import { loadModules } from '@src/core/base';
import { parserAttrs, parserDataset } from '@utils/parser-property';
import $ from 'jquery';
import { message } from 'antd';
import { deepEachElement } from '@utils/util';
import { isArray, isCustomElement, isFunc, isUndefined } from '@utils/inspect';
import { IComponentConfig } from '@root/config/component.config';
import * as antdIcons from '@ant-design/icons';
import { elementWrap } from '@utils/parser-dom';
import { trigger } from '@utils/trigger';
import { Hooks } from '@root/config/directive.config';
import { Monitor } from '@services/Monitor';

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
    elChildren?: Array<HTMLElement>  //  组件被渲染之前，@element 中的模版中的子节点(只存在于容器元素中/如非input)
    Component: any                  //  被调用的组件
    container?: HTMLElement          //  组件渲染的React容器
    // containerWrap: HTMLElement      //  组件根容器
    templates?: object
    hooks: object                   //  钩子
    // componentMethod: string         //  组件方法
    defaultProperty: IModuleProperty         //  组件默认值
    config: IComponentConfig        // 组件配置
    componentUID: string            // 组件uid
}

interface IAttributes extends NamedNodeMap {
    style?: any | string

    [key: string]: any
}

interface IInstances {
    module?: IModules
    instance?: ReactInstance
}

type ITemplateName = 'children' | '';

export default class App {

    public static instances: IInstances = {};      // 组件实例
    public static registerComponents: Array<string> = [];         // 注册过的自定义组件

    constructor(root: HTMLElement | Array<HTMLElement>, private readonly force: boolean = false) {

        if (!root) return;

        let rootElement: HTMLElement = isArray(root) ? elementWrap(root) : root;

        try {
            this.init2(rootElement).then(r => r);
        } catch (e) {
            console.error(e);
        }
    }

    // web-components
    async init2(rootElement: HTMLElement) {

        App.renderIcons(rootElement);
        deepEachElement(rootElement, async (element) => {
            let { tagName } = element;
            tagName = tagName.toLowerCase();
            if (!isCustomElement(tagName)) {
                return;
            }

            if (App.registerComponents.includes(tagName)) {
                // console.log('有注册过', App.registerComponents, tagName);
                return;
            }

            window.customElements.define(tagName, class extends HTMLElement {
                constructor() {
                    super();
                    App.renderCustomElement(this);
                }

            });

            App.registerComponents.push(tagName);
        });
        App.errorVerify();

    }

    // div data-fn
    async init(rootElement: HTMLElement) {
        App.renderIcons(rootElement);
        deepEachElement(rootElement, async (element, parentNode) => {

            let attributes = element.attributes;

            if (!attributes['data-fn']) {
                return;
            }

            // form-group 元素不解析
            if (!this.force && $(element).parents('[data-fn=form-group]').length > 0) {
                console.warn('被form-group 包裹，不渲染');
                return;
            }

            if (!this.force && $(element).parents('[data-fn=data-panel]').length > 0 && attributes['data-fn'].value !== 'data-panel') {

                console.warn('上一个是data-panel,当前元素不解析', element);

            } else {

                await App.renderCustomElement1(element);

            }
        });
        App.errorVerify();
    }

    // 渲染组件 <form-select></form-select>
    public static async renderCustomElement(el: HTMLElement) {
        el.hidden = true;

        let { attributes, tagName: componentName } = el;
        componentName = componentName.toLowerCase();
        let tpls = [...el.querySelectorAll('template')];
        let templates = {};

        for (const tpl of tpls) {
            let name = tpl.attributes['name']?.value;
            if (!name) continue;
            templates[name] = tpl;
        }

        // let templates: Array<any> = [];

        // TODO 设置组件唯一ID
        let componentUID = App.getUUID();
        el.setAttribute('data-component-uid', componentUID);

        // 外部模块
        if (componentName.startsWith('self-')) {
            console.error(`${ componentName } 模块不属于MingleJS`);
            return;
        }

        let keysArr = componentName.trim().split('-');
        // TODO 例如: `<div data-fn="layout-window-open"></div>` 调用到 LayoutWindow实例的open方法

        // const [ , , componentMethod ] = keysArr;  // 第三项
        const Modules = await loadModules(keysArr);
        const Component = Modules.component.default;            // React组件
        const config = Modules.config;

        let defaultProperty = Modules.property;

        let hooks = App.formatHooks(attributes);
        let module: IModules = {
            Component,
            element: el,
            templates,
            hooks,
            defaultProperty,
            config,
            componentUID,
        };

        App.renderComponent(module, (hooks, instance) => {
            hooks[Hooks.beforeLoad]?.(instance);
        }, (hooks, instance) => {
            hooks[Hooks.load]?.(instance);
            el.style.opacity = '1';
            el.hidden = false;
        });
        App.eventListener(module);

    }

    // 渲染组件 <input data-fn="form-select"/>
    public static async renderCustomElement1(element: HTMLElement) {

        let attributes = element.attributes;
        let elChildren: Array<HTMLElement | any> = Array.from(element.children ?? []);
        let container: HTMLElement, containerWrap: HTMLElement;
        let componentNames: string = attributes['data-fn']?.value ?? '';        // 组件名称


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

        container.hidden = true;

        // 没有组件名 return 掉
        if (!componentNames) {
            // console.log('没有组件名');
            return;
        }

        // 有uid说明已经被渲染过,不重复渲染，return掉
        if (containerWrap.attributes['data-component-uid']?.value) {
            console.log('有uid说明已经被渲染过,不重复渲染，return掉');
            return;
        }

        // TODO 设置组件唯一ID
        let componentUID = App.getUUID();
        containerWrap.setAttribute('data-component-uid', componentUID);

        for (const componentName of componentNames.split(' ')) {

            // 外部模块
            if (componentName.startsWith('self-')) {
                console.error(`${ componentName } 模块不属于MingleJS`);
                continue;
            }

            let keysArr = componentName.trim().split('-');
            // TODO 例如: `<div data-fn="layout-window-open"></div>` 调用到 LayoutWindow实例的open方法

            const [, , componentMethod] = keysArr;  // 第三项
            const Modules = await loadModules(keysArr);
            const Component = Modules.component.default;            // React组件
            const config = Modules.config;

            let defaultProperty = Modules.property;

            // TODO 组件内的render是异步渲染的,所以需要在执行render之前获取到DOM子节点
            // let elChildren: Array<HTMLElement | any> = [];

            let hooks = App.formatHooks(attributes);
            let module: IModules = {
                Component,
                element,
                container,
                // containerWrap,
                elChildren,
                hooks,
                // componentMethod,
                defaultProperty,
                config,
                componentUID,
            };

            App.renderComponent(module, (hooks, instance) => {
                hooks[Hooks.beforeLoad]?.(instance);
            }, (hooks, instance) => {
                hooks[Hooks.load]?.(instance);
                element.style.opacity = '1';
            });
            App.eventListener(module);
        }

    }

    // 生成组件唯一ID
    public static getUUID() { // 获取唯一值
        return 'xxx-xxxx-4xxx-yxxx-xxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // 根据uid获取组件实例
    public static getInstance(componentUID: string): IInstances {
        return App?.instances?.[componentUID] ?? {};
    }

    // 获取所有组件实例
    public static getInstances(): any {
        return App?.instances ?? {};
    }

    // 通过 Element 获取到组件解析后的所有属性
    public static async parseElementProperty(el: HTMLElement): Promise<any> {
        let componentName = el.getAttribute('data-fn') ?? '';
        let componentModule = await loadModules(componentName.split('-'));
        let defaultProperty = componentModule.property;
        let { dataset, hook, ...attrs } = defaultProperty;     // default

        // dataset
        let parsedDataset = parserDataset(el.dataset, dataset);

        // 普通属性
        let elAttrs = {};     // key value
        [...el.attributes].forEach(item => {
            if (!item.name.includes('data-')) {
                elAttrs[item.name] = item.value;
            }
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

    public static renderIcons(rootElement: HTMLElement) {
        let elements = [...rootElement.querySelectorAll('icon')] as Array<any>;
        for (const icon of elements) {
            console.log(icon);
            let { type, color, size } = icon.attributes;
            let Icon = antdIcons[type.value];
            if (!Icon) {
                console.warn(`没有${ type.value }这个icon图标`);
                continue;
            }
            ReactDOM.render(<Icon style={ { color: color?.value, fontSize: size?.value + 'px' } }/>, icon);
        }
    }

    public static formatHooks(attributes: IAttributes): object {
        let hooks: { [key: string]: any } = {};

        Array.from(attributes).forEach(({ name, value: fnName }: { name: string, value: string }) => {
            // @ts-ignore
            let hook = Object.values(Hooks).includes(name);
            if (hook) {
                if (name && isFunc(window[fnName])) {
                    hooks[name] = window[fnName];
                }
            }
        });
        return hooks;
    }

    // 重载组件(模版联动选择)
    public static dynamicReloadComponents(element: HTMLInputElement) {

        // TODO input调用的元素,外层才是 [data-component-uid]
        let $formItems: Array<HTMLElement> = [];

        // form-group 内的组件，只在组作用域内产生关联关系
        if ($(element).closest('[data-fn=form-group]').length > 0) {
            $formItems = [...$(element).closest('.form-group-item').find('[data-fn][name]')];
        } else {
            $formItems = [...$(element).closest('form').find('[data-fn][name]')];
        }

        $formItems.forEach(formItem => {
            let dataset = formItem.dataset;

            // TODO parent 换成 closest 可以适用于 div form表单元素
            let $formItemBox = $(formItem).closest('[data-component-uid]');
            // console.log($formItemBox);
            let uid = $formItemBox.attr('data-component-uid') ?? '';
            let selfInputName = element.name;
            let regExp = new RegExp(`<{(.*?)${ selfInputName }(.*?)}>`);
            let { module } = App.instances?.[uid];

            if (!module) return;

            for (const key in dataset) {
                if (!dataset.hasOwnProperty(key)) continue;
                let value = dataset[key] ?? '';

                // 只有和模版关联的input框组件才会重载
                if (regExp.test(value)) {
                    // https://zh-hans.reactjs.org/docs/react-dom.html#unmountcomponentatnode

                    console.log(module, uid);
                    ReactDOM.unmountComponentAtNode(module.container);  // waring 错误不必理会
                    (module.element as HTMLInputElement).value = '';
                    setTimeout(() => {
                        App.renderComponent(module,
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

    public static eventListener(module: IModules) {
        let { element } = module;

        // https://developer.mozilla.org/zh-CN/docs/Web/Events#%E5%8F%82%E8%A7%81

        // TODO onchange用于 ( 统一处理 ) 监听到自身值修改后,重新去渲染模版 <{}> 确保组件中每次都拿到的是最新的解析过的模版
        $(element).on('change', (e) => {
            e.preventDefault();
            e.stopImmediatePropagation();
            e.stopPropagation();

            // message.success(`onchange - value:${ $(element).val() }`);
            console.log(`onchange - value:${ $(element).val() }`);

            // 组件发生改变的时候重新出发组件渲染，达到值的改变
            App.renderComponent(module, (hooks, instance) => {
                hooks[Hooks.beforeUpdate]?.(instance);
            }, (hooks, instance: ReactInstance /*获取到的组件实例*/) => {
                hooks[Hooks.update]?.(instance);
                App.dynamicReloadComponents(element as HTMLInputElement);

                let exec = element.dataset.exec;
                // if (!isUndefined(exec)) {
                if (exec === 'true') {
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
                let groups = [...formElement.find(`input[data-fn][data-group=${ groupname }]`)];
                groups.forEach(el => {
                    if (el !== element) {
                        console.log(el);
                    }
                });
            });
        });

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

    public static async globalEventListener() {

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
            console.log(e);
            let msg = e?.message ?? '';        // 错误
            let stack = e?.error?.stack ?? '';
            let filename = e.filename;          // 报错文件名
            let error_col = e.colno;            // 报错行
            let error_line = e.lineno;          // 报错列
            let url = window.location.href;
            let log = {
                message : msg,
                stack,
                page_url: url,
                flag    : 'mingle',
                filename,
                error_line,
                error_col,
            };

            await Monitor.errorLogger(log);
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

    public static errorVerify() {
        let arr: Array<string> = [];
        let repeatName: Array<string> = [];
        let elements = document.querySelectorAll('[name]');
        for (const element of elements) {
            let name = element.getAttribute('name');
            if (name) {
                if (arr.includes(name)) {
                    repeatName.push(name);
                } else {
                    arr.push(name);
                }
            }
        }
        let names = repeatName.filter(t => t).join(',');
        if (names) {
            message.error(`${ names } 的name属性值重复`);
        }
    }

    public static renderComponent(module, beforeCallback: (h, instance: ReactInstance) => any, callback: (h, instance: ReactInstance) => any) {
        let {
            element, defaultProperty, Component, hooks, componentUID,
            templates,
        } = module;

        let { dataset: defaultDataset, hook, ...defaultAttrs } = defaultProperty;

        // 处理 data-* 属性
        let dataset = (element as (HTMLInputElement | HTMLDivElement)).dataset;
        let parsedDataset = parserDataset(dataset, defaultDataset ?? {});

        // 普通属性
        let attrs = {};     // key value
        [...element.attributes].forEach(item => {
            if (!item.name.includes('data-')) attrs[item.name] = item.value;
        });
        let parsedAttrs = parserAttrs(attrs, defaultAttrs, parsedDataset);

        let instance: any = null;
        let props = {
            el     : element,
            templates,
            // elChildren: elChildren ?? [],
            dataset: parsedDataset,
            ...parsedAttrs,
            ref    : componentInstance => {        // 组件实例
                // componentMethod && componentInstance[componentMethod]();
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
        let elementValue = element.attributes?.['value']?.value;
        let value = elementValue || defaultValue;

        // TODO 如果值不相等，说明使用了默认值，这时要改变到 input element 的value,只有 form表单元素才会触发
        // TODO 值不相等时，才触发trigger ，重新渲染
        if (!isUndefined(elementValue) && value !== elementValue) {
            trigger(element, value);
        }

        // 触发 beforeLoad 钩子
        beforeCallback(hooks, instance);

        // 组件渲染
        try {
            // 组件名必须大写
            ReactDOM.render(
                // <ConfigProvider { ...globalComponentConfig } >
                <Component { ...props } value={ value }/>
                // </ConfigProvider>
                , element, () => {
                    callback(hooks, instance);
                },
            );
        } catch (e) {
            console.error(e);
        }
    }

}


