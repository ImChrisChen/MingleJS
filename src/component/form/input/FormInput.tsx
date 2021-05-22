/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/25
 * Time: 5:49 下午
 */
import React from 'react';
import { Form, Input } from 'antd';
import { InputProps } from 'antd/es/input';
import { trigger } from '@src/utils';
import { FormExecIcon, FormSmartIcon } from '@src/private-component/form-component';

interface IComponentProps extends InputProps {
    el: HTMLInputElement

    [key: string]: any
}

export default class FormInput extends React.Component<IComponentProps, any> {

    constructor(props: IComponentProps) {
        super(props);
    }

    state = {
        value: ''
    };

    handleChange(e) {
        trigger(this.props.el, e.target.value);
    }

    render() {
        let { smart, exec, required, label, ...dataset } = this.props.dataset;
        return <>
            <Form.Item
                required={ required }
                label={ label }
                style={ this.props.style }
            >
                { smart ? <FormSmartIcon /> : '' }
                { exec ? <FormExecIcon /> : '' }

                <Input
                    value={ this.props.value }
                    { ...dataset }
                    onChange={ this.handleChange.bind(this) }
                    placeholder={ this.props.placeholder }
                />
            </Form.Item>
        </>;
    }
}
