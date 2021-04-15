/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/20
 * Time: 2:36 上午
 */

import { isEmptyObject, isUndefined } from './inspect';
import { IVnode } from '@interface/common/component';

/**
 * 获取数组最后一项
 * @param array
 */
export function arraylastItem<T>(array: Array<T>): T {
    let lastIndex = array.length - 1;
    return array[lastIndex];
}

/**
 * 删除数组中的某一项
 * @param array
 * @param callback
 */
export function arrayDeleteItem(array: Array<any>, callback: (item, index?: number) => boolean) {
    let i = array.findIndex(callback);
    array.splice(i, 1);
    return array;
}

/**
 * 求树最大深度
 * @param node     树的根节点
 * @param children 字节点key值
 */
export function getDepthMax(node: any, children = 'children') {

    if (!node[children] || node[children].length === 0) {
        return 1;
    }

    let maxChildDepth = node[children].map(item => getDepthMax(item));

    return 1 + Math.max(...maxChildDepth);
}

/**
 * 等待函数
 * @param time
 */
export const sleep = (time: number): Promise<void> => new Promise(resolve => setTimeout(resolve, time));

/**
 * DOM元素递归(不包含文本节点和其他节点) 从根节点到root节点
 * @param root
 * @param callback
 * @param parentNode
 */
export function deepEachElementTail(root, callback?: (el: HTMLElement, parentNode) => void, parentNode?) {
    // 这里输出的是根节点
    if (!root) return;

    if (root.children.length > 0) {
        [ ...root.children ].forEach(item => {
            deepEachElementTail(item, callback, root);
        });
    }
    callback && callback(root, parentNode);
}

/**
 * DOM 递归 深度优先
 * @param root
 * @param callback
 * @param parentNode
 */
export function deepEachElement(root, callback?: (el: HTMLElement, parentNode?: HTMLElement) => void, parentNode?) {
    if (!root) return;

    callback && callback(root, parentNode);

    if (root.children.length > 0) {
        [ ...root.children ].forEach(item => {
            deepEachElement(item, callback, root);
        });
    }
}

/**
 * 根据点操作符解析获取对象属性
 * @param keys  'item.name'
 * @param model { item: {name: 'Chris'} }
 */
export function getObjectValue(keys: string, model: object = {}): any {

    let isDone = false;

    //多重属性
    if (keys.includes('.')) {
        let fieldArr = keys.split('.').filter(t => t);
        let ov: any = fieldArr.reduce((data, fieldItem) => {
            // TODO 取数据的时候要过滤掉两边的空格，否则key值有空格时会拿不到数据返回成为undefined,(模版替换的时候就不需要加trim,不然会匹配不到字符串无法替换)
            let value = data[fieldItem.trim()];
            if (isUndefined(value)) {
                // console.warn(`${ field } 未匹配到模版变量，暂不替换`, itemData);
                isDone = true;
                return {};
            }
            return value;
        }, model);       // item.name
        return isDone ? undefined : ov;
    } else {
        return model[keys];
    }
}

/**
 * 递归 - 深度优先
 * @param tree
 * @param callback
 * @param parent
 * @param resultArr
 * @param children
 */
export function deepEach(
    tree: Array<object> = [],
    // callback: (node?: object | any, i?: number | any, parent?: object | any, resultArr?: Array<object> | any) => {},
    callback: (node: any, i: number, parent: any, arr: Array<any>) => any,
    children: string = 'children',
    parent?: object,
    resultArr: Array<any> = [],
): void | Array<any> {

    for (let i = 0; i < tree.length; i++) {
        let node = tree[i];
        let childrens = node[children];

        if (callback) {
            /**
             * @node        当前节点
             * @i           当前节点所在组的Index
             * @parent      每一项的父节点
             * @resultArr   返回的数组
             */
            let callbackResult = callback(node, i, parent, resultArr);
            if (callbackResult) {
                resultArr.push(callbackResult);
            }
        }

        if (childrens && childrens.length > 0) deepEach(childrens, callback, children, node, resultArr);
    }

    return resultArr;

}

/**
 * 防抖函数
 * @param method 事件触发的操作
 * @param delay 多少毫秒内连续触发事件，不会执行
 * @returns {Function}
 */
export function debounce(method, delay) {
    let timer: any = null;
    return function temp() {
        let args = arguments;
        timer && clearTimeout(timer);
        timer = setTimeout(function () {
            method.apply(temp, args);
        }, delay);
    };
}

interface IBrowserInfo {
    browser: string,
    ver: string
}


/**
 * 获取浏览器信息 / 版本
 */
export function getBrowerInfo(): IBrowserInfo {
    let Sys = {} as IBrowserInfo;
    let ua = navigator.userAgent.toLowerCase();
    let re = /(msie|firefox|chrome|opera|version).*?([\d.]+)/;
    let m = ua.match(re) || [];
    Sys.browser = m[1].replace(/version/, 'safari');
    Sys.ver = m[2];
    return Sys;
}

/**
 * 利用原生Js获取操作系统版本
 */
export function getOS(): string {
    let sUserAgent = navigator.userAgent;
    let isWin = (navigator.platform == 'Win32') || (navigator.platform == 'Windows');
    let isMac = (navigator.platform == 'Mac68K') || (navigator.platform == 'MacPPC') || (navigator.platform == 'Macintosh') || (navigator.platform == 'MacIntel');
    if (isMac) return 'Mac';
    let isUnix = (navigator.platform == 'X11') && !isWin && !isMac;
    if (isUnix) return 'Unix';
    let isLinux = (String(navigator.platform).indexOf('Linux') > -1);
    if (isLinux) return 'Linux';
    if (isWin) {
        let isWin2K = sUserAgent.indexOf('Windows NT 5.0') > -1 || sUserAgent.indexOf('Windows 2000') > -1;
        if (isWin2K) return 'Win2000';
        let isWinXP = sUserAgent.indexOf('Windows NT 5.1') > -1 || sUserAgent.indexOf('Windows XP') > -1;
        if (isWinXP) return 'WinXP';
        let isWin2003 = sUserAgent.indexOf('Windows NT 5.2') > -1 || sUserAgent.indexOf('Windows 2003') > -1;
        if (isWin2003) return 'Win2003';
        let isWinVista = sUserAgent.indexOf('Windows NT 6.0') > -1 || sUserAgent.indexOf('Windows Vista') > -1;
        if (isWinVista) return 'WinVista';
        let isWin7 = sUserAgent.indexOf('Windows NT 6.1') > -1 || sUserAgent.indexOf('Windows 7') > -1;
        if (isWin7) return 'Win7';
        let isWin10 = sUserAgent.indexOf('Windows NT 10') > -1 || sUserAgent.indexOf('Windows 10') > -1;
        if (isWin10) return 'Win10';
    }
    return 'other';
}

/**
 *
 * @param node
 * @param isInit  是否初始化value
 */
export function vnodeToElement(node: IVnode, isInit = false): HTMLElement {

    if (isEmptyObject(node)) {
        return document.createElement('div');
    }

    let { tag, props, children, events } = node;
    let el = document.createElement(tag);

    // 属性
    for (const name in props) {
        if (!props.hasOwnProperty(name)) continue;
        let value = props[name];

        // 设置表单元素的value
        if (isInit && name === 'value') {
            el.setAttribute(name, '');
            continue;
        }

        el.setAttribute(name, value);
    }

    // 事件
    for (const name in events) {
        if (!events.hasOwnProperty(name)) continue;
        let listeners = events[name];
        for (const eventItem of listeners) {
            let { func, type } = eventItem;
            el.addEventListener(type, (e) => {
                func?.call(el, e);
            });
        }
    }

    // 子元素
    if (children) {
        for (const child of children) {
            let childElm = vnodeToElement(child, isInit);
            el.append(childElm);
        }
    }

    return el;
}

