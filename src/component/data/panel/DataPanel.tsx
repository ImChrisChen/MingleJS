/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/29
 * Time: 8:26 下午
 */
import { IComponentProps } from '@interface/common/component';
import React, { ReactNode } from 'react';
import { isArray } from '@utils/inspect';
import App from '@src/App';
import { Inject } from 'typescript-ioc';
import { HttpClientService } from '@services/HttpClient.service';
import { ParserElementService } from '@services/ParserElement.service';

// DOM 解析
export default class DataPanel extends React.Component<IComponentProps, ReactNode> {
    @Inject private readonly httpClientService: HttpClientService;
    @Inject private readonly parserElementService: ParserElementService;

    public state = {
        html : this.props.el.innerHTML,
        model: {},
    };

    constructor(props) {
        super(props);
        let { el, dataset } = this.props;
        this.renderElement(el, dataset).then(r => r);
    }

    // 获取到组件实例 才能被外部调用
    public async renderElement(el: HTMLElement | Array<HTMLElement>, dataset: object = {}) {
        let data = await this.getData(dataset);     // {}
        let root = await this.parserElementService.parseElement(el, data);

        if (!isArray(el)) {
            el.style.visibility = 'visible';
            el.style.opacity = '1';
        }
        new App(root, true);
    }

    public async getData(dataset) {
        let { url, model } = dataset;
        if (url) {
            let res = await this.httpClientService.jsonp(url);
            return res.status ? res : {};
        } else if (model) {
            return model;
        }
    }

    render() {
        return null;
    }

}
