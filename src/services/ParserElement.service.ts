/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/2/7
 * Time: 3:30 下午
 */

import { directiveElse, directiveForeach, directiveIf } from '@src/config';
import { deepEachElement, getObjectValue, isArray, isExpandSymbol, isObject, isUndefined, isWuiTpl } from '@src/utils';
import $ from 'jquery';
import { ParserTemplateService } from '@services/ParserTemplate.service';

export interface IFunctions {
    methods: {
        [key: string]: (...args) => any
    },
    callthis: any
}

export class ParserElementService extends ParserTemplateService {

    constructor() {
        super();
    }

    /**
     * DOM 拓展运算符(属性) 实现语法糖 ...variable
     * item = { type='text', name:"chris", value:1 }
     * 解析例子: <p ...item></p>  -> <input type="text" name="pf" value="1" />
     * @param el
     * @param model
     * @param name
     * @private
     */
    private static parseExpand(el: HTMLElement, model: object, name: string) {
        let [, key]: Array<string> = name.split('...');

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

    /**
     * 递归解析DOM
     * @param root
     * @param model { Object }     解析文本用到的数据
     * @param functions { Object } 解析函数用到的数据
     */
    public parseElement(root: HTMLElement, model: object, functions?: IFunctions) {

        // TODO 解析顺序会影响渲染性能
        deepEachElement(root, async (el: HTMLElement) => {

            this.parseIfelse(el, model);
            this.parseProperty(el, model);
            this.parseTextContent(el, model, functions);
            this.parseForeach(el, model, functions);
            this.parseEventListen(el, model, functions);

        });
        return root;
    }

    /**
     * 属性解析 - 对改DOM上的属性进行模版解析,
     * 解析规则:  data-title="<{pf}>" 解析后->  data-title="1"
     * @param el
     * @param model
     * @private
     */
    private parseProperty(el: HTMLElement, model: object) {
        let attrs = el.attributes;
        for (const attr of attrs) {
            let { name, value } = attr;

            // if (name === directiveForeach || name === directiveIf || name === 'data-fn') {
            if (name === directiveForeach || name === directiveIf) {
                continue;
            }

            if (isWuiTpl(value)) {
                value = this.parseTpl(value, model, 'tpl');
                el.setAttribute(name, value);
                // console.log(name, value);
                // el.setStore(name, value);
            }

            // '...data'
            if (isExpandSymbol(name)) {
                ParserElementService.parseExpand(el, model, name);
            }
        }
    }

    /**
     * 文本解析 - 对该DOM上的文本进行解析
     * 解析规则: <p> 平台:<{pf}> <p>  解析后 ->  <p>1</p>
     * @param el
     * @param model
     * @param functions
     * @private
     */
    private parseTextContent(el: HTMLElement, model: object, functions?) {
        [...el.childNodes].forEach(node => {

            // node 节点
            // @ts-ignore
            if (node.nodeType === 1) {

                // #document-frament 节点
                // @ts-ignore
                // if (node.content && node.content.nodeType === 11 && node.content instanceof DocumentFragment) {
                //     // @ts-ignore
                //     // this.parseElement([ ...node.content.childNodes ], model, functions);
                // } else {
                //     this.parseTextContent(node as HTMLElement, model, functions);
                // }
            }

            // 处理文本节点
            if (node.nodeType === 3) {
                let textNode = node.textContent;
                if (isWuiTpl(textNode ?? '')) {
                    let textContent = this.parseTpl(textNode ?? '', model, 'tpl');
                    node.textContent = textContent;
                }
            }
        });
    }

    /**
     * 解析 w-foreach语法 - 对该DOM上的 w-foreach="data as item" 语法进行解析
     * @param el
     * @param model
     * @param functions
     * @private
     */
    private parseForeach(el: HTMLElement, model: object, functions?: IFunctions) {
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

        // 未解析的表达式 例子: "i / 2 === 0"
        let express = getIfExpressByElement(el) ?? undefined;        // undefined 时是没有表达式的
        if (express) {
            // '<{i}>' => '0'
            // 'i' => '0'
            express = this.parseTpl(express, model, 'field');        // TODO foreach中的条件判断要进行两个作用域解析，当前是第一层
        }

        let [arrayName, itemName]: Array<string> = value.split('as');
        let indexName = 'foreach_default_index';

        // data as (item,index)
        if (/\(.+?\)/.test(itemName)) {
            let [, itemIndex] = /\((.+?)\)/.exec(itemName) ?? [];       // "item,index"
            [itemName, indexName] = itemIndex.split(',');
        }

        arrayName = arrayName.trim();       // 数组名称
        itemName = itemName.trim();         // item名称
        indexName = indexName ? indexName.trim() : '';       // 下标名称

        // foreach 遍历支持对象和数组
        let loopData: Array<object> | {};
        if (arrayName.includes('.')) {          // w-foreach="item.children as it"
            loopData = arrayName.split('.').reduce((data, item) => {
                return data?.[item] || undefined;
            }, model) as Array<any>;
        } else {                                // w-foreach="data as item"
            loopData = model[arrayName];
        }

        let elseElement;
        if (!isObject(loopData) && !isArray(loopData)) {
            // console.warn(`w-foreach 请使用正确的数据格式`, arrayName, model, loopData);
            return;
        }

        let nodes: Array<any> = [];
        for (const key in loopData) {
            let value = loopData[key];

            let itemModel = {
                [itemName] : value,
                [indexName]: key,       // index
            };
            let result: any;     // if 表达式的判断结果

            // 如果foreach元素上没有if的条件判断
            if (isUndefined(express)) {
                result = true;
            } else {
                let parseExpress = this.parseTpl(express, itemModel, 'field');       // TODO
                // foreach中的条件判断要进行两个作用域解析，当前是第二层
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
                this.parseElement(cloneNode, itemModel, functions);
                nodes.push(cloneNode);
            } else {
                elseElement = el.nextElementSibling as HTMLElement;     // w-else
                if (elseElement?.attributes?.[directiveElse]) {
                    let cloneNode = elseElement.cloneNode(true) as HTMLElement;
                    this.parseElement(cloneNode, itemModel, functions);
                    nodes.push(cloneNode);
                }
            }
        }

        $(el).after(...nodes);
        el.remove();        // 删除掉原始模版
        elseElement && elseElement.remove();
    }

    /**
     * 解析 w-if w-else
     * @param el
     * @param model
     * @private
     */
    private parseIfelse(el: HTMLElement, model: object) {
        let attrs = el.attributes;
        if (!attrs?.[directiveIf]) return;

        let { value: expressTpl } = attrs[directiveIf];
        let express = this.parseTpl(expressTpl, model, 'field');
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

    /**
     * 解析自定义监听事件 model (解析参数) methods (解析方法)
     * @param el
     * @param model
     * @param functions
     * @private
     */
    private parseEventListen(el: HTMLElement, model: object, functions?: IFunctions) {
        // 判断事件函数中是否有括号
        const isBracket = (v: string): boolean => {
            return /\((.*?)\)/.test(v);
        };

        for (const { name, value } of el.attributes) {
            if (name.startsWith('@')) {
                let [, event] = name.split('@');
                let [method, arg] = value.split(/\((.*?)\)/);  // 把 handleClick($2) 分成两部分 [handleClick,undefined]
                event = event?.trim();
                method = method?.trim();
                arg = arg?.trim();

                if (!method) continue;

                //  参数列表
                let argument: Array<any> = [];

                // 有参数的情况
                if (arg) {
                    argument = arg.split(',');
                    argument = argument.map(param => {
                        param = param.trim();
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

                                if (param === 'this') {     // 如果参数是this 指向到当前 dom 元素
                                    return el;
                                }

                                if (param === '$event') {
                                    return '$event';
                                }

                                return eval(param);

                            }
                        } catch (e) {
                            let pv = getObjectValue(param, model);
                            return pv;
                        }
                    });
                }

                // 绑定自定义事件
                $(el).on(event, (e) => {
                    // @ts-ignore
                    let { methods, callthis } = functions;
                    // 有括号
                    if (isBracket(value)) {
                        if (argument.length > 0) {      // 有参数
                            let args = argument.map(item => item === '$event' ? e : item);
                            methods?.[method]?.call(callthis, ...args);
                        } else {
                            methods?.[method]?.call(callthis);
                        }
                    } else {
                        // 无括号，也无参数
                        methods?.[method]?.call(callthis, e);
                    }
                });

                // TODO 用 el.addEventListener 部分事件监听用jQuery的trigger触发不了
                // el.addEventListener(event, (...args) => {
                // });

                el.removeAttribute(name);
            }
        }
    }

}
