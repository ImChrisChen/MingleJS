/** * Created by WebStorm. * User: MacBook * Date: 2021/1/28 * Time: 5:22 下午 */export class Monitor {    constructor() {    }    static getTiming() {        let times: Array<any> = [];        let that = this;        try {            let time = window.performance.timing;            let loadTime = (time.loadEventEnd - time.loadEventStart) / 1000;            if (loadTime < 0) {                setTimeout(() => {                    that.getTiming();                }, 200);                return;            }            let redirect = { name: '重定向时间', value: time.redirectEnd - time.redirectStart };            let domain = { name: 'DNS解析时间', value: (time.domainLookupEnd - time.domainLookupStart) };            let tcpconnect = { name: 'TCP完成握手时间', value: (time.connectEnd - time.connectStart) };            let response = { name: 'HTTP请求响应完成时间', value: (time.responseEnd - time.requestStart) / 1000 };            let domload = { name: 'DOM开始加载前所花费时间', value: time.responseEnd - time.navigationStart };            let domend = { name: 'DOM结构解析完成时间', value: time.domInteractive - time.domLoading };            let scriptload = { name: '脚本加载时间', value: time.domContentLoadedEventEnd - time.domContentLoadedEventStart };            let onlaod = { name: 'onload事件时间', value: time.loadEventEnd - time.loadEventStart };            let pageload = {                name : '页面完全加载时间',                value: redirect.value + domain.value + tcpconnect.value + response.value + domload.value + domend.value,            };            times.push(redirect, domain, tcpconnect, response, domload, domend, scriptload, onload, pageload);            // times['TCP完成握手时间'] = (time.connectEnd - time.connectStart) / 1000;            // times['HTTP请求响应完成时间'] = (time.responseEnd - time.requestStart) / 1000;            // times['DOM开始加载前所花费时间'] = (time.responseEnd - time.navigationStart) / 1000;            // times['DOM加载完成时间'] = (time.domComplete - time.domLoading) / 1000;            // times['DOM结构解析完成时间'] = (time.domInteractive - time.domLoading) / 1000;            // times['脚本加载时间'] = (time.domContentLoadedEventEnd - time.domContentLoadedEventStart) / 1000;            // times['onload事件时间'] = (time.loadEventEnd - time.loadEventStart) / 1000;            // times['页面完全加载时间'] = (times['重定向时间'] + times['DNS解析时间'] + times['TCP完成握手时间'] + times['HTTP请求响应完成时间'] + times['DOM结构解析完成时间'] + times['DOM加载完成时间']);            for (let item of times) {                console.log(item.name + ':' + times[item]?.value + '秒(s)');            }        } catch (e) {            console.log(times);        }        return times;    }}