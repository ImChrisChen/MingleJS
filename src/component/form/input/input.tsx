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

interface IComponentProps extends InputProps {
    el: HTMLInputElement

    [key: string]: any
}

export default class FormInput extends React.Component<IComponentProps, any> {

    constructor(props: IComponentProps) {
        super(props);
        console.log(this.props);
    }

    state = {
        value: '',
    };

    handleChange(e) {
        // this.setState({ //     value: e.target.value, // });
        trigger(this.props.el, e.target.value);
    }

    render() {
        return <>
            <Form.Item
                label={ this.props.dataset.label }
                rules={ [ { required: true, message: `请填写${ this.props.dataset.label }` } ] }
                validateStatus="error"
                hasFeedback={ true }
                help="Should be combination of numbers & alphabets"
            >
                <Input
                    { ...this.props.dataset }
                    onChange={ this.handleChange.bind(this) }
                />
            </Form.Item>
        </>;
    }
}
