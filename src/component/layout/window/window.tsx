/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/5
 * Time: 2:48 下午
 */
import React from 'react';
import { Button, Modal } from 'antd';
import { IComponentProps } from '@interface/common/component';
import $ from 'jquery';
import Draggable from 'react-draggable';
import DataPanel from '@component/data/panel/panel';
// import { Row, Col, Icon, Button, Layout, Menu, Card } from 'antd';


const style = {
    display       : 'flex',
    alignItems    : 'center',
    justifyContent: 'center',
    border        : 'solid 1px #ddd',
    background    : '#f0f0f0',
};

export default class LayoutWindow extends React.Component<IComponentProps, any> {

    state = {
        loading : false,
        visible : false,
        width   : 600,
        height  : 400,
        disabled: true,
        x       : 50,
        y       : 50,
    };
    rnd: any;

    constructor(props) {
        super(props);
        this.props.el.onclick = e => this.handleClickBtn(e);
        this.props.el.innerHTML = this.props.dataset.content;
    }

    handleClickBtn(e) {

        this.handleShowModel();

        // TODO 这个要第一次弹窗后才会渲染
        let model = DataPanel.model;
        DataPanel.parseElement(this.props.elChildren, model);

        let container = document.querySelector('.layout-window-content');
        container && container.append(...this.props.elChildren);
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

    // TODO 待处理问题，当页面存在多个panel区域中都有弹窗的时候
    render() {
        const { visible, loading } = this.state;
        return <Modal
            className={ 'layout-window' }
            visible={ visible }
            mask={ false }
            getContainer={ () =>
                $(this.props.el).closest('[data-fn=data-panel]').get(0)
                || document.body }
            title={ <div
                onMouseOverCapture={ () => {
                    if (this.state.disabled) {
                        this.setState({
                            disabled: false,
                        });
                    }
                } }
                onMouseOutCapture={ () => {
                    this.setState({
                        disabled: true,
                    });
                } }
                style={ { width: '100%', cursor: 'move' } }
                onMouseOver={ () => {
                    if (this.state.disabled) {
                        this.setState({
                            disabled: false,
                        });
                    }
                } }
                onMouseOut={ () => {
                    this.setState({
                        disabled: true,
                    });
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
                    <Button key="submit" type="primary" loading={ loading } onClick={ this.handleOk.bind(this) }>
                        Submit
                    </Button>,
                ]
            }
        >
            <div className="layout-window-content"/>
        </Modal>;
    }

}

