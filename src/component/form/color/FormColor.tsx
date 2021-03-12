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
import { FormSmartIcon } from '@component/form/form-action/FormAction';

export default class FormColor extends Component<IComponentProps, any> {
    state = {
        // color: '#f0f00f',
        color: this.props.value,
    };

    handleChangeComplete(color) {
        this.setState({ color: color.hex });
    }

    render() {
        return <Form.Item label={ this.props.dataset.label } style={ this.props.style }>
            { this.props.dataset.smart ? <FormSmartIcon/> : '' }
            <SketchPicker
                color={ this.state.color }
                onChangeComplete={ this.handleChangeComplete.bind(this) }
            />;
        </Form.Item>;
    }
}
