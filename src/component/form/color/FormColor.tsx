/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/11/13
 * Time: 10:14 上午
 */
import React, { Component } from 'react';
import { IComponentProps } from '@interface/common/component';
import { SketchPicker } from 'react-color';
import { Form } from 'antd';
import { FormExecIcon, FormSmartIcon } from '@src/private-component/form-component';
import { trigger } from '@src/utils';

export default class FormColor extends Component<IComponentProps, any> {
    state = {
        // color: '#f0f00f',
    };

    handleChangeComplete(color) {
        this.setState({ color: color.hex });
        trigger(this.props.el, color.hex);
    }

    render() {
        let { smart, exec } = this.props.dataset;
        return <Form.Item label={ this.props.dataset.label } style={ this.props.style }>
            { smart ? <FormSmartIcon/> : '' }
            { exec ? <FormExecIcon/> : '' }

            <SketchPicker
                color={ this.props.value }
                onChangeComplete={ this.handleChangeComplete.bind(this) }
            />;
        </Form.Item>;
    }
}
