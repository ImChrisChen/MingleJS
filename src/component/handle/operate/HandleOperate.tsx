/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/3/23
 * Time: 10:41 上午
 */
import { INativeProps } from '@interface/common/component';
import React from 'react';

export default class HandleOperate {
    el: HTMLElement;

    constructor(props: INativeProps) {
        let el = props.el;
        let { operate } = props.dataset;

        el.addEventListener('click', async () => {
            console.log(operate);
            switch(operate) {
                case 'layout-window' :
                    let LayoutWindow = await import('@component/layout/window/LayoutWindow');
                    break;
            }
            console.log(operate);
        });
    }

}
