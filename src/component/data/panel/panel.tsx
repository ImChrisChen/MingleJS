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
import { parseTpl } from '@utils/parser-tpl';
import $ from 'jquery';
import { isArray, isUndefined, isWuiTpl } from '@utils/inspect';
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
            this.props.el.style.display = 'block';
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
            this.parseTextContent(el, model);
            this.parseForeach(el, model);
        });
    }

    public static parseTextContent(el: HTMLElement, model: object) {
        el.childNodes.forEach(node => {
            // 处理文本节点
            if (node.nodeType === 3) {
                let textNode = node.textContent;
                if (isWuiTpl(textNode ?? '')) {
                    console.log(textNode, model);
                    node.textContent = parseTpl(textNode ?? '', model, 'tpl');
                }
            }
        });
    }

    public static parseForeach(el: HTMLElement, model: object) {
        let attrs = el.attributes;
        if (!attrs['@foreach']) return el;
        let { name, value } = attrs['@foreach'];
        el.removeAttribute('@foreach');

        if (!/^\w+ as \w+$/.test(value)) {
            console.error(`${ name }格式不正确`);
        }

        function getIfExpressByElement(element: HTMLElement) {
            let attrs = element.attributes;
            let express;
            if (attrs['@if'] && attrs['@if'].value) {
                express = attrs['@if'].value;
                el.removeAttribute('@if');
            }
            return express;
        }

        let express = getIfExpressByElement(el);
        express = parseTpl(express, model, 'field');        // TODO foreach中的条件判断要进行两个作用域解析，当前是第一层

        let [ arrayName, itemName ] = value.split('as');


        arrayName = arrayName.trim();
        itemName = itemName.trim();

        let loopData = model[arrayName];
        let nodes = loopData.map(item => {
            let itemModel = { [itemName]: item };
            let result: any;     // if 表达式的判断结果

            // 如果foreach元素上没有if的条件判断
            if (isUndefined(express)) {
                result = true;
            } else {
                let parseExpress = parseTpl(express, itemModel, 'field');       // TODO foreach中的条件判断要进行两个作用域解析，当前是第二层
                console.log(parseExpress);
                try {
                    result = eval(parseExpress);
                } catch (e) {
                    console.warn(`${ parseExpress }表达式解析错误`);
                    result = false;
                }
            }

            // 表达式成立的时候才克隆节点
            if (result) {
                let cloneNode = el.cloneNode(true) as HTMLElement;
                this.parseElement(cloneNode, itemModel);
                return cloneNode;
            }

        }).filter(t => t);

        $(el).after(...nodes);
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
            return res.status ? res : {};
        } else if (model) {
            return model;
        }
    }

    render() {
        return null;
    }

}
