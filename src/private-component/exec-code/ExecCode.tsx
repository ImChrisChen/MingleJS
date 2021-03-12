/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/12/2
 * Time: 5:10 下午
 */

import React, { Component } from 'react';
import App from '@src/App';
import $ from 'jquery';
import Title from 'antd/lib/typography/Title';

interface IExecCodeProps {
    code: string
}

export class ExecCode extends Component<IExecCodeProps, any> {

    constructor(props) {
        super(props);
    }

    render() {
        return <>
            <div style={ { padding: 10 } } ref={ node => {
                if (node) {
                    if ($(this.props.code).length > 0) {
                        node.innerHTML = '';
                        console.log(this.props.code);
                        node?.append($(this.props.code).get(0));
                        // new App(node);
                    }
                }
            } }/>
        </>;
    }
}
