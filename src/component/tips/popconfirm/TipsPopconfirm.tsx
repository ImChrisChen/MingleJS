 import React from 'react';
 import { INativeProps } from '@interface/common/component';
 import { Popconfirm } from 'antd';
 import $ from 'jquery';
import ReactDOM from 'react-dom';
 
 export default class TipsPopconfirm{

    constructor(private readonly props: INativeProps){
        this.props = props;
        this.props.el.addEventListener('click', e => this.handleClickBtn(e),true);
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
            </Popconfirm>
        </>
        
        let position = document.createElement('div')
        let { x , y,width:targetWidth,height:targetHeight } = this.props.el.getBoundingClientRect()
        ReactDOM.render(dom,position)
        document.body.append(position)
        let {width,height} = position.children[0].getBoundingClientRect()
        $(position).css('position','absolute')
        $(position).css('width','100%')
        $(position).offset({top: y+targetHeight/2-height,left: x+targetWidth/2-width/2})
    }
 }
 