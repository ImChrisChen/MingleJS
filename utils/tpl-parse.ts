/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/19
 * Time: 11:13 上午
 */
import { isEmptyStr } from '@utils/util';

// 'pf=<{pf}>' => 'pf=ios'
export function parseTpl(tpl: string): String {
    let fields: Array<string> = getTplFields(tpl);

    fields.forEach(field => {
        let input = document.querySelector(`input[name=${ field }]`);
        let val = input?.['value'] ?? '';
        tpl = tpl.replace(/<{(.*?)}>/g, encodeURIComponent(val));      // 将模版替换为指定的值
    });

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

    if(isEmptyStr(enumStr)) return [];

    return enumStr.split(';').reduce((arr: Array<object>, group) => {
        let [ key, val ] = group.split(',');
        arr.push({ [key]: val });
        return arr;
    }, []);
}

// export function readyUrl(url) {
//     if(!url) {
//         return '';
//     }
//     url += (url.indexOf('?') > 0 ? '&' : '?');
//
//     let relay = getRelay(url), _o, val;
//     for(var i in relay) {
//         _o = $('input[name="' + relay[i] + '"], select[name="' + relay[i] + '"]').first();
//         val = _o.attr('type') === 'checkbox' ? (_o.prop('checked') ? _o.val() : '') : _o.val() || '';
//         url = url.replace('<{' + relay[i] + '}>', encodeURIComponent(val));
//     }
//     url += 'jsoncallback=?';
//     return url;
// }
//
// export function getRelay(url) {
//     //把url中所有<{}>找出来
//     if(!url) {
//         return [];
//     }
//     url = url.match(/<\{([^}]+)\}>/ig);
//     for(var i in url) {
//         url[i] = url[i].substr(2, url[i].length - 4);
//     }
//     return url ? url : [];
// }

