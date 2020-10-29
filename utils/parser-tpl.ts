/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/19
 * Time: 11:13 上午
 */

// 正则手册 https://tool.oschina.net/uploads/apidocs/jquery/regexp.html
import { isDOM, isEmptyStr, isObject, isUndefined } from '@utils/inspect';

declare type IParseModeData = HTMLElement | object | null;

// 'pf=<{pf}>' => 'pf=ios'
export function parseTpl(
    tpl: string,
    itemData: IParseModeData = document.body,
): string {
    let fields: Array<string> = getTplFields(tpl);

    // 去body 里面找input
    if (isDOM(itemData)) {
        fields.forEach(field => {
            let input = document.querySelector(`input[name=${ field }]`);
            let val = input?.['value'] ?? '';
            let regExp = new RegExp(`<{${ field }}>`, 'g');
            tpl = tpl.replace(regExp, encodeURIComponent(val));              // 将模版替换为指定的值
        });
    } else if (isObject(itemData)) {
        fields.forEach(field => {
            let regExp = new RegExp(`<{${ field }}>`, 'g');

            if (/[^0-9]\.[^0-9]/.test(field)) {     // 匹配是否是多级变量访问
                let fieldArr = field.split('.');
                let val: any = fieldArr.reduce((data, fieldItem) => {
                    let val = data[fieldItem];
                    if (isUndefined(val)) {
                        console.error(` ${ field } 模版解析错误`);
                        return '';
                    }
                    return val;
                }, itemData);
                tpl = tpl.replace(regExp, val);

            } else {
                let val = itemData[field] ?? '';
                // tpl = tpl.replace(/<{(.*?)}>/g, encodeURIComponent(val));        // TODO value为中文的情况下不适用
                tpl = tpl.replace(regExp, val);
            }

        });
    }
    return tpl;
}

// [ 'pf', 'game_id' ];
export function getTplFields(tpl: string): Array<string> {
    let matchArr: Array<string> = tpl.match(/<{(.*?)}>/g) ?? [];

    return matchArr.map(item => {
        let [ , inputname ] = item.match(/<{(.*?)}>/) ?? [];
        return inputname;
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
