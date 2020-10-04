/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/5
 * Time: 12:02 上午
 */

import { UnControlled as CodeMirror } from 'react-codemirror2';
import React from 'react';
import './CodeEditor.scss';
import { Button } from 'antd';
import App from '@root/src/App';

export default class CodeEditor extends React.Component<any, any> {

    constructor(props) {
        super(props);
    }

    state = {
        value: `<h1>1232131</h1>`,
    };

    code = `<input data-fn="form-button"
                   name="fruits"
                   data-label="水果:"
                   data-optionType="button"
                   data-buttonStyle="solid"
                   data-enum="apple,Apple;pear,Pear;orange,Orange;tomato,Tomato"
                   value="orange"
            />`;

    runCode() {
        let el = $(this.state.value);
        let elementContainer = document.querySelector('.show-code');
        console.log(this.state.value);
        console.log(el);
        $('.show-code').html('').append(el);
        new App(elementContainer);
    }

    render() {
        return <>
            <CodeMirror
                value={ this.code }
                options={ {
                    mode       : 'htmlmixed',
                    theme      : 'material',
                    lineNumbers: true,
                } }
                onBeforeChange={ (editor, data, value) => {
                    this.setState({ value });
                } }
                onChange={ (editor, data, value) => {
                    console.log(editor, data, value);
                    this.setState({ value, });
                } }
            />
            <Button onClick={ this.runCode.bind(this) }>保存</Button>

            <div>
                <h1>Show Code</h1>
                <div className="show-code">

                </div>
            </div>
        </>;
    }
}
