/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/1/23
 * Time: 3:12 下午
 */
import React, { Component } from 'react';
import { IComponentProps } from '@interface/common/component';
import { Slider } from 'antd';
import { trigger } from '@src/utils';

export default class FormSlider extends Component<IComponentProps, any> {

    state = {};

    constructor(props) {
        super(props);
    }

    handleChange(value) {
        trigger(this.props.el, value);
    }

    render() {
        let { disabled, range, step, max, min } = this.props.dataset;
        let value = this.props.value;
        value = range ? value.split(',').map(item => Number(item)) : value;
        return <Slider
            range={ range }
            step={ step }
            defaultValue={ 30 }
            disabled={ disabled }
            max={ max }
            min={ min }
            value={ value }
            onChange={ e => this.handleChange(e) }
        />;
    }
}
