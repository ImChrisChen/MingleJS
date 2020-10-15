/** * Created by WebStorm. * User: chrischen * Date: 2020/9/20 * Time: 4:07 上午 */import React from 'react';import { TreeSelect } from 'antd';import { IComponentProps } from "@interface/common/component";const { SHOW_PARENT } = TreeSelect;const treeData = [    {        title   : 'Node1',        value   : '0-0',        key     : '0-0',        children: [            {                title: 'Child Node1',                value: '0-0-0',                key  : '0-0-0',            },        ],    },    {        title   : 'Node2',        value   : '0-1',        key     : '0-1',        children: [            {                title: 'Child Node3',                value: '0-1-0',                key  : '0-1-0',            },            {                title: 'Child Node4',                value: '0-1-1',                key  : '0-1-1',            },            {                title: 'Child Node5',                value: '0-1-2',                key  : '0-1-2',            },        ],    },];export default class FormSelectTree extends React.Component<IComponentProps, any> {    state = {        value: [ '0-0-0' ],    };    onChange = value => {        console.log('onChange ', value);        this.setState({ value });    };    render() {        console.log(this.props.dataset);        const tProps = {            treeData,            value              : this.state.value,            onChange           : this.onChange,            treeCheckable      : true,            showCheckedStrategy: SHOW_PARENT,            placeholder        : 'Please select',            style              : {                width: '300px',            },        };        return <TreeSelect { ...this.props.dataset } { ...tProps } />;    }}