/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/2/8
 * Time: 12:08 下午
 */

import { isWuiTpl } from '@src/utils';
import { message } from 'antd';
import { LogReportService } from '@services/LogReport.service';
import { Inject } from 'typescript-ioc';
import { ParserTemplateService } from '@services/ParserTemplate.service';
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

export class HttpClientService {

    private static instance;
    @Inject private readonly parserTemplateService: ParserTemplateService;

    // 使用单例模式
    constructor() {
        if (HttpClientService.instance) {
            return HttpClientService.instance;
        } else {
            // 这个区域只会执行一次
            HttpClientService.setConfig();
            HttpClientService.instance = this;
            return this;
        }
    }

    private static setConfig() {
        // 允许携带cookie;
        axios.defaults.timeout = 6000;
        axios.defaults.withCredentials = true;
        // axios.defaults.baseURL = process.env.VUE_APP_BASE_API;
        this.httpRequestInterceptors();
        this.httpResponseInterceptors();
    }

    private static httpRequestInterceptors() {
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
    }

    private static httpResponseInterceptors() {
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
    }

    public async jsonp(url: string): Promise<IApiResult> {
        if (isWuiTpl(url)) url = this.parserTemplateService.parseTpl(url);

        let funcName = 'callback' + (new Date().getTime() + '_' + Math.floor(Math.random() * 1000));         // 解决jsonp短时间内无法循环请求的问题
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

            if (!url) {
                reject();
            }

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
                LogReportService.requestLogger({
                    request_url: url,
                    page_url   : window.location.href,
                    flag       : 'mingle',
                    method     : 'get',
                    dataType   : 'jsonp',
                    headers    : '{}',
                });
            } catch(e) {
                console.error(e);
            }

            setTimeout(() => {
                if (!isDone) message.error('接口请求超时');
                reject({ error: '', msg: '接口请求超时' });
                window[funcName] = undefined;
            }, timeout);
            setTimeout(() => body?.removeChild(script), 500);
        });
    };

    public async get(url, ...args) {
        return await axios.get(url, ...args);
    };

    public async post(url, ...args) {
        return await axios.post(url, ...args);
    };

    public async delete(url, ...args) {
        return await axios.delete(url, ...args);
    };

    public async put(url, ...args) {
        return await axios.put(url, ...args);
    };

}


