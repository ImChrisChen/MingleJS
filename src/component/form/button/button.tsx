/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/21
 * Time: 9:36 下午
 */
import React from 'react';
import { Radio } from 'antd';
import { trigger } from '@utils/trigger';

export default class Button extends React.Component<any, any> {
    state: any = {
        // options    : this.formatAntdButton(this.props.enum),
        // [
        // { label: 'Apple', value: 'Apple' },
        // { label: 'Pear', value: 'Pear' },
        // { label: 'Orange', value: 'Orange' },
        // ],
        optionType : 'button',                                // 'button' | 'default'
        buttonStyle: this.props.el.mode ?? 'solid',           // 'online' | 'solid'
        size       : this.props.el.size ?? 'middle',          // 'large' | 'middle' | 'small'
    };

    handleChange(e: any) {
        let value = e.target.value;
        // this.setState({ value });
        trigger(this.props.el, value);
    }

    formatAntdButton(list: Array<any>) {
        let options: Array<any> = [];
        list.forEach(item => {
            for (const key in item) {
                if (!item.hasOwnProperty(key)) continue;
                let val = item[key];
                options.push({
                    label: val,
                    value: key,
                });
            }
        });
        return options;
    }

    render() {
        let { style, el, elChildren, ...dealProps } = this.props;
        console.log(this.props);
        let formatProps = { ...dealProps };
        formatProps['options'] = this.formatAntdButton(dealProps.enum);
        // formatProps = { ...formatProps, ...this.state };        // 合并对象
        let object = Object.assign(this.state, formatProps);
        console.log(object);

        console.log(formatProps);

        return <>
            <Radio.Group
                onChange={ this.handleChange.bind(this) }
                { ...formatProps }

                // options={ options }
                // size={ size }
                // optionType={ optionType }
                // buttonStyle={ buttonStyle }
                // value={ value }
            />
        </>;
    }
}
