/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/17
 * Time: 11:38 上午
 */
import * as React from 'react';
// import axios from 'axios';
import { Button, Menu } from 'antd';
import { MailOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { SubMenu } = Menu;

interface IMenuItem {
    name: string
    path?: string
    id?: string
}

interface IMenuState<T> {
    theme?: string,
    menuList: Array<T>
    collapsed: boolean,
}

export default class LayoutMenu extends React.Component<any, any> {

    state: IMenuState<IMenuItem> = {
        collapsed: false,
        theme    : 'light',
        menuList : this.props.menuList,
    };

    toggleCollapsed = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };

    render() {
        console.log(this.props);
        return (
            <div style={ { width: 256 } }>
                <Button type="primary" onClick={ this.toggleCollapsed } style={ { marginBottom: 16 } }>
                    { React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined) }
                </Button>

                <Button>
                    <Link to="/form">Form</Link>
                </Button>

                <Menu
                    defaultSelectedKeys={ [ '1' ] }
                    defaultOpenKeys={ [ 'sub1' ] }
                    mode="inline"       /* 'vertical' : 'inline': 'horizontal */
                    theme={ 'light' }
                    inlineCollapsed={ this.state.collapsed }
                >
                    {
                        this.props.menuList.map((item, index) => {
                            let children = item.children;
                            if (children && children.length > 0) {
                                return <SubMenu key={ 'parent-' + index } icon={ <MailOutlined/> } title={ item.label }>
                                    { children.map(((child, i) => {
                                        return <Menu.Item key={ 'child-' + i }>
                                            {
                                                child.path ?
                                                    <Link
                                                        to={ child.path ?? '' }>{ child.label }{ child.path ?? '' }</Link> :
                                                    <span>{ child.label }</span>
                                            }
                                            {/*<Route exact path="/" component={ Home }/>*/ }
                                            {/*<Route path="/about" component={ About }/>*/ }
                                            {/*<Route path="/topics" component={ Topics }/>*/ }
                                        </Menu.Item>;
                                    })) }
                                </SubMenu>;
                            } else {
                                // return <Menu.Item mode={ 'horizontal' } key="1" icon={ <PieChartOutlined/> }>
                                //     Option 1
                                // </Menu.Item>
                            }
                        })
                    }
                </Menu>
            </div>
        );
    }
}

