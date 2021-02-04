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
import { getObjectValue, parseTpl } from '@utils/parser-tpl';
import $ from 'jquery';
import {
    isArray,
    isEmptyObject,
    isExpandSymbol,
    isJSON,
    isObject,
    isString,
    isUndefined,
    isWuiTpl,
} from '@utils/inspect';
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
        let data = await this.getData(dataset);     // {}
        let root = await this.parseElement(el, data);

        if (!isArray(el)) {
            el.style.visibility = 'visible';
            el.style.opacity = '1';
        }
        new App(root, true);
    }

    public static parseElement(rootElement: HTMLElement | Array<HTMLElement>, model: object) {

        if (!rootElement) return rootElement;

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
            this.parseEventListen(el, model);

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
                // console.log(name, value);
                // el.setStore(name, value);
            }

            // '...data'
            if (isExpandSymbol(name)) {
                this.parseExpand(el, model, name);
            }
        }
    }

    // 文本解析 解析规则 <p> 平台:<{pf}> <p>
    public static parseTextContent(el: HTMLElement, model: object) {
        [ ...el.childNodes ].forEach(node => {

            // node 节点
            // @ts-ignore
            if (node.nodeType === 1) {

                // #document-frament 节点
                // @ts-ignore
                if (node.content && node.content.nodeType === 11 && node.content instanceof DocumentFragment) {
                    // @ts-ignore
                    this.parseTextContent(node.content, model);
                } else {
                    this.parseTextContent(node as HTMLElement, model);
                }
            }

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
        let [ , key ]: Array<string> = name.split('...');

        let itemModel = getObjectValue(key, model);

        // let fieldArr = expandByte.split('.');
        // let itemModel: object = fieldArr.reduce((data, field) => {
        //     if (isObject(data)) {
        //         return data[field];
        //     } else {
        //         return {};
        //     }
        // }, model);
        // if (!itemModel || isEmptyObject(itemModel)) return;

        if (isUndefined(itemModel)) return;

        for (const key in itemModel) {
            if (!itemModel.hasOwnProperty(key)) continue;
            let value = itemModel[key];
            let attrvalue = el.getAttribute(key);

            // element 上没有这个属性才给它设置
            if (!attrvalue) {
                // 如果是 混合数据类型, 对数据格式做处理，否则会成为 [object,object]
                if (isObject(value) || isArray(value)) {
                    value = JSON.stringify(value);
                }
                el.setAttribute(key, value);
            }
        }
        // ...items 运算符删除掉
        el.removeAttribute(name);
    }

    // 解析自定义监听事件
    public static parseEventListen(el: HTMLElement, model: object) {
        for (const { name, value } of el.attributes) {
            if (name.startsWith('@')) {
                let [ , event ] = name.split('@');
                let [ method, arg ] = value.split(/\((.+?)\)/);
                event = event.trim();
                method = method.trim();
                arg = arg?.trim();
                // 有参数

                let argument: Array<any> = [];

                // 有参数的情况
                if (arg) {
                    argument = arg.split(',');
                    argument = argument.map(param => {
                        try {
                            /**
                             * 参数是字符串 * 当作JS执行,如果报错解析不了
                             * "'name'" => 'name'
                             * 'window' => window 对象
                             * 'message' => eval后 error 报错 解析不了，走到catch 说明使用的是 data 里面的
                             */
                            // widnow下的属性方法 包括 window
                            if (param in window) {
                                /**
                                 * TODO 很有可能是eval 解析成了全局的属性方法 eval('window') eval('location') 等等,此时会和属性有冲突 -- 先不开放全局属性解析
                                 */
                                console.warn(`属性 ${ param }  与全局属性冲突,不提供全局属性解析,只开放data对象里的属性作为解析,`);
                                return model[param];   // data['window']
                            } else {
                                // "'name'" => 'name' 不在window里面,直接用 data 对象的值去解析
                                // TODO handleClick(location.href) 存在这种情况的解析
                                return eval(param);
                            }
                        } catch (e) {
                            let pv = getObjectValue(param, model);
                            return pv;
                        }
                    });
                }

                if (!method) continue;
                console.log(event, method, argument, model);
                $(el).on(event, (...args) => {
                    model?.[method]?.(...args, ...argument);
                });
            }
        }
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
