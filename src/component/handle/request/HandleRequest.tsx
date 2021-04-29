/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/10/26
 * Time: 3:30 下午
 */

import React from 'react';
import { INativeProps } from '@interface/common/component';
import { message } from 'antd';
import { Inject } from 'typescript-ioc';
import { HttpClientService } from '@src/services/HttpClient.service';
import App, { DataComponentUID } from '@src/App';

interface IHandleRequestProps extends INativeProps {
    dataset: {
        method: string
        url: string
    }
}

export default class HandleRequest {

    @Inject private readonly httpClientService: HttpClientService;

    constructor(private readonly props: IHandleRequestProps) {
        this.props.el.onclick = e => this.handleRequest(e);
    }

    async handleRequest(e) {
        let { $method, $url } = this.props;
        try {
            if ($url) {
                $method = $method.toLowerCase();
                let { status, msg } = await this.httpClientService?.[$method]($url);
                if (status) {
                    message.success('操作成功');
                    this.reloadEntity();
                } else {
                    message.error('操作失败');
                }
            }
        } catch(error) {
            message.error(error.message);
        }
    }

    reloadEntity() {
        let tableEl = $(this.props.el).closest('data-table');
        let dataFrom = tableEl.attr('data-from');
        let formUID = $(`form-action[id=${ dataFrom }]`).attr(DataComponentUID) ?? '';
        let formInstance = App.getInstance(formUID).instance;
        formInstance?.handleSubmit?.();
    }

}

