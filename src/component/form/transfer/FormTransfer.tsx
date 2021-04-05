/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/3/17
 * Time: 9:54 上午
 */

import React, { Component, ReactNode } from 'react';
import { Transfer } from 'antd';
import { Inject } from 'typescript-ioc';
import { HttpClientService } from '@services/HttpClient.service';
import { IComponentProps } from '@interface/common/component';
import { FormatDataService } from '@services/FormatData.service';
import { trigger } from '@src/utils';


interface IFormTransferProps extends IComponentProps {
    dataset: {
        pagesize: number
        width: number | string,
        height: number | string,
        url: string
        key: string
        value: string
        titles: Array<string>
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
        let { pagesize, width, height, titles } = this.props.dataset;
        let value = this.props.value;
        value = value.split(',').filter(t => t);
        return (
            <Transfer
                dataSource={ this.state.mockData }
                showSearch
                titles={ titles }
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
        );
    }
}
