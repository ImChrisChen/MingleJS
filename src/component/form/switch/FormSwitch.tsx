/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/22
 * Time: 10:44 下午
 */

import React from 'react';
import { Form, Switch } from 'antd';
import { trigger } from '@src/utils';
import { FormExecIcon, FormSmartIcon } from '@src/private-component/form-component';

export default class FormSwitch extends React.Component<any, any> {
    state: any = {
        attr: {
            checkedChildren  : '开启',
            unCheckedChildren: '关闭',
            checked          : this.props.dataset.value ?? false,
            // size             : this.props.state,
        },
    };

    constructor(props) {
        super(props);
        // this.props.el.setAttribute();
    }

    handleChange(value) {
        trigger(this.props.el, value ? '1' : '0');
    }

    render() {
        let { smart, exec, label, ...dataset } = this.props.dataset;
        let value = this.props.value;
        // TODO switch 不需要设置required
        return <>
            <Form.Item label={ label } style={ this.props.style }>
                { smart ? <FormSmartIcon/> : '' }
                { exec ? <FormExecIcon/> : '' }

                <Switch
                    onChange={ this.handleChange.bind(this) }
                    { ...dataset }
                    defaultChecked={ value === '1' }
                />
            </Form.Item>
        </>;
    }
}

