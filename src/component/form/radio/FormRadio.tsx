/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/21
 * Time: 9:36 下午
 */
import React from 'react';
import { trigger } from '@src/utils';
import { Form, Radio } from 'antd';
import { IComponentProps } from '@interface/common/component';
import { FormExecIcon, FormSmartIcon } from '@src/private-component/form-component';
import { Inject } from 'typescript-ioc';
import { FormatDataService } from '@src/services';

export default class FormRadio extends React.Component<IComponentProps, any> {

    state: any = {
        options: [],
    };
    tplSelector = this.props.dataset.tplSelector ?? null;        // 模版选择器
    @Inject private readonly formatDataService: FormatDataService;

    constructor(props) {
        super(props);
        if (this.tplSelector) {
            let tpl = document.querySelector(this.tplSelector);
            console.log(tpl);
        }
        this.getData().then(options => {
            this.setState({ options });
        });
    }

    async getData() {
        return this.formatDataService.enum2AntdOptions(this.props.dataset.enum);
    }

    handleChange(e: any) {
        let value = e.target.value;
        trigger(this.props.el, value);
    }

    render() {
        let { label, type, buttonStyle, size, smart, exec, required } = this.props.dataset;
        return <>
            <Form.Item label={ label }
                       style={ this.props.style }
                       required={ required }
                       className="form-action-item"
            >
                { smart ? <FormSmartIcon/> : '' }
                { exec ? <FormExecIcon/> : '' }
                <Radio.Group
                    onChange={ this.handleChange.bind(this) }
                    value={ this.props.value }
                    options={ this.state.options }
                    optionType={ type }
                    buttonStyle={ buttonStyle }
                    size={ size }
                />
            </Form.Item>
        </>;
    }
}
