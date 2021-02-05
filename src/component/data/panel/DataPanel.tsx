/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/29
 * Time: 8:26 下午
 */
import { IComponentProps } from '@interface/common/component';
import React, { ReactNode } from 'react';
import { jsonp } from '@utils/request/request';
import { isArray } from '@utils/inspect';
import App from '@src/App';
import { parseElement } from '@utils/parser-element';

// DOM 解析
export default class DataPanel extends React.Component<IComponentProps, ReactNode> {

    public state = {
        html : this.props.el.innerHTML,
        model: {},
    };

    constructor(props) {
        super(props);
        let { el, dataset } = this.props;
        DataPanel.renderElement(el, dataset).then(r => r);
    }

    // 获取到组件实例 才能被外部调用
    public static async renderElement(el: HTMLElement | Array<HTMLElement>, dataset: object = {}) {
        let data = await this.getData(dataset);     // {}
        let root = await parseElement(el, data);

        if (!isArray(el)) {
            el.style.visibility = 'visible';
            el.style.opacity = '1';
        }
        new App(root, true);
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
