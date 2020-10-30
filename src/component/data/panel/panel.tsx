/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/29
 * Time: 8:26 下午
 */
import { IComponentProps } from '@interface/common/component';
import React from 'react';
import { parserEscape2Html } from '@utils/parser-char';
import { parseTpl } from '@utils/parser-tpl';
import { jsonp } from '@utils/request/request';

export default class DataPanel extends React.Component<IComponentProps, any> {

    state = {
        html: this.props.el.innerHTML,
    };

    constructor(props) {
        super(props);
        this.getData().then(data => {
            console.log(data);
            this.parserTemplate(data);
        });
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
