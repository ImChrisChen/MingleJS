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
        this.handleReset(form);
        this.handleEvents(form);
    }

    handleReset(form: HTMLElement) {
        $(form).find('[type=reset]').on('click', e => {
            e.preventDefault();
            $(form).find('input[data-fn]').val('').trigger('change');
        });
    }

    async handleEvents(form: HTMLElement) {
        let { url, method, headers } = this.props.dataset;

        FormAction.onFormSubmit(form, async (formData, e) => {
            console.log(formData);
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
        });
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

    public static onFormSubmit(formElement, callback) {
        // TODO 使用Jquery on 绑定事件(DOM2级事件),在一个表单关联多个表格/图表的情况下避免事件覆盖
        $(formElement).on('submit', e => {
            e.preventDefault();

            let formData = FormAction.getFormData(formElement);

            if (!formData) {
                return;
            }

            callback(formData, e);
            // message.info('提交表单');
        });
    }

    public static findFormElement(from): HTMLElement | null {
        return document.querySelector(`#${ from }`);
    }

    // 获取表单数据
    public static getFormData(formElement): IFormData | boolean {
        let $elements = $(formElement).find(`input[name]`);
        let formData: IFormData = {};
        let verify = true;
        $elements.each((index, el) => {
            let name = $(el).attr('name') ?? '';
            let value = $(el).val();

            let required = eval(el.dataset.required + '');
            if (required && !value) {
                message.error(`${ name }的值必须填写`);
                verify = false;
            }

            formData[name] = value;
        });

        if (!verify) {
            return false;
        }

        return formData;
    }

    public static async requestData() {

    }

    render() {
        return <></>;
    }
}
