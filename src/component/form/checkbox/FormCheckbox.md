import React from 'react';
/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/11/30
 * Time: 5:43 下午
 */
import { Component } from 'react';
import { IComponentProps } from '@interface/common/component';
import { Checkbox, Form } from 'antd';
import { FormSmartIcon } from '@component/form/form-action/FormAction';

export default class FormCheckbox extends Component<IComponentProps, any> {

    state = {
        options: [],
        value  : this.props.value,
    };

    constructor(props) {
        super(props);
        this.getData(this.props.dataset.url).then(options => {
            this.setState({ options });
        });
    }

    handleChange(e: Array<any>) {
        let value = e.join(',');
        this.setState({ value }, () => trigger(this.props.el, value));
    }

    async getData(url) {
        let { groupby, key, value, enum: enumList } = this.props.dataset;
        if (url) {
            let { data } = await jsonp(url);

            if (groupby) {
                return list2Group(data, {
                    id  : key,
                    name: value,
                    pid : groupby,
                });
            } else {
                return list2AntdOptions(data, key, value);
            }

        } else if (enumList) {

            return enum2AntdOptions(enumList);

        }
    }

    render() {
        return <>
            <Form.Item label={ this.props.dataset.label } style={ this.props.style }>
                { this.props.dataset.smart ? <FormSmartIcon/> : '' }
                <Checkbox.Group
                    disabled={ this.props.dataset.disabled }
                    options={ this.state.options }
                    value={ this.state.value }
                    onChange={ this.handleChange.bind(this) }
                />
            </Form.Item>
        </>;
    }
}
