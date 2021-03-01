/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2021/2/28
 * Time: 6:49 下午
 */

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

class VNode {
    children: any[];
    // 构造函数
    private tag: any;           // 标签名称
    private data: any;          // 属性
    private value: any;         // nodeValue | textContent
    private type: any;          // 节点类型 nodeType
    private events: any;        // 事件

    constructor(tag, data, value, type) {
        // tag:用来表述 标签  data：用来描述属性  value：用来描述文本 type：用来描述类型
        this.tag = tag;     //文本节点时 tagName是undefined
        this.data = data;
        this.value = value;
        this.type = type;
        this.children = [];
    }

    public appendChild(vnode) {
        this.children.push(vnode);
    }
}

/**
 利用递归 来遍历DOM元素 生成虚拟DOM
 Vue中的源码使用 栈结构  ，使用栈存储 父元素来实现递归生成
 */
export function getVNode(node: HTMLElement) {
    let nodeType = node.nodeType;
    let _vnode;

    if (nodeType === 1) {
        // 元素
        let nodeName = node.nodeName;//元素名
        let attrs = node.attributes;//属性  伪数组
        let _attrObj: any = {};
        for (let i = 0; i < attrs.length; i++) {//attrs[ i ] 属性节点（nodeType == 2) 是对象
            _attrObj[attrs[i].nodeName] = attrs[i].nodeValue;
        }
        _vnode = new VNode(nodeName, _attrObj, undefined, nodeType);
        // 考虑node的子元素
        let childNodes: any = node.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            _vnode.appendChild(getVNode(childNodes[i]));//递归
        }
    } else if (nodeType === 3) {
        // 文本节点
        _vnode = new VNode(undefined, undefined, node.nodeValue, nodeType);
    }
    return _vnode;
}

export class VirtualDOM {

    constructor() {

    }

    private static getAttributesByElement(el): object {
        let attrs = {};
        for (const attr of [...el.attributes]) {
            let { name, value } = attr;
            attrs[name] = value;
        }
        return attrs;
    }

    // 获取事件监听
    private static getEventsByElement(el) {
        // let res = getEventListeners(el)
    }

    public getVnode(node: HTMLElement) {
        let nodeType = node.nodeType;
        let vnode;
        let attrs = VirtualDOM.getAttributesByElement(node);

        if (nodeType === 1) {               // element
            let nodeName = node.localName;

            vnode = new VNode(nodeName, attrs, node.nodeValue, nodeType);
            let childNodes: any = node.childNodes;
            for (const childNode of childNodes) {
                vnode.appendChild(getVNode(childNode));
            }
        } else if (nodeType === 3) {        // 文本节点
            vnode = new VNode(undefined, undefined, node.nodeValue, nodeType);
        }
        return vnode;
    }

}
