/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/21
 * Time: 9:36 下午
 */
import React from 'react';
import { Radio } from 'antd';
import { trigger } from '@utils/trigger';

export default class Button extends React.Component<any, any> {
    state: any = {
        options    : [
            { label: 'Apple', value: 'Apple' },
            { label: 'Pear', value: 'Pear' },
            { label: 'Orange', value: 'Orange' },
        ],
        optionType : 'button',                                // 'button' | 'default'
        buttonStyle: this.props.el.mode ?? 'solid',           // 'online' | 'solid'
        size       : this.props.el.size ?? 'middle',          // 'large' | 'middle' | 'small'
        value      : this.props.el.value ?? '',
    };

    handleChange(e) {
        let value = e.target.value;
        this.setState({ value });
        trigger(this.props.el, value);
    }

    render() {
        let { options, value, buttonStyle, optionType, size } = this.state;
        return <>
            <Radio.Group
                onChange={ this.handleChange.bind(this) }

                options={ options }
                size={ size }
                optionType={ optionType }
                buttonStyle={ buttonStyle }
                value={ value }
            />
        </>;
    }
}
