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

// import tableData from '@mock/table/tableContent'

interface IFormData {
    [key: string]: string | any
}

export default class FormAjax extends React.Component<IComponentProps, any> {

    constructor(props) {
        super(props);
        this.init();
    }

    private init() {
        let { async } = this.props.dataset;
        let form: HTMLElement = this.props.el;
        this.setLayout(form);
        $(form).find('[type=reset]').on('click', e => {
            e.preventDefault();
            // $(form).find('input[data-fn]').val('').trigger('change');
        });
        FormAjax.onFormSubmit(form, function (formData) {
            console.log(formData);
        });
    }

    private setLayout(formElement: HTMLElement) {
        if (this.props.dataset.layout === 'flex') {
            $(formElement).css({ display: 'flex' });
        } else {
        }
    }

    static onFormSubmit(formElement, callback) {
        $(formElement).on('submit', function (e) {
            e.preventDefault();
            let formData: IFormData = FormAjax.getFormData(formElement);
            callback(formData, e);
            message.info('提交表单');
        });
        // formElement.onsubmit = async function (e) {
        //     e.preventDefault();
        //     let formData: IFormData = FormAjax.getFormData(formElement);
        //     callback(formData, e);
        //     message.info('提交表单');
        //     // $(formElement).trigger('submit', formData);
        // };
    }

    static findFormElement(from): HTMLElement | null {
        return document.querySelector(`#${ from }`);
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
        return <></>;
    }
}
