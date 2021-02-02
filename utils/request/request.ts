/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/23
 * Time: 11:16 下午
 */

import { message } from 'antd';
import md5 from 'md5';
import { isWuiTpl } from '@utils/inspect';
import { parseTpl } from '@utils/parser-tpl';
import { Monitor } from '@services/Monitor';
import axios from 'axios';

export interface IApiResult {
    status: boolean
    data: any

    msg?: string
    message?: string
    md5?: string
    nums?: number | string,
    page?: number | string,

    [key: string]: any
}

export function jsonp(url: string): Promise<IApiResult> {
    if (isWuiTpl(url)) url = parseTpl(url);

    let funcName = 'callback' + md5(url + new Date().getTime());         // 解决jsonp短时间内无法循环请求的问题
    let isDone = false;
    let timeout = 15000;     // 超时时间
    return new Promise((resolve, reject) => {
        window[funcName] = result => {
            if (result.status) {
                isDone = true;
                resolve(result);
                window[funcName] = undefined;
            } else {
                isDone = true;
                message.error('接口返回错误');
                reject(result);
                window[funcName] = undefined;
            }
        };
        let script: HTMLScriptElement = document.createElement('script');

        if (url.includes('?')) {
            url = url + `&jsoncallback=${ funcName }`;
        } else {
            url = url + `?jsoncallback=${ funcName }`;
        }

        script.type = 'text/javascript';
        script.src = url;

        let body = document.querySelector('body');

        try {
            body?.appendChild(script);
            Monitor.requestLogger({
                request_url: url,
                page_url   : window.location.href,
                flag       : 'mingle',
                method     : 'get',
                dataType   : 'jsonp',
                headers    : '{}',
            });
        } catch (e) {
            console.error(e);
        }

        setTimeout(() => {
            if (!isDone) message.error('接口请求超时');
            reject({ error: '', msg: '接口请求超时' });
            window[funcName] = undefined;
        }, timeout);
        setTimeout(() => body?.removeChild(script), 500);
    });
}

// window.jsonp = jsonp;

// 允许携带cookie;
axios.defaults.timeout = 6000;
axios.defaults.withCredentials = true;
// axios.defaults.baseURL = process.env.VUE_APP_BASE_API;
axios.interceptors.request.use(
    config => {
        let { url, baseURL, method, headers } = config;
        if (baseURL) {
            url = baseURL + url;
        }
        // Monitor.requestLogger({
        //     request_url: url,
        //     page_url   : window.location.href,
        //     flag       : 'mingle',
        //     method     : method,
        //     dataType   : 'jsonp',
        //     headers    : headers,
        // });

        // let token = JSON.parse(localStorage.getItem('token') || null);
        // if (token) {
        // config.headers['secretKey'] = token.secretKey;
        // config.headers['timestamp'] = token.timestamp;
        // config.headers['uuid'] = token.uuid;
        // }

        return config;
    },
    err => {
        // console.log(err);
    },
);

// response 响应拦截器
axios.interceptors.response.use(
    res => {
        if (res.status === 200) {
            // console.log(`%c ${ res.config.url } API - 响应正常 - success`, 'font-size:12px;color:skyblue;', res);
            return res.data;
        } else {
            console.log(`%c ${ res.config.url } API - 响应异常 - fail`, 'font-size:12px;color: red;', res);
            message.error(`${ res.config.url } 接口响应异常`);
        }
    },
    err => {

        // 超时处理
        let originalRequest = err.config;

        // console.log(err.message);     //timeout of 100ms exceeded

        if (err.code === 'ECONNABORTED' && err.message.indexOf('timeout') !== -1 && !originalRequest._retry) {

            originalRequest._retry = true;
            // Message.error('请求超时,尝试重新请求中')

            message.error(`${ err.config.url } 接口请求超时`);

            // 重新发起请求
            return axios.request(originalRequest);
        }
    },
);


