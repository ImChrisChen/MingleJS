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
        let { _title, _label, _width, _trigger } = this.props;
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
            title={ _title }
            style={ { width: _width ?? 300 } }
            trigger={ _trigger ?? 'hover' }
        > { _label } </Popover>;
    }
}
