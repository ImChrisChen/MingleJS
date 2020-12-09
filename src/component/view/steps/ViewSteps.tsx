/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/11/15
 * Time: 1:41 上午
 */

import React, { Component, ReactNode } from 'react';
import { IComponentProps } from '@interface/common/component';
import { Steps } from 'antd';

const { Step } = Steps;

export default class ViewSteps extends Component<IComponentProps, ReactNode> {

    state = {
        current: this.props.dataset.current,
    };

    constructor(props) {
        super(props);
        this.renderStepChildren();
    }

    handleChange(current) {
        this.setState({ current });
    }

    renderStepChildren() {
        // TODO 异步渲染，字符串转化成ReactNode会出现DOM元素的事件失效
        setTimeout(() => {
            let steps = [ ...document.querySelectorAll('.layout-step-desc') ] as Array<HTMLElement>;
            steps.forEach((container, index) => {
                let step = this.props.elChildren[index];
                container.append(step);
            });
        });
    }

    render() {
        return <>
            <Steps current={ this.state.current }
                   direction={ this.props.dataset.layout || undefined }
                   type={ this.props.dataset.type }
                   onChange={ this.handleChange.bind(this) }>
                { this.props.elChildren.map((element, index) => {
                    return <Step
                        className="layout-step"
                        key={ index }
                        title={ element.dataset.title }
                        description={ <div className="layout-step-desc"/> }/>;
                }) }
            </Steps>
        </>;
    }
}
