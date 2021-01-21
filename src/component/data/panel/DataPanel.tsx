/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/29
 * Time: 8:26 下午
 */
import { IComponentProps } from '@interface/common/component';
import React, { ReactNode, ReactPropTypes } from 'react';
import { jsonp } from '@utils/request/request';
import { deepEachElement } from '@utils/util';
import { parseTpl } from '@utils/parser-tpl';
import $ from 'jquery';
import { isArray, isEmptyObject, isExpandSymbol, isObject, isUndefined, isWuiTpl } from '@utils/inspect';
import { elementWrap } from '@utils/parser-dom';
import App from '@src/App';
import { directiveElse, directiveForeach, directiveIf } from '@root/config/directive.config';

// DOM 解析
export default class DataPanel extends React.Component<IComponentProps, ReactNode> {

    public state = {
        html : this.props.el.innerHTML,
        model: {},
    };

    constructor(props) {
        super(props);
        console.log(props);
        let { el, dataset } = this.props;
        DataPanel.renderElement(el, dataset).then(r => r);
    }

    // 获取到组件实例 才能被外部调用
    public static async renderElement(el: HTMLElement | Array<HTMLElement>, dataset: object = {}) {
        let data = await this.getData(dataset);
        let root = await this.parseElement(el, data);
        console.log(root);

        if (!isArray(el)) {
            el.style.visibility = 'visible';
            el.style.opacity = '1';
        }
        new App(root, true);
    }

    public static parseElement(rootElement: HTMLElement | Array<HTMLElement>, model: object) {
        let root = rootElement;

        // 支持单个element 和 多个 element 处理
        if (isArray(rootElement)) {
            root = elementWrap(rootElement);
        }

        // TODO 解析顺序会影响渲染性能
        deepEachElement(root, async (el: HTMLElement) => {

            this.parseIfelse(el, model);
            this.parseProperty(el, model);
            this.parseTextContent(el, model);
            this.parseForeach(el, model);

        });
        return root;
    }

    // 属性解析 解析规则 data-title="<{pf}>"
    public static parseProperty(el: HTMLElement, model: object) {
        let attrs = el.attributes;
        for (const attr of attrs) {
            let { name, value } = attr;

            // if (name === directiveForeach || name === directiveIf || name === 'data-fn') {
            if (name === directiveForeach || name === directiveIf) {
                continue;
            }

            if (isWuiTpl(value)) {
                value = parseTpl(value, model, 'tpl');
                el.setAttribute(name, value);
            }

            // '...data'
            if (isExpandSymbol(name)) {
                this.parseExpand(el, model, name);
            }
        }
    }

    // 文本解析 解析规则 <p> 平台:<{pf}> <p>
    public static parseTextContent(el: HTMLElement, model: object) {
        el.childNodes.forEach(node => {
            // 处理文本节点
            if (node.nodeType === 3) {
                let textNode = node.textContent;
                if (isWuiTpl(textNode ?? '')) {
                    let textContent = parseTpl(textNode ?? '', model, 'tpl');
                    node.textContent = textContent;
                }
            }
        });
    }

    // 解析 w-foreach
    public static parseForeach(el: HTMLElement, model: object) {
        let attrs = el.attributes;
        if (!attrs[directiveForeach]) return el;
        let { name, value } = attrs[directiveForeach];
        el.removeAttribute(directiveForeach);

        // w-foreach="data as item" 或者 data as (item,index)
        if (!/^(\w+|\w+\.\w+) as (\w+|\(.+?\))$/.test(value)) {
            console.error(`${ name }格式不正确`);
        }

        function getIfExpressByElement(element: HTMLElement) {
            let attrs = element.attributes;
            let express;
            if (attrs[directiveIf] && attrs[directiveIf].value) {
                express = attrs[directiveIf].value;
                el.removeAttribute(directiveIf);
            }
            return express;
        }

        let express = getIfExpressByElement(el) ?? undefined;        // undefined 时是没有表达式的
        if (express) {
            express = parseTpl(express, model, 'field');        // TODO foreach中的条件判断要进行两个作用域解析，当前是第一层
        }

        let [ arrayName, itemName ]: Array<string> = value.split('as');
        let indexName = 'foreach_default_index';

        // data as (item,index)
        if (/\(.+?\)/.test(itemName)) {
            let [ , itemIndex ] = /\((.+?)\)/.exec(itemName) ?? [];       // "item,index"
            [ itemName, indexName ] = itemIndex.split(',');
        }

        arrayName = arrayName.trim();       // 数组名称
        itemName = itemName.trim();         // item名称
        indexName = indexName ? indexName.trim() : '';       // 下标名称

        let loopData: Array<object> = [];
        if (arrayName.includes('.')) {          // w-foreach="item.children as it"
            loopData = arrayName.split('.').reduce((data, item) => {
                return data?.[item] || [];
            }, model) as Array<any>;
        } else {                                // w-foreach="data as item"
            loopData = model[arrayName];
        }

        console.log(loopData);

        let elseElement;
        if (!loopData) return;

        // w-foreach
        let nodes: Array<any> = loopData.map((item, index) => {
            let itemModel = {
                [itemName] : item,
                [indexName]: index,
            };
            let result: any;     // if 表达式的判断结果

            // 如果foreach元素上没有if的条件判断
            if (isUndefined(express)) {
                result = true;
            } else {
                let parseExpress = parseTpl(express, itemModel, 'field');       // TODO foreach中的条件判断要进行两个作用域解析，当前是第二层
                // console.log(parseExpress);
                try {
                    result = eval(parseExpress);
                } catch (e) {
                    console.warn(`${ parseExpress }表达式解析错误`);
                    result = false;
                }
            }

            // w-if (表达式成立 或者 没有 w-if的情况) 的时候才克隆节点
            if (result) {
                let cloneNode = el.cloneNode(true) as HTMLElement;
                // this.parseExpand(el, itemModel);
                this.parseElement(cloneNode, itemModel);
                // this.parseElement(cloneNode, model);
                // this.parseProperty(cloneNode, itemModel);      // 处理属性解析
                return cloneNode;
            } else {
                elseElement = el.nextElementSibling as HTMLElement;     // w-else
                if (elseElement?.attributes?.[directiveElse]) {
                    let cloneNode = elseElement.cloneNode(true) as HTMLElement;
                    this.parseElement(cloneNode, itemModel);
                    // this.parseElement(cloneNode, model);
                    // this.parseProperty(cloneNode, itemModel);      // 处理属性解析
                    return cloneNode;
                }
            }
        }).filter(t => t);

        $(el).after(...nodes);
        el.remove();        // 删除掉原始模版
        elseElement && elseElement.remove();
    }

    // 解析 w-if w-else
    public static parseIfelse(el: HTMLElement, model: object) {
        let attrs = el.attributes;
        if (!attrs[directiveIf]) return;

        let { value: expressTpl } = attrs[directiveIf];
        let express = parseTpl(expressTpl, model, 'field');
        try {
            if (eval(express)) {
                $(el).next().attr(directiveElse) !== undefined && $(el).next().remove();      // 成立去掉else
            } else {
                $(el).remove();
            }
        } catch (e) {
            // TODO 有可能是 ~foreach 中的 if 语句
            // console.error(`if内表达式解析语法错误: ${ express }`);
        }
    }

    // 解析 ...object 拓展运算符(属性)
    public static parseExpand(el: HTMLElement, model: object, name: string) {
        let [ , expandByte ]: Array<string> = name.split('...');
        let fieldArr = expandByte.split('.');
        let itemModel: object = fieldArr.reduce((data, field) => {
            if (isObject(data)) {
                return data[field];
            } else {
                return {};
            }
        }, model);

        if (!itemModel || isEmptyObject(itemModel)) return;

        for (const key in itemModel) {
            if (!itemModel.hasOwnProperty(key)) continue;
            let value = itemModel[key];
            let attrvalue = el.getAttribute(key);

            // element 上没有这个属性才给它设置
            if (!attrvalue) {
                el.setAttribute(key, value);
            }
        }
        // ...items 运算符删除掉
        el.removeAttribute(name);
    }

    public static async getData(dataset) {
        let { url, model } = dataset;
        if (url) {
            let res = await jsonp(url);
            return res.status ? res : {};
        } else if (model) {
            return model;
        }
    }

    render() {
        return null;
    }

}
