import './src/defaultClass.less';
import './src/App.scss';
import 'antd/dist/antd.compact.less'; // 紧凑模de式
import React from 'react';
import { ConfigProvider, message, notification } from 'antd';
import $ from 'jquery';
import ReactDOM from 'react-dom';
import Document from '@src/pages/document/Document'; // https://www.cnblogs.com/cckui/p/11490372.html
import { HashRouter } from 'react-router-dom';
import { globalComponentConfig } from '@src/config/component.config';
import { Mingle } from './src/core/Mingle';
import App from './src/App';
import { Inject } from 'typescript-ioc';
import { FormatDataService, HttpClientService } from './src/services';
import { BaseUrl } from './src/config';
import { ViewRenderService } from './src/services/ViewRender.service';

let container = document.querySelector('#__MINGLE_DOCS__');
container && ReactDOM.render(
    <ConfigProvider { ...globalComponentConfig }>
        <HashRouter>
            <Document/>
        </HashRouter>
    </ConfigProvider>,
    container);

class EntityView {

    @Inject private readonly viewRenderService: ViewRenderService;
    @Inject private readonly formatDataService: FormatDataService;
    @Inject private readonly httpClientService: HttpClientService;

    // 单例模式之恶汉模式
    // private static singleInstance = new EntityView;

    // 将构造函数私有化，禁止使用new操作符，调用此类
    constructor() {
        let { entityid } = this.formatDataService.url2Obj(window.location.href);
        if (!entityid) {
            return;
        }

        this.getEntityConfig().then(json => {
            let node = this.viewRenderService.vnodeToElement(json);
            document.body.innerHTML = '';
            document.body.append(node);
            new Mingle({ el: node });
        });

    }

    public static getInstance() {
        // return this.singleInstance;
    }

    public async getEntityConfig(): Promise<any> {
        // let url = '';
        // console.log(url);
        // let res = await this.httpClientService.get(`${ BaseUrl }`);
        // return res.status ? res.data : [];
        return {}
    }
}

// new EntityView;

// window.addEventListener('load', async () => {
//     new App(document.body);
//     Monitor.getPerformanceTimes(times => {
//         Monitor.performanceLogger(times);
//     });
// });

Mingle.globalEventListener();
window['$'] = $;
window['App'] = App;
window['Message'] = message;
window['Notice'] = notification;
window['Mingle'] = Mingle;
