/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/15
 * Time: 11:56 下午
 */

import './select.less';
import * as React from 'react';
import { Checkbox, Form, Select, Typography } from 'antd';
import selectJson from '@root/mock/form/select.json';
import { formatEnumOptions } from '@utils/format-value';
import { trigger } from '@utils/trigger';
import { IComponentProps } from "@interface/common/component";

const { Option } = Select;
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
        checkedAll: false,
        options   : [],
        value     : '' as any
    };

    constructor(props) {
        super(props);
        this.getSelectList().then(options => {
            this.setState({ options, });
        });
    }

    formatListKey(list: Array<any>): Array<object> {
        return [];
        let selectTree: Array<object> = [];
        let selectList = list.map(item => {
            let isSuper = selectTree.find((f: object) => f['key'] === item['pid']);
            if (isSuper) {
                console.log(isSuper);
            } else {
                let option = {
                    label: item.game_name,
                    value: item.id,
                    pid  : item.original_name,
                };
                selectTree.push(option);
            }

        });
        console.log(selectTree);
        // let pids = Array.from(new Set(selectList.map(item => item.pid)));

        return [];
    }

    async getSelectList() {
        if (this.props.dataset.enum) {
            return formatEnumOptions(this.props.dataset.enum);
        } else {
            return this.formatListKey(selectJson);
        }
    }

    render() {
        let dataset = this.props.dataset;
        delete dataset.enum
        let value: any;
        if (dataset.mode === 'multiple') {
            if (this.props.value) {
                value = this.props.value.split(',')
            } else {
                value = []
            }
        }
        console.log(dataset);

        return <>
            <Form.Item label={ dataset.label }>
                <Select
                    // menuItemSelectedIcon={ menuItemSelectedIcon }

                    { ...dataset }
                    value={ value }
                    options={ this.state.options }

                    onChange={ this.handleChange.bind(this) }
                    onClear={ this.handleClear.bind(this) }
                    dropdownRender={ menu => this.renderMenuCheckAll(menu) }
                    filterOption={ (input, option) => {
                        if (!option) return false;
                        return String(option.value).includes(input) || String(option.label).includes(input);
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
                                onChange={ this.handleSelectAll.bind(this) }>全选</Checkbox>
                    : ''
            }
        </>;
    }

    handleChange(value, object) {
        console.log(value);
        this.setState({ value }, () => trigger(this.props.el, value))
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

        console.log(v);

        this.setState({
            checkedAll: !this.state.checkedAll,
        });

    }

}




