/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/1/26
 * Time: 3:39 下午
 */
import { Component } from 'react';
import { IComponentProps } from '@interface/common/component';
import React from 'react';
import { Image } from 'antd';

export default class ViewImage extends Component<IComponentProps, any> {

    state = {
        src: 'https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=1381219144,3184889911&fm=26&gp=0.jpg',
    };

    render() {
        console.log(this.props);
        return <div>
            <Image
                width={ 200 }
                src={ this.props.dataset.src }
                style = { this.props.style }
                className={ this.props.class }
            />
        </div>;
    }
}
