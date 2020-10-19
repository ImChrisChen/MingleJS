/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/22
 * Time: 7:03 下午
 */

import React from 'react';
// https://github.com/remarkjs/react-markdown#options
import MarkdownEditor from '@uiw/react-markdown-editor';
import $ from 'jquery';
import './editor.css';

interface IFormEditorProps {
    value?: string;
    visibleEditor?: boolean

    [key: string]: any
}

export default class Editor extends React.Component<IFormEditorProps, any> {

    state = {
        options: {
            // lineNumbers  : true,
            // mode         : 'markdown',
            // tabSize      : 2,
            value        : this.props.value || sessionStorage.getItem('form-editor-value') || `# 哈哈哈哈哈`,
            visibleEditor: this.props.visibleEditor ?? false,
            // visible      : true,
            // toolbarsMode : [ '😁' ],
            // width        : '100%',
            // height       : '100%',

        },
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        $('.md-editor-visible').css('width', this.props.visibleEditor ? '50%' : '100%');
    }

    handleChange(editor, data, value) {
        // this.setState({ value });
        // sessionStorage.setItem('form-editor-value', value);
        // message.success('保存成功');
    }

    render() {
        return <>
            <div className="container md-editor-markdown">

                {
                    this.props.visibleEditor ? <MarkdownEditor { ...this.state.options } /> :
                        <MarkdownEditor { ...this.state.options } toolbars={ false }/>
                }

            </div>
        </>;
    }
}

