/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/15
 * Time: 11:56 下午
 */

import './select.less';
import * as React from 'react';
import { Button, Checkbox, Form, Select, Typography } from 'antd';
import selectJson from '@root/mock/form/select.json';
import { formatEnumOptions, formatList2AntdOptions, formatList2Tree } from '@utils/format-data';
import { trigger } from '@utils/trigger';
import { IComponentProps } from '@interface/common/component';
import { jsonp } from '@utils/request/request';
import { Divider } from 'antd/es';
// import axios from 'axios'

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

    async getSelectList() {
        let pid = 'original_name';
        let name = 'game_name';
        let id = 'game_name';

        return formatList2Tree(selectJson, { id, pid, name });

        if (this.props.dataset.enum) {
            return formatEnumOptions(this.props.dataset.enum);
        } else {
            return formatList2Tree(selectJson, { id, pid, name });
        }
    }

    async getData() {
        // let url = `http://e.local.aidalan.com/option/game/publisher?pf=0`;
        if (this.props.dataset.url) {
            let { data } = await jsonp(this.props.dataset.url);
            let { key, value } = this.props.dataset;
            return formatList2AntdOptions(data, key, value)
            return formatList2Tree(data, {
                pid : 'media_name',
                name: 'publisher_name',
                id  : 'id',
            })
        } else if (this.props.dataset.enum) {
            return formatEnumOptions(this.props.dataset.enum);
        }
    }

    render() {
        console.log(this.props);
        let dataset = this.props.dataset;
        delete dataset.enum;
        let value: any;
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
                    value={ value }
                    options={ this.state.options }
                    style={ { width: 200 } }
                    onChange={ this.handleChange.bind(this) }
                    onClear={ this.handleClear.bind(this) }
                    dropdownRender={ menu => this.renderMenuCheckAll(menu) }
                    maxTagCount={ 1 }
                    filterOption={ (input, option) => {     // 搜索
                        if (!option) return false;
                        return String(option.value).includes(input) || String(option.label).includes(input);
                    } }/>
                {/*<Select*/}
                {/*    options={ this.state.currentItem['children'] }*/}
                {/*    mode="multiple"*/}
                {/*    maxTagCount={ 1 }*/}
                {/*    style={ { width: 200 } }*/}
                {/*/>*/}
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
        console.log(value, object);
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




