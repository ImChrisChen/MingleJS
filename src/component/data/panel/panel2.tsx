/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/29
 * Time: 8:26 下午
 */
import { IComponentProps } from '@interface/common/component';
import React from 'react';
import { parserEscape2Html } from '@utils/parser-char';
import { parseFor, parseTpl } from '@utils/parser-tpl';
import { jsonp } from '@utils/request/request';
import { deepEachElement } from '@utils/util';

export default class DataPanel extends React.Component<IComponentProps, any> {

    state = {
        html: this.props.el.innerHTML,
    };

    constructor(props) {
        super(props);
        this.getData().then(data => {
            console.log(this.props.el);
            this.tplParser(this.props.el, data);
        });
    }

    // TODO if-else  => parseVal => foreach
    tplParser(el: HTMLElement, model) {
        $(el).hide();
        deepEachElement(el, element => {
            console.log(element);
            let attrs = element.attributes;

            if (attrs['@if']) {
                let { value: fieldTpl } = attrs['@if'];

                let express = parseTpl(fieldTpl, model, 'field');
                try {
                    let ifResult = eval(express);

                    if (ifResult) {
                        $(element).next().attr('@else') !== undefined && $(element).next().remove();
                    } else {
                        $(element).remove();
                    }

                    $(element).removeAttr('@if');
                    $(element).next().removeAttr('@else');

                } catch (e) {
                    console.error(`if内表达式解析语法错误: ${ express }`);
                }
            }

            if (attrs['@foreach']) {
                let { name, value } = attrs['@foreach'];
                if (!/^\w+ as \w+$/.test(value)) {
                    console.error(`${ name }格式不正确`);
                    return;
                }
                let [ list, item ] = value.split('as');
                list = list.trim();
                item = item.trim();

                element.removeAttribute('@foreach');

                let htmlStr = parseFor(element.outerHTML, model, { list, item });
                element.insertAdjacentHTML('afterend', htmlStr);
                element.remove();
            }
        });
        // TODO 这里必须要用 this.state.html 是在子组件中还没渲染的原始模版,不然子组件中(不再data-panel内的子组件，例如弹窗)无法使用模版变量
        // this.props.el.innerHTML = parseTpl(this.state.html, model);
        this.props.el.innerHTML = parseTpl(el.innerHTML, model);
        $(el).show();
    }

    private async getData() {
        let { url, model } = this.props.dataset;
        if (url) {
            let res = await jsonp(url);
            return res.status ? res.data : {};
        } else if (model) {
            return model;
        } else {
            return {};
        }
    }

    private parserTemplate(data) {
        let html = parserEscape2Html(this.state.html);
        html = parseTpl(html, data);
        this.props.el.innerHTML = html;
    }

    render() {
        return <></>;
    }

}
