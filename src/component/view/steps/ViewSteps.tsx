/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/11/15
 * Time: 1:41 上午
 */

import React, { Component, ReactNode } from 'react';
import { IComponentProps } from '@interface/common/component';
import { Button, message, Steps } from 'antd';
import style from './ViewSteps.scss';
import App, { DataComponentUID } from '@src/App';

const { Step } = Steps;

export default class ViewSteps extends Component<IComponentProps, ReactNode> {

    state = {
        current: this.props.dataset.current,
    };
    private displays = [] as Array<string>;

    constructor(props) {
        super(props);
        this.props.el.style.width = '100%';
        this.props.subelements.forEach(el => {
            let display = el.style.display;
            this.displays.push(display);
            el.style.display = 'none';
        });
    }

    handleChange(current) {
        this.setState({ current });
    }

    renderStepChildren() {
        // TODO 异步渲染，字符串转化成ReactNode会出现DOM元素的事件失效
        setTimeout(() => {
            let steps = [ ...document.querySelectorAll('.layout-step-desc') ] as Array<HTMLElement>;
            steps.forEach((container, index) => {
                let step = this.props.subelements[index];
                container.append(step);
            });
        });
    }

    handleNext(current) {
        this.setState({ current: current + 1 });
    };

    handlePrev(current) {
        this.setState({ current: current - 1 });
    }

    handleDone() {
        let $form = $(this.props.el).closest('form-action');
        if ($form.length === 0) return;
        let uid = $form.attr(DataComponentUID) ?? '';
        let formInstance = App.getInstance(uid).instance;
        formInstance?.handleSubmit?.($form.get(0));
    }

    render() {
        let { current } = this.state;
        return <>
            <Steps current={ this.state.current }
                   direction={ this.props.dataset.layout || undefined }
                   type={ this.props.dataset.type }
                   onChange={ this.handleChange.bind(this) }
                   style={ {
                       width       : '100%',
                       marginBottom: 12,
                   } }>
                { this.props.subelements.map((element, index) => {
                    return <Step
                        className="layout-step"
                        key={ index }
                        title={ element.dataset.title }
                        description={ <div className="layout-step-desc"/> }/>;
                }) }
            </Steps>

            {/* 渲染内容 */ }
            { this.props.subelements.map((el, index) => {
                return <div hidden={ index !== current } className={ style.stepsContent } ref={ node => {
                    if (node) {
                        el.style.display = this.displays[current];      // 使用之前的display属性
                        node.innerHTML = '';
                        node.append(el);
                    }
                } }/>;
            }) }

            <div className={ style.stepsAction }>
                { current < this.props.subelements.length - 1 && (
                    <Button type="primary" onClick={ () => this.handleNext(current) }>
                        下一步
                    </Button>
                ) }
                { current === this.props.subelements.length - 1 && (
                    <Button type="primary" onClick={ () => this.handleDone() }>
                        完成
                    </Button>
                ) }
                { current > 0 && (
                    <Button style={ { margin: '0 8px' } } onClick={ () => this.handlePrev(current) }>
                        上一步
                    </Button>
                ) }
            </div>
        </>;
    }

}
