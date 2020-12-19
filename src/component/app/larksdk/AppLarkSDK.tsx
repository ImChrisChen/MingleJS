/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/12/17
 * Time: 5:37 下午
 */
import React, { Component } from 'react';
import axios from 'axios';

export default class AppLarkSDK extends Component<any, any> {

    private larkSDKUrl = 'https://s3.bytecdn.cn/ee/lark/js_sdk/h5-js-sdk-1.4.13.js';
    private url = location.href.replace(/#.*$/, '');
    public sdkData;

    constructor(props) {
        super(props);

        this.loadSDK(async () => {
            let res = await this.getSign();
            console.log(res);
            alert(window.h5sdk);
            // noncestr: '4458331152339229349';
            // signature: '3f9594087fca50c8ed8dbe35987a79a0df594620';
            // timestamp: '1608200950924';
            // url: '';
            window.h5sdk.ready(() => {
                window.h5sdk.config({
                    appId    : 'cli_9e07f4ae206c900e', //res.appId
                    timestamp: +res.timestamp,
                    nonceStr : res.noncestr,
                    signature: res.signature,
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
                        this.sdkData = res;
                    },
                });
            });
        });
    }

    createScript() {

    }

    async getSign() {
        let res = await axios.get(`https://mina.bytedance.com/openapi/jssdk/demo/getsignature?url=${ this.url }`);
        if (res.status === 200 && res.data.code === 0) {
            return res.data.data;
        } else {
            return {};
        }
    }

    loadSDK(callback) {
        let script: any = document.createElement('script');
        script.src = this.larkSDKUrl;
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