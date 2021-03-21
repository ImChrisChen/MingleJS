/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/5
 * Time: 12:02 上午
 */

import { Controlled as CodeMirror } from 'react-codemirror2'; // https://codemirror.net/doc/manual.html#config
import React, { Component } from 'react';
import './CodeEditor.css';
import $ from 'jquery';

require('codemirror/mode/javascript/javascript');
require('codemirror/mode/htmlmixed/htmlmixed');
require('codemirror/mode/xml/xml');

export default class CodeEditor extends Component<any, any> {

    state = {
        value: '',
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.runCode();
    }

    runCode() {
        let el = $(this.props.dataset.value);
        let elementContainer = document.querySelector('.show-code') as HTMLElement;
        $('.show-code').html('').append(el);
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
                    this.setState({ value });
                } }
            />
        </>;
    }
}
