/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/11/11
 * Time: 2:36 下午
 */

import * as React from 'react';
import { Component, ReactNode } from 'react';
import { IComponentProps } from '@interface/common/component';
import { Button, Menu } from 'antd';
import {
    IdcardOutlined,
    MailOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    PieChartOutlined,
} from '@ant-design/icons';
import SubMenu from 'antd/lib/menu/SubMenu';
import { jsonp } from '@utils/request/request';
import { formatList2Tree, formatTreeKey } from '@utils/format-data';
import { getDepthMax } from '@utils/util';

export default class LayoutMenu2 extends Component<IComponentProps, ReactNode> {

    state = {
        collapsed: !this.props.dataset.open,
        url      : '',
        menulist : [] as Array<any>,
    };

    constructor(props) {
        super(props);
        console.log(this.props.dataset);
        this.getData().then(menulist => {
            console.log(menulist);
            this.setState({ menulist });
        });
    }

    async getData(): Promise<Array<any>> {
        let { url, menulist, id, name, pid, children } = this.props.dataset;
        let data: Array<any>;
        if (url) {
            let res = await jsonp(url);
            data = res.status ? res.data : [];
        } else {
            data = menulist;
        }
        let deep = getDepthMax({ children: data }, 'children') - 1;

        if (deep > 1) {
            data = formatTreeKey(data, { id, pid, name, children }, {
                id      : 'id',
                pid     : 'pid',
                name    : 'label',
                children: 'children',
            });
        } else {
            data = formatList2Tree(data, { id, pid, name, children });
        }
        return data;
    }

    toggleCollapsed = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };

    handleSelectMenu(e) {
        // window.location.href = e.item.props['data-path'];
    }

    render() {

        let s = this.props.box?.style
        console.log(s);

        return (
            <div style={ {
                height: '100vh',
                width : (this.state.collapsed ? 80 : this.props.dataset.width) || 200,
            } }>

                {/* 菜单为Nav时不显示伸缩按钮 */ }
                { this.props.dataset.layout !== 'horizontal'
                    ? <Button type="primary" onClick={ this.toggleCollapsed } style={ { marginBottom: 16 } }>
                        { React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined) }
                    </Button>
                    : ''
                }
                <Menu
                    defaultSelectedKeys={ [ '1' ] }
                    defaultOpenKeys={ [ 'sub1' ] }
                    mode={ this.props.dataset.layout }       /* 'vertical' : 'inline': 'horizontal */
                    theme={ 'light' }
                    onClick={ this.handleSelectMenu.bind(this) }
                    inlineCollapsed={ this.state.collapsed }
                >
                    {
                        this.state.menulist.map((item, index) => {
                            let children = item.children;
                            if (children && children.length > 0) {
                                return <SubMenu data-path={ item.path }
                                                key={ item.id }
                                                icon={ <MailOutlined/> }
                                                title={ item.label }>
                                    { children.map(((child, i) => {
                                        return <Menu.Item data-path={ child.path }
                                                          key={ child.id || 'child-' + i }
                                                          icon={ <IdcardOutlined/> }>
                                            { child.label }
                                        </Menu.Item>;
                                    })) }
                                </SubMenu>;
                            } else {
                                return <Menu.Item mode={ 'horizontal' }
                                                  key={ item.id || 'child-' + index }
                                                  data-path={ item.path }
                                                  icon={ <PieChartOutlined/> }>
                                    { item.label }
                                </Menu.Item>;
                            }
                        })
                    }
                </Menu>
            </div>
        );
    }
}
