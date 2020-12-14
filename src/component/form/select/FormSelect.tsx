/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/15
 * Time: 11:56 下午
 */

import { Button, Checkbox, Form, Select, Typography } from 'antd';
import { formatEnumOptions, formatList2AntdOptions, formatList2Group } from '@utils/format-data';
import { trigger } from '@utils/trigger';
import { IComponentProps } from '@interface/common/component';
import { jsonp } from '@utils/request/request';
import { Divider } from 'antd/es';
import { strParseDOM } from '@utils/parser-dom';
import React, { Component } from 'react';
import { FormSmartIcon } from '@component/form/form-action/FormAction';
import { isUndefined } from '@utils/inspect';
// import axios from 'axios'

const { Option, OptGroup } = Select;
const { Title } = Typography;

interface ISelectState<T> {
    // selectProps?: T
    selectProps: any
    checkedAll: boolean

    [key: string]: any
}

interface ISelectProps {
    // theme: string
    // options: Array<any>
    // value?: any

    [key: string]: any
}

export default class Selector extends Component<IComponentProps, any> {

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
            let { data } = await jsonp(url);

            if (groupby) {
                return formatList2Group(data, {
                    id  : key,
                    name: value,
                    pid : groupby,
                });
            } else {
                return formatList2AntdOptions(data, key, value);
            }

        } else if (enumList) {

            return formatEnumOptions(enumList);

        }
    }

    render() {
        console.log(this.props);
        let dataset = this.props.dataset;
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
            <Form.Item label={ dataset.label } style={ { display: 'flex' } }
                       required={ this.props.dataset.required }>
                { !isUndefined(dataset.smart) ? <FormSmartIcon/> : '' }
                <Select
                    // menuItemSelectedIcon={ menuItemSelectedIcon }
                    { ...dataset }
                    placeholder={ this.props.placeholder }
                    dropdownMatchSelectWidth={ 300 }
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
                {/*<Select*/ }
                {/*    options={ this.state.currentItem['children'] }*/ }
                {/*    mode="multiple"*/ }
                {/*    maxTagCount={ 1 }*/ }
                {/*    style={ { width: 200 } }*/ }
                {/*/>*/ }
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
        trigger(this.props.el, '');
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




