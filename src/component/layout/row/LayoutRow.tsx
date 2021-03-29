/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/12/24
 * Time: 5:35 下午
 */

import { INativeProps } from '@interface/common/component';

export default class LayoutRow {

    constructor(props: INativeProps) {
        let el = props.el;
        el.style.display = 'flex';
        el.style.minHeight = '90px';
        el.style.cssText = String(props.style);
    }

}
