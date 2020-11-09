/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/5
 * Time: 2:48 下午
 */
import React from 'react';
import { Button, Modal } from 'antd';
import { IComponentProps } from '@interface/common/component';
import { elementParseAllVirtualDOM } from '@utils/parser-dom';
import $ from 'jquery';
import Draggable from 'react-draggable';
import DataPanel from '@component/data/panel/panel';
// import { Row, Col, Icon, Button, Layout, Menu, Card } from 'antd';
import App from '@src/App';

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
    }

    handleClickBtn(e) {
        let $dataPanel = $(this.props.el).closest('[data-fn=data-panel]');
        App.parseElementProperty($dataPanel.get(0)).then(dataset => {
            DataPanel.getData(dataset).then(model => {
                this.handleShowModel();
                DataPanel.parseWorkingModel(model);
            });
        });
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
        const { visible, loading } = this.state;

        // @ts-ignore
        // let children = [ ...this.props.elChildren[0].content.children ];
        let children = this.props.elChildren;

        return <Modal
            visible={ visible }
            mask={ false }
            maskClosable={ false }
            getContainer={ () => document.querySelector('[data-template-element]') ?? document.body }
            title={ <div
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
            // @ts-ignore
            modalRender={ modal => <Draggable disabled={ this.state.disabled }>{ modal }</Draggable> }
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
            {   // @ts-ignore 
                elementParseAllVirtualDOM(children)
            }
        </Modal>;
    }

}

