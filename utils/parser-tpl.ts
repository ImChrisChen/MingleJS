/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/19
 * Time: 11:13 上午
 */

// 正则手册 https://tool.oschina.net/uploads/apidocs/jquery/regexp.html
import { isArray, isDOM, isEmptyObject, isEmptyStr, isObject, isString, isUndefined } from '@utils/inspect';
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
    // 模版字符替换 "<{pf}>" => "2"
    tpl = replaceTplDataValue(fields, itemData, tpl, type);

    // 表达式执行 如 "<{ 1 + 1 }>" => "2"
    tpl = tpl.replace(/<{(.*?)}>/g, v => {
        let [ , express ] = /<{(.*?)}>/.exec(v) ?? [];
        let exp = isExpress(express.trim());
        if (exp) {
            try {
                return eval(express);
            } catch (e) {
                console.warn(`${ express } 表达式格式不正确,运算错误,以替换成空字符串`);
                return '';
            }
        } else {        // 如果不是表达式,则不解析,返回
            console.warn(`${ express } 不是表达式,未解析模版`);
            return type === 'tpl' ? `<{${ express }}>` : express;
        }
    });
    return tpl;
}

// 解析拓展运算符 ...item.dataset
export function parseExpand(tpl: string, itemData: IParseModeData) {
    if (!tpl) return tpl;

    tpl.replace(/\.\.\.(.*?)/, v => {
        return v;
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
                let objectValue: any = fieldArr.reduce((data, fieldItem) => {
                    // TODO 取数据的时候要过滤掉两边的空格，否则key值有空格时会拿不到数据返回成为undefined,(模版替换的时候就不需要加trim,不然会匹配不到字符串无法替换)
                    let value = data[fieldItem.trim()];
                    if (isUndefined(value)) {
                        console.warn(`${ field } 未匹配到模版变量，暂不替换`, itemData);
                        return {};
                    }
                    return value;
                }, itemData);       // item.name
                if (isEmptyObject(objectValue)) {   // 如果是空对象，说明没匹配到值
                    let val = type === 'tpl' ? `<{${ field }}>` : field;
                    // tpl = tpl.replace(regExp, val);
                    tpl = replaceSetTpl(tpl, regExp, val);
                } else {
                    // tpl = tpl.replace(regExp, objectValue);
                    tpl = replaceSetTpl(tpl, regExp, objectValue);
                }
                // 单级属性访问 例如: "<{product}>"
            } else {
                let key = field.trim();
                let val = isDOM(itemData)
                    ? encodeURIComponent((itemData.querySelector(`input[name=${ key }]`) as HTMLInputElement)?.value ?? '')
                    : (itemData[key]);

                // 只有对象中有这个属性才会被替换
                if (isUndefined(val)) {
                    console.warn(` ${ field } 未匹配到模版变量，暂不替换`, itemData);
                } else {
                    // tpl = tpl.replace(regExp, val);
                    tpl = replaceSetTpl(tpl, regExp, val);
                }
            }
        }
    });
    return tpl;
}

// 模版替换 统一收拢
function replaceSetTpl(tpl: string, regExp: RegExp, value: string | object) {
    if (isObject(value) || isArray(value)) {
        value = JSON.stringify(value);
    }
    return tpl.replace(regExp, value);
}

function createRegExp(type: tplTyle, field): RegExp {
    let regExp;
    if (type === 'tpl') {
        regExp = new RegExp(`<{${ field }}>`, 'g');
    } else if (type === 'field') {
        // TODO 三元运算法加空格在这里会报错，后面有时间再优化这个，/?/
        // console.log(field);
        regExp = new RegExp(`${ field }`, 'g');
    }
    return regExp as RegExp;
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
    //表达式
    if (/[\n\!\|\&\+\-\*\/\=\>\<\(\)\{\}\~\%\'\"]+/.test(express)) {
        return true;
    } else {
        return false;
    }
}

export function parsePipeExpress(tpl: string) {
    tpl.replace(/[0-9]+ |> ([a-zA-Z])/, v => {
        return v;
    });
}

// 1,Android;2,iOS => [{1:Android},{2:iOS}]
export function parseEnum(enumStr: string): Array<object> {
    return parseStr2JSONArray(enumStr, ';', ',');
}

// inline-style 解析成 react-style
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
export function parseCamelCase(string: string): string {
    return string.replace(/-(.)/g, function (ret) {
        ret = ret.substr(1);
        return ret.toUpperCase();
    });
}
