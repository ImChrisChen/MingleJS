/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/7
 * Time: 3:43 下午
 */

import React, { Component } from 'react';
import { IComponentProps, INativeProps } from '@interface/common/component';
import { Drawer } from 'antd';
import ReactDOM from 'react-dom';

import style from './LayoutDrawer.scss';

export default class layoutDrawer extends Component<IComponentProps, any> {

    state = {
        visible: false,
    };

    constructor(props) {
        super(props);
        let el = this.props.el;
        el.innerHTML = 'label';
        el.onclick = () => {
            this.setState({
                visible: true,
            });
        };
    }

    render() {
        let { dataset } = this.props;
        return <Drawer
            title={ dataset.title }
            width={ dataset.width ?? 400 }
            height={ dataset.height ?? 400 }
            placement={ dataset.layout ?? 'right' }
            closable={ dataset.closable ?? true }
            mask={ dataset.mask ?? false }
            onClose={ () => this.setState({ visible: false }) }
            visible={ this.state.visible }
        >
            {/*<iframe className={ style.iframe } src={ this.state.iframeUrl } name={ this.target }></iframe>*/ }
        </Drawer>;
    }
}

// export default class LayoutDrawer {
//
//     props: INativeProps;
//
//     constructor(props: INativeProps) {
//         this.props = props;
//         console.log(props.el);
//         this.renderDrawer();
//     }
//
//     renderDrawer() {
//         let popupContainer = document.querySelector('.popup-container');
//         if (!popupContainer) {
//             popupContainer = document.createElement('div');
//             popupContainer.classList.add('popup-container');
//             document.body.append(popupContainer);
//         }
//
//         let container = document.createElement('div');
//         container.classList.add('layout-drawer-container');
//         popupContainer.append(container);
//         ReactDOM.render(<PrivateDrawer key={ new Date().getTime() } { ...this.props } />, container);
//     }
// }
//
// export class PrivateDrawer extends Component<any, any> {
//
//     state = {
//         visible  : false,
//         iframeUrl: '',
//     };
//     private readonly target: string = 'layout-drawer';
//
//     constructor(props) {
//         super(props);
//
//         let el: HTMLElement = this.props.el;
//         let target = el.getAttribute('target');
//         if (!target) {
//             el.setAttribute('target', this.target);
//         }
//         el.addEventListener('click', e => {
//             e.preventDefault();
//             this.setState({
//                 iframeUrl: el.getAttribute('href'),
//                 visible  : true,
//             });
//         });
//     }
//
//     render() {
//         let { dataset } = this.props;
//         return <Drawer
//             title={ dataset.title }
//             width={ dataset.width ?? 400 }
//             height={ dataset.height ?? 400 }
//             placement={ dataset.layout ?? 'right' }
//             closable={ dataset.closable ?? true }
//             mask={ dataset.mask ?? false }
//             onClose={ () => this.setState({ visible: false }) }
//             visible={ this.state.visible }
//         >
//             <iframe className={ style.iframe } src={ this.state.iframeUrl } name={ this.target }></iframe>
//         </Drawer>;
//     }
//
// }

// export class LayoutDrawers extends Component<IComponentProps, any> {
//     constructor(props) {
//         super(props);
//         this.props.el.onclick = e => this.handleClickBtn(e);
//         // this.props.el.innerHTML = this.props.dataset.label;
//     }
//
//     state = {
//         visible: this.props.dataset.open ?? false,
//     };
//
//     handleClickBtn(e) {
//         this.showDrawer();
//     }
//
//     showDrawer() {
//         this.setState({ visible: true });
//     };
//
//     onClose() {
//         this.setState({ visible: false });
//     };
//
//     render() {
//         let { dataset } = this.props;
//         return <Drawer
//             title={ dataset.title }
//             width={ dataset.width ?? 400 }
//             height={ dataset.height ?? 400 }
//             placement={ dataset.layout ?? 'right' }
//             closable={ dataset.closable ?? true }
//             mask={ dataset.mask ?? false }
//             onClose={ this.onClose.bind(this) }
//             visible={ this.state.visible }
//         >
//             <iframe name="target" ref={ element => {
//                 // element?.append(...this.props.subelements);
//             } }/>
//         </Drawer>;
//     }
// }
