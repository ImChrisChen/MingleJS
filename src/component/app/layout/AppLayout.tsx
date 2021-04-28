/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/11/18
 * Time: 7:32 下午
 */
import React, { Component } from 'react';
import { IComponentProps } from '@interface/common/component';
import { elementWrap } from '@src/utils';
import $ from 'jquery';
import { Content, Footer } from 'antd/lib/layout/layout';
import style from './AppLayout.scss';
import { Avatar, Dropdown, Menu } from 'antd';
import { CaretDownOutlined, UserOutlined } from '@ant-design/icons';
import { Inject } from 'typescript-ioc';
import { HttpClientService } from '@src/services';

export default class AppLayout extends Component<IComponentProps, any> {

    @Inject httpClientService: HttpClientService;

    state = {
        containers: [ 'aside', /*'header'*/ 'main' /*'footer'*/ ],
        page      : {},
        list      : [] as Array<{ name: string, url: string }>,
        info      : {} as { username: string },
    };

    constructor(props) {
        super(props);
        this.renderSlot();
    }

    async componentDidMount() {
        let [ data, page ] = await this.getUserInfo();
        this.setState({
            list: data.urls,
            info: data.info,
            page,
        });
    }

    async getUserInfo() {
        let url = `http://sim.local.superdalan.com/cmdb/profile`;
        let res = await this.httpClientService.jsonp(url);
        return res.status ? [ res.data, res.page ] : [];
    }

    renderSlot() {
        setTimeout(() => {
            let rootElement = elementWrap(this.props.subelements);
            this.state.containers.forEach(slot => {
                debugger
                let container = rootElement.querySelector(`[data-slot=${ slot }]`) as HTMLElement;
                if (container) {
                    $(`#app-layout [role=${ slot }]`).append(container);
                }
            });
            $('body').on('click', '.layout-menu-toggle-btn', function (e) {
                let layoutMenu = $(this).closest('aside[role=aside]');
                let layoutContent = layoutMenu.next('div');

                console.log(Number(layoutMenu?.width()) >= 200, layoutContent);
                if (Number(layoutMenu?.width()) >= 200) {
                    layoutContent.css({
                        'width': `calc(100% - 60px)`,
                    });
                } else {
                    layoutContent.css({
                        'width': `calc(100% - 200px)`,
                    });
                }

            });
        });
    }

    render() {
        const menu = this.state.list.map(item => <Menu.Item> <a href={ item.url }> { item.name } </a>
        </Menu.Item>);
        const logo = <div className={ style.logo }>
            <img src="https://wui.superdalan.com/images/dalan64.png" style={ { width: 30, marginLeft: 8 } } alt=""/>
            <h1 style={ { padding: 0, margin: 0 } }>{ this.props.dataset.title }</h1>
        </div>;

        const nav = <nav>
            <Dropdown overlay={ <Menu>{ menu }</Menu> } placement="bottomCenter" arrow>
                <span style={ { cursor: 'pointer' } }>
                    <Avatar size="small" icon={ <UserOutlined/> }/> { this.state.info.username }
                    <CaretDownOutlined/>
                </span>
            </Dropdown>
        </nav>;


        return this.props.dataset.layout === 'horizontal' ?
            <div id="app-layout"
                 style={ { display: 'flex', flexDirection: 'row' } }>
                <aside style={ { background: '#fff' } }>

                </aside>
                <section className={ ' site-layout' } style={ { width: '100%', background: '#fff' } }>

                    <header className={ `${ style.appLayoutHeaderV }` }>

                        { logo }

                        { nav }

                    </header>

                    <Content role="main"
                             style={ {
                                 minHeight : 280,
                                 padding   : 10,
                                 boxSizing : 'border-box',
                                 background: '#f0f2f5',
                             } }
                    >
                    </Content>
                </section>
                <Footer role="footer" style={ { width: '100%' } }>

                </Footer>
            </div>
            :
            <div id="app-layout"
                 style={ {
                     display      : 'flex',
                     flexDirection: 'row',
                     flexWrap     : 'wrap',
                 } }>

                <header className={ `${ style.appLayoutHeaderV }` }>

                    { logo }

                    <div role="header">

                    </div>

                    { nav }

                </header>

                <section className={ `site-layout ${ style.appLayoutSelectionV }` }>
                    <aside role="aside" className={ style.appLayoutAsideV }>

                    </aside>

                    <div className={ `app-layout-content ${ style.appLayoutContentV }` }>
                        <Content role="main" style={ { padding: 10 } }> </Content>
                        <Footer className={ style.appLayoutFooterV } role="footer">
                        </Footer>
                    </div>

                </section>
            </div>;

    }
}
