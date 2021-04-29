import React, { ReactInstance } from 'react';
import ReactDOM from 'react-dom';
import {
    deepEachElement,
    isCustomElement,
    isFunc,
    isReactComponent,
    isUndefined,
    loadModule,
    parserAttrs,
    parserDataset,
    trigger,
} from '@src/utils';
import $ from 'jquery';
import { ConfigProvider } from 'antd';
import { globalComponentConfig, IComponentConfig } from '@src/config/interface';
import * as antdIcons from '@ant-design/icons';
import { Hooks } from '@src/config/directive.config';
import { IComponentProps } from '@interface/common/component';

// typescript 感叹号(!) 如果为空，会丢出断言失败。
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#strict-class-initialization

interface IModuleProperty {
    dataset: object | any
    // hook: {
    //     load?: object
    //     beforeLoad?: object
    //     update?: object
    //     beforeUpdate?: object
    // }
    value: {
        el: string
        options?: Array<{ label: string, value: any }>
        label?: string
        value?: any
    }
}

interface IModules {
    // { element, Component, container, subelements }
    element: HTMLElement            //  调用组件的元素，拥有data-fn属性的
    subelements?: Array<HTMLElement>  //  组件被渲染之前，@element 中的模版中的子节点(只存在于容器元素中/如非input)
    Component: any                  //  被调用的组件
    container: HTMLElement          //  组件渲染的React容器
    // containerWrap: HTMLElement      //  组件根容器
    templates?: object
    hooks: object                   //  钩子
    // // componentMethod: string         //  组件方法
    defaultProperty: IModuleProperty         //  组件默认值
    config?: IComponentConfig        // 组件配置
    componentUID: string            // 组件uid
}

interface IAttributes extends NamedNodeMap {
    style?: any | string

    [key: string]: any
}

interface IInstances {
    module?: IModules
    instance?: {
        [key: string]: any
    }
}

export const DataComponentUID = 'data-component-uid';

export default class App {

    public static instances: IInstances = {};      // 组件实例
    public static registerComponents: Array<string> = [];         // 注册过的自定义组件

    constructor(root: HTMLElement, private readonly forceRender = false) {

        if (!root) return;

        try {
            this.init(root).then(r => r);
        } catch(e) {
            console.error(e);
        }
    }

    // web-components
    async init(rootElement: HTMLElement) {

        App.renderIcons(rootElement);
        deepEachElement(rootElement, async (element, parentNode) => {
            let { localName: tagName } = element;

            // TODO data-list使用动态渲染子元素的时候，需要过滤掉初始化渲染，直接从data-list控制子组件渲染
            if (parentNode?.localName === 'data-list') {

                if (!this.forceRender) {
                    console.log('拦截掉', element);
                    return;
                }
            }

            if (parentNode?.localName === 'data-table') {
                if (!this.forceRender) {
                    return;
                }
            }

            /**
             * TODO 注册过后的组件会改变加载顺序，web-components的问题暂未解决,
             * 例如：组件的参数依赖 foreach 上下文的模版的解析，注册过的组件通常导致，首先加载组件，而没有解析模版。
             */
            let isWebComponents = false;

            // 如果是自定义组件 <form-select></form-select>
            if (isCustomElement(tagName)) {
                if (isWebComponents) {
                    if (App.registerComponents.includes(tagName)) {
                        // console.log('有注册过', App.registerComponents, tagName);
                        return;
                    }
                    //
                    window.customElements.define(tagName, class extends HTMLElement {

                        /**
                         * TODO 生命周期函数的顺序
                         * constructor -> attributeChangedCallback -> connectedCallback
                         */

                        constructor() {
                            super();

                            // let shadow = this.attachShadow({ mode: 'open' });
                            // console.log(shadow);

                            /**
                             * TODO 自定义元素的构造器不应读取或编写其 DOM. 构造函数中不能操作DOM
                             *  https://stackoverflow.com/questions/43836886/failed-to-construct-customelement-error-when-javascript-file-is-placed-in-head
                             */
                        }

                        // public props = [ 1, 2, 3 ];         // document.querySelector('el').props

                        private static get observedAttributes() {
                            return [];
                        }

                        /**
                         * 元素链接成功后
                         */
                        connectedCallback() {
                            App.renderCustomElement(this);
                        }

                        /**
                         * 当元素从DOM中移除的时候将会调用它。但是要记住，在用户关闭浏览器或者浏览器tab的时候
                         */
                        disconnectCallback() {

                        }

                        /**
                         * adoptedCallback，当元素通过调用document.adoptNode(element)被采用到文档时将会被调用
                         */
                        adoptedCallback() {

                        }

                        /**
                         * 每当将属性添加到observedAttributes的数组中时，就会调用这个函数。这个方法调用时两个参数分别为旧值和新值。
                         */
                        attributeChangedCallback(attr, oldVal, newVal) {
                            console.log(attr, oldVal, newVal);
                        }


                    });
                    App.registerComponents.push(tagName);
                } else {
                    await App.renderCustomElement(element, false);
                }
            }

            // $modulejs
            let methods = element.getAttribute('data-fn') ?? '';
            if (methods) {        // data-fn 函数功能
                let $module = loadModule(methods);
                if ($module.type === 'functional') {
                    const Component = (await $module.component).default;
                    // 不是react组件,直接 new Class
                    if (!isReactComponent(Component)) {
                        let defaultProperty = $module.property;
                        let { dataset, attrs } = App.parseProps(element, defaultProperty);
                        new Component({
                            el: element,
                            dataset,
                            ...attrs,
                        });         // 统一使用 class 写法
                    }
                }
            }
        });

        App.errorVerify();

    }

    // 渲染组件 <form-select></form-select>
    public static async renderCustomElement(el: HTMLElement, isDataFn: boolean = false) {
        let tagName = el.localName;

        if (el.getAttribute(DataComponentUID)) {
            console.log('渲染过了');
            return;
        }

        if (tagName === 'define-component' && el.getAttribute('module')) {
            tagName = el.getAttribute('module') || '';
        }

        // 获取到组件的子元素（排除template标签)
        let subelements = [ ...el.children ].filter(child => child.localName !== 'template') as Array<HTMLElement>;

        let container = document.createElement('div');
        container.style.maxHeight = '100%';     // TODO iframe弹窗中和外部展示效果不一样，故用maxHeight处理
        container.classList.add('component-container');
        // let container = el;
        el.append(container);

        // form-component
        if (tagName.startsWith('form-')) {
            el.setAttribute('form-component', '');
        }

        let tpls = [ ...el.querySelectorAll('template') ];
        let templates = {};

        for (const tpl of tpls) {
            let name = tpl.attributes['name']?.value;
            if (!name) continue;
            templates[name] = tpl;
        }

        const $module = loadModule(tagName);
        const Component = (await $module.component)?.default;            // React组件
        if (!Component) {
            // 一般出现在 component.configs.ts中没有写 component import 导入组件的情况
            console.error(`${ tagName }没有这个组件`, $module);
            return;
        }

        let hooks = App.formatHooks(el.attributes);
        let defaultProperty = $module.property;

        /**
         * --------------------------- 开始实例化组件 --------------------------------------
         */

            // TODO 设置组件唯一ID
        let componentUID = App.createUUID();
        el.setAttribute(DataComponentUID, componentUID);

        let module: IModules = {
            Component,
            element: el,
            templates,
            subelements,
            container,
            hooks,
            // @ts-ignore
            defaultProperty,
            componentUID,
        };

        let props: IComponentProps;
        // React 写法的组件
        if (isReactComponent(Component)) {
            props = App.renderComponent(module);
        } else {
            // 原生js组件
            let defaultProperty = $module.property;
            let { dataset, attrs } = App.parseProps(el, defaultProperty);
            props = {
                el: el,
                dataset,
                ...attrs,
            };
            let componentInstance = new Component(props);
            App.instances[componentUID] = {
                instance: componentInstance, module,
            };
        }

        App.eventListener(module, props);
    }

    // 生成组件唯一ID
    public static createUUID() { // 获取唯一值
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

    public static renderIcons(rootElement: HTMLElement) {
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

    public static formatHooks(attributes: IAttributes): object {
        let hooks: { [key: string]: any } = {};

        for (const { name, value: fnName } of attributes) {
            // @ts-ignore
            let hook = Object.values(Hooks).includes(name);
            if (hook) {
                if (name && isFunc(window[fnName])) {
                    hooks[name] = window[fnName];
                }
            }
        }
        return hooks;
    }

    // 重载组件(模版联动选择)
    public static dynamicReloadComponents(element: HTMLElement) {

        // TODO input调用的元素,外层才是 [data-component-uid]
        let $formItems: Array<HTMLElement> = [];

        // form-group 内的组件，只在组作用域内产生关联关系
        // if ($(element).closest('[data-fn=form-group]').length > 0) {
        if ($(element).closest('form-group').length > 0) {
            $formItems = [ ...$(element).closest('.form-group-item').find(`[${ DataComponentUID }][name]`) ];
        } else {
            $formItems = [ ...$(element).closest('form-action').find(`[${ DataComponentUID }][name]`) ];
        }

        $formItems.forEach(formItem => {
            let dataset = formItem.dataset;

            // TODO parent 换成 closest 可以适用于 div form表单元素
            let $formItemBox = $(formItem).closest(`[${ DataComponentUID }]`);
            let uid = $formItemBox.attr(DataComponentUID) ?? '';
            // let selfInputName = element['name'] ?? element.attributes?.['name'].value;
            let selfAttrName = element.getAttribute('name');
            let regExp = new RegExp(`<{(.*?)${ selfAttrName }(.*?)}>`);        // 验证是否包含模版变量 <{pf}>
            let module = App.instances?.[uid]?.module;

            if (!module) return;

            for (const key in dataset) {
                if (!dataset.hasOwnProperty(key)) continue;
                let value = dataset[key] ?? '';

                // 只有和模版关联的input框组件才会重载
                if (regExp.test(value)) {
                    // https://zh-hans.reactjs.org/docs/react-dom.html#unmountcomponentatnode

                    ReactDOM.unmountComponentAtNode(module.container);  // waring 错误不必理会
                    (module.element as HTMLInputElement).value = '';
                    setTimeout(() => {
                        App.renderComponent(module,
                            // (hooks, instance) => hooks[Hooks.beforeUpdate]?.(instance),
                            // (hooks, instance) => {
                            //     hooks[Hooks.update]?.(instance);
                            // },
                        );
                    });
                    break;
                }
            }
        });
    }

    public static eventListener(module: IModules, props: IComponentProps) {
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

                let exec = props.dataset.exec;
                if (exec) {
                    // TODO 简陋的实现，后续待调整
                    let formElement = $(element).closest('form-action');
                    let submitBtn = formElement.find('[type=submit]');
                    if (submitBtn.length > 0) {
                        submitBtn.click();
                    } else {
                        formElement.append(`<button type="submit" style="display: none;"/>`).find('[type=submit]').click();
                    }
                }

                let groupname = element.getAttribute('data-group');
                if (groupname) {
                    let formElement = $(element).closest('form-action');
                    let groups = [ ...formElement.find(`[${ DataComponentUID }][data-group=${ groupname }]`) ];
                    groups.forEach(el => {
                        if (el !== element) {
                            console.log(el);
                        }
                    });
                }
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

    public static errorVerify() {
        let arr: Array<string> = [];
        let repeatName: Array<string> = [];
        let elements = document.querySelectorAll(`[name][${ DataComponentUID }]`);
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
            console.warn(`${ names } 的name属性值重复`);
        }
    }

    // 通过 Element 获取到组件解析后的所有属性
    public static parseElementProperty(el: HTMLElement): IComponentProps {
        let componentModule = loadModule(el.localName);

        let defaultProperty = componentModule.property;

        let { dataset, attrs } = this.parseProps(el, defaultProperty);

        return {
            el,
            dataset,
            ...attrs,
        };
    }

    public static parseProps(el: HTMLElement, defaultProperty) {

        // @ts-ignore
        let { dataset, hook, ...attrs } = defaultProperty;     // default

        // dataset
        let parsedDataset = parserDataset(el.dataset, dataset ?? {});

        // 普通属性
        let elAttrs = {};     // key value
        [ ...el.attributes ].forEach(item => {
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
            dataset: parsedDataset,
            attrs  : parsedAttrs,
        };
    }

    public static renderComponent(module: IModules, beforeCallback?: (h, instance: ReactInstance) => any, callback?: (h, instance: ReactInstance) => any): IComponentProps {
        let {
            element, defaultProperty, Component, hooks, componentUID, subelements, templates, container,
        } = module;

        let { dataset: parsedDataset, attrs } = this.parseProps(element, defaultProperty);

        let instance: any = null;
        let props = {
            templates,
            subelements,
            el     : element,
            dataset: parsedDataset,
            ...attrs,
            ref: componentInstance => {        // 组件实例
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

        /**
         * TODO 自定义元素没有 element没有value属性，和html中写入value默认值只能通过 attributes获取到，
         * 但是值出发改变后只能通过 element.value 来获取新的值，两者存在冲突,已经在trigger方法中处理好
         */
        let elementValue = element.attributes?.['value']?.value ?? element['value'];

        let value = elementValue || defaultValue;

        // 如果没有设置默认值(没有设置为undefined)，则给element 元素添加默认组件配置的默认值
        if (isUndefined(elementValue)) {
            element.setAttribute('value', value);
            element['value'] = value;
        }

        // TODO 如果值不相等，说明使用了默认值，这时要改变到 input element 的value,只有 form表单元素才会触发
        // TODO 值不相等时，才触发trigger ，重新渲染
        if (!isUndefined(elementValue) && value !== elementValue) {
            trigger(element, value);
        }

        // 触发 beforeLoad 钩子
        beforeCallback?.(hooks, instance);

        // 组件渲染
        try {
            // 组件名必须大写
            ReactDOM.render(
                <ConfigProvider { ...globalComponentConfig } >
                    <Component { ...props } value={ value }/>
                </ConfigProvider>
                , container, () => {
                    callback?.(hooks, instance);
                },
            );
        } catch(e) {
            console.error(e);
        }
        return props;
    }

}


