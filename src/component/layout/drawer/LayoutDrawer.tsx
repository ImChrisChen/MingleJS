/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/7
 * Time: 3:43 下午
 */

import React from 'react';
import { IComponentProps } from '@interface/common/component';
import { Drawer } from 'antd';

export default class LayoutDrawer extends React.Component<IComponentProps, any> {
    constructor(props) {
        super(props);
        this.props.el.onclick = e => this.handleClickBtn(e);
        this.props.el.innerHTML = this.props.dataset.content;
    }

    state = {
        visible: this.props.dataset.open ?? false,
    };

    handleClickBtn(e) {
        this.showDrawer();
    }

    showDrawer() {
        this.setState({ visible: true });
    };

    onClose() {
        this.setState({ visible: false });
    };

    render() {
        let { dataset } = this.props;
        return <Drawer
            title={ dataset.title }
            width={ dataset.width ?? 400 }
            height={ dataset.height ?? 400 }
            placement={ dataset.layout ?? 'right' }
            closable={ dataset.closable ?? true }
            mask={ dataset.mask ?? false }
            onClose={ this.onClose.bind(this) }
            visible={ this.state.visible }
        >
            <div ref={ element => {
                element?.append(...this.props.elChildren);
            } }/>
        </Drawer>;
    }
}
