/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/21
 * Time: 9:36 下午
 */
import React from 'react';
import { Form, Radio } from 'antd';
import { trigger } from '@utils/trigger';
import { formatEnumOptions } from '@utils/format-value';

export default class Button extends React.Component<any, any> {
    state: any = {
        // options    : this.formatAntdButton(this.props.enum),
        // [
        // { label: 'Apple', value: 'Apple' },
        // { label: 'Pear', value: 'Pear' },
        // { label: 'Orange', value: 'Orange' },
        // ],
        optionType : 'button',                                // 'button' | 'default'
        buttonStyle: this.props.el.mode ?? 'solid',           // 'online' | 'solid'
        size       : this.props.el.size ?? 'middle',          // 'large' | 'middle' | 'small'
    };

    handleChange(e: any) {
        let value = e.target.value;
        // this.setState({ value });
        trigger(this.props.el, value);
    }

    render() {
        let formatProps = this.props.dataset;
        formatProps['options'] = formatEnumOptions(formatProps.enum);
        let attrs = Object.assign(this.state, formatProps);
        // rules={ [ { required: this.props.required, message: this.props.message } ] }
        return <>
            <Form.Item label="区域:">
                <Radio.Group

                    onChange={ this.handleChange.bind(this) }
                    { ...attrs }

                    // options={ options }
                    // size={ size }
                    // optionType={ optionType }
                    // buttonStyle={ buttonStyle }
                    // value={ value }
                />
            </Form.Item>
        </>;
    }
}
