/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/21
 * Time: 5:09 下午
 */

import $ from 'jquery';
import { isArray } from '@utils/inspect';

type el = HTMLElement | HTMLInputElement

export function trigger(el: el, value: string | Array<any>, event_type: string = 'change') {

    if (!el) {
        console.log(`请输入正确参数  el:${ el }`);
        return;
    }

    if (isArray(value)) {
        value = value.join(',');
    }

    $(el).val(value).trigger(event_type);
    $(el).attr('value', value);
}

