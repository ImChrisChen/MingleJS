/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/21
 * Time: 9:36 下午
 */
import React from 'react';
import { trigger } from '@utils/trigger';
import { formatEnumOptions } from '@utils/format-data';
import { Form, Radio } from 'antd';
import { IComponentProps } from '@interface/common/component';

export default class Button extends React.Component<IComponentProps, any> {
    state: any = {
        value  : this.props.value,
        options: [],
    };

    constructor(props) {
        super(props);
        this.getData().then(options => {
            this.setState({ options });
        });
    }

    async getData() {
        return formatEnumOptions(this.props.dataset.enum);
    }

    handleChange(e: any) {
        let value = e.target.value;
        this.setState({ value }, () => trigger(this.props.el, value));
    }

    render() {
        return <>
            <Form.Item label={ this.props.dataset.label }>
                <Radio.Group
                    onChange={ this.handleChange.bind(this) }
                    value={ this.state.value }
                    options={ this.state.options }
                    { ...this.props.dataset }
                />
            </Form.Item>
        </>;
    }
}
