/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/21
 * Time: 5:09 下午
 */

import $ from 'jquery';
import { isArray } from '@utils/inspect';

type el = HTMLElement | HTMLInputElement

/**
 * 事件触发
 * @param el
 * @param value
 * @param event_type
 */
export function trigger(el: el, value: string | Array<any>, event_type: string = 'change') {

    if (!el) {
        console.warn(`请输入正确参数  el:${ el }`);
        return;
    }

    if (isArray(value)) {
        value = value.join(',');
    }

    // TODO 必须先设置好属性，再触发事件，先后顺序不可替换( 同步 el.value 和 el.attributes.value.value)
    $(el).attr('value', value).val(value).trigger(event_type);
}

