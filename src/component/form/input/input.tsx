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
        let { el, elChildren, style, ...dealProps } = this.props;

        // style.split();

        console.log(dealProps);
        return <>
            <Input
                { ...dealProps }
                onChange={ this.handleChange.bind(this) }
            />
        </>;
    }
}
