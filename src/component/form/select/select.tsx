/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/15
 * Time: 11:56 下午
 */

import './select.less';
import * as React from 'react';
import { Checkbox, Form, Select, Typography } from 'antd';
// @ts-ignore
import selectJson from '@root/mock/form/select.json';
import { formatEnumOptions } from '@utils/format-value';
import { trigger } from "@utils/trigger";

const { Option } = Select;
const { Title } = Typography;

interface ISelectState<T> {
    selectProps: T
    checkedAll: boolean

    [key: string]: any
}

interface ISelectProps {
    theme: string
    options: Array<any>
    value?: any

    [propsName: string]: any
}

export default class Selector extends React.Component<any, any> {

    state: ISelectState<ISelectProps> = {
        checkedAll : false,
        selectProps: {
            theme           : 'light',
            options         : [],
            optionFilterProp: 'children',
            placeholder     : 'Select a person',
            allowClear      : true,
            // mode            : 'multiple',
            autoFocus       : true,
            maxTagCount     : 1,
        },
    };

    constructor(props) {
        super(props);
        // label   : strParseVirtualDOM(this.props.label),
        this.getSelectList().then(options => {
            this.setState({
                selectProps: { options },
            });
        });
    }

    formatListKey(list: Array<any>): Array<object> {
        return []
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
        console.log(this.props);

        // 字符串DOM 转化成 ReactDOM  https://zh-hans.reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml
        // let menuItemSelectedIcon = <div dangerouslySetInnerHTML={ { __html: `<div>😄</div>` } }/>;
        let dealProps = Object.assign(this.state.selectProps, this.props.dataset);
        return <>
            <Form.Item label={ this.props.dataset.label }>
                <Select
                    { ...dealProps }
                    // menuItemSelectedIcon={ menuItemSelectedIcon }
                    onChange={ this.handleChange.bind(this) }
                    onClear={ this.handleClear.bind(this) }
                    onSearch={ this.handleSearch.bind(this) }
                    showSearch
                    style={ { width: '200px' } }
                    dropdownRender={ menu => (
                        <div>
                            { menu }
                            <Checkbox checked={ this.state.checkedAll }
                                      onChange={ this.handleSelectAll.bind(this) }>全选</Checkbox>
                        </div>
                    ) }
                    filterOption={ (input, option) => {
                        if (!option) return false;
                        // return String(option.value).includes(input) || String(option.title).includes(input);
                        return String(option.value).includes(input) || String(option.label).includes(input);
                    } }/>
            </Form.Item>
        </>;
    }

    handleChange(value, object) {
        console.log(value);
        trigger(this.props.el, value);
    }

    handleClear() {
        this.setState({ checkedAll: false });
        trigger(this.props.el, '')
    }

    handleSearch() {

    }

    handleSelectAll(e) {
        let v = e.target.checked;

        if (v) {
            let value = this.state.selectProps.options.map(item => item.value);
            this.setState({ value });
            trigger(this.props.el, value.join(','))
        } else {
            this.setState({ value: [] });
            trigger(this.props.el, '')
        }

        console.log(v);

        this.setState({
            checkedAll: !this.state.checkedAll,
        });

    }

}




