/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/3/17
 * Time: 9:54 上午
 */

import React, { Component, ReactNode } from 'react';
import { Form, Transfer } from 'antd';
import { Inject } from 'typescript-ioc';
import { FormatDataService, HttpClientService } from '@src/services';
import { IComponentProps } from '@interface/common/component';
import { trigger } from '@src/utils';
import { FormExecIcon, FormSmartIcon } from '@src/private-component/form-component';

interface IFormTransferProps extends IComponentProps {
    dataset: {
        pagesize: number
        width: number | string,
        height: number | string,
        url: string
        key: string
        value: string
        titles: Array<string>

        [key: string]: any
    }
}

export default class FormTransfer extends Component<IFormTransferProps, ReactNode> {

    @Inject private readonly httpClientService: HttpClientService;
    @Inject private readonly formatDataService: FormatDataService;

    state = {
        mockData  : [],
        targetKeys: [],     // 渲染到右边
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.getData().then(data => {
            this.setState({
                mockData: data,
            });
        });
    }

    async getData() {
        let { url, key, value } = this.props.dataset;
        if (url) {
            let { data } = await this.httpClientService.jsonp(url);
            if (data && data.length > 0) {
                return this.formatDataService.list2AntdOptions(data, key, value);
            }
        }
        return [];
    }

    handleChange = targetKeys => {
        // this.setState({ targetKeys });
        trigger(this.props.el, targetKeys, 'change');
    };

    render() {
        let { pagesize, width, height, label, required, titles, exec, smart } = this.props.dataset;
        console.log(width);
        let value = this.props.value;
        value = value.split(',').filter(t => t);
        return <Form.Item label={ label } required={ required }>
            { smart ? <FormSmartIcon/> : '' }
            { exec ? <FormExecIcon/> : '' }
            <Transfer
                dataSource={ this.state.mockData }
                showSearch
                titles={ titles }
                style={ {
                    width: '100%',
                } }
                listStyle={ {
                    width,
                    height,
                } }
                rowKey={ record => record.value }
                // operations={ [ 'to right', 'to left' ] }
                targetKeys={ value }
                onChange={ this.handleChange }
                render={ (item: any) => `${ item.label }` }
                pagination={ { pageSize: pagesize } }
                // footer={ this.renderFooter }
            />
        </Form.Item>;
    }
}
