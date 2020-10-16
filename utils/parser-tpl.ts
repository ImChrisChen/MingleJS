/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/19
 * Time: 11:13 上午
 */

import { isDOM, isEmptyStr, isObject } from '@utils/inspect';

declare type IParseModeData = HTMLElement | object | null;

// 'pf=<{pf}>' => 'pf=ios'
export function parseTpl(
    tpl: string,
    data: IParseModeData = document.querySelector('body'),
): string {
    let fields: Array<string> = getTplFields(tpl);

    // 去body 里面找input
    if (isDOM(data)) {
        fields.forEach(field => {
            let input = document.querySelector(`input[name=${ field }]`);
            let val = input?.['value'] ?? '';
            tpl = tpl.replace(/<{(.*?)}>/g, encodeURIComponent(val));      // 将模版替换为指定的值
        });
    }

    if (isObject(data)) {
        fields.forEach(field => {
            let val = data[field] ?? '';
            tpl = tpl.replace(/<{(.*?)}>/g, encodeURIComponent(val));
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
    return parseStr2JSON(enumStr, ';', ',');
}

export function parseLineStyle(style: string): object {
    let res = parseCamelCase(style);
    let stylesJson = parseStr2JSON(res, ';', ':');
    return Object.assign({}, ...stylesJson);
}

function parseStr2JSON(str: string, rowStplit: string, cellSplit: string): Array<object> {
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
        console.log(ret);
        ret = ret.substr(1);
        return ret.toUpperCase();
    });
}
