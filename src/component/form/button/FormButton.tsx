import { Component } from 'react';
import { IComponentProps } from '@interface/common/component';
import React from 'react';
import { Button } from 'antd';

export default class FormButton extends Component<IComponentProps, any> {

    state = {};

    render() {
        return <div>
            <Button
                size={ this.props.dataset.size }
                type={ this.props.dataset.type }
                style={ this.props.style }
                disabled={ this.props.dataset.disabled }
            >{ this.props.dataset.title }</Button>
        </div>;
    }
}
