/** * Created by WebStorm. * User: MacBook * Date: 2020/11/18 * Time: 7:32 下午 */import React, { Component } from 'react';import { IComponentProps } from '@interface/common/component';import { elementWrap } from '@utils/parser-dom';import $ from 'jquery';import { Content, Footer } from 'antd/lib/layout/layout';export default class AppLayout extends Component<IComponentProps, any> {    state = {        containers: [ 'aside', 'header', 'main', 'footer' ],    };    constructor(props) {        super(props);        this.renderSlot();    }    renderSlot() {        setTimeout(() => {            let rootElement = elementWrap(this.props.elChildren);            this.state.containers.forEach(slot => {                let container = rootElement.querySelector(`[data-slot=${ slot }]`) as HTMLElement;                if (container) {                    $(`#app-layout [role=${ slot }]`).append(container);                }            });        });    }    render() {        console.log(this.props.dataset);        return this.props.dataset.layout === 'h' ?            <div id="app-layout"                 className="ant-layout"                 style={ { display: 'flex', flexDirection: 'row' } }>                <aside style={ { background: '#fff' } }>                </aside>                <section className="ant-layout site-layout" style={ { width: '100%', background: '#fff' } }>                    <header className="ant-layout-header site-layout-background"                            style={ { background: '#fff', padding: 0 } }>                    </header>                    <Content role="main" className="ant-layout-content site-layout-background"                             style={ {                                 minHeight : 280,                                 padding   : 10,                                 boxSizing : 'border-box',                                 background: '#fff',                             } }                    >                    </Content>                </section>                <Footer role="footer" style={ { width: '100%' } }>                </Footer>            </div>            :            <div id="app-layout"                 className="ant-layout"                 style={ {                     display      : 'flex',                     flexDirection: 'row',                     flexWrap     : 'wrap',                 } }>                <header role="header" className="ant-layout-header site-layout-background"                        style={ { background: '#fff', padding: 0, width: '100%', overflow: 'hidden' } }>                </header>                <section className="ant-layout site-layout"                         style={ {                             width        : '100%',                             display      : 'flex',                             flexDirection: 'row',                             background   : '#fff',                         } }                >                    <aside role="aside" style={ { width: 200, background: '#ff' } }>                    </aside>                    <Content role="main" className="ant-layout-content site-layout-background"                             style={ {                                 minHeight : 280,                                 padding   : 10,                                 boxSizing : 'border-box',                                 background: '#fff',                             } }>                    </Content>                </section>                <Footer role="footer" style={ { width: '100%' } }>                </Footer>            </div>;    }}