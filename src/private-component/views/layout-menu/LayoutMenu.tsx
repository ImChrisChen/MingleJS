/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/17
 * Time: 11:38 上午
 */
import * as React from 'react';
// import axios from 'axios';
import { Button, Menu } from 'antd';
import {
    IdcardOutlined,
    MailOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    PieChartOutlined,
} from '@ant-design/icons';

const { SubMenu } = Menu;

interface IMenuItem {
    name: string
    path?: string
    id?: string
    url?: string
    children?: Array<IMenuItem>

    [key: string]: any
}

interface IMenuState<T> {
    theme?: string,
    // data?: Array<T>
    collapsed: boolean,
}

interface ILayoutMenu {
    data: Array<IMenuItem>
    width?: string | number
    layout?: 'horizontal' | 'vertical' | 'vertical-left' | 'vertical-right' | 'inline' | undefined
    open?: boolean
    map?: {
        id: string
        name: string
        pid: string
    }
}

export default class LayoutMenu extends React.Component<ILayoutMenu, any> {

    state: IMenuState<IMenuItem> = {
        theme    : 'light',
        collapsed: !(this.props.open ?? true),
    };

    constructor(props) {
        super(props);
    }

    toggleCollapsed = (e) => {
        console.log(e);
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };

    handleSelectMenu(e) {

    }

    getCurrentMenu() {
        let [ , currentRoute ] = window.location.hash.split('#');
        return currentRoute;
    }

    render() {
        let width = this.props.layout === 'horizontal' ? '100%' : '200px';
        let height = this.props.layout === 'horizontal' ? 'inherit':'100vh';
        console.log(this.props);
        return (
            <div style={ {
                width : (this.state.collapsed ? 80 : width),
                height, background: '#fff',
            } }>

                {/* 菜单为Nav时不显示伸缩按钮 */ }
                { this.props.layout !== 'horizontal'
                    ? <Button type="primary"
                              onClick={ this.toggleCollapsed.bind(this) }
                              style={ { marginBottom: 16 } }>
                        { React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined) }
                    </Button>
                    : ''
                }
                <Menu
                    mode={ this.props.layout || 'inline' }       /* 'vertical' : 'inline': 'horizontal */
                    theme={ 'light' }
                    inlineCollapsed={ this.state.collapsed }
                >
                    {
                        this.props.data.map((item, index) => {
                            let children = item.children;
                            let key = item.id || item.path || item.value || index;
                            if (children && children.length > 0) {
                                return <SubMenu data-path={ item.path }
                                                key={ key }
                                                icon={ <MailOutlined/> }
                                                title={ item.label }>
                                    { children.map(((child, i) => {
                                        let k = child.id || child.path || child.value || i;
                                        return <Menu.Item data-path={ child.path }
                                                          key={ k }
                                                          icon={ <IdcardOutlined/> }>
                                            { child.label }
                                        </Menu.Item>;
                                    })) }
                                </SubMenu>;
                            } else {
                                return <Menu.Item mode={ 'horizontal' }
                                                  key={ key }
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

