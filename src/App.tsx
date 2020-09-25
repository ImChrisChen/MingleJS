import React from 'react';
import { render } from 'react-dom';
import { getComponent } from '@utils/relation-map';
import { ElementDataAttrs } from '@interface/ElDatasetAttrs';
import { parseDataAttr } from '@utils/parse-data-attr';
import $ from 'jquery';
import { message } from 'antd';
import { isFunc } from '@utils/util';

// typescript 感叹号(!) 如果为空，会丢出断言失败。
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#strict-class-initialization

interface IModules {
    // { element, Component, container, elChildren }
    element: HTMLElement            //  调用组件的元素，拥有data-fn属性的
    elChildren: Array<HTMLElement>  //  组件被渲染之前，@element 中的模版中的子节点(只存在于容器元素中/如非input)
    Component: any                  //  被调用的组件
    container: HTMLElement          //  组件渲染的React容器
    hooks: object
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

    constructor(private readonly elements: Array<HTMLElement>) {
        this.init().then(() => this.render());
    }

    async init() {
        for (const element of this.elements) {

            let container: HTMLElement, containerWrap: HTMLElement;
            let attrs = Array.from(element.attributes);
            let hooks: object = {};
            attrs.forEach(({ name, value: fnName }) => {
                let [ , hookName ] = name.split('hook:');
                if (hookName && isFunc(window[fnName])) {
                    hooks[hookName] = window[fnName];
                }
            });

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
            if (!componentNames) continue;

            containerWrap.setAttribute('data-component-container', componentNames);

            for (const componentName of componentNames.split(' ')) {

                if (componentName.startsWith('self-')) {
                    console.error(`${ componentName } 模块不属于MingleJS`);
                    continue;
                }

                let Component = await getComponent(componentName);

                // TODO 组件内的render是异步渲染的,所以需要在执行render之前获取到DOM子节点
                let elChildren: Array<HTMLElement> = [];
                if (element.children.length !== 0) { // 有子节点的时候克隆当前父节点(然后获取到子节点)
                    elChildren = Array.from(element.cloneNode(true)?.['children'] ?? []);
                }
                this.modules.push({ Component, element, container, elChildren, hooks });
            }

        }
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
                console.log(e.target['value']);
                this.renderComponent(module, function (hooks) {
                    console.log('-----------------beforeUpdate');
                    hooks['beforeUpdate']?.();
                }, function (hooks) {
                    console.log('---------------update');
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
        element.addEventListener('DOMCharacterDataModified', function () {

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

    private renderComponent(module: IModules, beforeCallback: (h) => any, callback: (h) => any) {
        let { element, Component, container, elChildren, hooks } = module;
        let dataset: ElementDataAttrs = (element as (HTMLInputElement | HTMLDivElement)).dataset;
        beforeCallback(hooks);
        // 组件名必须大写
        render(<Component
                el={ element }
                value={ element['value'] }
                elChildren={ elChildren }
                { ...parseDataAttr(dataset) }
            />, container, () => callback(hooks),
        );


    }

}

