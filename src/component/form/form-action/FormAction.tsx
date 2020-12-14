/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/21
 * Time: 12:35 上午
 */
import React from 'react';
import { Button, message } from 'antd';
import $ from 'jquery';
import { IComponentProps } from '@interface/common/component';
import axios from 'axios';
import { trigger } from '@utils/trigger';
import SmartIcon from '@static/icons/form-smart.png';
import style from './FormAction.scss';

// import tableData from '@mock/table/tableContent'

// 表格提交的数据
interface IFormData {
    [key: string]: string | any
}

interface IFormAction extends IComponentProps {
    layout?: 'v' | 'h'
    async
}

// data-smart icon
export function FormSmartIcon() {
    return <img className={ style.dataSmartIcons } src={ SmartIcon } alt="data-smart标志"/>;
}

export default class FormAction extends React.Component<IFormAction, any> {

    state = {
        formSmartData: {},
        smartElements: ([...this.props.el.querySelectorAll(`input[data-fn][data-smart]`)] || []) as Array<HTMLInputElement>,
    };

    constructor(props) {
        super(props);
        this.init();
    }

    init() {
        let form: HTMLElement = this.props.el;
        form.onsubmit = (e) => this.handleSubmit(form, e);
        form.onreset = (e) => this.handleReset(form, e);

        this.setLayout(form);
    }

    getFormDataSmart(elements) {
        let formSmartData = {};
        if (elements.length > 0) {
            elements.forEach(element => {
                let { name, value } = element;
                if (name && value) {
                    formSmartData[name] = value;
                }
            });
        }
        return formSmartData;
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
        let views = [...document.querySelectorAll(`[data-from=${ id }]`)];
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

    verifyFormData(formElement, formData): boolean {
        let unVerifys: Array<string> = [];
        let formItems = [...formElement.querySelectorAll(`input[name][data-fn]`)] as Array<HTMLInputElement>;
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
        let formItems = [...formElement.querySelectorAll(`input[name][data-fn]`)];
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

    //  保存 data-smart 表单选择条件
    handleSaveSelects() {
        let formDataSmart = this.getFormDataSmart(this.state.smartElements);
        console.log(formDataSmart);
    }

    renderFormSmart() {
        return this.state.smartElements.length > 0 ?
            <div className={ style.formSmart }>
                <div>
                    <p> ---------------- </p>
                    <p> ---------------- </p>
                    <p> ---------------- </p>
                    <p> ---------------- </p>
                    <p> ---------------- </p>
                </div>
                <Button> 收缩 </Button>
                <Button onClick={ this.handleSaveSelects.bind(this) } type={ 'primary' }> 保存 </Button>
            </div> : '';
    }

    render() {
        return <>
            { this.renderFormSmart() }
        </>;
    }
}
