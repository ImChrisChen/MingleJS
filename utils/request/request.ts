/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/23
 * Time: 11:16 下午
 */
import { message } from 'antd';

export function jsonp(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        window['jsonCallBack'] = (result) => {
            
            console.log(result);

            if (result.status) {
                resolve(result);
            } else {
                message.error('接口返回错误');
                reject(result);
            }

        };
        let script: HTMLScriptElement = document.createElement('script');

        if (url.includes('?')) {
            url = url + '&jsoncallback=jsonCallBack';
        } else {
            url = url + '?jsoncallback=jsonCallBack';
        }
        script.type = 'text/javascript';
        script.src = url;
        let body = document.querySelector('body');
        body?.appendChild(script);

        setTimeout(() => {
            body?.removeChild(script);
        }, 500);
    });
}

//
// 允许携带cookie
// axios.defaults.timeout = 6000;
// axios.defaults.withCredentials = true;
// // axios.defaults.baseURL = process.env.VUE_APP_BASE_API;
// axios.interceptors.request.use(
//     config => {
//         // let token = JSON.parse(localStorage.getItem('token') || null);
//         // if (token) {
//         // config.headers['secretKey'] = token.secretKey;
//         // config.headers['timestamp'] = token.timestamp;
//         // config.headers['uuid'] = token.uuid;
//         // }
//
//         return config;
//     },
//     err => {
//         // console.log(err);
//     },
// );
//
// // response 响应拦截器
// axios.interceptors.response.use(
//     res => {
//         if (res.status === 200) {
//             // console.log(`%c ${ res.config.url } API - 响应正常 - success`, 'font-size:12px;color:skyblue;', res);
//             return res.data;
//         } else {
//             console.log(`%c ${ res.config.url } API - 响应异常 - fail`, 'font-size:12px;color: red;', res);
//             message.error(`${ res.config.url } 接口响应异常`);
//         }
//     },
//     err => {
//
//         // 超时处理
//         let originalRequest = err.config;
//
//         // console.log(err.message);     //timeout of 100ms exceeded
//
//         if (err.code === 'ECONNABORTED' && err.message.indexOf('timeout') !== -1 && !originalRequest._retry) {
//
//             originalRequest._retry = true;
//             // Message.error('请求超时,尝试重新请求中')
//
//             message.error(`${ err.config.url } 接口请求超时`);
//
//             // 重新发起请求
//             return axios.request(originalRequest);
//         }
//     },
// );
