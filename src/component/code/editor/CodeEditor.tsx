/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/5
 * Time: 12:02 上午
 */

import { Controlled as CodeMirror } from 'react-codemirror2'; // https://codemirror.net/doc/manual.html#config
import React from 'react';
import { Divider, Space } from 'antd';
import App from '@root/src/App';
import './CodeEditor.css';
import $ from 'jquery';

require('codemirror/mode/javascript/javascript');
require('codemirror/mode/htmlmixed/htmlmixed');
require('codemirror/mode/xml/xml');

export default class CodeEditor extends React.Component<any, any> {

    // state = {
    //     value: this.props.dataset.value ?? `<input data-fn="" />`,
    // };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.runCode();
    }

    runCode() {
        let el = $(this.props.dataset.value);
        let elementContainer = document.querySelector('.show-code');
        $('.show-code').html('').append(el);
        new App(elementContainer);
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any) {
        this.runCode();
    }

    render() {
        return <>
            <CodeMirror
                className="code-mirror"
                value={ this.props.dataset.value }
                scroll={ {
                    // x: 50,
                    // y: 50,
                } }
                options={ {
                    // mode                   : 'htmlmixed',
                    mode                   : {
                        name: 'text/html',
                    },
                    theme                  : /*'idea'*/ 'rubyblue',
                    tabSize                : 2,
                    lineNumbers            : true,
                    styleActiveLine        : true,
                    lineWrapping           : true,
                    line                   : true,
                    foldGutter             : true,
                    extrakeys              : {
                        Tab: function (cm) {
                            let spaces = Array(cm.getOption('indentUnit') + 1).join(' ');
                            cm.replaceSelection(spaces);
                        },
                    },
                    matchBrackets          : true,      //括号匹配
                    autofocus              : true,
                    smartIndent            : true,
                    indentWithTabs         : true,
                    showCursorWhenSelecting: true,
                    hintOptions            : {
                        completeSingle: true,
                    },
                } }
                onBeforeChange={ (editor, data, value) => {
                    this.setState({ value });
                } }
                onChange={ (editor, data, value) => {
                    // console.log(editor, data, value);
                    // this.setState({ value });
                } }
            />

            {/*<Button onClick={ this.runCode.bind(this) }>查看效果</Button>*/ }

            <Divider/>
            <Space/>
            <div>
                <h1>代码演示</h1>
                <div className="show-code">

                </div>
            </div>
        </>;
    }
}
