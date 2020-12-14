/** * Created by WebStorm. * User: MacBook * Date: 2020/10/15 * Time: 下午5:24 */import { IComponentProps } from '@interface/common/component';import React from 'react';import { Cascader, Form } from 'antd';import { arraylastItem } from '@utils/util';import { formatList2Group } from '@utils/format-data';import { trigger } from '@utils/trigger';import { jsonp } from '@utils/request/request';import { isArray, isUndefined } from '@utils/inspect';import { FormSmartIcon } from '@component/form/form-action/FormAction';export default class FormCascader extends React.Component<IComponentProps, any> {    state = {        options: [],    };    constructor(props) {        super(props);        this.getData().then(options => {            this.setState({ options });        });    }    async getData() {        let { key, value, groupby } = this.props.dataset;        let { data } = await jsonp(this.props.dataset.url);        let keyMap = {            id  : key,            name: value,            pid : groupby,        };        return formatList2Group(/*selectJson*/ data, keyMap);    }    handleChange(e) {        let lastItem: any = arraylastItem(e);        trigger(this.props.el, lastItem);    }    render() {        // TODO data-value属性和value属性冲突，所以这了将props.dataset.value属性过滤出来        let { smart, ...dataset } = this.props.dataset;        return <>            <Form.Item label={ dataset.label }>                { smart ? <FormSmartIcon/> : '' }                <Cascader                    { ...dataset }                    options={ this.state.options }                    onChange={ this.handleChange.bind(this) }                    displayRender={ (label, selectedOptions) => {                        return isArray(label) ? label.join('/') : label;                    } }                    dropdownRender={ (menus) => {                        return <> { menus } </>;                    } }                    value={ this.props.value }                />            </Form.Item>        </>;    }}