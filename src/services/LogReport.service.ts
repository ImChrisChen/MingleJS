/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/1/28
 * Time: 5:22 下午
 */

import axios from 'axios';
import { getBrowerInfo, getOS } from '@src/utils';
import { HttpClientService } from '@services/HttpClient.service';
import { Inject } from 'typescript-ioc';

// 通用日志字段
interface ILog {
    page_url: string
    flag: string,
    browser_name?: string
    browser_ver?: string
    log_type?: 'error' | 'http' | 'performance'
    os_name?: string
    os_ver?: string

    [key: string]: any
}

// 错误日志字段
interface IErroLog extends ILog {
    message: string
    stack: string
    filename: string,
    error_line: number,
    error_col: number,
}

// 请求日志
interface IRequestLog extends ILog {
    request_url?: string
    method?: 'get' | 'GET' | 'delete' | 'DELETE' | 'head' | 'HEAD' | 'options' | 'OPTIONS' | 'post' | 'POST' | 'put' | string
    data?: any
    headers?: any
    dataType: 'jsonp' | 'json'
}

interface IPerformancesItem {
    name: string
    value: number
    unit: string
}

interface IPerformanceLog<T = IPerformancesItem> extends ILog {
    redirect: T             // 重定向时间
    dnsparse: T               // DNS解析时间
    tcpconnect: T           // TCP完成握手时间
    response: T           // HTTP请求响应完成时间
    domload: T          // DOM开始加载前所花费时间
    domend: T           // DOM结构解析完成时间
    scriptload: T       // 脚本加载时间
    onload: T           // onload事件时间
    pageload: T         // 页面完全加载时间
}


export class LogReportService {

    constructor(@Inject private readonly httpClientService: HttpClientService) {

    }

    // public static performances: Array<any>;     // 性能数据

    // 异常收集
    public static async errorLogger(log: IErroLog) {
        return;
        let { browser, ver } = getBrowerInfo();
        log['browser_name'] = browser;
        log['browser_ver'] = ver;
        log['os_name'] = getOS();
        log['os_ver'] = '';
        log['log_type'] = 'error';

        let res = await axios.post('/server/log?type=error', log);
        // console.log(res);
    }

    // 请求收集
    public static async requestLogger(log: IRequestLog) {
        return;
        log['log_type'] = 'http';
        await axios.post('/server/log?type=http', log);
    }

    // 性能收集
    public static async performanceLogger(log: IPerformanceLog) {
        return;
        log['log_type'] = 'performance';
        console.log('性能日志', log);
        await axios.post('/server/log?type=performance', log);
    }

    // 获取加载时间性能测速
    public static getPerformanceTimes(cb: (times: any) => any) {
        return;
        let times: any = {};
        let that = this;
        let time = window.performance.timing;
        let loadTime = (time.loadEventEnd - time.loadEventStart) / 1000;
        if (loadTime < 0) {
            setTimeout(() => {
                that.getPerformanceTimes(cb);
            }, 200);
        } else {
            let redirect = { name: '重定向时间', value: time.redirectEnd - time.redirectStart };
            let dnsparse = { name: 'DNS解析时间', value: (time.domainLookupEnd - time.domainLookupStart) };
            let tcpconnect = { name: 'TCP完成握手时间', value: (time.connectEnd - time.connectStart) };
            let response = { name: 'HTTP请求响应完成时间', value: (time.responseEnd - time.requestStart) };
            let domload = { name: 'DOM开始加载前所花费时间', value: time.responseEnd - time.navigationStart };
            let domend = { name: 'DOM结构解析完成时间', value: time.domInteractive - time.domLoading };
            let scriptload = { name: '脚本加载时间', value: time.domContentLoadedEventEnd - time.domContentLoadedEventStart };
            let onload = { name: 'onload事件时间', value: time.loadEventEnd - time.loadEventStart };
            let pageload = {
                name : '页面完全加载时间',
                value: redirect.value + dnsparse.value + tcpconnect.value + response.value + domload.value + domend.value,
            };
            times.redirect = redirect;
            times.dnsparse = dnsparse;
            times.tcpconnect = tcpconnect;
            times.response = response;
            times.domload = domload;
            times.domend = domend;
            times.scriptload = scriptload;
            times.onload = onload;
            times.pageload = pageload;

            for (let key in times) {
                if (!times.hasOwnProperty(key)) continue;
                let item = times[key];
                item.unit = '毫秒(ms)';
                // console.log(item.name + ':' + item.value + item.unit);
            }
            cb(times);
        }
    }
}
