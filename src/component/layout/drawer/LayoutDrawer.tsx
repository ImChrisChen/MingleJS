/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/7
 * Time: 3:43 下午
 */

import React, { Component, ReactInstance } from 'react';
import { IComponentProps, INativeProps } from '@interface/common/component';
import { Drawer, Spin } from 'antd';
import ReactDOM from 'react-dom';
import style from './LayoutDrawer.scss';

export default class LayoutDrawer {

    private static instance;
    props: INativeProps;

    // 使用单例模式
    constructor(props: INativeProps) {
        this.props = props;
        let el = props.el;

        el.addEventListener('click', e => this.handleClick(e));

        if (!LayoutDrawer.instance) {
            this.renderDrawer();
        }
    }

    handleClick(e: MouseEvent) {
        e.preventDefault();

        let prevUrl = LayoutDrawer.instance.state.iframeUrl;
        let currentUrl = this.props.el.getAttribute('href');
        let iframeHidden = true;
        if (prevUrl === currentUrl) {
            iframeHidden = false;
        }

        LayoutDrawer.instance.setState({
            visible     : true,
            iframeUrl   : this.props.el.getAttribute('href'),
            iframeHidden: iframeHidden,
        });
    }

    renderDrawer() {
        let container = document.createElement('div');
        container.classList.add('layout-drawer-container');
        ReactDOM.render(<PrivateDrawer
            key={ new Date().getTime() }
            { ...this.props }
            ref={ instance => {
                LayoutDrawer.instance = instance;
            } }
        />, container);
    }
}

export class PrivateDrawer extends Component<any, any> {

    state = {
        visible     : false,
        iframeUrl   : '',
        iframeHidden: false,
    };

    constructor(props) {
        super(props);
    }

    render() {
        let { _title, _width, _height, _layout, _closable, _mask } = this.props;
        return <Drawer
            title={ _title }
            width={ _width ?? 400 }
            height={ _height ?? 400 }
            placement={ _layout ?? 'right' }
            closable={ _closable ?? true }
            mask={ _mask ?? false }
            onClose={ () => this.setState({ visible: false }) }
            visible={ this.state.visible }>
            <Spin spinning={ this.state.iframeHidden }>
                <iframe
                    className={ style.iframe }
                    style={ { height: '100vh', opacity: this.state.iframeHidden ? 0 : 1 } }
                    src={ this.state.iframeUrl }
                    onLoad={ () => this.setState({ iframeHidden: false }) }
                />
            </Spin>
        </Drawer>;
    }

}
