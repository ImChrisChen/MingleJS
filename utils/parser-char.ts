/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/10/27
 * Time: 6:22 下午
 */
import { isString } from '@utils/inspect';

//普通字符转换成转意符
export function parserHtml2Escape(sHtml) {
    return sHtml.replace(/[<>&"]/g, function (c) {
        return {
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            '"': '&quot;',
        }[c];
    });
}

//转意符换成普通字符
export function parserEscape2Html(str) {
    var arrEntities = {
        'lt'  : '<',
        'gt'  : '>',
        'nbsp': ' ',
        'amp' : '&',
        'quot': '"',
    };
    return str.replace(/&(lt|gt|nbsp|amp|quot);/ig, function (all, t) {
        return arrEntities[t];
    });
}

// 将多个连续空格合并成一个空格
export function parserMergeSpace(str) {
    str = str.replace(/(\s|&nbsp;)+/g, ' ');
    return str;
}

// 去掉html标签
export function parserRemoveHtmlTag(tab) {
    return tab.replace(/<[^<>]+?>/g, '');//删除所有HTML标签
}
