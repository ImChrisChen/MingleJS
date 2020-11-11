/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/15
 * Time: 11:56 下午
 */

import './select.less';
import * as React from 'react';
import { Button, Checkbox, Form, Select, Typography } from 'antd';
import { formatEnumOptions, formatList2AntdOptions, formatList2Tree } from '@utils/format-data';
import { trigger } from '@utils/trigger';
import { IComponentProps } from '@interface/common/component';
import { jsonp } from '@utils/request/request';
import { Divider } from 'antd/es';
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

export default class Selector extends React.Component<IComponentProps, any> {

    state = {
        checkedAll : false,
        options    : [],
        value      : '' as any,
        currentItem: {},
    };

    constructor(props) {
        super(props);
        // this.getSelectList().then(options => {
        //     this.setState({ options, });
        // });
        this.getData().then(options => {
            this.setState({ options });
        });
    }

    async getData() {
        // let url = `http://e.local.aidalan.com/option/game/publisher?pf=0`;
        let { url, groupby, key, value, enum: enumList } = this.props.dataset;

        if (url) {
            let { data } = await jsonp(url);

            if (groupby) {
                return formatList2Tree(data, {
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
            <Form.Item label={ dataset.label } style={ { display: 'flex' } }>
                <Select
                    // menuItemSelectedIcon={ menuItemSelectedIcon }

                    { ...dataset }
                    placeholder={ this.props.placeholder }
                    dropdownMatchSelectWidth={ 300 }
                    style={ { minWidth: 100 } }
                    value={ value }
                    options={ this.state.options }
                    onChange={ this.handleChange.bind(this) }
                    onClear={ this.handleClear.bind(this) }
                    dropdownRender={ menu => this.renderMenuCheckAll(menu) }
                    maxTagCount={ 1 }
                    filterOption={ (input, option) => {     // 搜索
                        if (!option) return false;
                        return String(option.value).includes(input) || String(option.label).includes(input);
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




