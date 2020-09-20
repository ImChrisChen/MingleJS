import React from 'react';
import { render } from 'react-dom';
import { getComponent } from '@utils/relation-map';
import { ElementDataAttrs } from '@interface/ElDatasetAttrs';
import { parseDataAttr } from '@utils/parse-data-attr';

// typescript 感叹号(!) 如果为空，会丢出断言失败。
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#strict-class-initialization

export default class App {

    private modules: Array<any> = [];

    constructor(private readonly elements: Array<HTMLElement>) {
        this.init().then(() => this.render());
    }

    async init() {
        for(const element of this.elements) {

            let container: HTMLElement, containerWrap: HTMLElement;

            if(element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {

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

            element.setAttribute('type', 'hidden');

            let componentNames: string = element.getAttribute('data-fn') ?? '';
            containerWrap.setAttribute('data-component-container', componentNames);

            for(const componentName of componentNames.split(' ')) {

                if(componentName.startsWith('self-')) {
                    console.error(`${ componentName } 模块不属于MingleJS`);
                    continue;
                }

                let Component = await getComponent(componentName);

                if(!Component) continue;

                // TODO 组件内的render是异步渲染的,所以需要在执行render之前获取到DOM子节点
                let elChildren: Array<HTMLElement> = [];
                if(element.children.length !== 0) { // 有子节点的时候克隆当前父节点(然后获取到子节点)
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
                <Component el={ element } elChildren={ elChildren } { ...parseDataAttr(dataset) }/>,
                container, () => {
                    let hooks = element.getAttribute('data-onload');
                    if(window[hooks]) {
                        (window[hooks] as any)();
                    }
                });

            this.eventListener(module);
        });
    }

    private eventListener(module) {
        let { element, Component, container } = module;

        // https://developer.mozilla.org/zh-CN/docs/Web/Events#%E5%8F%82%E8%A7%81

        if(element.tagName === 'INPUT') {
            element['onchange'] = function (e) {
                console.log('input值变化重新触发 解析模块');
                let dataset: ElementDataAttrs = (element as (HTMLInputElement | HTMLDivElement)).dataset;
                render(<Component el={ element } { ...parseDataAttr(dataset) }/>, container);
            };
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

