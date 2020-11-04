/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/29
 * Time: 8:26 下午
 */
import { IComponentProps } from '@interface/common/component';
import React from 'react';
import { parserEscape2Html } from '@utils/parser-char';
import { parseFor, parseTpl, parseVar } from '@utils/parser-tpl';
import { jsonp } from '@utils/request/request';
import { deepEachElement } from '@utils/util';

export default class DataPanel extends React.Component<IComponentProps, any> {

    state = {
        html: this.props.el.innerHTML,
    };

    constructor(props) {
        super(props);
        this.getData().then(data => {
            this.tplParser(this.props.el, data);
        });
    }

    // TODO if-else  => parseVal => foreach
    tplParser(el: HTMLElement, model) {
        $(el).hide();
        deepEachElement(el, element => {
            let attrs = element.attributes;

            if (attrs['@if']) {
                let { value: fieldTpl } = attrs['@if'];
                let express = parseVar(fieldTpl, model, 'field');
                try {
                    let ifResult = eval(express);
                    console.log(ifResult);

                    if (ifResult) {
                        $(element).next().attr('@else') !== undefined && $(element).next().remove();
                    } else {
                        console.log(element);
                        $(element).remove();
                    }

                    $(element).removeAttr('@if');
                    $(element).next().removeAttr('@else');

                } catch (e) {
                    console.error('if内表达式解析语法错误');
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
        $(el).show();
    }

    parserForeach() {

    }

    parserIfelse() {

    }


    private async getData() {
        console.log(this.props);
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
