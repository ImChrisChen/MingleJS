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
    LeftOutlined,
    RightOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import style from './LayoutMenu.scss';

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
    pathfield: string
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
    pathfield = this.props.pathfield ?? '';

    constructor(props) {
        super(props);
    }

    toggleCollapsed = (e) => {
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

    collapsedButton() {
        return this.props.layout !== 'horizontal'
            ? <Button
                hidden
                type="primary"
                className={ `layout-menu-toggle-btn ${ style.layoutMenuToggleBtn }` }
                onClick={ this.toggleCollapsed.bind(this) }
            >
                { this.state.collapsed ? <RightOutlined/> : <LeftOutlined/> }
            </Button>
            : '';
    }

    renderMenuItem(item, index) {
        const renderMenuChild = item => {
            if (item?.[this.pathfield]) {
                return <a href={ item?.[this.pathfield] }>{ item.label }</a>;
            } else if (item?.path) {
                return <Link to={ item.path ?? '/' }> { item.label } </Link>;
            } else {
                return item.label;
            }
        };
        return <Menu.Item mode={ 'horizontal' }
                          key={ index }
                          data-path={ item.path }
            // icon={ <PieChartOutlined/> }
        >
            { renderMenuChild(item) }
        </Menu.Item>;
    }

    renderMenuChildren(data) {
        // this.props.data
        return data.map((item, index) => {
            let children = item.children;
            let key = item.id || item.path || item.value || index;
            if (children && children.length > 0) {
                return <SubMenu
                    className={ style.layoutSubmenu }
                    data-path={ item.path }
                    key={ key }
                    // icon={ <MailOutlined/> }
                    title={ item.label }>
                    { children.map(((child, i) => {
                        let k = child.id || child.path || child.value || i;
                        if (child.children && child.children.length > 0) {
                            return this.renderMenuChildren(child.children);
                        } else {
                            return this.renderMenuItem(child, k);
                        }
                    })) }
                </SubMenu>;
            } else {
                return this.renderMenuItem(item, key);
            }
        });

    }

    render() {
        console.log(this.props.data);
        let width = this.props.layout === 'horizontal' ? '100%' : '160px';
        let height = this.props.layout === 'horizontal' ? 'inherit' : '100vh';
        return (
            <div style={ {
                width             : (this.state.collapsed ? 60 : width),
                height, background: '#fff',
                position          : 'relative',
            } }>

                {/* 菜单为Nav时不显示伸缩按钮 */ }
                {/*{ this.collapsedButton() }*/ }
                <Menu
                    style={ { position: 'relative' } }
                    mode={ this.props.layout || 'inline' }       /* 'vertical' : 'inline': 'horizontal */
                    theme={ 'light' }
                    inlineCollapsed={ this.state.collapsed }
                >
                    { this.renderMenuChildren(this.props.data) }
                </Menu>
                { this.collapsedButton() }
            </div>
        );
    }
}

