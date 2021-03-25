/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/10/15
 * Time: 下午5:24
 */
import { IComponentProps } from '@interface/common/component';
import React from 'react';
import { Cascader, Form } from 'antd';
import { arraylastItem } from '@utils/util';
import { trigger } from '@utils/trigger';
import { isArray } from '@utils/inspect';
import { FormSmartIcon } from '@component/form/form-action/FormAction';
import { Inject } from 'typescript-ioc';
import { HttpClientService } from '@services/HttpClient.service';
import { FormatDataService } from '@services/FormatData.service';

export default class FormCascader extends React.Component<IComponentProps, any> {

    @Inject private readonly httpClientService: HttpClientService;
    @Inject private readonly formatDataService: FormatDataService;

    state = {
        options: [],
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
                pid : groupby,
            };
            let list = this.formatDataService.list2Group(/*selectJson*/ data, keyMap);
            return list;
        }
        return [];
    }

    handleChange(e) {
        let lastItem: any = arraylastItem(e);
        trigger(this.props.el, lastItem);
    }

    render() {
        // TODO data-value属性和value属性冲突，所以这了将props.dataset.value属性过滤出来
        let { smart, ...dataset } = this.props.dataset;
        return <>
            <Form.Item label={ dataset.label } style={ this.props.style }>
                { smart ? <FormSmartIcon/> : '' }
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
