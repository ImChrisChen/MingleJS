/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/22
 * Time: 7:03 下午
 */

import React, { Component } from 'react'; // https://github.com/remarkjs/react-markdown#options
import MarkdownEditorPrivate from '@src/private-component/markdown-editor/MarkdownEditor';
import { IComponentProps } from '@interface/common/component';

export default class MarkdownEditor extends Component<IComponentProps, any> {
    render() {
        console.log(this.props.dataset);
        return <MarkdownEditorPrivate value={ this.props.value } visibleEditor={ this.props.dataset.visibleEditor }/>;
    }
}

