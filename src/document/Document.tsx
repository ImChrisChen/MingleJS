/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/23
 * Time: 12:54 下午
 */

import React from 'react';
import { deepEach } from '@utils/util';
import componentMap from '@root/config/component.config';
import { formatComponents2Tree } from '@utils/format-data';
import FormEditor from '@component/form/editor/editor';
import { Layout, Menu } from 'antd';
import './Document.scss';
import LayoutMenu from '@component/layout/menu/menu';
import { Redirect, Route, Switch } from 'react-router';
import CodeGenerate from '@component/code/generate/CodeGenerate';
import { Link } from 'react-router-dom';
import html from '@root/template/user_analysis.html';
import html2 from '@root/template/temaplte.pkg.html';
import App from '@src/App';
import developmentDocs from '@root/README.md';
import usageDocs from '@root/README-USAGE.md';
import tplEngine from '@root/template/tpl-engine.html';
import $ from 'jquery';
import regExpManual from '@root/template/regexp_manual.html';

const { Header, Content, Footer, Sider } = Layout;

class Document extends React.Component<any, any> {
    state: any = {
        menuList      : [],
        routes        : [],
        collapsed     : false,
        showCodeDesign: false,          // 是否显示组件设计器
    };

    constructor(props) {
        super(props);

        formatComponents2Tree(componentMap).then(list => {
            let routes = deepEach(list, item => {
                if (item.component) return item;
            });
            console.log(list);
            this.setState({ menuList: list, routes });
        });
    }

    toggle = () => {
        this.setState({
            collapsed: !this.state.collapsed,
        });
    };

    handleCodeGenerate() {
        this.setState({
            showCodeDesign: true,
        });
        console.log(this.state);
    }

    handleCloseCodeDesign() {
        this.setState({
            showCodeDesign: false,
        });
    }

    render() {
        let Routes = [];
        if (this.state.routes.length > 0) {
            Routes = this.state.routes.map(route => {
                if (route.document) {
                    return <Route key={ Math.random() * 1000 }
                                  path={ route.path }
                                  render={ () => <FormEditor visibleEditor={ false }
                                                             val={ route.document['default'] }/> }/>;
                } else {
                    return undefined;
                }
            }).filter(t => t);
        }

        return (
            <Layout style={ { display: 'flex', flexDirection: 'row' } }>
                <LayoutMenu menuList={ this.state.menuList }/>
                <Layout className="site-layout" style={ { width: '100%' } }>
                    <Header className="site-layout-background" style={ { padding: 0, background: '#fff' } }>
                        <div className="logo"/>

                        <Menu theme="light" mode="horizontal" defaultSelectedKeys={ [ '2' ] }>
                            <Menu.Item key="1"><Link to={ '/code-generate' }>组件设计器</Link></Menu.Item>
                            <Menu.Item key="2"><Link to={ '/' }>使用文档</Link></Menu.Item>
                            <Menu.Item key="3"><Link to={ '/development-docs' }>开发文档</Link></Menu.Item>
                            <Menu.Item key="4"><Link to={ '/test' }>测试页面</Link></Menu.Item>
                            <Menu.Item key="5"><Link to={ '/test2' }>测试页面2</Link></Menu.Item>
                            <Menu.Item key="6"><Link to={ '/tpl-engine' }>模版引擎</Link></Menu.Item>
                            <Menu.Item key="7"><Link to={ '/regexp-manual' }>正则手册</Link></Menu.Item>
                        </Menu>

                    </Header>
                    <Content
                        className="site-layout-background"
                        style={ {
                            // margin   : '24px 16px',
                            // padding  : 2,
                            minHeight: 280,
                        } }
                    >
                        <Switch>
                            { ...Routes }
                            <Route path={ '/' } exact key="/"
                                   render={ () => <FormEditor visibleEditor={ false } value={ usageDocs }/> }/>
                            <Route path={ '/development-docs' } exact key="development-docs"
                                   render={ () => <FormEditor visibleEditor={ false } value={ developmentDocs }/> }/>
                            <Route path={ '/test' } key="test" exact render={ () => <HtmlRender html={ html }/> }/>
                            <Route path={ '/test2' } key="test2" exact render={ () => <HtmlRender html={ html2 }/> }/>
                            <Route path={ '/tpl-engine' } key="tpl-engine" exact
                                   render={ () => <HtmlRender html={ tplEngine }/> }/>
                            <Route path={ '/code-generate' } key="code-generate" exact
                                   render={ () => <CodeGenerate/> }/>
                            <Route path={ '/regexp-manual' } key="regexp-manual" exact
                                   render={ () => <HtmlRender html={ regExpManual }/> }/>
                            <Redirect from="*" to="/" exact/>
                        </Switch>

                        {/*<CodeGenerate visible={ this.state.showCodeDesign }*/ }
                        {/*              onClose={ this.handleCloseCodeDesign.bind(this) }*/ }
                        {/*<CodeGenerate visible={ this.state.showCodeDesign }*/ }
                        {/*              onClose={ this.handleCloseCodeDesign.bind(this) }*/ }

                    </Content>
                </Layout>
            </Layout>
        );
    }
}

class HtmlRender extends React.Component<{ html: string }, any> {
    constructor(props) {
        console.log('htmlrender');
        super(props);
        this.renderHtml();
    }

    renderHtml() {
        setTimeout(() => {
            let HtmlRender = $('.HtmlRender');
            HtmlRender.html('').append($(this.props.html));
            new App(HtmlRender.get(0));
        });
    }

    render() {
        return <div className="HtmlRender"/>;
    }
}

export default Document;
