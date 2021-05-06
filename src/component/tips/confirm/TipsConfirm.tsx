/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2021/5/6
 * Time: 5:14 下午
 */
import { INativeProps } from '@interface/common/component';
import { Popconfirm } from 'antd';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

export default class TipsConfirm {

    constructor(private readonly props: INativeProps) {

        // 使用DOM0级事件进行覆盖
        this.props.el.onclick = (e) => this.handleClick(e);
    }

    handleClick(e: MouseEvent) {
        console.log(e);
        e.preventDefault();
        let el = document.createElement('div');
        ReactDOM.render(<Popconfirm
            title="Are you sure to delete this task?"
            okText="Yes"
            cancelText="No"
            ref={ (node: HTMLElement) => {
                if (node) {
                }
            } }
        >
            <a href="#" hidden>Delete</a>;
        </Popconfirm>, el);
        this.props.el.append(el);
    };

    handleDelete() {

    }

}
