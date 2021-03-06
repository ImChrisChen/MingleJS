/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/12/25
 * Time: 10:00 上午
 */
import React, { Component } from 'react';
import { IComponentProps } from '@interface/common/component';
import { Tree } from 'antd';
import { isNumber, isString } from '@src/utils';
import { Inject } from 'typescript-ioc';
import { FormatDataService } from '@services/FormatData.service';
import { HttpClientService } from '@services/HttpClient.service';

const treeData = [
    {
        title   : '0-0',
        key     : '0-0',
        children: [
            {
                title   : '0-0-0',
                key     : '0-0-0',
                children: [
                    { title: '0-0-0-0', key: '0-0-0-0' },
                    { title: '0-0-0-1', key: '0-0-0-1' },
                    { title: '0-0-0-2', key: '0-0-0-2' },
                ],
            },
            {
                title   : '0-0-1',
                key     : '0-0-1',
                children: [
                    { title: '0-0-1-0', key: '0-0-1-0' },
                    { title: '0-0-1-1', key: '0-0-1-1' },
                    { title: '0-0-1-2', key: '0-0-1-2' },
                ],
            },
            {
                title: '0-0-2',
                key  : '0-0-2',
            },
        ],
    },
    {
        title   : '0-1',
        key     : '0-1',
        children: [
            { title: '0-1-0-0', key: '0-1-0-0' },
            { title: '0-1-0-1', key: '0-1-0-1' },
            { title: '0-1-0-2', key: '0-1-0-2' },
        ],
    },
    {
        title: '0-2',
        key  : '0-2',
    },
];

export default class DataTree extends Component<IComponentProps, any> {

    @Inject private readonly httpClientService: HttpClientService;
    @Inject private readonly formatDataService: FormatDataService;

    state = {
        expandedKeys: [],       // 展开的默认值
        // checkedKeys     : [ '0-0-0' ],
        autoExpandParent: true,
        selectedKeys    : [],
        options         : [] as Array<any>,
        value           : [],       // 选中个的默认值
    };

    constructor(props) {
        super(props);
        console.log(this.props);

        this.getData().then(options => {
            let key = options[0].key;
            this.setState({
                options,
                value       : this.props.dataset.checkeds.map(e => {
                    if (isString(key)) {
                        return e && String(e);
                    }
                    if (isNumber(key)) {
                        return e && Number(e);
                    }
                }),
                expandedKeys: this.props.dataset.expands.map(e => {
                    if (isString(key)) {
                        return e && String(e);
                    }
                    if (isNumber(key)) {
                        return e && Number(e);
                    }
                }),
            });
        });

    }

    async getData(): Promise<Array<any>> {
        let { url, key, value, children } = this.props.dataset;
        if (url) {
            let res = await this.httpClientService.jsonp(url);
            let data = res.status ? res.data : [];
            data = this.formatDataService.treeKeyReplace(data, {
                id      : key,
                name    : value,
                pid     : '',
                children: children,
            }, {
                id      : 'key',
                pid     : '',
                name    : 'title',
                children: 'children',
            });
            return data;
        } else {
            return treeData;
        }
    }

    onExpand(expandedKeys) {
        console.log('onExpand', expandedKeys);
        // if not set autoExpandParent to false, if children expanded, parent can not collapse.
        // or, you can remove all expanded children keys.
        this.setState({
            expandedKeys,
            autoExpandParent: false,
        });
    };

    onCheck(value) {
        this.setState({ value });
    };

    onSelect(value, info) {
        console.log('onSelect', info);
        this.setState({ value });
    }

    onDrop(info) {
        console.log(info);
        const dropKey = info.node.props.eventKey;
        const dragKey = info.dragNode.props.eventKey;
        const dropPos = info.node.props.pos.split('-');
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

        const loop = (data, key, callback) => {
            for (let i = 0; i < data.length; i++) {
                if (data[i].key === key) {
                    return callback(data[i], i, data);
                }
                if (data[i].children) {
                    loop(data[i].children, key, callback);
                }
            }
        };
        const data = [...this.state.options];

        // Find dragObject
        let dragObj;
        loop(data, dragKey, (item, index, arr) => {
            arr.splice(index, 1);
            dragObj = item;
        });

        if (!info.dropToGap) {
            // Drop on the content
            loop(data, dropKey, item => {
                item.children = item.children || [];
                // where to insert 示例添加到头部，可以是随意位置
                item.children.unshift(dragObj);
            });
        } else if (
            (info.node.props.children || []).length > 0 && // Has children
            info.node.props.expanded && // Is expanded
            dropPosition === 1 // On the bottom gap
        ) {
            loop(data, dropKey, item => {
                item.children = item.children || [];
                // where to insert 示例添加到头部，可以是随意位置
                item.children.unshift(dragObj);
                // in previous version, we use item.children.push(dragObj) to insert the
                // item to the tail of the children
            });
        } else {
            let ar;
            let i;
            loop(data, dropKey, (item, index, arr) => {
                ar = arr;
                i = index;
            });
            if (dropPosition === -1) {
                ar.splice(i, 0, dragObj);
            } else {
                ar.splice(i + 1, 0, dragObj);
            }
        }

        this.setState({
            options: data,
        });
    };

    onDragEnter(info) {
        console.log(info);
        // expandedKeys 需要受控时设置
        // this.setState({
        //   expandedKeys: info.expandedKeys,
        // });
    };

    onActiveChange(e) {
        console.log('发生改变后', e);
    }

    render() {
        return <>
            <Tree
                checkable
                onExpand={ e => this.onExpand(e) }
                expandedKeys={ this.state.expandedKeys }
                draggable={ this.props.dataset.draggable }
                autoExpandParent={ this.state.autoExpandParent }
                disabled={ this.props.dataset.disabled }
                onCheck={ e => this.onCheck(e) }
                onDrop={ e => this.onDrop(e) }
                onActiveChange={ e => this.onActiveChange(e) }
                onDragEnter={ e => this.onDragEnter(e) }
                checkedKeys={ this.state.value }
                // onSelect={ (...e) => this.onSelect(...e) }
                selectedKeys={ this.state.selectedKeys }
                treeData={ this.state.options }
            />
        </>;
    }
}
