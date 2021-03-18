/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/5
 * Time: 2:48 下午
 */
import React, { Component } from 'react';
import { Button, Modal } from 'antd';
import { IComponentProps } from '@interface/common/component';
import Draggable from 'react-draggable';
import './LayoutWindow.css';
import ReactDOM from 'react-dom';

export default class LayoutWindow {

    private iframe;
    private el: HTMLElement;
    private delay: number = 400;       // ms

    constructor(el) {
        this.el = el;

        el.addEventListener('click', e => {
            let layoutWindowContainer = $('.layout-window-container');
            // 复用同一个iframe
            if (layoutWindowContainer.length > 0) {
                layoutWindowContainer.fadeIn(this.delay);
            } else {
                this.createIframe();
            }
        });
    }

    createIframe() {
        let iframe = document.createElement('iframe');
        iframe.name = this.el.getAttribute('target') || '';
        iframe.height = '400';
        iframe.width = '600';
        iframe.classList.add('layout-window-iframe');
        this.iframe = iframe;

        let iframeModal = <div ref={ el => el && el.append(iframe) }>
            <Button onClick={ this.handleClose }>关闭</Button>
        </div>;

        let container = document.createElement('div');
        container.classList.add('layout-window-container');
        document.body.append(container);
        ReactDOM.render(iframeModal, container);
    }

    handleClose = () => {
        $('.layout-window-container').fadeOut(this.delay);
    };

}

class LayoutWindows extends Component<IComponentProps, any> {

    state = {
        loading : false,
        visible : this.props.dataset.open ?? false,
        width   : this.props.dataset.width ?? 600,
        height  : this.props.dataset.height ?? 400,
        disabled: true,
    };
    rnd: any;

    constructor(props) {
        super(props);
        this.props.el.onclick = e => this.handleClickBtn(e);
        this.props.el.innerHTML = this.props.dataset.label;
    }

    handleClickBtn(e) {
        e.stopPropagation();
        this.handleShowModel();
    }

    handleShowModel() {
        this.setState({ visible: true });
    };

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
            <div ref={ element => {
                element?.append(...this.props.subelements);
            } }/>
        </Modal>;
    }

}

