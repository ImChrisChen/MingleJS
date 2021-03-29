/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/3/29
 * Time: 11:10 上午
 */

import { INativeProps } from '@interface/common/component';

export default class LayoutCol {

    constructor(props: INativeProps) {
        let { col } = props.dataset;
        let { el } = props;
        el.style.width = (col / 24 * 100) + '%';
        el.style.minHeight = '90px';
        el.style.margin = '0 4px';
        el.style.border = '1px solid #f0f';
        el.style.cssText = String(props.cssText);
    }
}
