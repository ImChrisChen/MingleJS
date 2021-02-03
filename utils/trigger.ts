/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/21
 * Time: 5:09 下午
 */

import $ from 'jquery';

export function trigger(el: HTMLInputElement | HTMLElement | undefined, value: string | Array<any>): void {
    if (!el) {
        console.log('该组件没有 props.el');
        return;
    }
    $(el).val(value).trigger('change');
    // $(el).val(value);
}
