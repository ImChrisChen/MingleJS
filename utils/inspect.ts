/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/10/16
 * Time: 下午3:41
 */

export function isNumber(v): v is number {
    return typeof v === 'number';
}

export function isString(v): v is string {
    return typeof v === 'string';
}

export function isEmptyStr(v) {
    return v === '';
}

export function isEmpty(v: any): boolean {
    return v === undefined;
}

export function isBool(v): v is boolean {
    return typeof v === 'boolean';
}

export function isObject(v): v is object {
    return typeof v === 'object' && v.constructor === Object;
}

export function isEmptyObject(v) {
    return isObject(v) && Object.keys(v).length === 0;
}

export function isArray(v): v is Array<any> {
    // return typeof v === 'object' && v.constructor === Array;
    return Array.isArray(v);
}

export function isEmptyArray(v): boolean {
    return v.constructor === Array && v.length === 0;
}

export function isNoEmptyArray(v): boolean {
    return isArray(v) && !isEmptyArray(v);
}

export function isUndefined(v): v is undefined {
    return typeof v === 'undefined';
}

export function isFunc(v): v is Function {
    return typeof v === 'function' && v.constructor === Function;
}

// 判断是否是 JSON 字符串
export function isJSON(v: string): boolean {
    if (!isString(v)) {
        console.warn('It is not a string!');
        return false;
    }

    try {
        let obj = JSON.parse(v);
        if (isObject(obj) || isArray(obj)) {
            return true;
        } else {
            return false;
        }

    } catch (e) {
        console.log('error：' + v + '!!!' + e);
        return false;
    }
}

/**
 * 判断是否是多层调用对象的key的结构
 * 如:
 * 'item.name'  => true
 * 'item.100'   => false
 * @param v
 */
export function isObjectKeys(v: string): boolean {
    return /[^0-9]\.[^0-9]/.test(v);
}

type IdataType =
    'boolean'
    | 'number'
    | 'string'
    | 'undefined'
    | 'null'
    | 'function'
    | 'array'
    | 'date'
    | 'object'
    | 'regExp'
    | 'set'
    | 'map';

// 获取数据类型
export function getType(obj): IdataType {
    const str = Object.prototype.toString.call(obj);

    const map: { [key: string]: IdataType } = {
        '[object Boolean]'  : 'boolean',
        '[object Number]'   : 'number',
        '[object String]'   : 'string',
        '[object Undefined]': 'undefined',
        '[object Null]'     : 'null',
        '[object Function]' : 'function',
        '[object Array]'    : 'array',
        '[object Date]'     : 'date',
        '[object RegExp]'   : 'regExp',
        '[object Object]'   : 'object',
        '[object Set]'      : 'set',
        '[object Map]'      : 'map',
    };
    return map[str];
}

// 判断对象是否是 ReactNode
export function isReactNode(v: any): boolean {
    return typeof v.$$typeof === 'symbol';
}

// 判断是否是 DOM
export function isDOM(v): v is HTMLElement {
    return (typeof HTMLElement === 'object') ?
        v instanceof HTMLElement :
        v && typeof v === 'object' && v.nodeType === 1 && typeof v.nodeName === 'string';
}

// 判断是否 DOM 字符串
export function isDOMString(v: string): boolean {
    return /(<[a-zA-Z])(.*?)(>)/.test(v);
}

// 判断是否是 WUI 的模版
export function isWuiTpl(v: string): boolean {
    return /<{(.+?)}>/.test(v);
}

// 判断字符串是否是wui组件
export function isWuiByString(v: string) {
    return /(.*?)(<[a-zA-Z]+)(.*?)/.test(v);
}

// 判断 DOM 是否是 Wui组件
// export function isWuiByElement(v: HTMLElement) {
//     let name = v.dataset.fn;
//     if (!name) return false;
//     return /^[a-zA-Z]/.test(name);
// }

// 判断是否是管道操作符
export function isPipe(v: string) {
    return /[0-9]+ |> ([a-zA-Z])/.test(v);
}

// 判断是否是自定义元素
export function isCustomElement(tagName: string): boolean {
    // tagName = tagName.toLowerCase();
    return /[a-z]-[a-z]/.test(tagName);
}

// 判断字符串中是否存在html字符串
export function isHtmlTpl(v: string): boolean {
    return /(.*?)(<[a-zA-Z]+) (.*?)/.test(v);
}

// 判断字符串是否是拓展运算符 '...item.dataset'
export function isExpandSymbol(v: string) {
    // return v.startsWith('...');
    return /^(\.\.\.)[a-zA-Z|_|$](.*?)/.test(v);
}

// 判断字符串中是否包含wui组件
export function isIncludeWuiComponent(v: string) {
    return /(<[a-zA-Z])(.*?)(data-fn=("|'|`|)[a-zA-Z]("|'|`|))(.*?)>/.test(v);
}


// 检测字符串是不是表达式
export function isExpress(express: string) {
    //表达式
    if (/[\n\!\|\&\+\-\*\/\=\>\<\(\)\{\}\~\%\'\"]+/.test(express)) {
        return true;
    } else {
        return false;
    }
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

// 是否url
export function isUrl(url: string): boolean {
    let rule = /^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/;
    return rule.test(url);
}

