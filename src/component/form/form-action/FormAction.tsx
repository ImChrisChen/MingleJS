/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/21
 * Time: 12:35 上午
 */
import React, { Component } from 'react';
import { Button, Card, Form, Input, List, message, Modal, Select, Switch } from 'antd';
import $ from 'jquery';
import { IComponentProps } from '@interface/common/component';
import axios from 'axios';
import { trigger } from '@utils/trigger';
import SmartIcon from '@static/icons/form-smart.png';
import style from './FormAction.scss';
import { jsonp } from '@root/utils/request/request';
import { isEmptyObject } from '@utils/inspect';
import { arrayDeleteItem } from '@root/utils/util';
import { CloseSquareOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import App from '@root/src/App';

// 表格提交的数据
interface IFormData {
    [key: string]: string | any
}

interface IFormAction extends IComponentProps {
    layout?: 'vertical' | 'horizontal'
    async
}

interface ISmartItemAPI {
    isPrivate: boolean      // 是否是私有的
    name: string            // 标签名称
    publicUser: string      // 创建人名称
    selectTagId: string     // 唯一ID (删除需要)
    select: object       // 表单选择项
}

// data-smart icon
export function FormSmartIcon() {
    return <img className={ style.dataSmartIcons } src={ SmartIcon } alt="data-smart标志"/>;
}

// form-smart
class FormSmart extends Component<{ el: HTMLElement }, any> {

    state = {
        isModalVisible  : false,
        formSmartVisible: false,
        data            : [] as Array<ISmartItemAPI>,
        smartElements   : ([ ...this.props.el.querySelectorAll(`[name][data-smart=true]`) ] || []) as Array<HTMLInputElement>,
    };

    private form: any = React.createRef();

    constructor(props) {
        super(props);
    }

    handleToggle() {
        $('.form-smart-container').css('right', this.state.formSmartVisible ? -200 : 0);
        this.setState({ formSmartVisible: !this.state.formSmartVisible });
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

    // 创建标签
    async handleOk(e) {

        let formDataSmart = this.getFormDataSmart(this.state.smartElements);
        if (isEmptyObject(formDataSmart)) {
            message.warn('请选择要保存的表单选项');
            return;
        }

        let validName = this.form.current.getFieldValue('name');
        if (!validName) {
            message.error('请填写组合名称');
            return;
        }

        let { name, isPublic } = this.form.current.getFieldsValue();        // 获取表单字段
        let dataStr = this.formatDataString(formDataSmart);

        let url = `https://auc.local.aidalan.com/user.selectTag/save?public=${ Number(isPublic) }&name=${ name }${ dataStr }`;
        let res = await jsonp(url);
        if (res.status) {
            message.success('创建成功');
            let data = await this.getFormSmartList();
            this.setState({ isModalVisible: false, data });
        } else {
            message.error(res.msg ?? '创建失败');
        }
    }

    // 删除标签
    async handleDeleteSmart(id, e) {
        let url = `https://auc.local.aidalan.com/user.selectTag/delete?selectTagId=${ id }`;
        let res = await jsonp(url);

        if (res.status) {
            message.success('删除成功');
            let data = this.state.data;
            data = arrayDeleteItem(data, item => item.selectTagId === id);
            this.setState({ data });
        } else {
            message.error('删除失败');
        }
    }

    async getFormSmartList() {
        let formDataSmart = this.getFormDataSmart(this.state.smartElements);
        let names = this.formatDataString(formDataSmart);
        let url = `https://auc.local.aidalan.com/user.selectTag/lists?keys=${ names }`;
        let res = await jsonp(url);
        return res.status ? res.data : [];
    }

    // {pf: 1} => key[pf]=1
    formatDataString(formDataSmart: {}): string {
        let str = '';
        for (const key in formDataSmart) {
            let value = formDataSmart[key];
            str += `&key[${ key }]=${ value }`;
        }
        return str;
    }

    // 选择列表(自动填充表单)
    handleSelectSmart(index, e) {
        let current = this.state.data?.[index];
        let selects = current.select;
        let el = this.props.el;
        for (const name in selects) {
            if (!selects.hasOwnProperty(name)) continue;
            let value = selects[name];
            let input = el.querySelector(`[data-fn][name=${ name }]`) as HTMLInputElement;
            // TODO 填充时如果 input有data-exec属性 会立即执行查询
            trigger(input, value);
        }
    }

    handleShowModal() {
        let formDataSmart = this.getFormDataSmart(this.state.smartElements);
        if (isEmptyObject(formDataSmart)) {
            message.warn('请选择要保存的表单选项');
            return;
        }
        this.setState({ isModalVisible: true });
    }

    handleCancel() {
        this.setState({ isModalVisible: false });
    }

    render() {
        return this.state.smartElements.length > 0 ? <>
            {/*  列表区域 */ }
            <div className={ 'form-smart-container ' + style.formSmart }
                 style={ { right: this.state.formSmartVisible ? 0 : -200 } }>
                <div style={ { position: 'relative' } }>
                    <List dataSource={ this.state.data }
                          size="small"
                          bordered
                          renderItem={ (item, index) =>
                              <List.Item onClick={ e => this.handleSelectSmart(index, e) }>
                                  <List.Item.Meta
                                      style={ { cursor: 'pointer' } }
                                      title={ <div style={ {
                                          display       : 'flex',
                                          justifyContent: 'space-between',
                                          alignItems    : 'center',
                                      } }>
                                          <span>{ item.name }</span>
                                          <CloseSquareOutlined
                                              hidden={ !item.isPrivate }
                                              onClick={ e => this.handleDeleteSmart(item.selectTagId, e) }/>
                                      </div> }
                                      description={ <>
                                          <span>创建人:{ item.publicUser }</span>
                                          <br/>
                                          <span>是否公开:{ !item.isPrivate ? 'true' : 'false' }</span>
                                      </> }
                                  />
                              </List.Item>
                          }
                    />
                    <Button onClick={ () => this.handleShowModal() }
                            type={ 'primary' }> 保存 </Button>
                </div>
                <Button onClick={ this.handleToggle.bind(this) }
                        className={ style.formSmartToggleBtn }> { this.state.formSmartVisible ?
                    <MenuUnfoldOutlined/> : <MenuFoldOutlined/> }
                </Button>
            </div>

            {/* 弹出区域 */ }
            <Modal title="提交组合信息" visible={ this.state.isModalVisible }
                   getContainer={ this.props.el }
                   onOk={ this.handleOk.bind(this) }
                   onCancel={ this.handleCancel.bind(this) }>
                <Form ref={ this.form }>

                    <Form.Item label={ '组合名称' } required name={ 'name' }>
                        <Input placeholder="请输入组合名称"/>
                    </Form.Item>

                    <Form.Item label={ '是否公开' } name={ 'isPublic' }>
                        <Switch defaultChecked={ false }/>
                    </Form.Item>

                </Form>
            </Modal>
        </> : '';
    }
}

export default class FormAction extends React.Component<IFormAction, any> {

    state = {};

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

    // type=submit
    public async handleSubmit(form, e) {
        e.preventDefault();

        let { url, method, headers, msgfield, showmsg } = this.props.dataset;
        let formData = await FormAction.getFormData(form);
        console.log(formData);

        let verify = this.verifyFormData(form, formData);

        if (verify) {

            // 加载 table,chart,list 数据
            this.getViewsInstances().then(async instances => {
                for (const instance of instances) {
                    await instance?.FormSubmit?.(formData);
                }
            });

            if (url) {
                let res = await axios({
                    url,
                    method,
                    headers: headers || { 'Content-Type': 'application/json' },
                    data   : formData,
                });

                if (showmsg) {
                    if (res.data.status) {
                        message.success(res?.data?.[msgfield] ?? '操作成功');
                        await this.handleReset(form);
                    } else {
                        message.error(res?.data?.[msgfield] ?? '操作失败');
                    }
                }

            }
        }
    }

    // 获取关联的table ，chart， list 的实例
    async getViewsInstances() {
        let id = this.props.id;
        if (!id) {
            return [];
        }
        let App = (await import('@src/App')).default;

        // table chart list
        let views = [ ...document.querySelectorAll(`[data-from=${ id }]`) ];
        return views.map(view => {
            let uid = view.getAttribute('data-component-uid') ?? '';
            return App.instances[uid]?.instance;
        }).filter(r => r);      // 没有 data-component-uid 则过滤出去
    }

    // 表单重置 type=reset , 获取DOM默认值 和 config默认值 生成默认值进行填充表单
    async handleReset(form: HTMLElement, e?: any) {
        let formItems = [ ...form.querySelectorAll(`[name][data-fn]`) ] as Array<HTMLInputElement>;
        for (const formItem of formItems) {
            let property = await App.parseElementProperty(formItem);        // 默认属性
            let value = property.value;
            formItem && trigger(formItem, value);
        }
    }

    verifyFormData(formElement, formData): boolean {
        let unVerifys: Array<string> = [];

        for (const name in formData) {
            if (!formData.hasOwnProperty(name)) continue;
            let value = formData[name];
            let formItemElem: HTMLElement = formElement.querySelector(`[name=${ name }][data-fn]`);
            let required = eval(formItemElem.dataset.required + '');
            if (required && !value) {
                unVerifys.push(name);
            }
        }

        if (unVerifys.length > 0) {
            message.error(`${ unVerifys.join(',') }的值为空`);
            return false;
        }
        return true;
    }

    // 获取处理formGroup数据
    public static async getFormGroupData(form) {
        let formGroup = form.querySelector('[data-fn=form-group]');

        if (!formGroup) {
            return {};
        }

        let name = formGroup?.getAttribute('name') ?? '';
        let formGroupItems: Array<HTMLElement> = [ ...formGroup.querySelectorAll(`.form-group .form-group-item`) ];
        let formGroupData: Array<object> = [];
        for (const formGroupItem of formGroupItems) {
            let itemData = await this.getDataByElement(formGroupItem, true);
            formGroupData.push(itemData);
        }
        return {
            [name]: formGroupData,
        };
    }

    // 获取表单数据
    public static async getFormData(form: HTMLElement): Promise<IFormData> {

        let formData = await this.getDataByElement(form);

        // 处理 data-fn=form-group内的组件
        let formGroupData = await this.getFormGroupData(form);

        return Object.assign(formData, formGroupData);
    }

    public static async getDataByElement(form: HTMLElement, force = false): Promise<IFormData> {
        let formData: IFormData = {};
        // 处理流程控制时 过滤掉被隐藏的DOM(防止数据污染)
        let hideInput = $(form).find('.form-tabpanel:hidden').find('[data-fn][name]');
        let hideInputName = hideInput.attr('name');

        let formItems = [ ...form.querySelectorAll(`[data-fn][name]`) ] as Array<HTMLInputElement>;
        for (const formItem of formItems) {
            let { name, value } = formItem;
            let isFormGroup = $(formItem).parents('[data-fn=form-group]').length > 0;

            // force强制获取name值 如果是form-group内的组件则跳过
            if (!force && isFormGroup) {
                continue;
            }

            // TODO 在 非input 元素中编写name 属性时需要通过 getAttirbute 属性获取
            name = name ? name : formItem.getAttribute('name') ?? '';

            // 把 layout-tab 隐藏的内容中的input框不加入form表单的提交
            if (name === hideInputName) {
                console.log('被隐藏区域的input', hideInputName, formItem);
                continue;
            }

            // TODO input value值为空的时候，去加载config中的默认值 ,例如时间选择器 , value为空，但是有默认时间
            formData[name] = value || (await App.parseElementProperty(formItem)).value;
        }
        return formData;
    }

    setLayout(formElement: HTMLElement) {
        let layout = this.props.dataset.layout;

        if (layout === 'horizontal') {
            $(formElement).css({ display: 'flex', flexWrap: 'wrap' });
        }

        if (layout === 'vertical') {
            console.log(formElement);
        }
    }

    render() {
        return <>
            <FormSmart el={ this.props.el }/>
        </>;
    }
}
