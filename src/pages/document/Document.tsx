/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/23
 * Time: 12:54 下午
 */

import React from 'react';
import { deepEach } from '@utils/util';
import componentConfig from '@root/config/component.config';
import { formatComponents2Tree } from '@utils/format-data';
import MarkdownEditor from '@src/private-component/markdown-editor/MarkdownEditor';
import { Layout, Menu } from 'antd';
import './Document.scss';
import LayoutMenu from '@src/private-component/views/layout-menu/LayoutMenu';
import { Redirect, Route, Switch } from 'react-router';
import navRoutes from '@src/router/router';
import { Link } from 'react-router-dom';
import md5 from 'md5';
import axios from 'axios';
import { HtmlRenderer } from '@src/private-component/html-renderer/HtmlRenderer';

const { Header, Content, Footer, Sider } = Layout;

class Document extends React.Component<any, any> {
    state: any = {
        menulist      : [],
        routes        : [],
        collapsed     : false,
        showCodeDesign: false,          // 是否显示组件设计器
        navRoutes     : [ ...navRoutes ],
    };

    constructor(props) {
        super(props);
        this.init();
    }

    async init() {
        let navRoutes = await this.getRouter();
        let list = await formatComponents2Tree(componentConfig);
        console.log(list);
        let routes = deepEach(list, item => {
            if (item.component && item.document) return item;
        });

        this.setState({
            navRoutes,
            menulist: list,
            routes,
        });
    }

    // 获取导航栏路由
    async getRouter() {
        let res = await axios.get('/server/files/template');
        let data = res.data.status ? res.data.data : [];
        let pageRoutes: Array<any> = [];
        for (const item of data) {
            let html = (await import(`@root/template/${ item }`)).default;
            let [ name ] = item.split('.');
            pageRoutes.push({
                name     : name,
                path     : '/nav-' + item,
                component: <HtmlRenderer key={ '/nav-' + item } html={ html }/>,
            });
        }
        let navRoutes = this.state.navRoutes;
        return [ ...navRoutes, ...pageRoutes ];
    }

    getCurrentMenu() {
        let [ , currentRoute ] = window.location.hash.split('#');
        return currentRoute;
    }

    render() {
        let routes = this.state.routes.map(route => {
            if (route.document && route.path) {
                return <Route
                    exact
                    key={ route.path }
                    path={ route.path }
                    render={ () => <MarkdownEditor
                        visibleEditor={ false }
                        value={ route.document.default }/> }/>;
            } else {
                return undefined;
            }
        }).filter(t => t);

        return (
            <Layout style={ { display: 'flex', flexDirection: 'row' } }>
                <LayoutMenu key={ md5(this.state.menulist) } data={ this.state.menulist }/>
                <Layout className="site-layout" style={ { width: '100%' } }>
                    <Header className="site-layout-background" style={ { padding: 0, background: '#fff' } }>
                        <div className="logo"/>

                        {/*TODO defaultSelectedKeys 有二级路由估计GG了 */ }
                        <Menu theme="light" mode="horizontal" defaultSelectedKeys={ [ this.getCurrentMenu() ] }>
                            { this.state.navRoutes.map(route => {
                                return <Menu.Item key={ route.path }>
                                    { route.target
                                        ? <a href={ route.path } target={ route.target }>{ route.name } </a>
                                        : <Link to={ route.path }> { route.name } </Link>
                                    }
                                </Menu.Item>;
                            }) }
                        </Menu>

                    </Header>
                    <Content
                        className="site-layout-background"
                        style={ {
                            minHeight : 280,
                            background: '#f0f2f5',
                        } }
                    >
                        <Switch>
                            { ...routes }
                            { this.state.navRoutes.map(route => <Route
                                    exact
                                    path={ route.path }
                                    key={ route.path }
                                    render={ () => route.component }
                                />,
                            ) }
                            <Redirect from="*" to="/" exact/>
                        </Switch>
                    </Content>
                </Layout>
            </Layout>
        );
    }
}

export default Document;
