/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/3/29
 * Time: 11:10 上午
 */

import { INativeProps } from '@interface/common/component';
import { isObject } from '@utils/inspect';

export default class LayoutCol {

    constructor(props: INativeProps) {
        let { col } = props.dataset;
        let { el } = props;

        // TODO 直接设置 cssText 会把行内样式覆盖掉
        let style = {
            width    : (col / 24 * 100) + '%',
            margin   : '0 4px',
            minHeight: '90px',
            border   : '1px solid #f0f',
        };

        el.style.cssText = this.mergeStyle(style, props.cssText);
    }

    mergeStyle(style: object, cssText: string = '') {
        let text = '';
        if (isObject(style)) {
            for (const k in style) {
                if (!style.hasOwnProperty(k)) continue;
                let v = style[k];
                text += `${ k }:${ v };`;
            }
        }
        text = text + cssText;
        return text;
    }
}
