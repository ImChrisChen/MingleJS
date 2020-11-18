/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/29
 * Time: 8:26 下午
 */
import { IComponentProps } from '@interface/common/component';
import React, { ReactNode } from 'react';
import { jsonp } from '@utils/request/request';
import { deepEachElement } from '@utils/util';
import { parseFor, parseTpl } from '@utils/parser-tpl';
import $ from 'jquery';
import { isArray, isWuiTpl } from '@utils/inspect';
import { elementWrap } from '@utils/parser-dom';

// DOM 解析
export default class DataPanel extends React.Component<IComponentProps, ReactNode> {

    public static model: object = {};

    public state = {
        html : this.props.el.innerHTML,
        model: {},
    };

    constructor(props) {
        super(props);

        DataPanel.getData(this.props.dataset).then(data => {
            DataPanel.parseElement(this.props.el, data);
            this.setState({ model: data });
        });
    }

    public static parseElement(rootElement: HTMLElement | Array<HTMLElement>, model: object) {
        let root = rootElement;

        // 支持单个element 和 多个 element 处理
        if (isArray(rootElement)) {
            root = elementWrap(rootElement);
        }

        deepEachElement(root, (el: HTMLElement) => {
            this.parseIfelse(el, model);
            this.parseForeach(el, model);
            el.childNodes.forEach(node => {
                // 处理文本节点
                if (node.nodeType === 3) {
                    let textNode = node.textContent;
                    if (isWuiTpl(textNode ?? '')) {
                        node.textContent = parseTpl(textNode ?? '', model, 'tpl');
                    }
                }
            });
        });
    }

    public static parseForeach(el: HTMLElement, model: object) {
        let attrs = el.attributes;
        let content = el.outerHTML;
        if (!attrs['@foreach']) return content;
        let { name, value } = attrs['@foreach'];
        console.log(name, value);
        if (!/^\w+ as \w+$/.test(value)) {
            console.error(`${ name }格式不正确`);
            return content;
        }
        let [ list, item ] = value.split('as');
        list = list.trim();
        item = item.trim();
        content = parseFor(content, model, { list, item });

        el.insertAdjacentHTML('afterend', content);
        el.remove();        // 删除掉原始模版
    }

    public static parseIfelse(el: HTMLElement, model: object) {
        let attrs = el.attributes;
        if (!attrs['@if']) return;

        let { value: expressTpl } = attrs['@if'];
        let express = parseTpl(expressTpl, model, 'field');
        try {
            if (eval(express)) {
                $(el).next().attr('@else') !== undefined && $(el).next().remove();      // 成立去掉else
            } else {
                $(el).remove();
            }
        } catch (e) {
            // TODO 有可能是 @foreach 中的 if 语句
            // console.error(`if内表达式解析语法错误: ${ express }`);
        }
    }

    public static async getData(dataset) {
        let { url, model } = dataset;
        if (url) {
            let res = await jsonp(url);
            return res.status ? res.data : {};
        } else if (model) {
            return model;
        }
    }

    render() {
        return null;
    }

}
