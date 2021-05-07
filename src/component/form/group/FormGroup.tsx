/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/12/25
 * Time: 5:30 下午
 */
import { PlusCircleOutlined } from '@ant-design/icons';
import React, { Component, ReactNode } from 'react';
import { IComponentProps } from '@interface/common/component';
import style from './FormGroup.scss';
import App from '@src/App';

export default class FormGroup extends Component<IComponentProps, any> {

    state = {
        formList: [] as Array<ReactNode>,
    };
    elements: Array<HTMLElement> = [];      // template
    count = 0;

    constructor(props) {
        super(props);
        this.getElements().then(elements => {
            this.elements = elements;
            this.addGroup();
        });
    }

    // 只获取第一层级
    getComponentVnode(el) {
        let vnode = {
            tag  : el.localName,
            props: {},
        };
        for (const { name, value } of [ ...el.attributes ]) {
            // TODO 有这个属性的组件说明已经被渲染过了
            if (name === 'data-component-uid') {
                continue;
            }
            vnode.props[name] = value;
        }
        return vnode;
    }

    toElement(el: HTMLElement): HTMLElement {
        let { tag, props } = this.getComponentVnode(el);
        let element = document.createElement(tag);
        for (const key in props) {
            element.setAttribute(key, props[key]);
        }
        return element;
    }

    async getElements() {
        let elements = this.props.subelements.map(item => this.toElement(item));
        $(this.props.subelements).remove();      // 从页面中删除掉input元素，避免name值冲突
        return elements;
    }

    addGroup() {
        let formList = this.state.formList;
        let node = this.renderFormItem(this.elements);
        formList.push(node);
        this.setState({ formList });
    }

    renderFormItem(elements): ReactNode {
        let elms = elements.map(el => el.cloneNode(true));      // cloneNode
        return <li key={ this.count++ } className={ `form-group-item ${ style.formItem }` }
                   ref={ el => {
                       if (el) {
                           el.append(...elms);
                           new App(el);
                       }
                   } }>
            <PlusCircleOutlined className={ style.addIcon } onClick={ e => this.handleAddGroup(e) }/>
        </li>;
    }

    handleFinsh(values) {
        console.log('Received values of form:', values);
    };

    handleAddGroup(e) {
        this.addGroup();
    }

    render() {
        return <ul className="form-group">
            { this.state.formList.map(node => node) }
        </ul>;
    }
}
