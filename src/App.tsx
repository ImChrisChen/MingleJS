import React from 'react';
import { render } from 'react-dom';
import { getComponent } from '@utils/relation-map';
import { ElementDataAttrs } from '@interface/ElDatasetAttrs';
import { parseDataAttr } from '@utils/parse-data-attr';
import $ from 'jquery'

// typescript 感叹号(!) 如果为空，会丢出断言失败。
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#strict-class-initialization

// console.log('哈哈哈哈');

interface IModules {
    // { element, Component, container, elChildren }
    element: HTMLElement            //  调用组件的元素，拥有data-fn属性的
    elChildren: Array<HTMLElement>  //  组件被渲染之前，@element 中的模版中的子节点(只存在于容器元素中/如非input)
    Component: any                  //  被调用的组件
    container: HTMLElement          //  组件渲染的React容器
}

interface IRenderComponent {
    el: HTMLElement
    elChildren: Array<HTMLElement> | []

    [propName: string]: any
}

export default class App {

    private modules: Array<IModules> = [];

    constructor(private readonly elements: Array<HTMLElement>) {
        this.init().then(() => this.render());
    }

    async init() {
        for (const element of this.elements) {

            let container: HTMLElement, containerWrap: HTMLElement;

            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.setAttribute('type', 'hidden');

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
                this.modules.push({ Component, element, container, elChildren });
            }

        }
    }

    async render() {
        this.modules.forEach(module => {
            let { element, Component, container, elChildren } = module;
            let dataset: ElementDataAttrs = (element as (HTMLInputElement | HTMLDivElement)).dataset;

            // 组件名必须大写
            render(
                <Component el={ element } elChildren={ elChildren } { ...parseDataAttr(dataset) }/>, container,
                () => {
                    let hooks = element.getAttribute('data-onload') ?? '';
                    window[hooks] && window[hooks]();
                });

            this.eventListener(module);
        });
    }

    // renderComponent(Component:ReactElement, props: IRenderComponent) {
    //     return <Component el={ element } elChildren={ elChildren } { ...parseDataAttr(dataset) }/>;
    //     return <Compoent></Compoent>
    // }

    private eventListener(module: IModules) {
        let { element, Component, container, elChildren } = module;

        // https://developer.mozilla.org/zh-CN/docs/Web/Events#%E5%8F%82%E8%A7%81

        if (element.tagName === 'INPUT') {

            $(element).on('change', function (e) {
                console.log('input值变化重新触发 解析模块');
                let dataset: ElementDataAttrs = (element as (HTMLInputElement | HTMLDivElement)).dataset;
                render(<Component el={ element } elChildren={ elChildren } { ...parseDataAttr(dataset) }/>, container);
                console.log('e', e);
            })

            // TODO onchange用于 ( 统一处理 ) 监听到自身值修改后,重新去渲染模版 <{}> 确保组件中每次都拿到的是最新的解析过的模版
            // element.addEventListener('change', function (e) {
            //     console.log('input值变化重新触发 解析模块');
            //     let dataset: ElementDataAttrs = (element as (HTMLInputElement | HTMLDivElement)).dataset;
            //     render(<Component el={ element } elChildren={ elChildren } { ...parseDataAttr(dataset) }/>, container);
            //     console.log('e', e);
            // });
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

    }

}

