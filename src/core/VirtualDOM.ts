/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2021/2/28
 * Time: 6:49 下午
 */
import { IFunctions } from '@services/ParserElement.service';
import { getObjectValue } from '@utils/util';
import { isArray, isEmpty, isEmptyObject, isExpandSymbol, isExpress, isObject, isUndefined } from '@utils/inspect';
import { directiveElse, directiveForeach, directiveIf } from '@root/config/directive.config';
import $ from 'jquery';
import { Inject } from 'typescript-ioc';
import { ParserTemplateService } from '@services/ParserTemplate.service';
import { child } from 'winston';

const events = {
    click: [        // 可以有多个事件
        {
            once      : false,
            type      : 'click',
            useCapture: false,          // 事件捕获
            listener  : function () {

            },
        },
    ],
};

interface IMingleVnode {
    tag: string
    data: object
    value: string
    type: number
    events: object
    children: Array<any>
}

interface IMingleEvents {
    [key: string]: Array<IEventItem>
}

interface IEventItem {
    once: boolean
    type: string
    useCapture: boolean
    listener: IListener
}

interface IListener {
    args?: Array<any>
    func: (...args) => any
    call: object
}

class VNode {

    children: Array<any>;

    // 构造函数
    private tag: string;           // 标签名称
    private data: object;          // 属性
    private value: string;         // nodeValue | textContent
    private type: number;          // 节点类型 nodeType
    private events: object;        // 事件

    constructor(tag, data, value, type, events) {
        // tag:用来表述 标签  data：用来描述属性  value：用来描述文本 type：用来描述类型
        this.tag = tag;     //文本节点时 tagName是undefined
        this.data = data;
        this.value = value;
        this.type = type;
        this.events = events;
        this.children = [];
    }

    public appendChild(vnode: IMingleVnode) {
        vnode && this.children.push(vnode);
    }
}

export class VirtualDOM extends ParserTemplateService {

    constructor() {
        super();
    }

    // 形参解析成实参
    private parseArguments(args: Array<string>, model: object): Array<any> {
        return args.map(param => {
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
                        return 'this';
                    }

                    if (param === '$event') {   // 事件对象
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

    private execEvents(el: HTMLElement, model: object, functions: IFunctions) {

    }

    private getAttributesByElement(el: HTMLElement, model: object, functions: IFunctions): { attrs: object, events: object } {
        let attrs = {};
        let events: IMingleEvents = {};
        for (const { name, value } of el.attributes) {

            // 事件
            if (name.startsWith('@')) {
                let [ , event ] = name.split('@');      // 事件名称 'click'
                let [ method, arg ] = value.split(/\((.*?)\)/);  // 把 handleClick($2) 分成两部分 [handleClick,undefined]
                event = event?.trim();
                method = method?.trim();
                arg = arg?.trim();

                let args = this.parseArguments(arg.split(','), model);
                let { methods, callthis } = functions;

                let e: IEventItem = {
                    once      : false,
                    type      : event,
                    useCapture: false,
                    listener  : {
                        func: methods?.[method],
                        args: args,
                        call: callthis,
                    },
                };

                if (isUndefined(events[event])) {
                    events[event] = [ e ];
                } else {
                    events[event].push(e);
                }

            } else {        // 属性
                attrs[name] = value;
            }
        }
        return {
            attrs,
            events,
        };
    }

    // 获取事件监听
    private static getEventsByElement(el) {

    }

    private parseForeach() {

    }

    private parseExpress(express: string, model: object): string {
        return this.parseTpl(express, model, 'field');
    }

    private parseIF(express: string): boolean {
        try {
            return Boolean(eval(express));
        } catch (e) {
            // TODO 有可能是 ~foreach 中的 if 语句
            console.error(`if内表达式解析语法错误: ${ express }`);
            return false;
        }
    }

    private getForEachVars(express: string, model: object) {
        let [ arrayName, itemName ]: Array<string> = express.split('as');
        let indexName = 'foreach_default_index';

        // data as (item,index)
        if (/\(.+?\)/.test(itemName)) {
            let [ , itemIndex ] = /\((.+?)\)/.exec(itemName) ?? [];       // "item,index"
            [ itemName, indexName ] = itemIndex.split(',');
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

        if (!isObject(loopData) && !isArray(loopData)) {
            console.error(`w-foreach 请使用正确的数据格式`, arrayName, model, loopData);
        }

        return {
            arrayName, itemName, indexName,
            loopData,
        };
    }

    public getVnode(node: HTMLElement, model: any, functions: IFunctions) {
        let nodeType = node.nodeType;
        let vnode;

        if (nodeType === 1) {               // element
            let nodeName = node.localName;

            const render = () => {
                let { attrs, events } = this.getAttributesByElement(node, model, functions);

                vnode = new VNode(nodeName, attrs, node.nodeValue, nodeType, events);
                let childNodes: any = node.childNodes;
                for (const childNode of childNodes) {
                    vnode.appendChild(this.getVnode(childNode, model, functions));
                }
            };

            // if (node.attributes[directiveIf]?.value) {
            //     let express = node.attributes[directiveIf].value;
            //     express = this.parseExpress(express, model);
            //     let result = this.parseIF(express);
            //     if (result) {
            //         // render
            //         render();
            //     } else {
            //
            //     }
            // }
            //
            // if (node.attributes[directiveForeach]?.value) {
            //     let express = node.attributes[directiveForeach]?.value;
            //     let ifExpress = node.attributes[directiveIf]?.value;
            //     ifExpress = this.parseExpress(ifExpress, model);
            //
            //     // w-foreach="data as item" 或者 data as (item,index)
            //     if (!/^(\w+|\w+\.\w+) as (\w+|\(.+?\))$/.test(express)) {
            //         console.error(`${ name }格式不正确`);
            //     }
            //
            //     express = this.parseExpress(express, model);
            //     let { arrayName, itemName, indexName, loopData } = this.getForEachVars(express, model);
            //
            //     for (const key in loopData) {
            //         if (!loopData.hasOwnProperty(key)) continue;
            //         let value = loopData[key];
            //         let itemModel = {
            //             [itemName] : value,
            //             [indexName]: key,       // index
            //         };
            //
            //         ifExpress = this.parseExpress(ifExpress, itemModel);
            //         let result: boolean;
            //         try {
            //             result = Boolean(eval(ifExpress));
            //         } catch (e) {
            //             console.warn(`${ ifExpress }表达式格式错误`);
            //             result = false;
            //         }
            //
            //
            //     }
            //
            // }
            //
            render();

        } else if (nodeType === 3) {        // 文本节点
            if (node.nodeValue && node.nodeValue.trim()) {

                let nodeValue = this.parseTpl(node.nodeValue, model, 'tpl');
                vnode = new VNode(undefined, undefined, nodeValue, nodeType, {});
            }
        }
        return vnode;
    }

    public vnodeToHtml(vnode: IMingleVnode) {
        let { type, data, tag, events, children, value } = vnode;
        let el;
        if (type === 1) {
            el = document.createElement(tag);
            for (const key in data) {
                if (!data.hasOwnProperty(key)) continue;
                let value = data[key];
                el.setAttribute(key, value);
            }
            for (const child of children) {
                let text = this.vnodeToHtml(child);
                el.append(text);
            }
        } else if (type === 3) {
            el = value;
        }
        return el;
    }

}
