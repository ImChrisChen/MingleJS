/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/20
 * Time: 2:36 上午
 */

// 获取数组最后一项
export function arraylastItem<T>(array: Array<T>): T {
    let lastIndex = array.length - 1;
    return array[lastIndex];
}

// 删除数组中的某一项
export function arrayDeleteItem(array: Array<any>, callback: (item, index?: number) => boolean) {
    let i = array.findIndex(callback);
    array.splice(i, 1);
    return array;
}

// 求树最大深度
export function getDepthMax(node: any, children = 'children') {

    if (!node[children] || node[children].length === 0) {
        return 1;
    }

    let maxChildDepth = node[children].map(item => getDepthMax(item));

    return 1 + Math.max(...maxChildDepth);
}

// 等待
export const sleep = (time: number): Promise<void> => new Promise(resolve => setTimeout(resolve, time));

// DOM 尾递归
export function deepEachElementTail(root, callback?: (el: HTMLElement) => void) {
    // 这里输出的是根节点
    if (!root) return;

    if (root.children.length) {
        Array.from(root.children).forEach(item => {
            return deepEachElementTail(item, callback);
        });
    }
    callback && callback(root);
}

// DOM 前递归
export function deepEachElement(root, callback?: (el: HTMLElement, parentNode: any) => void, parentNode?) {
    if (!root) return;

    callback && callback(root, parentNode);

    if (root.children.length) {
        Array.from(root.children).forEach(item => {
            return deepEachElement(item, callback, root);
        });
    }
}

// 前递归 => root => left => right => children
export function deepEach(
    tree: Array<object> = [],
    // callback: (node?: object | any, i?: number | any, parent?: object | any, resultArr?: Array<object> | any) => {},
    callback: (node: any, i: number, parent: any, arr: Array<any>) => any,
    parent?: object,
    resultArr: Array<any> = [],
    children: string = 'children',
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

        if (childrens && childrens.length > 0) deepEach(childrens, callback, node, resultArr, children);
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
};

interface IBrowserInfo {
    browser: string,
    ver: string
}

// 获取浏览器信息 / 版本
export function getBrowerInfo(): IBrowserInfo {
    let Sys = {} as IBrowserInfo;
    let ua = navigator.userAgent.toLowerCase();
    let re = /(msie|firefox|chrome|opera|version).*?([\d.]+)/;
    let m = ua.match(re) || [];
    Sys.browser = m[1].replace(/version/, 'safari');
    Sys.ver = m[2];
    return Sys;
}

//利用原生Js获取操作系统版本
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
