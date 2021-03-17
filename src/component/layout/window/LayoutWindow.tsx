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

export default class LayoutWindow {

    private iframe;

    constructor(el) {
        let iframe = document.createElement('iframe');
        console.log(el);
        iframe.name = el.getAttribute('target');
        iframe.height = '400';
        iframe.width = '600';
        iframe.classList.add('layout-window-iframe');
        document.body.append(iframe);
        this.iframe = iframe;
    }
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

