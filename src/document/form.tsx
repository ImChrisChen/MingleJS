/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/6
 * Time: 12:18 下午
 */

import React from 'react';
import { Button } from 'antd';
import $ from 'jquery';
import App from '@src/App';

const template = `<input data-fn="form-button" data-enum="1,Apple;2,iOS" />`;

export default class DocumentForm extends React.Component<any, any> {

    state = {
        value: ``,
    };

    constructor(props) {
        super(props);
    }

    handleClick(mode) {
        let value = template.replace(/data-fn="(.*?)"/, function (v) {
            return v + ` data-buttonStyle="${ mode }"`;
        });
        this.setState({ value });
        let div = document.createElement('div');
        div.appendChild($(value)[0]);
        $('.run-code').html('').append(div);
        new App(div);
    }

    handleTextAreaChange() {

    }

    render() {
        return <div>
            <Button>form-button</Button>
            <Button onClick={ this.handleClick.bind(this, 'online') }>online</Button>
            <Button onClick={ this.handleClick.bind(this, 'solid') }>solid</Button>

            <div>代码</div>
            <textarea cols={ 100 } value={ this.state.value } onChange={ this.handleTextAreaChange.bind(this) }/>

            <h1>show Code</h1>
            <div className="run-code">

            </div>

            form
        </div>;
    }
}
