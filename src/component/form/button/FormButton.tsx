/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/21
 * Time: 9:36 下午
 */
import React from 'react';
import { trigger } from '@utils/trigger';
import { Form, Radio } from 'antd';
import { IComponentProps } from '@interface/common/component';
import { FormSmartIcon } from '@component/form/form-action/FormAction';
import { Inject } from 'typescript-ioc';
import { FormatDataService } from '@services/FormatData.service';

export default class FormButton extends React.Component<IComponentProps, any> {

    @Inject private readonly formatDataService: FormatDataService;

    state: any = {
        value  : this.props.value,
        options: [],
    };
    tplSelector = this.props.dataset.tplSelector ?? null;        // 模版选择器

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
        console.log(this.props.el);
        this.setState({ value }, () => trigger(this.props.el, value));
        $(this.props.el).trigger('aaa');
    }

    render() {
        return <>
            <Form.Item label={ this.props.dataset.label } style={ this.props.style }>
                { this.props.dataset.smart ? <FormSmartIcon/> : '' }
                <Radio.Group
                    onChange={ this.handleChange.bind(this) }
                    value={ this.state.value }
                    options={ this.state.options }
                    optionType={ this.props.dataset.type }
                    buttonStyle={ this.props.dataset.buttonStyle }
                    size={ this.props.dataset.size }
                />
            </Form.Item>
        </>;
    }
}
