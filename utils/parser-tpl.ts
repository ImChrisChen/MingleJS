/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/19
 * Time: 11:13 上午
 */

// 正则手册 https://tool.oschina.net/uploads/apidocs/jquery/regexp.html
import { isDOM, isEmptyStr, isUndefined } from '@utils/inspect';
import { parserEscape2Html } from '@utils/parser-char';

declare type tplTyle = 'tpl' | 'field'

declare type IParseModeData = HTMLElement | object | null;

// 'pf=<{pf}>' => 'pf=ios' 或者
// 'data.length > 1' => '10 > 1' => true
export function parseTpl(tpl: string, itemData: IParseModeData = document.body, type: tplTyle = 'tpl'): string {

    if (!tpl) return tpl;

    tpl = parserEscape2Html(tpl);       // 字符替换 "&lt" => "<"

    let fields: Array<string> = [];
    if (type === 'tpl') {
        fields = getTplFields(tpl);
    } else if (type === 'field') {
        fields = getExpressFields(tpl);
    }
    tpl = replaceTplDataValue(fields, itemData, tpl, type);
    return tpl.replace(/<{(.*?)}>/g, v => {
        let [ , express ] = /<{(.*?)}>/.exec(v) ?? [];
        let exp = isExpress(express.trim());
        if (exp) {
            try {
                return eval(express);
            } catch (e) {
                console.error(`${ express } 表达式格式不正确,运算错误`);
                return express;
            }
        } else {
            return express;
        }
    });
}

function replaceTplDataValue(fields, itemData, tpl, type: tplTyle = 'tpl') {
    fields.forEach(field => {
        let regExp = createRegExp(type, field);

        if (isExpress(field.trim())) {
            let fs = getExpressFields(field);
            tpl = replaceTplDataValue(fs, itemData, tpl, 'field');
        } else {
            // 多级属性访问 例如: "<{product.detail.title}>"
            if (/[^0-9]\.[^0-9]/.test(field)) {
                let fieldArr = field.split('.');
                let val: any = fieldArr.reduce((data, fieldItem) => {
                    // TODO 取数据的时候要过滤掉两边的空格，否则key值有空格时会拿不到数据返回成为undefined,(模版替换的时候就不需要加trim,不然会匹配不到字符串无法替换)
                    let val = data[fieldItem.trim()];
                    if (isUndefined(val)) {
                        // console.warn(` ${field} 未匹配到模版变量，暂不替换`, itemData);
                        return field;
                    }
                    return val;
                }, itemData);
                tpl = tpl.replace(regExp, val);
                // 单级属性访问 例如: "<{product}>"
            } else {
                let key = field.trim();
                let val = isDOM(itemData)
                    ? encodeURIComponent((itemData.querySelector(`input[name=${ key }]`) as HTMLInputElement)?.value ?? '')
                    : (itemData[key]);

                // 只有对象中有这个属性才会被替换
                if (!isUndefined(val)) {
                    console.log(tpl);
                    tpl = tpl.replace(regExp, val);
                    console.log(tpl);
                }
            }
        }
    });
    return tpl;
}

function createRegExp(type: tplTyle, field): RegExp {
    let regExp;
    if (type === 'tpl') {
        regExp = new RegExp(`<{${ field }}>`, 'g');
    } else if (type === 'field') {
        regExp = new RegExp(`${ field }`, 'g');
    }
    return regExp as RegExp;
}

// 解析 if else 语法
// `<(if <{product.count}> >0 )> <div title="超预算"> <{product.name}> </div> <(/if)>`;
export function parseIfelse(tpl, itemData: IParseModeData) {
    let regExp = /<\(if\s+[\S\s]+?\)>([\S\s]+?)(<\(else\)>[\S\s]+?)?<\(\/if\)>/g;
    if (!regExp.test(tpl)) return tpl;
    return tpl.replace(regExp, (val: string /*val整个是个if代码块*/) => {
        // if 匹配出 if 条件表达式 例如 "100 > 90"
        let execResult = /<\(if\s+([\S\s]+?)\)>([\S\s]+?)(<\(else\)>[\S\s]+?)?<\(\/if\)>/g.exec(val) || [];
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
        let list = itemData[listName];
        return list.map(item => {
            let model = { [itemName]: item };
            let tpl = parseTpl(codeBlock, model);
            return tpl;
        }).join('');
    });
}

export function parseFor(codeBlock: string, itemData, { list, item }): string {
    let data = itemData[list];
    let html = '';
    return data.map(it => {
        let model = { [item]: it };
        let html = parseTpl(codeBlock, model, 'tpl');
        let [ , exp ] = html.match(/@if=["'`](.*?)["'`]/) ?? [];
        exp = parseTpl(exp, model, 'field');      // if 条件解析后,执行if条件
        // console.log(exp, eval(exp), html);
        return eval(exp) ? html : '';
    }).join('');
}

// 解析 四则运算(加减乘除)
export function parseMathCalc(tpl) {
    let regExp = /(\(\d+)(\+|-|\*|\/)(\d+\))/;
    return tpl.replace(regExp, e => eval(e));       // TODO 待完善递归匹配
}

// `<{pf}>xxx<{game_id}>` [ 'pf', 'game_id' ];
export function getTplFields(tpl: string): Array<string> {
    let matchArr: Array<string> = tpl.match(/<{(.*?)}>/g) ?? [];
    return matchArr.map(item => {
        let [ , fieldName ] = item.match(/<{(.*?)}>/) ?? [];
        return fieldName;
    });
}

// `pf / 2 + 100` => [pf]
export function getExpressFields(tpl): Array<string> {
    let fields = tpl.match(/[^\s\n\!\|\&\+\-\*\/\=\>\<\(\)\{\}\~\%\'\"]+/g) ?? [];      // 匹配表达式中需要解析字段
    return fields.filter(item => isNaN(Number(item)));
}

// 检测字符串是不是表达式
export function isExpress(express: string) {
    if (isNaN(Number(express)) && !(/[\n\!\|\&\+\-\*\/\=\>\<\(\)\{\}\~\%\'\"]+/.test(express))) {
        // 变量
        // console.log('变量', express);
        return false;
    } else {
        // console.log('表达式', express);
        return true;
    }
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
