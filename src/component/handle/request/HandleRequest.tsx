/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/10/26
 * Time: 3:30 下午
 */

import React from 'react';
import { IComponentProps } from '@interface/common/component';
import { message } from 'antd';
import { Inject } from 'typescript-ioc';
import { HttpClientService } from '@src/services/HttpClient.service';

export default class HandleRequest  {
    @Inject private readonly httpClientService: HttpClientService;

    constructor(private readonly props) {
        this.props.el.onclick = e => this.handleRequest(e);
    }

    async handleRequest(e) {
        try {
            if (this.props.dataset.url) {
                let { status, msg } = await this.httpClientService.jsonp(this.props.dataset.url);
                message.success(status ? '操作成功' : '操作失败');
            }
        } catch (error) {
            message.success(error.message);
        }
    }

    render() {
        return <></>;
    }
}

