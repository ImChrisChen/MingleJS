/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/21
 * Time: 5:09 下午
 */

import $ from 'jquery'

export function trigger(el: HTMLInputElement | HTMLElement, value: string | Array<any>): void {
    $(el).val(value).trigger('change');
}
