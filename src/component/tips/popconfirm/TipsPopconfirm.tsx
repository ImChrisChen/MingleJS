 import React from 'react';
 import { INativeProps } from '@interface/common/component';
 import { Popconfirm } from 'antd';
 import $ from 'jquery';
import ReactDOM from 'react-dom';
 
 export default class TipsPopconfirm{
    position: HTMLDivElement;

    constructor(private readonly props: INativeProps){
        this.props = props;
        this.props.el.addEventListener('click', e => this.handleClickBtn(e),true);
        this.position = document.createElement('div')
        document.body.append(this.position)
    }

    handleClickBtn(e: MouseEvent) {
        if(e.isTrusted){
            this.renderPopconfirm()
            e.preventDefault();
            e.stopPropagation();
        }
    }

    confirm = ()=>{
        this.props.el.click()
        $(this.props.el).children().toArray().map(v=>{
            v.click()
        })
    }
    
    cancel = ()=>{

    }

    renderPopconfirm = ()=>{
        let dom = <>
            <Popconfirm
                defaultVisible
                title={this.props._label}
                onConfirm={this.confirm}
                onCancel={this.cancel}
                okText={this.props._okText}
                cancelText={this.props._cancelText}
            >
                <span></span>
            </Popconfirm>
        </>
        
        let {width:targetWidth,height:targetHeight } = this.props.el.getBoundingClientRect()
        let y = this.props.el.offsetTop
        let x = this.props.el.offsetLeft
        ReactDOM.render(<></>,this.position) // react 对比没变化就不加载了
        ReactDOM.render(dom,this.position)
        let {width,height} = this.position.children[0].getBoundingClientRect()
        $(this.position).css('position','absolute')
        $(this.position).css('width','100%')
        $(this.position).offset({top: y+targetHeight/2-height,left: x+targetWidth/2-width/2})
    }
 }
 