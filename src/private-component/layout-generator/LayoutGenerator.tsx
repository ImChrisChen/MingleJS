/** * Created by WebStorm. * User: MacBook * Date: 2020/11/17 * Time: 3:20 下午 */import React, { Component, memo, PureComponent } from 'react';import { Card, Divider } from 'antd';import style from './LayoutGenerator.scss';import componentConfig from '@root/config/component.config';import { DndProvider } from 'react-dnd';import { HTML5Backend } from 'react-dnd-html5-backend';import { useDrag, useDrop } from 'react-dnd';import { formatComponents2Tree } from '@utils/format-data';import { deepEach } from '@utils/util';import Title from 'antd/lib/typography/Title';import { optimize } from 'webpack';import CodeGenerator from '@src/private-component/code-generator/CodeGenerator';import { ExecCode } from '@src/private-component/exec-code/ExecCode';const ItemTypes = {    BOX: 'box',};// 拖拽的按钮export const Box = ({ name }) => {    const style = {        border         : '1px solid #ccc',        backgroundColor: '#fff',        padding        : '2px 4px',        marginRight    : '10px',        marginBottom   : '10px',        cursor         : 'move',    };    const [ { isDragging }, drag ] = useDrag({        item   : { name, type: ItemTypes.BOX },        end    : (item, monitor) => {            const dropResult = monitor.getDropResult();            if (item && dropResult) {       // 拖拽进去后                alert(`You dropped ${ item.name } into ${ dropResult.name }!`);            }        },        collect: (monitor) => ({            isDragging: monitor.isDragging(),        }),    });    const opacity = isDragging ? 0.4 : 1;    // @ts-ignore    return (<div ref={ drag } className="" style={ { ...style, opacity } }>        { name }    </div>);};// 拖拽到的区域export const Dustbin = () => {    let style = {        height         : '12rem',        width          : '12rem',        marginRight    : '1.5rem',        marginBottom   : '1.5rem',        color          : 'white',        padding        : '1rem',        textAlign      : 'center',        fontSize       : '1rem',        lineHeight     : 'normal',        float          : 'left',        backgroundColor: '#222',    };    const [ { canDrop, isOver }, drop ] = useDrop({        accept : ItemTypes.BOX,        drop   : () => ({ name: 'Dustbin' }),        collect: (monitor) => ({            isOver : monitor.isOver(),            canDrop: monitor.canDrop(),        }),    });    const isActive = canDrop && isOver;    if (isActive) {        style.backgroundColor = 'darkgreen';    } else if (canDrop) {        style.backgroundColor = 'darkkhaki';    }    // @ts-ignore    return <div ref={ drop } style={ style }>        { isActive ? 'Release to drop' : 'Drag a box here' }    </div>;};class Example extends PureComponent<{ options: Array<any> }, any> {    render() {        return <div className={ style.layoutGenerate }>            {/* 组件列表 */ }            <div className={ style.layoutComponentList }                 style={ { overflow: 'hidden', clear: 'both' } }>                { this.props.options.map((item, i) => {                    return <>                        <Title key={ i } level={ 5 }>{ item.label } 组件</Title>                        <div className={ style.componentsWrap }> {                            (item.children && item.children.length > 0)                                ? item.children.map(c => {                                    return <Box key={ c.label } name={ c.label }/>;                                }) : ''                        }</div>                        <Divider/>                    </>;                }) }            </div>            {/* 内容区域 */ }            <div className={ style.layoutContent } style={ { overflow: 'hidden', clear: 'both' } }>                <Dustbin/>            </div>            {/* 组件设计器 */ }            <div className={ style.layoutComponentDesign }>                <ExecCode code="<input data-fn='form-checkbox'>"/>                {/*<CodeGenerator/>*/}            </div>        </div>;    }}export const Examples = memo(function Container(props) {    return (<div>        <div style={ { overflow: 'hidden', clear: 'both' } }>            <Dustbin/>        </div>        <div style={ { overflow: 'hidden', clear: 'both' } }>            <Title type="success">组件</Title>            <Divider/>            <Box name="Glass"/>            <Box name="Banana"/>            <Box name="Paper"/>        </div>    </div>);});// https://strml.github.io/react-grid-layout/examples/1-basic.htmlexport class LayoutGenerator extends Component<any, any> {    state = {        components: [],    };    constructor(props) {        super(props);        formatComponents2Tree(componentConfig).then(components => {            console.log(components);            this.setState({ components });        });    }    render() {        return <>            <DndProvider backend={ HTML5Backend }>                <Example options={ this.state.components }/>            </DndProvider>        </>;    }}