/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/29
 * Time: 8:26 下午
 */
import { IComponentProps } from '@interface/common/component';
import React, { ReactNode } from 'react';
import { jsonp } from '@utils/request/request';
import { deepEachElement } from '@utils/util';
import { parseTpl } from '@utils/parser-tpl';
import $ from 'jquery';
import { isArray, isUndefined, isWuiTpl } from '@utils/inspect';
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

        DataPanel.getData(this.props.dataset).then(data => {
            let rootElement = DataPanel.parseElement(this.props.el, data);
            new App(rootElement, true);

            this.setState({ model: data });
            this.props.el.style.visibility = 'visible';
            this.props.el.style.opacity = '1';
        });
    }

    public static parseElement(rootElement: HTMLElement | Array<HTMLElement>, model: object) {
        let root = rootElement;

        // 支持单个element 和 多个 element 处理
        if (isArray(rootElement)) {
            root = elementWrap(rootElement);
        }

        // TODO 解析顺序会影响渲染性能
        deepEachElement(root, (el: HTMLElement) => {
            this.parseIfelse(el, model);
            this.parseProperty(el, model);
            this.parseTextContent(el, model);
            this.parseForeach(el, model);
            this.parseExpand(el, model);
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

            if (!isWuiTpl(value)) {
                continue;
            }

            let parseValue = parseTpl(value, model, 'tpl');
            el.setAttribute(name, parseValue);
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
                    console.log(textContent);
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
        if (!/^\w+ as (\w+|\(.+?\))$/.test(value)) {
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

        let [ arrayName, itemName ] = value.split('as');
        let indexName = 'index';

        // data as (item,index)
        if (/\(.+?\)/.test(itemName)) {
            let [ , itemIndex ] = /\((.+?)\)/.exec(itemName) ?? [];       // "item,index"
            [ itemName, indexName ] = itemIndex.split(',');
        }

        arrayName = arrayName.trim();       // 数组名称
        itemName = itemName.trim();         // item名称
        indexName = indexName ? indexName.trim() : '';       // 下标名称

        let elseElement;
        let loopData = model[arrayName];
        let nodes = loopData.map((item, index) => {
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

            // 表达式成立的时候才克隆节点
            if (result) {
                let cloneNode = el.cloneNode(true) as HTMLElement;
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

    // 解析拓展运算符
    public static parseExpand(el: HTMLElement, model: object) {
        let attrs = el.attributes;
        model = { dataset: { url: 'xxxx' } };
        let modelData = { item: model };
        for (const item of attrs) {
            let { name, value } = item;
            if (name.startsWith('...')) {
                let [ , expandByte ]: Array<string> = name.split('...');     // "...item.dataset" => "item.dataset"
                console.log(expandByte, modelData);
                let fieldArr = expandByte.split('.');
                let result: object = fieldArr.reduce((model, field) => {
                    return model[field];
                }, modelData);
                let str = '';
                for (const key in result) {
                    if (!result.hasOwnProperty(key)) continue;
                    let value = result[key];
                    str += ` ${ key }="${ value }"`;
                }
                console.log(str);
            }
        }
        // $0.attributes['...item.dataset'].name
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
