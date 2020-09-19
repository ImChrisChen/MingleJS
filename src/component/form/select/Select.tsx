/** * Created by WebStorm. * User: chrischen * Date: 2020/9/15 * Time: 11:56 下午 */import './select.less';import * as React from 'react';import { Checkbox, Popover, Select, Typography } from 'antd';const { Option } = Select;const { Title } = Typography;interface ISelectState {    theme: string    options: Array<any>    checkedAll: boolean    [propsName: string]: any}export default class Selector extends React.Component<any, any> {    state: ISelectState = {        theme     : 'light',        options   : [],        value     : [],        checkedAll: false,    };    constructor(props) {        super(props);        for(let i = 0; i < 100; i++) {            const value = `${ i.toString(36) }${ i }`;            this.state.options.push({                // title   : '🤔😄😹',                // label   : 'hah是哈哈哈哈🍭',                value,                disabled: i === 10,            });        }    }    render() {        // 字符串DOM 转化成 ReactDOM  https://zh-hans.reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml        let menuItemSelectedIcon = <div dangerouslySetInnerHTML={ { __html: `<div>😄</div>` } }/>;        console.log('组件的值发生发生改变', this.props);        return <div onMouseDown={ e => e.preventDefault() /*(单选模式)阻止事件冒泡，解决选择一次下拉就收回下拉列表的问题*/ }>            <Popover content={ '😀' } title={ 'title' } trigger={ 'hover' }>                <Select                    showSearch                    optionFilterProp="children"                    style={ { width: 200 } }                    placeholder="Select a person"                    allowClear={ true }                    mode="multiple"                    autoFocus={ true }                    value={ this.state.value }                    maxTagCount={ 1 }                    menuItemSelectedIcon={ menuItemSelectedIcon }                    onChange={ this.handleChange.bind(this) }                    onClear={ this.handleClear.bind(this) }                    onSearch={ this.handleSearch.bind(this) }                    options={ this.state.options }                    dropdownRender={ menu => (                        <div>                            { menu }                            <Checkbox checked={ this.state.checkedAll }                                      onChange={ this.handleSelectAll.bind(this) }>全选</Checkbox>                        </div>                    ) }                    filterOption={ (input, option: any) =>                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0                    }/>            </Popover>        </div>;    }    handleChange(value, object) {        this.setState({ value });        let { el } = this.props;        el.value = value.join(',');        if(el.onchange) {            (el.onchange as Function)();        }    }    handleClear() {        this.setState({ checkedAll: false });    }    handleSearch() {    }    handleSelectAll(e) {        let v = e.target.checked;        if(v) {            let value = this.state.options.map(item => item.value);            this.setState({ value });            this.props.el.value = value.join(',');        } else {            this.setState({ value: [] });            this.props.el.value = '';        }        this.setState({            checkedAll: !this.state.checkedAll,        });    }    componentDidMount() {        let hooks = this.props.el.getAttribute('data-onload');        if(window[hooks]) {            (window[hooks] as any)();        }    }}