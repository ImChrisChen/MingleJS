/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/15
 * Time: 11:56 下午
 */

import { Button, Checkbox, Form, Select } from 'antd';
import { trigger } from '@utils/trigger';
import { IComponentProps } from '@interface/common/component';
import { Divider } from 'antd/es';
import { strParseDOM } from '@utils/trans-dom';
import React, { Component } from 'react';
import { FormSmartIcon } from '@component/form/form-action/FormAction';
import { Inject } from 'typescript-ioc';
import { HttpClientService } from '@services/HttpClient.service';
import { FormatDataService } from '@services/FormatData.service';

export default class FormSelect extends Component<IComponentProps, any> {
    @Inject private readonly httpClientService: HttpClientService;
    @Inject private readonly formatDataService: FormatDataService;

    state = {
        checkedAll : false,
        options    : [],
        value      : '' as any,
        currentItem: {},
        loading    : true,
    };

    constructor(props) {
        super(props);
        this.getData(this.props.dataset.url).then(options => {
            this.setState({ options, loading: false });
        });
    }

    async getData(url) {
        let { groupby, key, value, enum: enumList } = this.props.dataset;
        if (url) {
            let { data } = await this.httpClientService.jsonp(url);

            if (groupby) {
                return this.formatDataService.list2Group(data, {
                    id  : key,
                    name: value,
                    pid : groupby,
                });
            } else {
                return this.formatDataService.list2AntdOptions(data, key, value);
            }

        } else if (enumList) {

            return this.formatDataService.enum2AntdOptions(enumList);

        }
    }

    render() {
        let { smart, ...dataset } = this.props.dataset;
        delete dataset.enum;
        let value: any = this.props.value;
        if (dataset.mode === 'multiple') {
            if (this.props.value) {
                value = this.props.value.split(',');
            } else {
                value = [];
            }
        }
        return <>
            <Form.Item label={ dataset.label } style={ { display: 'flex', ...this.props.style } }
                       required={ this.props.dataset.required }>
                { smart ? <FormSmartIcon/> : '' }
                <Select
                    // menuItemSelectedIcon={ menuItemSelectedIcon }
                    { ...dataset }
                    placeholder={ this.props.placeholder }
                    dropdownMatchSelectWidth={ 300 }
                    tokenSeparators={ [ ',' ] }     // 自动分词
                    style={ { minWidth: 100 } }
                    value={ value }
                    options={ this.state.options }
                    loading={ this.state.loading }
                    disabled={ !this.state.loading && this.props.dataset.disabled }
                    onChange={ this.handleChange.bind(this) }
                    onClear={ this.handleClear.bind(this) }
                    dropdownRender={ menu => this.renderMenuCheckAll(menu) }
                    maxTagCount={ 1 }
                    filterOption={ (input, option: any) => {     // 搜索
                        if (!option) return false;
                        let label: any;
                        label = typeof option?.label === 'object'
                            ? strParseDOM(option.label?.props?.dangerouslySetInnerHTML.__html).innerText
                            : option.label;
                        return String(option.value).includes(input) || String(label).includes(input);
                    } }/>
            </Form.Item>
        </>;
    }

    renderMenuCheckAll(menu) {
        let isMultiple = this.props.dataset.mode === 'multiple';
        return <>
            { menu }
            {
                isMultiple
                    ? <Checkbox checked={ this.state.checkedAll }
                                onChange={ this.handleSelectAll.bind(this) }>全选</Checkbox> : ''
            }
            <Divider/>
            <>
                { '' &&
                [ '枫之战纪', '飞剑四海', '彩虹物语', '版署包' ].map((item, index) => {
                    return <Button type="primary" key={ index }>{ item }</Button>;
                })
                }
            </>
        </>;
    }

    handleSelectTag(e) {
        console.log(e);
    }

    handleChange(value, object) {
        let currentItem = object;
        this.setState({ currentItem, value }, () => trigger(this.props.el, value));
    }

    handleClear() {
        this.setState({ checkedAll: false });
        trigger(this.props.el, '', 'clear');
    }

    handleSelectAll(e) {
        let v = e.target.checked;

        if (v) {
            let value = this.state.options.map((item: any) => item.value);
            this.setState({ value });
            trigger(this.props.el, value.join(','));
        } else {
            this.setState({ value: [] });
            trigger(this.props.el, '');
        }

        this.setState({
            checkedAll: !this.state.checkedAll,
        });

    }

}




