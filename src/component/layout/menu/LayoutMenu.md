/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/11/11
 * Time: 2:36 下午
 */

import * as React from 'react';
import { Component, ReactNode } from 'react';
import { IComponentProps } from '@interface/common/component';
import { list2Group, treeKeyReplace } from '@utils/format-data';
import { getDepthMax } from '@utils/util';
import LayoutMenuPrivate from '@src/private-component/views/layout-menu/LayoutMenu';

export default class LayoutMenu extends Component<IComponentProps, ReactNode> {

    state = {
        collapsed: !this.props.dataset.open,
        url      : '',
        data     : [] as Array<any>,
    };

    constructor(props) {
        super(props);
        this.getData().then(data => {
            this.setState({ data });
        });
    }

    async getData(): Promise<Array<any>> {
        let { url, menulist, id, name, pid, children } = this.props.dataset;
        let data: Array<any>;
        if (url) {
            let res = await jsonp(url);
            data = res.status ? res.data : [];
        } else {
            data = menulist;
        }
        let deep = getDepthMax({ children: data }, 'children') - 1;

        if (deep > 1) {
            data = treeKeyReplace(data, { id, pid, name, children }, {
                id      : 'value',
                pid     : 'pid',
                name    : 'label',
                children: 'children',
            });
        } else {
            data = list2Group(data, { id, pid, name, children });
        }
        return data;
    }

    render() {
        return <LayoutMenuPrivate
            layout={ this.props.dataset.layout }
            width={ this.props.dataset.width }
            data={ this.state.data }
            open={ this.props.dataset.open }
        />;
    }
}
