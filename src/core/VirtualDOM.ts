/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2021/2/28
 * Time: 6:49 下午
 */
import { IFunctions } from '@services/ParserElement.service';
import {
    arraylastItem,
    getObjectValue,
    isArray,
    isExistAttr,
    isExpandSymbol,
    isObject,
    isUndefined,
    isWuiTpl,
} from '@src/utils';
import { directiveElse, directiveForeach, directiveIf, directiveReadonly } from '@src/config/directive.config';
import { ParserTemplateService } from '@services/ParserTemplate.service';
import { DataComponentUID } from '@src/App';

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

export interface IMingleVnode {
    tag: string
    data: object
    value: string | null
    type: number
    events: IMingleEvents
    children: Array<IMingleVnode>
    el: HTMLElement
    isChanged: boolean
    vid: number
    nextRender: boolean
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

let vid = 0;

class VNode {

    // 构造函数
    private tag: string;           // 标签名称
    private data: object;          // 属性
    private value: string | null;         // nodeValue | textContent
    private type: number;          // 节点类型 nodeType
    private events: object;        // 事件
    private el: HTMLElement;
    private children: Array<IMingleVnode>;
    private isChanged: boolean;     // false则无改变，需要重写生成DOM
    private vid: number;
    private nextRender: boolean;

    constructor(tag, data, value, type, events, el) {
        // tag:用来表述 标签  data：用来描述属性  value：用来描述文本 type：用来描述类型
        this.tag = tag;     //文本节点时 tagName是undefined
        this.data = data;
        this.value = value;
        this.type = type;
        this.events = events;
        this.children = [];
        this.el = el;
        this.isChanged = false;
        this.vid = vid++;
    }

    public append(vnode: IMingleVnode) {
        if (isUndefined(vnode)) {
            return;
        }

        Array.isArray(vnode)
            ? this.children.push(...vnode)
            : this.children.push(vnode);

    }
}

export class VirtualDOM extends ParserTemplateService {

    constructor() {
        super();
    }

    // 获取事件监听
    private static getEventsByElement(el) {

    }

    public getVnode(
        node: HTMLElement,
        model: any, functions: IFunctions,
        parent?: IMingleVnode,
        readOnly = false,
    ): IMingleVnode {
        let nodeType = node.nodeType;
        let vnode;

        if (nodeType === 1) {               // element
            let nodeName = node.localName;
            let nodeValue = node.nodeValue;     // 节点的 nodeValue 为null

            // w-readonly 只要有些属性就生效
            if (isExistAttr(directiveReadonly, node)) {
                readOnly = true;
            }

            let { attrs, events } = this.getAttributesByElement(node, model, functions);

            // 渲染当前节点
            const render = (model, fn?: (...args) => any) => {

                vnode = new VNode(nodeName, attrs, nodeValue, nodeType, events, node);

                let childNodes: any = node.childNodes;
                for (const childNode of [...childNodes]) {
                    vnode.append(this.getVnode(childNode, model, functions, vnode, readOnly));
                }

                return vnode;

            };

            // 有 else
            if (isExistAttr(directiveElse, node)) {
                if (parent?.children && parent.children.length > 0) {
                    let prevVnode = arraylastItem<IMingleVnode>(parent.children);
                    // prevVnode.nextRender === true 则上一个删掉，渲染当前 else元素
                    if (prevVnode.nextRender) {
                        parent.children.pop();      // delete 上一个
                        render(model);
                    } else {    // 当前不渲染，上一个元素不用处理

                    }
                }
            } else if (isExistAttr(directiveIf, node) && !isExistAttr(directiveForeach, node)) {       // 只有if的情况

                if (node.getAttribute(directiveIf)) {
                    // let express = node.attributes[directiveIf].value;
                    let express = node.getAttribute(directiveIf) || '';
                    express = this.parseExpress(express, model);
                    let result = this.parseIF(express);
                    let vn = render(model);
                    vn.nextRender = !result;        // 用下一个节点来判断
                } else {
                    render(model);
                }

            } else if (isExistAttr(directiveForeach, node)) {      // if 和 foreach 都有的情况
                let foreachSyntax = node.getAttribute(directiveForeach) ?? '';
                let ifExpress = node.getAttribute(directiveIf) ?? '';

                // w-foreach="data as item" 或者 data as (item,index)
                if (!/^(\w+|\w+\.\w+) as (\w+|\(.+?\))$/.test(foreachSyntax)) {
                    console.error(`${ foreachSyntax }格式不正确`);
                }

                ifExpress = this.parseExpress(ifExpress, model);

                let { itemName, indexName, loopData } = this.getForEachVars(foreachSyntax, model);

                for (const key in loopData) {
                    let ifResult: boolean;

                    if (!loopData.hasOwnProperty(key)) continue;
                    let value = loopData[key];
                    let itemModel = {
                        [itemName] : value,
                        [indexName]: key,       // index
                    };

                    let newifExpress = this.parseExpress(ifExpress, itemModel);

                    // 存在 w-if 元素
                    if (isExistAttr(directiveIf, node)) {
                        try {
                            ifResult = Boolean(eval(newifExpress));
                        } catch (e) {
                            console.warn(`${ newifExpress }表达式格式错误`);
                            ifResult = false;
                        }
                    } else {        // 不存在条件则为true，默认渲染
                        ifResult = true;
                    }

                    if (ifResult) {
                        let vn = render(itemModel);
                        if (parent && isArray(parent.children)) {
                            parent.children.push(vn);
                        }
                    }
                }
                // TODO 应该有更好的方案
                parent?.children.pop();

            } else {
                render(model);
            }


        } else if (nodeType === 3) {        // 文本节点
            if (node.nodeValue && node.nodeValue.trim()) {

                let nodeValue = readOnly
                    ? node.nodeValue
                    : this.parseTpl(node.nodeValue, model, 'tpl');
                vnode = new VNode(undefined, undefined, nodeValue, nodeType, {}, node);
            }
        }
        return vnode;
    }

    // vnode上还有特殊指令了，在这里把不需要的属性过滤掉
    public vnodeToHtml(vnode: IMingleVnode) {
        if (!vnode) {
            return '';
        }

        let { type, data, tag, events, children, value, isChanged } = vnode;
        let el;
        let isRemoveElement = false;

        // if (isChanged) {
        //     console.log('直接返回真实DOM元素');
        //     return vnode.el;
        // }

        if (type === 1) {
            el = document.createElement(tag);

            // events
            for (const event in events) {
                if (!events.hasOwnProperty(event)) continue;
                let eventItems = events[event];

                for (const eventItem of eventItems) {
                    el.addEventListener(eventItem.type, (e) => {
                        let { call, func, args } = eventItem.listener;
                        args = args || [];

                        if (args.length > 0) {
                            args = args.map(arg => arg === '$event' ? e : arg === 'this' ? el : arg);
                            func?.call(call, ...args);
                        } else {
                            func?.call(call);
                        }

                    });
                }
            }

            // attributes
            for (const k in data) {
                if (!data.hasOwnProperty(k)) continue;

                let v = data[k];

                if (k === 'class' && v === 'component-container') {
                    isRemoveElement = true;
                    // break;
                }


                // TODO 把不必要的属性排除掉
                if (k === directiveForeach
                    || k === directiveIf
                    || k === directiveElse
                    || k === directiveReadonly
                ) {
                    continue;
                }

                // TODO k === DataComponentUID      更新虚拟DOM的时候，避免自定义组件不渲染 
                if (k === DataComponentUID) {
                    console.log(v);
                    continue;
                }

                el.setAttribute(k, v);
            }

            if (isRemoveElement) {
                // console.log(el);        // class='component-container'  容器
                // return el;
            }

            // children
            for (const child of children) {
                let elements = this.vnodeToHtml(child);
                el.append(elements);
            }

            //  text
        } else if (type === 3) {
            el = value;
        }
        return el;
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
        for (const { name, value } of [...el.attributes]) {

            // // 把不必要的属性排除掉
            // if (name === directiveForeach
            //     || name === directiveIf
            //     || name === directiveElse
            //     || name === directiveReadonly
            // ) {
            //     continue;
            // }

            // 事件
            if (name.startsWith('@')) {
                let [, event] = name.split('@');      // 事件名称 'click'
                let [method, arg] = value.split(/\((.*?)\)/);  // 把 handleClick($2) 分成两部分 [handleClick,undefined]
                event = event?.trim();
                method = method?.trim();
                arg = arg?.trim();

                if (!method) continue;
                let args: Array<any> = [];

                if (arg) {
                    args = this.parseArguments(arg.split(','), model);
                }

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
                    events[event] = [e];
                } else {
                    events[event].push(e);
                }

            } else if (name.startsWith('^')) {      // 不解析该属性

                let [, nativeName] = name.split('^');     // "^href" => "href"
                attrs[nativeName] = value;

            } else if (isExpandSymbol(name)) {

                let props = this.parseExpand(name, model);
                attrs = Object.assign(attrs, props);

            } else {        // 属性

                if (isWuiTpl(value)) {
                    attrs[name] = this.parseTpl(value, model, 'tpl');
                } else {
                    attrs[name] = value;
                }
            }
        }
        return {
            attrs,
            events,
        };
    }

    private parseForeach() {

    }

    private parseExpress(express: string, model: object): string {
        if (isUndefined(express)) {
            return express;
        }
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

    // 触发自定义事件
    private trigger(eventName: string) {
        // 创建自定义事件
        let event = document.createEvent('HTMLEvents');
        // 初始化testEvent事件
        event.initEvent(eventName, false, true);
        // event.data = { 'click': true };
        // 触发自定义事件
        window.dispatchEvent(event);
    }

    private getForEachVars(express: string, model: object) {
        let [arrayName, itemName]: Array<string> = express.split('as');
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

        if (!isObject(loopData) && !isArray(loopData)) {
            console.error(`w-foreach 请使用正确的数据格式`, arrayName, model, loopData);
        }

        return {
            itemName, indexName, loopData,
        };
    }

    private parseExpand(name, model): object {
        let [, key]: Array<string> = name.split('...');
        let itemModel = getObjectValue(key, model);
        let props = {};

        if (isUndefined(itemModel)) {
            return {};
        }

        for (const key in itemModel) {
            if (!itemModel.hasOwnProperty(key)) continue;
            let value = itemModel[key];

            // element 上没有这个属性才给它设置
            // 如果是 混合数据类型, 对数据格式做处理，否则会成为 [object,object]
            if (isObject(value) || isArray(value)) {
                value = JSON.stringify(value);
            }
            props[key] = value;
        }
        return props;
    }

}
