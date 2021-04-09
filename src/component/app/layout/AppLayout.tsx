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

export default class AppLayout extends Component<IComponentProps, any> {

    state = {
        containers: ['aside', 'header', 'main' /*'footer'*/],
    };

    constructor(props) {
        super(props);
        this.renderSlot();
    }

    renderSlot() {
        setTimeout(() => {
            let rootElement = elementWrap(this.props.subelements);
            this.state.containers.forEach(slot => {
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

        const menu = (
            <Menu>
                <Menu.Item>
                    个人信息
                </Menu.Item>
                <Menu.Item>
                    退出
                </Menu.Item>
            </Menu>
        );


        return this.props.dataset.layout === 'horizontal' ?
            <div id="app-layout"
                 style={ { display: 'flex', flexDirection: 'row' } }>
                <aside style={ { background: '#fff' } }>

                </aside>
                <section className={ ' site-layout' } style={ { width: '100%', background: '#fff' } }>

                    <header className={ `${ style.appLayoutHeaderV }` }>

                        <div className={ style.logo }>Logo</div>

                        <nav>
                            <Dropdown overlay={ menu } placement="bottomCenter" arrow>
                            <span style={ { cursor: 'pointer' } }>
                                <Avatar size="small" icon={ <UserOutlined/> }/> bottomCenter <CaretDownOutlined/>
                            </span>
                            </Dropdown>
                        </nav>

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

                    <div className={ style.logo }>Logo</div>

                    <div role="header">

                    </div>

                    <nav>
                        <Dropdown overlay={ menu } placement="bottomCenter" arrow>
                            <span style={ { cursor: 'pointer' } }>
                                <Avatar size="small" icon={ <UserOutlined/> }/> bottomCenter <CaretDownOutlined/>
                            </span>
                        </Dropdown>
                    </nav>

                </header>

                <section className={ `site-layout ${ style.appLayoutSelectionV }` }>
                    <aside role="aside" className={ style.appLayoutAsideV }>

                    </aside>

                    <div className={ `app-layout-content ${ style.appLayoutContentV }` }>
                        <Content role="main" style={ { padding: 10 } }> </Content>
                        <Footer className={ style.appLayoutFooterV } role="footer">
                            footer
                        </Footer>
                    </div>

                </section>
            </div>;

    }
}
