/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/29
 * Time: 8:26 下午
 */
import { IComponentProps } from '@interface/common/component';
import React from 'react';
import { jsonp } from '@utils/request/request';
import { deepEachElement } from '@utils/util';
import { parseFor, parseVar } from '@utils/parser-tpl';
import $ from 'jquery';

export default class DataPanel extends React.Component<IComponentProps, any> {

    state = {
        html: this.props.el.innerHTML,
    };

    constructor(props) {
        super(props);
        DataPanel.getData(this.props.dataset).then(data => {
            let html = this.parseTemplate(this.props.el, data);
            if (html !== this.props.el.innerHTML) {
                this.props.el.innerHTML = this.deleteDirective(html);
            } else {
                console.log('无变化 ');
            }
        });
    }

    parseTemplate(rootElement: HTMLElement, model: object) {
        deepEachElement(rootElement, (el: HTMLElement) => {
            this.parseIfelse(el, model);
            this.parseForeach(el, model);
        });
        return parseVar(rootElement.innerHTML, model, 'tpl');
    }

    // 解析弹窗内的数据
    static parserWorkingModel(model: any) {
        let templateAreas = document.querySelector('[data-template-element]');
        if (templateAreas) {
            templateAreas.innerHTML = parseVar(templateAreas?.innerHTML ?? '', model, 'tpl');
        }
    }

    deleteDirective(html: string) {
        return html.replace(/(@foreach=["'`](.*?)["'`])|(@if=["'`](.*?)["'`])/g, '');
    }

    parseContentProps(el, model) {
        let res = parseVar(el.textContent, model, 'tpl');
        console.log(res);
    }

    parseForeach(el: HTMLElement, model: object) {
        let attrs = el.attributes;
        let content = el.outerHTML;
        if (!attrs['@foreach']) return content;
        let { name, value } = attrs['@foreach'];
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

    parseIfelse(el: HTMLElement, model: object) {
        let attrs = el.attributes;
        if (!attrs['@if']) return;

        let { value: expressTpl } = attrs['@if'];
        let express = parseVar(expressTpl, model, 'field');
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

    static async getData(dataset) {
        let { url, model } = dataset;
        if (url) {
            let res = await jsonp(url);
            return res.status ? res.data : {};
        } else if (model) {
            return model;
        } else {
            return {};
        }
    }

    render() {
        return <></>;
    }

}
