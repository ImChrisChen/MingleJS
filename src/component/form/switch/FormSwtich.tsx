/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/22
 * Time: 10:44 下午
 */

import React from 'react';
import { Form, Switch } from 'antd';
import { trigger } from '@utils/trigger';
import { FormSmartIcon } from '@component/form/form-action/FormAction';

export default class FormSwitch extends React.Component<any, any> {
    state: any = {
        attr: {
            checkedChildren  : '开启',
            unCheckedChildren: '关闭',
            checked          : this.props.dataset.value ?? false,
            // size             : this.props.state,
        },
    };

    handleChange(value) {
        console.log(value);
        this.setState({
            attr: { checked: value },
        });
        trigger(this.props.el, value);
    }

    render() {
        let { smart, ...dataset } = this.props.dataset;
        dataset.checked = dataset.value;        // switch 的value值是checked
        return <>
            <Form.Item label={ this.props.dataset.label } required={ this.props.required } style={ this.props.style }>
                { smart ? <FormSmartIcon/> : '' }
                <Switch
                    onChange={ this.handleChange.bind(this) }
                    { ...dataset }
                />
            </Form.Item>
        </>;
    }
}

