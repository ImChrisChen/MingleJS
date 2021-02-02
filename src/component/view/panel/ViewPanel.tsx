/** * Created by WebStorm. * User: MacBook * Date: 2021/1/14 * Time: 5:20 下午 */import { Component, ReactNode } from 'react';import { IComponentProps } from '@interface/common/component';import React from 'react';import { jsonp } from '@utils/request/request';import { Card, Typography } from 'antd';import { isHtmlTpl, isObject, isReactNode, isWuiByString, isWuiTpl } from '@utils/inspect';import { parseTpl } from '@utils/parser-tpl';import { strParseDOM, strParseVirtualDOM } from '@utils/parser-dom';import App from '@src/App';import style from './ViewPanel.scss';const { Paragraph, Text } = Typography;export default class ViewPanel extends Component<IComponentProps, any> {    state = {        model: {},    };    constructor(props) {        super(props);        ViewPanel.getData(this.props.dataset).then(data => {            console.log(data);            this.setState({ model: data });        });    }    renderItem(data: object) {        let elements: Array<ReactNode> = [];        for (const key in data) {            if (!data.hasOwnProperty(key)) continue;            let value = data[key];            // 解析html模版            if (isHtmlTpl(value)) {                if (isWuiByString(value)) {                    let element = strParseDOM(value);                    value = <div ref={ node => {                        if (node) {                            node.innerHTML = '';                            node.append(element);                            new App(element);                        }                    } }/>;                } else {                    value = strParseVirtualDOM(value);          // 字符串dom转化                }            }            value = isReactNode(value) ? value : String(isObject(value) ? JSON.stringify(value) : value);            elements.push(<li key={ key } className={ style.item }>                <Text style={ { width: 'inherit', textAlign: 'right', padding: '0 10px' } } strong>{ key }:</Text>                <Paragraph                    style={ { width: 'inherit', textAlign: 'left', padding: '0 10px', margin: 0 } }                    copyable                    editable={ { onChange: val => this.handleChangeEditText(key, val) } }>{ value }</Paragraph>            </li>);        }        return elements;    }    async handleChangeEditText(key, value) {        let model = this.state.model;        model[key] = value;        this.setState({ model });    }    public static async getData(dataset): Promise<any> {        let { url, model } = dataset;        console.log(url);        if (url) {            let res = await jsonp(url);            return res.status ? res.data : {};        } else if (model) {            console.log(model);            return model;        } else {            return {};        }    }    render() {        return <ul className={ style.container }>            { this.renderItem(this.state.model) }        </ul>;    }}