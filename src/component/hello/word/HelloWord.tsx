/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/2/26
 * Time: 5:22 下午
 */

import React from 'react';
import { Component } from 'react';
import { IComponentProps } from '@interface/common/component';
import style from './HelloWorld.scss';
import { Button } from 'antd';

export default class HelloWord extends Component<IComponentProps, any> {

    constructor(props) {
        super(props);
        console.log(this.props);
    }

    render() {
        return <div>
            <h1 className={ style.title }>{ this.props.title }</h1>
            <Button type="primary">Primary Button</Button>
        </div>;
    }
}
