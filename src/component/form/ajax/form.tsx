/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/21
 * Time: 12:35 上午
 */
import React from 'react';
import { message } from 'antd';
import $ from 'jquery';

// import tableData from '@mock/table/tableContent'

interface IFormData {
    [key: string]: string | any
}

export default class FormAjax extends React.Component<any, any> {

    constructor(props) {
        super(props);
        this.init();
    }

    private init() {
        let { async } = this.props.dataset;
        let form: HTMLFormElement = this.props.el;
    }

    static onFormSubmit(formElement, callback) {
        formElement.onsubmit = async function (e) {
            e.preventDefault();
            // let formData = FormAjax.getFormData(form);
            callback(FormAjax.getFormData(formElement), e)
            message.info('提交表单');
        };
    }

    // 获取表单数据
    static getFormData(formElement): IFormData {
        let $elements = $(formElement).find(`[name]`);
        let formData: IFormData = {};
        $elements.each((index, el) => {
            let name = $(el).attr('name') ?? '';
            let value = $(el).val();
            formData[name] = value;
        });
        return formData;
    }

    static async requestData() {

    }

    render() {
        return <>

        </>;
    }
}
