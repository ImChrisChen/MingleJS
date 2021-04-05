/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/11/11
 * Time: 2:36 下午
 */

import * as React from 'react';
import { Component, ReactNode } from 'react';
import { IComponentProps } from '@interface/common/component';
import { getDepthMax } from '@src/utils';
import LayoutMenuPrivate from '@src/private-component/views/layout-menu/LayoutMenu';
import { Inject } from 'typescript-ioc';
import { HttpClientService } from '@services/HttpClient.service';
import { FormatDataService } from '@services/FormatData.service';

export default class LayoutMenu extends Component<IComponentProps, ReactNode> {
    @Inject private readonly httpClientService: HttpClientService;
    @Inject private readonly formatDataService: FormatDataService;

    state = {
        collapsed: !this.props.dataset.open,
        url      : '',
        data     : [] as Array<any>,
    };

    constructor(props) {
        super(props);
        console.log(this.props);
        this.getData().then(data => {
            this.setState({ data });
        });
    }

    async getData(): Promise<Array<any>> {
        let { url, menulist, id, name, pid, children } = this.props.dataset;
        let data: Array<any>;
        if (url) {
            let res = await this.httpClientService.jsonp(url);
            data = res.status ? res.data : [];
        } else {
            data = menulist;
        }
        let deep = getDepthMax({ children: data }, 'children') - 1;

        if (deep > 1) {
            data = this.formatDataService.treeKeyReplace(data, { id, pid, name, children }, {
                id      : 'value',
                pid     : 'pid',
                name    : 'label',
                children: 'children',
            });
        } else {
            data = this.formatDataService.list2Group(data, { id, pid, name, children });
        }
        return data;
    }

    render() {
        return <LayoutMenuPrivate
            layout={ this.props.dataset.layout }
            width={ this.props.dataset.width }
            data={ this.state.data }
            open={ this.props.dataset.open }
            pathfield={ this.props.dataset.pathfield }
        />;
    }
}
