/** * Created by WebStorm. * User: MacBook * Date: 2020/12/2 * Time: 5:10 下午 */import React, { Component } from 'react';import App from '@src/App';import $ from 'jquery';import Title from 'antd/lib/typography/Title';interface IExecCodeProps {    code: string}export class ExecCode extends Component<IExecCodeProps, any> {    constructor(props) {        super(props);    }    render() {        return <>            <Title level={ 5 }>title</Title>            <div ref={ node => {                if (node) {                    node.innerHTML = '';                    node?.append($(this.props.code).get(0));                    new App(node);                }            } }                 className="show-code">            </div>        </>;    }}