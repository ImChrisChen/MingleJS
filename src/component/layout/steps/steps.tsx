/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/11/15
 * Time: 1:41 上午
 */

import React, { Component, ReactNode } from 'react';
import { IComponentProps } from '@interface/common/component';
import { Steps } from 'antd';
import { strParseVirtualDOM } from '@utils/parser-dom';

const { Step } = Steps;

export default class LayoutSteps extends Component<IComponentProps, ReactNode> {

    state = {
        current: this.props.dataset.current,
    };

    constructor(props) {
        super(props);
    }

    handleChange(current) {
        this.setState({ current });
    }

    renderStepChildren() {
        return this.props.elChildren.map((element, index) => {
            let { title } = element.dataset;
            let description = strParseVirtualDOM(element.innerHTML);
            element.remove();
            return <Step key={index} title={title} description={description}/>;
        });
    }

    render() {
        return <>
            <Steps current={this.state.current}
                   direction={this.props.dataset.layout || undefined}
                   type={this.props.dataset.type}
                   onChange={this.handleChange.bind(this)}>
                {this.renderStepChildren()}
            </Steps>
        </>;
    }
}
