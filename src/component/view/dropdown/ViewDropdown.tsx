/** * Created by WebStorm. * User: chrischen * Date: 2020/9/20 * Time: 1:16 上午 */import React, { Component } from 'react';import { Button, Dropdown, Menu } from 'antd';import { elementParseVirtualDOM } from '@utils/parser-dom';import { DownOutlined } from '@ant-design/icons';import { IComponentProps } from '@interface/common/component';export default class ViewDropdown extends Component<IComponentProps, any> {    render() {        let { elChildren } = this.props;        let menu = <Menu>            { elChildren.map((element, i) =>                <Menu.Item key={ i }> { elementParseVirtualDOM(element) } </Menu.Item>) }        </Menu>;        return <div>            <Dropdown overlay={ menu } trigger={ [ 'click' ] } arrow>                <h1>{ this.props.dataset.content }</h1>            </Dropdown>        </div>;    }}