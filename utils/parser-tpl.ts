/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/19
 * Time: 11:13 上午
 */

// 正则手册 https://tool.oschina.net/uploads/apidocs/jquery/regexp.html
import { isDOM, isEmptyStr, isObject, isUndefined, isWuiTpl } from '@utils/inspect';

declare type IParseModeData = HTMLElement | object | null;

// 'pf=<{pf}>' => 'pf=ios'
export function parseTpl(tpl: string, itemData: IParseModeData = document.body): string {
    tpl = parseForeach(tpl, itemData as object);
    tpl = parseVar(tpl, itemData);
    tpl = parseIfelse(tpl, itemData);
    return tpl;
}

// 解析模版变量 例如: 'pf=<{pf}>' => 'pf=1'
export function parseVar(tpl: string, itemData: IParseModeData = document.body): string {
    let fields: Array<string> = getTplFields(tpl);

    if (!isWuiTpl(tpl)) return tpl;

    // 去body 里面找input
    if (isDOM(itemData)) {
        fields.forEach(field => {
            let key = field.trim();
            let input = document.querySelector(`input[name=${ key }]`);
            let val = input?.['value'] ?? '';
            let regExp = new RegExp(`<{${ field }}>`, 'g');
            tpl = tpl.replace(regExp, encodeURIComponent(val));              // 将模版替换为指定的值
        });
    } else if (isObject(itemData)) {
        fields.forEach(field => {
            let regExp = new RegExp(`<{${ field }}>`, 'g');

            // 多级属性访问 例如: "<{product.detail.title}>"
            if (/[^0-9]\.[^0-9]/.test(field)) {
                let fieldArr = field.split('.');
                let val: any = fieldArr.reduce((data, fieldItem) => {
                    // TODO 取数据的时候要过滤掉两边的空格，否则key值有空格时会拿不到数据返回成为undefined,(模版替换的时候就不需要加trim,不然会匹配不到字符串无法替换)
                    let val = data[fieldItem.trim()];
                    if (isUndefined(val)) {
                        console.error(` ${ field } 模版解析错误`);
                        return '';
                    }
                    return val;
                }, itemData);
                tpl = tpl.replace(regExp, val);

                // 单级属性访问 例如: "<{product.name}>"
            } else {
                let val = itemData[field.trim()] ?? '';
                // tpl = tpl.replace(/<{(.*?)}>/g, encodeURIComponent(val));        // TODO value为中文的情况下不适用
                tpl = tpl.replace(regExp, val);
            }

        });
    }
    return tpl;
}

// 解析 if else 语法
// `<(if <{product.count}> >0 )> <div title="超预算"> <{product.name}> </div> <(/if)>`;
export function parseIfelse(tpl, itemData: IParseModeData) {
    let regExp = /<\(if\s+[\S\s]+?\)>([\S\s]+?)(<\(else\)>[\S\s]+?)?<\(\/if\)>/g;
    if (!regExp.test(tpl)) return tpl;
    return tpl.replace(regExp, (val: string /*val整个是个if代码块*/) => {
        // if 匹配出 if 条件表达式 例如 "100 > 90"
        let execResult = /<\(if\s+([\S\s]+?)\)>([\S\s]+?)(<\(else\)>[\S\s]+?)?<\(\/if\)>/g.exec(val) || [];
        console.log(execResult);
        let [ , condtionExpress /*表达式*/, content /* if包裹的内容*/ ] = execResult;
        let result: boolean;
        try {
            result = eval(String(condtionExpress));
        } catch (e) {
            console.error(e);
            result = false;
        }
        console.log(`表达式:'${ condtionExpress }', 执行结果:`, result);
        return result ? content : '';
    });
}

// 解析 foreach 语法
export function parseForeach(tpl, itemData: object) {
    let regExp = /(<{foreach[^}]+}>)([\S\s]*?)(<{\/foreach}>)/g;
    if (!regExp.test(tpl)) return tpl;

    function parseEachHead(eachHead: string) {
        let result = /foreach\s([\w-.]+)\sas\s((\w+)\s=>\s)?([\w-]+)/.exec(eachHead) ?? [];
        return [ result[1], result[4] ]; // ['users' 'user']
    }

    return tpl.replace(regExp, (val: string) => {
        let res = regExp.exec(val) ?? [];
        let [ , eachHead, codeBlock /*eachFoot*/ ] = res;   // eachStart `<{foreach users as user}>`
        let [ listName, itemName ] = parseEachHead(eachHead);
        console.log(listName, itemName, itemData);
        let list = itemData[listName];
        return list.map(item => {
            let model = { [itemName]: item };
            let tpl = parseVar(codeBlock, model);
            console.log(tpl);
            return tpl;
        }).join('');
    });
}

// 解析 四则运算(加减乘除)
export function parseMathCalc(tpl) {
    let regExp = /(\(\d+)(\+|-|\*|\/)(\d+\))/;
    return tpl.replace(regExp, e => eval(e));       // TODO 待完善递归匹配
}

// [ 'pf', 'game_id' ];
export function getTplFields(tpl: string): Array<string> {
    let matchArr: Array<string> = tpl.match(/<{(.*?)}>/g) ?? [];

    return matchArr.map(item => {
        let [ , fieldName ] = item.match(/<{(.*?)}>/) ?? [];
        return fieldName;
    });
}

export function parseEnum(enumStr: string): Array<object> {
    return parseStr2JSONArray(enumStr, ';', ',');
}

export function parseLineStyle(style: string): object {
    let res = parseCamelCase(style);
    let stylesJson = parseStr2JSONArray(res, ';', ':');
    return Object.assign({}, ...stylesJson);
}

export function parseStr2JSONArray(str: string, rowStplit: string, cellSplit: string): Array<object> {
    if (isEmptyStr(str)) return [];

    // return str.split(';').reduce((arr: Array<object>, group) => {
    return str.split(rowStplit).reduce((arr: Array<object>, group) => {
        // let [ key, val ] = group.split(',');
        let [ key, val ] = group.split(cellSplit);
        if (!isEmptyStr(key) && !isEmptyStr(val)) {
            key = key.trim();
            val = val.trim();
            arr.push({ [key]: val });
        }
        return arr;
    }, []);
}

// 中横线转化为 小驼峰
function parseCamelCase(string: string): string {
    return string.replace(/-(.)/g, function (ret) {
        ret = ret.substr(1);
        return ret.toUpperCase();
    });
}
