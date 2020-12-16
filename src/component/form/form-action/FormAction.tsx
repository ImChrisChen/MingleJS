/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/21
 * Time: 12:35 上午
 */
import React from 'react';
import { Button, Form, Input, message, Modal, Select, Switch } from 'antd';
import $ from 'jquery';
import { IComponentProps } from '@interface/common/component';
import axios from 'axios';
import { trigger } from '@utils/trigger';
import SmartIcon from '@static/icons/form-smart.png';
import style from './FormAction.scss';
import { jsonp } from '@root/utils/request/request';

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
        isModalVisible  : false,
        formSmartVisible: false,
        smartElements   : ([ ...this.props.el.querySelectorAll(`input[data-fn][data-smart=true]`) ] || []) as Array<HTMLInputElement>,

        // 提交的数据
        formModelData: {
            groupName: '',
            isPublic : false,
        },
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

    // 获取form表单中只有 data-smart='true'的属性值
    getFormDataSmart(elements) {
        let formDataSmart = {};
        if (elements.length > 0) {
            elements.forEach(element => {
                let { name, value } = element;
                if (name && value) {
                    formDataSmart[name] = value;
                }
            });
        }
        return formDataSmart;
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

    verifyFormData(formElement, formData): boolean {
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

    //  保存 data-smart 表单选择条件
    handleSaveSelects() {
        this.setState({ isModalVisible: true });
    }

    handleToggle() {
        $('.form-smart-container').css('right', this.state.formSmartVisible ? -200 : 0);
        this.setState({ formSmartVisible: !this.state.formSmartVisible });
    }

    async handleOk() {
        let formDataSmart = this.getFormDataSmart(this.state.smartElements);
        let { groupName, isPublic } = this.state.formModelData;
        let dataStr = formatDataString(formDataSmart);

        function formatDataString(formDataSmart: {}): string {
            let str = '';
            for (const key in formDataSmart) {
                let value = formDataSmart[key];
                str += `&key[${ key }]=${ value }`;
            }
            return str;
        }

        let url = `https://auc.local.aidalan.com/user.selectTag/save?public=${ Number(isPublic) }&name=${ groupName }${ dataStr }`;
        let res = await axios.get(url);
        console.log(res);
    }

    handleCancel() {
        this.setState({ isModalVisible: false });
    }

    renderFormSmart() {
        return this.state.smartElements.length > 0 ?
            <div className={ 'form-smart-container ' + style.formSmart }
                 style={ { right: this.state.formSmartVisible ? 0 : -200 } }>
                <div style={ { position: 'relative' } }>
                    <p> ---------------- </p>
                    <p> ---------------- </p>
                    <p> ---------------- </p>
                    <p> ---------------- </p>
                    <p> ---------------- </p>
                    <Button onClick={ this.handleSaveSelects.bind(this) } type={ 'primary' }> 保存 </Button>
                </div>
                <Button onClick={ this.handleToggle.bind(this) } className={ style.formSmartToggleBtn }> 收缩 </Button>
            </div> : '';
    }

    render() {
        return <>
            { this.renderFormSmart() }
            <Modal title="提交组合信息" visible={ this.state.isModalVisible }
                   getContainer={ this.props.el }
                   onOk={ this.handleOk.bind(this) }
                   onCancel={ this.handleCancel.bind(this) }>
                <Form.Item label={ '组合名称' }>
                    <Input placeholder="请输入组合名称" value={ this.state.formModelData.groupName }
                           onChange={ (e) => {
                               let formModelData = this.state.formModelData;
                               formModelData.groupName = e.target.value;
                               this.setState({ formModelData });
                           } }
                    />
                </Form.Item>

                <Form.Item label={ '是否公开' }>
                    <Switch checked={ this.state.formModelData.isPublic } onClick={ (e) => {
                        let formModelData = this.state.formModelData;
                        formModelData.isPublic = e;
                        this.setState({ formModelData });
                    } }/>
                </Form.Item>
            </Modal>
        </>;
    }
}
