/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/12/25
 * Time: 5:30 下午
 */
import { MinusCircleOutlined, PlusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import React, { Component, ReactNode } from 'react';
import { IComponentProps } from '@interface/common/component';
import style from './FormGroup.scss';

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

    async getElements() {
        let elements = this.props.subelements.map(item => {
            item.removeAttribute('data-component-uid');
            return item.cloneNode(true);
        }) as Array<HTMLElement>;
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
                   ref={ el => el && el.append(...elms) }>
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
        console.log('state', this.state);
        return <ul className="form-group">
            { this.state.formList.map(node => node) }
        </ul>;
    }
}
