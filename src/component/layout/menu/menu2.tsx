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
import { MailOutlined, MenuFoldOutlined, MenuUnfoldOutlined, PieChartOutlined } from '@ant-design/icons';
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
        console.log(url);
        if (url) {
            let res = await jsonp(url);
            data = res.status ? res.data : [];
        } else {
            data = menulist;
        }
        let deep = getDepthMax({ children: data }, 'children') - 1;
        console.log(deep);
        if (deep > 1) {
            data = formatTreeKey(data, { id, pid, name, children }, {
                id      : 'id',
                pid     : 'pid',
                name    : 'label',
                children: 'children',
            });
            console.log(data);
        } else {
            data = formatList2Tree(data, { id, pid, name, children });
        }
        console.log(data);
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
        return (
            <div style={ { width: this.props.dataset.width || 200, height: '100vh', background: '#fff' } }>
                <Button type="primary" onClick={ this.toggleCollapsed } style={ { marginBottom: 16 } }>
                    { React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined) }
                </Button>

                <Menu
                    defaultSelectedKeys={ [ '1' ] }
                    defaultOpenKeys={ [ 'sub1' ] }
                    mode="inline"       /* 'vertical' : 'inline': 'horizontal */
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
                                        return <Menu.Item data-path={ child.path } key={ child.id || 'child-' + i }>
                                            { child.label }
                                        </Menu.Item>;
                                    })) }
                                </SubMenu>;
                            } else {
                                return <Menu.Item mode={ 'horizontal' } key={ item.id || 'child-' + index }
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
        ;
    }
}