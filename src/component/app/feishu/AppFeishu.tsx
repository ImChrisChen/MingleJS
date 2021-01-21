/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/12/17
 * Time: 5:37 下午
 */
import React, { Component } from 'react';
import axios from 'axios';
import { jsonp } from '@utils/request/request';

interface IFeishuH5SignAPI {
    appId: string
    timestamp: string
    nonceStr: string
    signature: string
    url: string

    [key: string]: string
}

export default class AppFeishu extends Component<any, any> {

    constructor(props) {
        super(props);

        this.loadSDK(async () => {
            if (window.h5sdk) {
                let data = await this.getSign();
                window.h5sdk.config({
                    appId    : data.appId, //res.appId
                    timestamp: +data.timestamp,
                    nonceStr : data.noncestr,
                    signature: data.signature,
                    jsApiList: [
                        'biz.user.getUserInfo',
                        'device.health.getStepCount',
                        'biz.user.openDetail',
                        'biz.contact.open',
                        'device.base.getSystemInfo',
                        'biz.util.getClipboardInfo',
                        'biz.util.openDocument',
                        'biz.util.downloadFile',
                        'device.geolocation.get',
                        'device.geolocation.start',
                        'device.geolocation.stop',
                        'biz.user.getUserInfoEx',
                        'device.connection.getNetworkType',
                    ],
                    onSuccess: (res) => {
                        console.log(`config: success ${ JSON.stringify(res) }`);
                        alert(`config: success ${ JSON.stringify(res) }`);
                    },
                });
                window.h5sdk.ready(() => {

                });
            }
        });
    }

    public geo() {
        alert('geo');
    }

    async getSign(): Promise<IFeishuH5SignAPI> {
        let url = `http://auc.local.aidalan.com/api/external.feishu/h5Sign`;
        let res = await jsonp(url);
        return res.status ? res.data : {};
    }

    loadSDK(callback) {
        let script: any = document.createElement('script');
        script.src = `https://s3.bytecdn.cn/ee/lark/js_sdk/h5-js-sdk-1.4.13.js`;
        script.type = 'text/javascript';
        script.onload = script.onreadystatechange = function () {
            if (!script.readyState || script.readyState === 'loaded' || script.readyState === 'complete') {
                callback();
                script.onload = script.onreadystatechange = null;
            }
        };
        document.body.append(script);
    }

    render() {
        return <></>;
    }
}
