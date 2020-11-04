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
import { Rnd } from 'react-rnd';
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
        loading: false,
        visible: false,
        width  : 600,
        height : 400,
        x      : 50,
        y      : 50,
    };
    rnd: any;

    constructor(props) {
        super(props);
        let uid = this.props.el.getAttribute('data-component-uid');
        $('body').on('click', `[data-component-uid=${ uid }]`, () => this.handleShowModel());
    }

    handleShowModel() {
        this.setState({
            visible: true,
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
        const { visible, loading } = this.state;
        // return <>
        //     <Rnd
        //         style={ style }
        //         default={ {
        //             x     : 0,
        //             y     : 0,
        //             width : 200,
        //             height: 200,
        //         } }
        //     >
        //         Rnd
        //     </Rnd>
        // </>;
        return <>
            <Modal
                visible={ visible }
                title={ this.props.dataset.title }
                onOk={ this.handleOk.bind(this) }
                onCancel={ this.handleCancel.bind(this) }
                // @ts-ignore
                modalRender={ modal => {
                    return <Rnd
                        ref={ c => {
                            this.rnd = c;
                        } }
                        default={ {
                            x     : 0,
                            y     : 0,
                            width : 320,
                            height: 200,
                        } }
                    >
                        { modal }
                    </Rnd>;
                } }
                footer={ [
                    <Button key="back" onClick={ this.handleCancel.bind(this) }>
                        Return
                    </Button>,
                    <Button key="submit" type="primary" loading={ loading } onClick={ this.handleOk.bind(this) }>
                        Submit
                    </Button>,
                ] }
            >
                { elementParseAllVirtualDOM(this.props.elChildren) }
            </Modal>
        </>;
    }

}

