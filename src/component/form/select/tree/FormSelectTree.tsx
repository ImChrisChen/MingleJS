/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/20
 * Time: 4:07 上午
 */

import React, { Component } from 'react';
import { Form, TreeSelect } from 'antd';
import { IComponentProps } from '@interface/common/component';
import { FormSmartIcon } from '@component/form/form-action/FormAction';
import { isNumber, isString, trigger } from '@src/utils';
import { Inject } from 'typescript-ioc';
import { FormatDataService, HttpClientService } from '@src/services';

const { SHOW_PARENT } = TreeSelect;

const treeData = [
    {
        title   : 'Node1',
        value   : '0-0',
        key     : '0-0',
        children: [
            {
                title: 'Child Node1',
                value: '0-0-0',
                key  : '0-0-0',
            },
        ],
    },
    {
        title   : 'Node2',
        value   : '0-1',
        key     : '0-1',
        children: [
            {
                title: 'Child Node3',
                value: '0-1-0',
                key  : '0-1-0',
            },
            {
                title: 'Child Node4',
                value: '0-1-1',
                key  : '0-1-1',
            },
            {
                title: 'Child Node5',
                value: '0-1-2',
                key  : '0-1-2',
            },
        ],
    },
];

export default class FormSelectTree extends Component<IComponentProps, any> {

    @Inject private readonly httpClientService: HttpClientService;
    @Inject private readonly formatDataService: FormatDataService;

    state = {
        options: [] as Array<any>,
        value  : [],
    };

    constructor(props) {
        super(props);
        this.getData().then(options => {
            let key = options[0].key;
            this.setState({
                options,
                value: this.props.value.split(',').map(e => {
                    if (isString(key)) {
                        return e && String(e);
                    }
                    if (isNumber(key)) {
                        return e && Number(e);
                    }
                }).filter(t => t),
            });
        });
    }

    onChange = value => {
        let val = value.map(e => e && Number(e)).join(',');
        this.setState({ value }, () => trigger(this.props.el, val, 'change'));
    };

    async getData(): Promise<Array<any>> {
        // let url = `http://e.local.aidalan.com/option/game/publisher?pf=0`;
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

    render() {
        let { value, smart, ...dataset } = this.props.dataset;
        return <>
            <Form.Item label={ this.props.dataset.label }>
                { smart ? <FormSmartIcon/> : '' }
                <TreeSelect
                    { ...dataset }
                    onChange={ e => this.onChange(e) }
                    treeData={ this.state.options }
                    treeCheckable={ true }
                    showCheckedStrategy={ SHOW_PARENT }
                    placeholder={ 'Please select' }
                    style={ { width: '300px' } }
                    value={ this.state.value }
                />
            </Form.Item>
        </>;
    }

}
