/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/1/14
 * Time: 5:20 下午
 */

import React, { Component, ReactNode } from 'react';
import { IComponentProps } from '@interface/common/component';
import { Typography } from 'antd';
import { isHtmlTpl, isObject, isReactNode, isWuiComponent, strParseDOM, strParseVirtualDOM } from '@src/utils';
import style from './ViewPanel.scss';
import { Inject } from 'typescript-ioc';
import { HttpClientService } from '@src/services';

const { Paragraph, Text } = Typography;

export default class ViewPanel extends Component<IComponentProps, any> {

    @Inject private readonly httpClientService: HttpClientService;

    state = {
        model: {},
    };

    constructor(props) {
        super(props);
        this.getData(this.props.dataset).then(data => {
            this.setState({ model: data });
        });
    }

    renderItem(data: object) {
        let elements: Array<ReactNode> = [];

        for (const key in data) {
            if (!data.hasOwnProperty(key)) continue;
            let value = data[key];

            // 解析html模版
            if (isHtmlTpl(value)) {

                if (isWuiComponent(value)) {
                    let element = strParseDOM(value);
                    value = <div ref={ node => {
                        if (node) {
                            node.innerHTML = '';
                            node.append(element);
                        }
                    } }/>;

                } else {
                    value = strParseVirtualDOM(value);          // 字符串dom转化
                }
            }
            value = isReactNode(value) ? value : String(isObject(value) ? JSON.stringify(value) : value);
            elements.push(<li key={ key } className={ style.item }>
                <Text style={ { width: 'inherit', textAlign: 'right', padding: '0 10px' } } strong>{ key }:</Text>
                <Paragraph
                    style={ { width: 'inherit', textAlign: 'left', padding: '0 10px', margin: 0 } }
                    copyable
                    editable={ { onChange: val => this.handleChangeEditText(key, val) } }>{ value }</Paragraph>
            </li>);
        }
        return elements;
    }

    async handleChangeEditText(key, value) {
        let model = this.state.model;
        model[key] = value;
        this.setState({ model });
    }

    public async getData(dataset): Promise<any> {
        let { url, model } = dataset;
        if (url) {
            let res = await this.httpClientService.jsonp(url);
            return res.status ? res.data : {};
        } else if (model) {
            return model;
        } else {
            return {};
        }
    }

    render() {
        return <ul className={ style.container }>
            { this.renderItem(this.state.model) }
        </ul>;
    }
}
