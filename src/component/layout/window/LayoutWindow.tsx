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
import { CloseOutlined } from '@ant-design/icons';

interface ILayoutModalProps {
    content: HTMLElement
    onClose: (...args) => any
    dataset?: any

    [key: string]: any
}

class LayoutModal extends Component<ILayoutModalProps, any> {

    constructor(prosp) {
        super(prosp);
        console.log(prosp);
    }

    render() {
        let { content, onClose } = this.props;
        return <div ref={ el => el && el.append(content) } style={ { width: 'inherit', height: 'inherit' } }>
            <div
                style={ {
                    display       : 'flex',
                    justifyContent: 'space-between',
                    alignItems    : 'center',
                    padding       : '8px 0',
                    borderBottom  : '1px solid #ccc',
                    cursor        : 'move',
                } }>
                <div></div>
                <h2 style={ { marginBottom: 0 } }>{ this.props.dataset.title }</h2>
                <CloseOutlined style={ { marginRight: 20 } } onClick={ onClose }/>
            </div>
        </div>;
    }
}

export default class LayoutWindow {

    private el: HTMLElement;
    private delay: number = 400;       // ms
    private target = `layout-window-iframe`;
    private props;

    constructor(props) {
        console.log(props);
        this.props = props;
        this.el = props.el;

        let elTarget = this.el.getAttribute('target');
        if (!elTarget) {
            this.el.setAttribute('target', this.target);
        } else {
            return;
        }

        this.el.addEventListener('click', e => {
            let layoutWindowContainer = $('.layout-window-container');
            // 复用同一个iframe
            if (layoutWindowContainer.length > 0) {
                layoutWindowContainer.fadeIn(this.delay);
            } else {
                this.renderIframe();
            }
        });
    }

    renderIframe() {
        let iframe = document.createElement('iframe');

        iframe.name = this.target;
        iframe.classList.add('layout-window-iframe');

        // let iframeModal = <div ref={ el => el && el.append(iframe) } style={ { width: 'inherit', height: 'inherit' } }>
        //     <Button onClick={ this.handleClose }>关闭</Button>
        // </div>;

        let container = document.createElement('div');
        container.classList.add('layout-window-container');

        container.style.height = '520px';
        container.style.width = '720px';

        document.body.append(container);
        ReactDOM.render(
            <LayoutModal
                { ...this.props }
                content={ iframe }
                onClose={ this.handleClose }
            />,
            container,
        );
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

