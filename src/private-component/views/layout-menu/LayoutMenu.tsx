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
    isEnd = false;
    defaultOpenKeys:any = [];
    defaultSelectedKeys:any = []
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
        >
            { renderMenuChild(item) }
        </Menu.Item>;
    }

    renderMenuChildren(data) {
        return data.map((item, index) => {
            let children = item.children;
            let key = item.id || item.path || item.value || index;
            if (children && children.length > 0) {
                return <SubMenu className={ style.layoutSubmenu }
                                data-path={ item.path }
                                key={ key }
                                title={ item.label }>
                    { this.renderMenuChildren(children) }
                </SubMenu>;
            } else {
                return this.renderMenuItem(item, key);
            }
        });
    }

    /**
     * 根据url选中menu（适用性？) // 还是保存在locastorage
     * @param data 
     * @returns 
     */
    getDefaultOpen = (data = this.props.data) =>{
        let url = window.location.pathname
        for(let i=0,l=data.length;i<l;i++){
            let {children,path} = data[i]
            let key =  data[i].id ||  data[i].path ||  data[i].value || i;
            if (children && children.length > 0) {
                if(this.isEnd)  return {defaultOpenKeys:this.defaultOpenKeys, defaultSelectedKeys:this.defaultSelectedKeys}
                this.defaultOpenKeys.push(key)
                this.getDefaultOpen(children)
            }else{
                if(path === url){
                    this.isEnd = true
                    this.defaultSelectedKeys.push(key)
                    return {defaultOpenKeys:this.defaultOpenKeys, defaultSelectedKeys:this.defaultSelectedKeys}
                }
            }
        }
        this.defaultOpenKeys = []
        return {defaultOpenKeys:this.defaultOpenKeys, defaultSelectedKeys:this.defaultSelectedKeys}
    }

    render() {
        let width = this.props.layout === 'horizontal' ? '100%' : '160px';
        let height = this.props.layout === 'horizontal' ? 'inherit' : '100vh';
        let {defaultOpenKeys,defaultSelectedKeys} = this.getDefaultOpen();
        return (
            <div style={ {
                width             : (this.state.collapsed ? 60 : width),
                height, background: '#fff',
                position          : 'relative',
            } }>

                {/* 菜单为Nav时不显示伸缩按钮 */ }
                {/*{ this.collapsedButton() }*/ }
                <Menu
                    openKeys={defaultOpenKeys}
                    selectedKeys={defaultSelectedKeys}
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

