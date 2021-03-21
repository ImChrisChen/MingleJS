/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/12/9
 * Time: 4:41 下午
 */
import React, { Component } from 'react';
import { IComponentProps } from '@interface/common/component';
import { Button, Popover } from 'antd';
import $ from 'jquery';

export default class TipsCard extends Component<IComponentProps, any> {
    render() {
        setTimeout(() => {
            $(this.props.subelements).remove();
            this.props.el.childNodes[0].textContent = '';
        });
        let { title, label, width, trigger } = this.props.dataset;
        return <Popover
            content={ () => {
                return <div ref={ element => {
                    if (element) {
                        element.innerHTML = '';
                        element.append(...this.props.subelements);
                    }
                } }>
                </div>;
            } }
            title={ title }
            style={ { width: width ?? 300 } }
            trigger={ trigger ?? 'hover' }
        > { label } </Popover>;
    }
}
