/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/21
 * Time: 12:35 上午
 */
import React from 'react';
import { message } from 'antd';
import $ from 'jquery';
import { IComponentProps } from '@interface/common/component';
import axios from 'axios';
import App from '@src/App';
import { trigger } from '@utils/trigger';

// import tableData from '@mock/table/tableContent'

// 表格提交的数据
interface IFormData {
    [key: string]: string | any
}

interface IFormAction extends IComponentProps {
    layout?: 'v' | 'h'
    async
}

export default class FormAction extends React.Component<IFormAction, any> {

    constructor(props) {
        super(props);
        this.init();
    }

    init() {
        let form: HTMLElement = this.props.el;
        this.setLayout(form);
        form.onsubmit = (e) => this.handleSubmit(form, e);
        form.onreset = (e) => this.handleReset(form, e);
    }

    async handleSubmit(form, e) {
        e.preventDefault();

        let { url, method, headers } = this.props.dataset;
        let formData = FormAction.getFormData(form);
        let verify = this.verifyFormData(form, formData);

        if (verify) {

            // 加载 table,chart,list 数据
            this.getViewsInstances().then(instances => {
                instances.forEach(async instance => {
                    await instance?.FormSubmit?.(formData);
                });
            });

            if (url) {
                let res = await axios({
                    url,
                    method,
                    headers: headers || { 'Content-Type': 'application/json' },
                    data   : formData,
                });
                console.log(res);
                message.info(res);
            }
        }
    }

    // 获取关联的table ，chart， list 的实例
    async getViewsInstances() {
        let id = this.props.id;
        let App = (await import('@src/App')).default;
        let views = [ ...document.querySelectorAll(`[data-from=${ id }]`) ];
        return views.map(view => {
            let uid = view.getAttribute('data-component-uid') ?? '';
            return App.instances[uid].instance;
        });
    }

    handleReset(form: HTMLElement, e) {
        let defaultFormData = FormAction.getFormData(this.props.beforeElement);

        for (const name in defaultFormData) {
            if (!defaultFormData.hasOwnProperty(name)) continue;
            let value = defaultFormData[name];
            let formItem = form.querySelector(`input[data-fn][name=${ name }]`) as HTMLElement;
            formItem && trigger(formItem, value);
        }
    }

    public verifyFormData(formElement, formData): boolean {
        let unVerifys: Array<string> = [];
        let formItems = [ ...formElement.querySelectorAll(`input[name][data-fn]`) ] as Array<HTMLInputElement>;
        formItems.forEach(formItem => {
            let name = formItem.name;
            let value = formData[name];
            let required = eval(formItem.dataset.required + '');
            if (required && !value) {
                unVerifys.push(name);
            }
        });

        if (unVerifys.length > 0) {
            message.error(`${ unVerifys.join(',') }的值为空`);
            return false;
        }
        return true;
    }

    // 获取表单数据
    public static getFormData(formElement): IFormData {
        let formData: IFormData = {};
        let formItems = [ ...formElement.querySelectorAll(`input[name][data-fn]`) ];
        formItems.forEach(formItem => {
            let { name, value } = formItem;
            formData[name] = value;
        });
        return formData;
    }

    setLayout(formElement: HTMLElement) {
        let layout = this.props.dataset.layout;

        if (layout === 'h') {
            $(formElement).css({ display: 'flex', flexWrap: 'wrap' });
        }

        if (layout === 'v') {
            console.log(formElement);
        }
    }

    render() {
        return <></>;
    }
}
