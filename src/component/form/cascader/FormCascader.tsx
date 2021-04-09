/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/10/15
 * Time: 下午5:24
 */
import { IComponentProps } from '@interface/common/component';
import React from 'react';
import { Cascader, Form } from 'antd';
import { isArray } from '@src/utils';
import { FormExecIcon, FormSmartIcon } from '@src/private-component/form-component';
import { Inject } from 'typescript-ioc';
import { FormatDataService, HttpClientService } from '@src/services';

export default class FormCascader extends React.Component<IComponentProps, any> {

    @Inject private readonly httpClientService: HttpClientService;
    @Inject private readonly formatDataService: FormatDataService;

    state = {
        options: []
    };

    constructor(props) {
        super(props);
        this.getData().then(options => {
            this.setState({ options });
        });
    }

    async getData() {
        let { key, value, groupby, url } = this.props.dataset;

        if (url) {
            let { data } = await this.httpClientService.jsonp(url);
            let keyMap = {
                id  : key,
                name: value,
                pid: groupby
            };
            let list = this.formatDataService.list2Group(/*selectJson*/ data, keyMap);
            return list;
        }
        return [];
    }

    handleChange(e) {
        console.log(e);
        // let lastItem: any = arraylastItem(e);
        // trigger(this.props.el, lastItem);
    }

    render() {
        // TODO data-value属性和value属性冲突，所以这了将props.dataset.value属性过滤出来
        let { smart, required, exec, label, ...dataset } = this.props.dataset;
        return <>
            <Form.Item
                label={ label }
                style={ this.props.style }
                required={ required }
            >
                { smart ? <FormSmartIcon /> : '' }
                { exec ? <FormExecIcon /> : '' }
                <Cascader
                    { ...dataset }
                    options={ this.state.options }
                    onChange={ this.handleChange.bind(this) }
                    displayRender={ (label, selectedOptions) => {
                        return isArray(label) ? label.join('/') : label;
                    } }
                    dropdownRender={ (menus) => {
                        return <> { menus } </>;
                    } }
                    value={ this.props.value }
                />
            </Form.Item>
        </>;
    }
}
