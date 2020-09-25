/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/19
 * Time: 6:38 下午
 */

import React, { ReactElement } from 'react';

// 真实DOM => 字符串 (一个)
export function elementParseStr(el: HTMLElement) {
    let temp = document.createElement('div') as HTMLDivElement;
    temp.appendChild(el as HTMLElement);
    return temp.innerHTML;
}

// 真实DOM => 字符串 (多个)
export function elementParseAllStr(els: Array<HTMLElement>) {
    return els.map(element => elementParseStr(element));
}

// 真实DOM 转 ReactDOM (一个)
export function elementParseVirtualDOM(el: HTMLElement): any {
    let strHtml = elementParseStr(el);
    return strParseVirtualDOM(strHtml);
}

// 真实DOM 转 ReactDOM (多个)
export function elementParseAllVirtualDOM(els: Array<HTMLElement>): Array<ReactElement> {
    return els.map(el => elementParseVirtualDOM(el));
}

// 字符串 => ReactDOM
export function strParseVirtualDOM(strHtml: string): any {
    return <div dangerouslySetInnerHTML={ { __html: strHtml } }/>;
}

// 字符串 => 真实DOM
export function strParseDOM(strHtml: string): NodeListOf<ChildNode> {

    let container = document.createElement('div');

    container.innerHTML = strHtml;

    return container.childNodes;

}

// 字符串 => DOM中的innerText
export function strParseDOMText(strHtml: string): string {

    let container = document.createElement('div');

    container.innerHTML = strHtml;

    return container.innerText;

}

class VNode {
    // 构造函数
    private tag: any;
    private data: any;
    private value: any;
    private type: any;
    private children: any[];

    constructor(tag, data, value, type) {
        // tag:用来表述 标签  data：用来描述属性  value：用来描述文本 type：用来描述类型
        this.tag = tag && tag.toLowerCase();//文本节点时 tagName是undefined
        this.data = data;
        this.value = value;
        this.type = type;
        this.children = [];

    }

    appendChild(vnode) {
        this.children.push(vnode);
    }
}

/**
 利用递归 来遍历DOM元素 生成虚拟DOM
 Vue中的源码使用 栈结构  ，使用栈存储 父元素来实现递归生成
 */
export function getVNode(node) {
    let nodeType = node.nodeType;
    let _vnode;

    if(nodeType === 1) {
        // 元素
        let nodeName = node.nodeName;//元素名
        let attrs = node.attributes;//属性  伪数组
        let _attrObj = {};
        for(let i = 0; i < attrs.length; i++) {//attrs[ i ] 属性节点（nodeType == 2) 是对象
            _attrObj[attrs[i].nodeName] = attrs[i].nodeValue;
        }
        _vnode = new VNode(nodeName, _attrObj, undefined, nodeType);
        // 考虑node的子元素
        let childNodes = node.childNodes;
        for(let i = 0; i < childNodes.length; i++) {
            _vnode.appendChild(getVNode(childNodes[i]));//递归
        }
    } else if(nodeType === 3) {
        // 文本节点
        _vnode = new VNode(undefined, undefined, node.nodeValue, nodeType);
    }
    return _vnode;
}
