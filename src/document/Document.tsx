/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/23
 * Time: 12:54 下午
 */

import React from 'react';
import { deepEach } from '@utils/util';
import componentMap from '@root/config/component.config';
import { formatComponents2Tree } from "@utils/format-data";
import FormEditor from '@component/form/editor/editor'
import { Layout, Menu } from "antd";
import './Document.scss'
import LayoutMenu from "@component/layout/menu/menu";
import { Redirect, Route, Switch } from "react-router";
import CodeGenerate from "@component/code/generate/CodeGenerate";
import { Link } from "react-router-dom";
import html from '@root/demo/index.html'
import App from "@src/App";

const { Header, Content, Footer, Sider } = Layout;

class Container extends React.Component<any, any> {
    render() {
        return <>
            <FormEditor visibleEditor={ false } value={ this.props.value }/>
        </>;
    }
}

class Document extends React.Component<any, any> {
    state: any = {
        menuList : [],
        routes   : [],
        collapsed: false,
    };

    constructor(props) {
        super(props);

        formatComponents2Tree(componentMap).then(list => {
            let routes = deepEach(list, item => {
                if (item.component) return item;
            });
            this.setState({ menuList: list, routes });
        });
    }

    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };

    handleCodeGenerate() {

    }

    render() {
        let Routes = [];
        if (this.state.routes.length > 0) {
            Routes = this.state.routes.map(route => {
                if (route.document) {
                    return <Route key={ Math.random() * 1000 } path={ route.path }
                                  render={ () => <Container value={ route.document['default'] }/> }/>;
                } else {
                    return undefined
                }
            }).filter(t => t);
        }

        return (
            <Layout style={ { display: "flex", flexDirection: 'row' } }>
                <LayoutMenu menuList={ this.state.menuList }/>
                <Layout className="site-layout" style={ { width: '100%', } }>
                    <Header className="site-layout-background" style={ { padding: 0, background: '#fff' } }>
                        <div className="logo"/>
                        <Menu theme="light" mode="horizontal" defaultSelectedKeys={ [ '2' ] }>
                            <Menu.Item key="1" onClick={ this.handleCodeGenerate.bind(this) }>组件设计器</Menu.Item>
                            <Menu.Item key="2"><Link to={ '/test' }>测试页面</Link></Menu.Item>
                        </Menu>

                    </Header>
                    <Content
                        className="site-layout-background"
                        style={ {
                            // margin   : '24px 16px',
                            // padding  : 24,
                            minHeight: 280,
                        } }
                    >
                        <Switch>
                            { ...Routes }
                            <Route render={
                                () => <TestPage/>
                            }/>
                            <Redirect from="*" to="/" exact/>
                        </Switch>

                        <CodeGenerate visible={ false }/>

                    </Content>
                </Layout>
            </Layout>
        );
    }
}

class TestPage extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.renderHtml()
    }

    renderHtml() {
        setTimeout(function () {
            let TestPage = $('.TestPage');
            TestPage.append($(html));
            new App(TestPage.get(0))
        })
    }

    render() {
        return <div className="TestPage"/>;
    }
}

export default Document;
