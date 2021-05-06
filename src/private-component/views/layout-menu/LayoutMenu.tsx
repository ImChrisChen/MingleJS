/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/17
 * Time: 11:38 上午
 */
import * as React from 'react';
import { Button, Menu } from 'antd';
import {
    LeftOutlined,
    RightOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import style from './LayoutMenu.scss';
import { Inject } from 'typescript-ioc';
import { FormatDataService } from '@src/services';

const { SubMenu } = Menu;

interface IMenuItem {
    name: string
    path?: string
    id?: string
    url?: string
    children?: Array<IMenuItem>

    [key: string]: any
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

    @Inject public readonly formatDataService: FormatDataService;

    state = {
        theme      : 'light',
        collapsed  : !(this.props.open ?? true),
        defaultKeys: this.getDefaultKeys(),
    };
    pathfield = this.props.pathfield ?? '';
    isEnd = false;

    constructor(props) {
        super(props);
    }

    getDefaultKeys() {
        let menuStr = localStorage.getItem('menu_active') || '{}';
        let menuActive = JSON.parse(menuStr);
        let { selectedKeys, openKeys } = menuActive;
        return {
            defaultOpenKeys    : openKeys,
            defaultSelectedKeys: selectedKeys,
        };
    }

    toggleCollapsed = (e) => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };

    handleSelectMenu = (e) => {
        let openKeys = e.item.props.openKeys;
        let selectedKeys = e.selectedKeys;
        localStorage.setItem('menu_active', JSON.stringify({
            openKeys,
            selectedKeys,
        }));
    };

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

    renderMenuItem(item, id, parentIndex, index) {
        const renderMenuChild = item => {
            if (item?.[this.pathfield]) {
                return <p>{ item.label }</p>;
                // return <a href={ item?.[this.pathfield] }>{ item.label }</a>;
            } else if (item?.path) {
                return <p> { item.label } </p>;
                // return <Link to={ item.path ?? '/' }> { item.label } </Link>;
            } else {
                return item.label;
            }
        };
        return <Menu.Item mode={ 'horizontal' }
                          key={ id }
                          data-path={ item.path }
        >
            { renderMenuChild(item) }
        </Menu.Item>;
    }

    renderMenuChildren(data, parentIndex = 0) {
        return data.map((item, index) => {
            let children = item.children;
            let id = item.id || item.path || item.value || index;
            if (children && children.length > 0) {
                return <SubMenu className={ style.layoutSubmenu }
                                data-path={ item.path }
                                key={ id }
                                title={ item.label }>
                    { this.renderMenuChildren(children, ++parentIndex) }
                </SubMenu>;
            } else {
                return this.renderMenuItem(item, id, parentIndex, index);
            }
        });
    }

    render() {
        let width = this.props.layout === 'horizontal' ? '100%' : '160px';
        let height = this.props.layout === 'horizontal' ? 'inherit' : '100vh';
        let { defaultKeys } = this.state;
        return (
            <div style={ {
                width     : (this.state.collapsed ? 60 : width),
                height,
                background: '#fff',
                position  : 'relative',
            } }>

                {/* 菜单为Nav时不显示伸缩按钮 */ }
                {/*{ this.collapsedButton() }*/ }
                <Menu
                    defaultOpenKeys={ defaultKeys.defaultOpenKeys }
                    defaultSelectedKeys={ defaultKeys.defaultSelectedKeys }
                    style={ { position: 'relative' } }
                    mode={ this.props.layout || 'inline' }       /* 'vertical' : 'inline': 'horizontal */
                    theme={ 'light' }
                    inlineCollapsed={ this.state.collapsed }
                    onSelect={ this.handleSelectMenu }
                >
                    { this.renderMenuChildren(this.props.data) }
                </Menu>
                { this.collapsedButton() }
            </div>
        );
    }
}

