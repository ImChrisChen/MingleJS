/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/12/24
 * Time: 5:35 下午
 */

import { INativeProps } from '@interface/common/component';
import { isObject } from '@utils/inspect';

export default class LayoutRow {

    constructor(props: INativeProps) {
        let el = props.el;
        let style = {
            display  : 'flex',
            minHeight: '90px',
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
