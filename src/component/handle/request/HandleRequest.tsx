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
import { ParserElementService } from '@src/services';

interface IHandleRequestProps extends INativeProps {
    dataset: {
        method: string
        url: string
    }
}

export default class HandleRequest {

    @Inject private readonly httpClientService: HttpClientService;
    @Inject private readonly parserElementService: ParserElementService;

    constructor(private readonly props: IHandleRequestProps) {
        if (this.props.el.localName === 'form-switch') {
            this.props.el.onchange = e => this.handleRequest(e);
        } else {
            this.props.el.onclick = e => this.handleRequest(e);
        }
    }

    async handleRequest(e) {
        let name = this.props.el.getAttribute('name') ?? '';
        let value = this.props.el.getAttribute('value');
        let { _method, _url } = this.props;
        let data = { [name]: value };
        _url = this.parserElementService.parseTpl(_url, data);
        console.log(_url);
        console.log(data);
        try {
            if (_url) {
                _method = _method.toLowerCase();
                let { status, msg } = await this.httpClientService?.[_method](_url);
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

