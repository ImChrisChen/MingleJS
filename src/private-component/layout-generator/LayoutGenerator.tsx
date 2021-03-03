/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/11/17
 * Time: 3:20 下午
 */

import React, { Component, Fragment, memo, PureComponent } from 'react';
import { Card, Divider } from 'antd';
import style from './LayoutGenerator.scss';
import componentConfig from '@root/config/component.config';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { useDrag, useDrop } from 'react-dnd';
import { deepEach } from '@utils/util';
import Title from 'antd/lib/typography/Title';
import { optimize } from 'webpack';
import CodeGenerator from '@src/private-component/code-generator/CodeGenerator';
import { ExecCode } from '@src/private-component/exec-code/ExecCode';
import { Inject } from 'typescript-ioc';
import { FormatDataService } from '@services/FormatData.service';

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

// 拖拽到的区域
export const Dustbin = (props) => {
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
        { props.children }
    </div>;
};

class Example extends PureComponent<{ options: Array<any> }, any> {

    state = {
        componentConfig: {},        // 组件配置
        componentName  : '',        // 组件名称
        code           : '',
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
                <Dustbin>
                    <ExecCode code={ this.state.code }/>
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
            this.setState({ components });
        });
    }

    render() {
        return <>
            <DndProvider backend={ HTML5Backend }>
                <Example options={ this.state.components }/>
            </DndProvider>
        </>;
    }
}

