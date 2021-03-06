/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/12/9
 * Time: 5:52 下午
 */
import React, { Component } from 'react';
import { IComponentProps } from '@interface/common/component';
import { Tooltip } from 'antd';
import $ from 'jquery';

export default class TipsText extends Component<IComponentProps, any> {
    render() {
        setTimeout(() => {
            $(this.props.subelements).remove();
            this.props.el.childNodes[0].textContent = '';
        });
        let { _label, _color } = this.props.dataset;
        return <Tooltip
            title={ () => {
                return <div ref={ element => {
                    if (element) {
                        element.innerHTML = '';
                        element.append(...this.props.subelements);
                    }
                } }>
                </div>;
            } }
            color={ _color }
        >{ _label }</Tooltip>;
    }
}
