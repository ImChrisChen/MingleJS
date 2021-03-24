/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/5
 * Time: 2:48 下午
 */
import React, { Component } from 'react';
import { Button, Modal } from 'antd';
import { INativeProps } from '@interface/common/component';
import Draggable from 'react-draggable';
import './LayoutWindow.css';
import ReactDOM from 'react-dom';

let c = document.createElement('div');
c.setAttribute('id', 'WIN');
document.body.append(c);

export default class LayoutWindow {

    props: INativeProps;

    constructor(props: INativeProps) {
        this.props = props;
        this.render();
    }

    render() {
        let el = this.props.el;
        let target = el.getAttribute('target');
        if (!target) {
            el.setAttribute('target', 'layout-window-iframe');
        }
        if (!document.querySelector('.layout-window-container')) {
            let container = document.createElement('div');
            container.classList.add('layout-window-container');
            document.body.append(container);
            ReactDOM.render(<PrivateLayoutWindow { ...this.props } />, container);
        }
    }
}

class PrivateLayoutWindow extends Component<any, any> {

    state = {
        loading  : false,
        visible  : this.props.dataset.open ?? false,
        width    : this.props.dataset.width ?? 600,
        height   : this.props.dataset.height ?? 400,
        disabled : true,
        iframeUrl: '',
    };

    private readonly target: string = 'layout-window-iframe';

    constructor(props) {
        super(props);
        let el = this.props.el;

        this.props.el.addEventListener('click', e => this.handleClickBtn(e));
    }

    handleClickBtn(e) {
        e.stopPropagation();
        this.handleShowModel();
    }

    handleShowModel() {
        if (document.querySelector('#WIN')) {

        }
        this.setState({
            iframeUrl: this.props.el.getAttribute('href'),
            visible  : true,
        });
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
            <iframe className="layout-window-iframe" style={ { minHeight: this.state.height } }
                    src={ this.state.iframeUrl }
                    name={ this.target }/>
            {/*<div ref={ element => element?.append(...this.props.subelements) }/>*/ }
        </Modal>;
    }

}

