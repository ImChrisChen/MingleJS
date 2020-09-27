/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/22
 * Time: 7:03 下午
 */

import React from 'react';
import MarkdownEditor from '@uiw/react-markdown-editor'; // https://gitee.com/uiw/react-markdown-editor
import { debounce } from '@utils/util';
import { message } from 'antd';

interface IFormEditorProps {
    value?: string;

    [key: string]: any
}

export default class Editor extends React.Component<IFormEditorProps, any> {
    state = {
        value  : this.props.value || sessionStorage.getItem('form-editor-value') || `# 哈哈哈哈哈`,
        options: {
            lineNumbers  : true,
            mode         : 'markdown',
            tabSize      : 2,
            visibleEditor: true,
            visible      : true,
            toolbarsMode : [ '😁' ],
            width        : '100%',
            height       : '100%',
        },
    };

    handleChange(editor, data, value) {
        this.setState({ value });
        sessionStorage.setItem('form-editor-value', value);
        message.success('保存成功');
    }

    render() {
        let { value, options } = this.state;
        return <>
            <div className="container">
                <MarkdownEditor
                    options={''}
                    value={ value }
                    onChange={ debounce(this.handleChange.bind(this), 3000) }
                />
            </div>
        </>;
    }
}

