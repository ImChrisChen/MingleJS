/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/20
 * Time: 2:36 上午
 */

export function isStr(v): v is string {
    return typeof v === 'string';
}

export function isEmptyStr(v) {
    return v === '';
}

export function isBool(v): v is boolean {
    return typeof v === 'boolean';
}

export function isObject(v): v is object {
    return typeof v === 'object' && v.constructor === Object;
}

export function isEmptyObject(v) {
    return JSON.stringify(v) === '{}';
}

export function isArray(v): v is Array<any> {
    return typeof v === 'object' && v.constructor === Array;
}

export function isEmptyArray(v) {
    return JSON.stringify(v) === '[]';
}

export function isNoEmptyArray(v) {
    return isArray(v) && !isEmptyArray(v);
}

export function isUndefined(v): v is undefined {
    return typeof v === 'undefined';
}

export function isFunc(v): v is Function {
    return typeof v === 'function';
}

export function isDOM(v): v is HTMLElement {
    return (typeof HTMLElement === 'object') ?
        v instanceof HTMLElement :
        v && typeof v === 'object' && v.nodeType === 1 && typeof v.nodeName === 'string';
}

export function DeepEachElement(root, callback?: (el: HTMLElement) => void) {
    // 这里输出的是根节点
    if (!root) return;


    if (root.children.length) {
        Array.from(root.children).forEach(item => {
            return DeepEachElement(item, callback);
        });
    }
    callback && callback(root);
}

// 判断是否是Class https://zhuanlan.zhihu.com/p/53385348
export function isClass(obj, strict?): obj is ClassDecorator {
    if (typeof obj != 'function') return false;

    let str = obj.toString();

    // async function or arrow function
    if (obj.prototype === undefined) return false;
    // generator function or malformed definition
    if (obj.prototype.constructor !== obj) return false;
    // ES6 class
    if (str.slice(0, 5) == 'class') return true;
    // has own prototype properties
    if (Object.getOwnPropertyNames(obj.prototype).length >= 2) return true;
    // anonymous function
    if (/^function\s+\(|^function\s+anonymous\(/.test(str)) return false;
    // ES5 class without `this` in the body and the name's first character
    // upper-cased.
    if (strict && /^function\s+[A-Z]/.test(str)) return true;
    // has `this` in the body
    if (/\b\(this\b|\bthis[\.\[]\b/.test(str)) {
        // not strict or ES5 class generated by babel
        if (!strict || /classCallCheck\(this/.test(str)) return true;

        return /^function\sdefault_\d+\s*\(/.test(str);
    }

    return false;
}

interface IDeepEachCallback {

}

// 前递归 => root => left => right => children
export function deepEach(
    tree: Array<object> = [],
    // callback: (node?: object | any, i?: number | any, parent?: object | any, resultArr?: Array<object> | any) => {},
    callback: Function,
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
