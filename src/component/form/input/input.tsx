/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/25
 * Time: 5:49 下午
 */
import React from 'react';
import { Input } from 'antd';
import { InputProps } from 'antd/es/input';
import { trigger } from '@utils/trigger';

export default class FormInput extends React.Component<any, any> {

    constructor(props: InputProps) {
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
        let { el, elChildren, ...dealProps } = this.props;
        return <>
            <Input
                { ...dealProps }
                style={ { width: '200px' } }
                onChange={ this.handleChange.bind(this) }
            />
        </>;
    }
}
