/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/25
 * Time: 5:49 下午
 */
import React from 'react';
import { Form, Input } from 'antd';
import { InputProps } from 'antd/es/input';
import { trigger } from '@utils/trigger';
import { FormSmartIcon } from '@component/form/form-action/FormAction';

interface IComponentProps extends InputProps {
    el: HTMLInputElement

    [key: string]: any
}

export default class FormInput extends React.Component<IComponentProps, any> {

    constructor(props: IComponentProps) {
        super(props);
    }

    state = {
        value: '',
    };

    handleChange(e) {
        // this.setState({ //     value: e.target.value, // });
        trigger(this.props.el, e.target.value);
    }

    render() {
        let { smart, ...dataset } = this.props.dataset;
        return <>
            <Form.Item
                required={ this.props.dataset.required }
                label={ this.props.dataset.label }
                name={ this.props.dataset.label }
                style={ this.props.style }
            >
                { smart ? <FormSmartIcon/> : '' }
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
