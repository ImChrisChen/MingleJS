/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/11/17
 * Time: 3:20 下午
 */

import React, { Component, PureComponent } from 'react';
import { Button, Divider } from 'antd';
import style from './LayoutGenerator.scss';
import { componentConfig } from '@root/config/component.config';

import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { deepEachElement } from '@utils/util';
import Title from 'antd/lib/typography/Title';
import CodeGenerator from '@src/private-component/code-generator/CodeGenerator';
import { ExecCode } from '@src/private-component/exec-code/ExecCode';
import { Inject } from 'typescript-ioc';
import { FormatDataService } from '@services/FormatData.service';
import { IVnode, Renderer } from '@src/core/renderer';
import { isEmptyObject } from '@utils/inspect';
import App from '@src/App';

const ItemTypes = {
    BOX: 'box',
};

interface IBoxProps {
    name: string
    config: any
    onDragInEnd?: (name: string, config: any) => void
}

// 拖拽的按钮
export const Box = ({ name, config, onDragInEnd }: IBoxProps) => {
    const [ { isDragging }, drag ] = useDrag({
        item   : { name, type: ItemTypes.BOX },
        end    : (item, monitor) => {
            const dropResult = monitor.getDropResult();
            if (item && dropResult) {       // 拖拽进去后
                console.log(item, dropResult, monitor);
                onDragInEnd?.(name, config);
            }
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });
    const opacity = isDragging ? 0.4 : 1;

    // @ts-ignore
    return (<div ref={ drag } className={ style.componentsItem } style={ { opacity } }>{ name }</div>);
};

interface IDustbin {
    onAddComponent: (...args) => any

    [key: string]: any
}

// 拖拽到的区域
export const Dustbin = (props: IDustbin) => {
    const [ { canDrop, isOver }, drop ] = useDrop({
        accept : ItemTypes.BOX,
        drop   : (...args) => {
            console.log(args);
            return { name: 'Dustbin' };
        },
        collect: (monitor) => ({
            isOver : monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });
    // const isActive = canDrop && isOver;

    // @ts-ignore
    return <div ref={ drop } className={ style.layoutWorkContent }>
        <Button style={ { position: 'absolute', bottom: '20px' } }
                onClick={ e => props.onAddComponent() }
        >添加组件</Button>
        { props.children }
    </div>;
};

class Example extends PureComponent<{ options: Array<any> }, any> {

    @Inject private readonly renderer: Renderer;

    state = {
        componentConfig: {},        // 组件配置
        componentName  : '',        // 组件名称
        code           : '',
        vnode          : {},
    };

    // 拖拽进去操作台后触发的事件
    handleDragInEnd(name: string, config: any) {
        console.log(name, config);
        this.setState({ componentName: name, componentConfig: config });
    }

    handleGenerateCode(code: string) {
        console.log('.....', code);
        this.setState({ code });
    }

    findNode(id: string): IVnode {
        let res;
        deepEachElement(this.state.vnode, (node) => {
            if (node.id === id) {
                res = node;
                return;
            }
        });
        console.log(res);
        return res;
    }

    createVnode(id, tag, props = {}, children = [], events = {}) {
        return {
            id, tag, props, children, events,
        };
    }

    /**
     * @param target {string}     目标组件ID
     * @param type {string}       类型 'children' | 'slots' | ''
     */
    handleAddComponent(target?, type?) {
        let tag = prompt('请输入组件名称') || 'form-select';
        let vnode = this.createVnode(String(Math.random()), tag);
        console.log(vnode);
        this.setState({
            vnode,
        });
        // let node = this.renderer.h(this.vnode);
    }


    render() {
        return <div className={ style.layoutGenerate }>
            {/* 组件列表 */ }
            <div className={ style.layoutComponentList }
                 style={ { overflow: 'hidden', clear: 'both' } }>
                { this.props.options.map((item, i) => {
                    return <>
                        <Title key={ i } level={ 5 }>{ item.label } 组件</Title>
                        <div className={ style.componentsWrap }> {
                            (item.children && item.children.length > 0)
                                ? item.children.map(child => {
                                    return <Box key={ child.label }
                                                name={ `${ item.label }-${ child.label }` }
                                                onDragInEnd={ this.handleDragInEnd.bind(this) }
                                                config={ child }/>;
                                }) : ''
                        }</div>
                        <Divider/>
                    </>;
                }) }
            </div>
            {/* 内容区域 */ }
            <div className={ style.layoutContent } style={ { overflow: 'hidden', clear: 'both' } }>
                <Dustbin onAddComponent={ this.handleAddComponent.bind(this) }>
                    <div ref={ el => {

                        if (isEmptyObject(this.state.vnode)) {
                            return;
                        }

                        let node = this.renderer.h(this.state.vnode as IVnode);
                        console.log(node);
                        if (el) {
                            el.append(node);
                            // new App(el);
                        }
                    } }></div>
                    {/*<ExecCode code={ this.state.code }/>*/ }
                </Dustbin>
            </div>
            {/* 组件设计器 */ }
            <div className={ style.layoutComponentDesign }>
                <CodeGenerator visibleCode={ false }
                               name={ this.state.componentName }
                               onGenerateCode={ this.handleGenerateCode.bind(this) }
                               config={ this.state.componentConfig }/>
            </div>
        </div>;
    }
}

// https://strml.github.io/react-grid-layout/examples/1-basic.html

export class LayoutGenerator extends Component<any, any> {

    @Inject private readonly formatDataService: FormatDataService;

    state = {
        components: [],
    };

    constructor(props) {
        super(props);
        this.formatDataService.components2MenuTree(componentConfig).then(components => {
            console.log(components);
            this.setState({ components });
        });
    }


    render() {
        return <>
            <DndProvider backend={ HTML5Backend }>
                <Example key={ 0 } options={ this.state.components }/>
            </DndProvider>
        </>;
    }
}

