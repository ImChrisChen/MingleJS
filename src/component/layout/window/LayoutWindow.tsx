/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/5
 * Time: 2:48 下午
 */
import React, { Component } from 'react';
import { Button, Modal, Spin } from 'antd';
import { INativeProps } from '@interface/common/component';
import Draggable from 'react-draggable';
import './LayoutWindow.css';
import ReactDOM from 'react-dom';

let c = document.createElement('div');
c.setAttribute('id', 'WIN');
document.body.append(c);

export default class LayoutWindow {

    public static instance;

    private readonly props: INativeProps;

    // TODO 使用单例模式，复用一个弹窗 (减少内存消耗)
    constructor(props: INativeProps) {
        this.props = props;

        this.props.el.addEventListener('click', e => this.handleClickBtn(e));

        /**
         * --------------------------- Single Model --------------------------------------
         */
        if (!LayoutWindow.instance) {
            this.render();
        }
    }

    handleClickBtn(e: MouseEvent) {
        e.preventDefault();
        this.handleShowModel();
    }

    handleShowModel() {

        let prevUrl = LayoutWindow.instance.state.iframeUrl;
        let currentUrl = this.props.el.getAttribute('href');
        let iframeHidden = true;
        if (prevUrl === currentUrl) {
            iframeHidden = false;
        }
        LayoutWindow.instance.setState({
            // 在a标签时可以不用设置,设置后其他标签也通用 <button data-fn="layout-window" href='https://baidu.com'>btn</button>
            iframeUrl   : currentUrl,
            visible     : true,     //弹窗显示
            iframeHidden: iframeHidden,     //弹窗内容iframe隐藏,等iframe 加载完成后再显示
        });
    };

    render() {
        if (!document.querySelector('.layout-window-container')) {
            let container = document.createElement('div');
            container.classList.add('layout-window-container');
            document.body.append(container);
            ReactDOM.render(<PrivateLayoutWindow ref={ instance => {
                LayoutWindow.instance = instance;
            } } { ...this.props } />, container);
        }
    }
}

class PrivateLayoutWindow extends Component<any, any> {

    state = {
        loading     : false,
        visible     : this.props.dataset.open ?? false,
        width       : this.props.dataset.width ?? 600,
        height      : this.props.dataset.height ?? 400,
        iframeHidden: false,
        disabled    : true,
        iframeUrl   : '',
    };

    // private readonly target: string = 'layout-window-iframe';

    constructor(props) {
        super(props);
    }

    handleOk() {
        this.setState({ loading: true });
        setTimeout(() => {
            this.setState({ loading: false, visible: false });
        }, 3000);
    };

    handleCancel() {
        this.setState({ visible: false });
    };

    render() {
        return <Modal
            visible={ this.state.visible }
            mask={ this.props.dataset.mask ?? false }
            getContainer={ document.querySelector('#WIN') as HTMLElement }
            title={ <div
                onMouseOverCapture={ () => {
                    if (this.state.disabled) {
                        this.setState({ disabled: false });
                    }
                } }
                onMouseOutCapture={ () => {
                    this.setState({ disabled: true });
                } }
                style={ { width: '100%', cursor: 'move' } }
                onMouseOver={ () => {
                    if (this.state.disabled) {
                        this.setState({ disabled: false });
                    }
                } }
                onMouseOut={ () => {
                    this.setState({ disabled: true });
                } }
            >{ this.props.dataset.title }</div> }

            width={ 1000 }
            onOk={ this.handleOk.bind(this) }
            onCancel={ this.handleCancel.bind(this) }
            modalRender={ modal => <Draggable disabled={ this.state.disabled }>{ modal }</Draggable> }
            footer={
                [
                    <Button key="back" onClick={ this.handleCancel.bind(this) }>
                        Return
                    </Button>,
                    <Button key="submit" type="primary" loading={ this.state.loading }
                            onClick={ this.handleOk.bind(this) }>
                        Submit
                    </Button>,
                ]
            }
        >
            <Spin spinning={ this.state.iframeHidden }>
                <iframe className="layout-window-iframe"
                        style={ { minHeight: this.state.height, opacity: this.state.iframeHidden ? 0 : 1 } }
                        onLoad={ () => this.setState({ iframeHidden: false }) }
                        src={ this.state.iframeUrl }
                />
                {/*<div ref={ element => element?.append(...this.props.subelements) }/>*/ }
            </Spin>
        </Modal>;
    }

}

