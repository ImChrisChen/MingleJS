/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/5
 * Time: 2:48 下午
 */
import React, { Component } from 'react';
import { Button, message, Modal, Spin } from 'antd';
import { INativeProps } from '@interface/common/component';
import Draggable from 'react-draggable';
import './LayoutWindow.css';
import ReactDOM from 'react-dom';
import { FormatDataService, HttpClientService } from '@src/services';
import { Inject } from 'typescript-ioc';
import { AMIS_DOMAIN } from '@src/config';
import { isString, vnodeToElement } from '@src/utils';
import { MingleJS } from '@src/core/MingleJS';
import FormAction from '@component/form/form-action/FormAction';
import App, { DataComponentUID } from '@src/App';
import { IEntityOperationMode } from '@src/config/interface';

interface IPrivateLayoutWindow extends INativeProps {
    onOk?: (...args) => any
}

export default class LayoutWindow {

    @Inject private readonly formatDataService: FormatDataService;
    @Inject private readonly httpClientService: HttpClientService;

    public static instance;
    public tableUID: string;            // 表格 data-component-uid
    public entityID: string;
    public entityMode: IEntityOperationMode;         // 实体模式 'create' | 'update'
    public uid: string;                              // 表格中row的id, 只有编辑的时候才有UID

    // TODO 使用单例模式，复用一个弹窗(但是Layoutwindow还是实例化多个) (减少内存消耗)
    constructor(private readonly props: INativeProps) {
        this.props = props;

        let tableEl = $(this.props.el).closest('data-table');
        this.tableUID = tableEl.attr(DataComponentUID) ?? '';

        // 若实体是在表格中的，那就直接获取表格上的实体ID
        this.entityID = tableEl.attr('data-entity_id') ?? '';  // this.entityID = this.props.dataset.entity_id || tableEntityID;

        this.entityMode = this.props.dataset.entity_mode;
        this.uid = this.props.dataset.uid;

        this.props.el.addEventListener('click', e => this.handleClickBtn(e, this.tableUID));

        /**
         * --------------------------- Single Model --------------------------------------
         */
        if (!LayoutWindow.instance) {
            this.renderLayoutWindow();
            window.addEventListener('message', e => {
                let { type } = e.data;
                if (type === 'CloseWindow') {
                    LayoutWindow.instance.setState({ visible: false });     //关闭弹窗
                }
            });

        }
    }

    // 获取实体配置
    async getEntityConfig(id: string): Promise<any> {
        let res = await this.httpClientService.get(`${ AMIS_DOMAIN }/api/page/${ id }`);
        if (res.status) {
            let contents = res.data.contents;
            if (isString(contents)) {
                try {
                    res.data.contents = JSON.parse(res.data.contents);
                } catch(e) {
                    console.warn(e);
                }
            }
        }
        return res.status ? res.data : {};
    }

    // 获取表格行详情
    async getRowDetail(uid: string): Promise<any> {
        let res = await this.httpClientService.get(`//amis.local.superdalan.com/api/random/${ uid }`);
        return res.status ? res.data : {};
    }

    // 编辑表格行
    async editRowDetail(uid: string, data: object): Promise<any> {
        return await this.httpClientService.put(`//amis.local.superdalan.com/api/random/${ uid }`, data);
    }

    // 新增表格行
    async createRowDetail(data: object): Promise<any> {
        let res = await this.httpClientService.post('//amis.local.superdalan.com/api/random', data);
        return res.status ? res.data : {};
    }

    handleClickOk = async e => {
        // 实体点击OK触发操作
        let entityID = LayoutWindow.instance.state.entityID;
        let entityMode = LayoutWindow.instance.state.entityMode;
        if (entityID) {
            // 弹窗的Form
            let form = document.querySelector('.layout-modal-window form-action') as HTMLElement;
            if (form) {
                let formData = FormAction.getFormData(form);
                let tableUID = document.querySelector('data-table')?.getAttribute(DataComponentUID) ?? '';
                let tableInstance = App.getInstance(tableUID ?? '').instance;
                console.log(tableInstance);
                if (entityMode === 'create') {
                    let res = await this.createRowDetail(formData);
                    if (res.id) {
                        message.success('添加成功');
                        console.log(tableInstance, formData);
                        tableInstance?.handleReload();
                    } else {
                        message.error('添加失败');
                    }
                }
                if (entityMode === 'update') {
                    let res = await this.editRowDetail(this.uid, formData);
                    if (res.status) {
                        message.success('修改成功');
                        tableInstance?.handleReload();
                    } else {
                        message.error('修改失败');
                    }
                }
            }
        }
    };

    handleClickBtn(e: MouseEvent, tableUID: string) {
        e.preventDefault();
        this.handleShowModel(tableUID);
    }

    // 点击弹窗
    async handleShowModel(tableUID) {

        /**
         * --------------------------- iframe 弹窗形式 --------------------------------------
         */
        let prevUrl = LayoutWindow.instance.state.iframeUrl;

        let currentUrl = this.props.el.getAttribute('href') ?? window.location.href;
        let iframeHidden = true;

        if (prevUrl === currentUrl) {
            iframeHidden = false;
        }

        // TODO 如果 layout-window上使用了 entityid，那么这个页面会被判定为实体去打开，触发Mingle的逻辑
        if (this.entityID) {

            // 优化: 如果当前弹窗的实体id和现在的实体id一致说明无变化
            // if (this.entityID === LayoutWindow.instance.state.entity_id && this.entityMode === LayoutWindow.instance.state.entity_mode) {
            //     await LayoutWindow.instance.setState({
            //         visible     : true,
            //         iframeHidden: false,
            //         isEntity    : true,
            //     });
            //     return;
            // }

            // 1. 先弹窗，显示loading 等
            await LayoutWindow.instance.setState({
                visible     : true,
                iframeHidden: true,
                isEntity    : true,
                entityID    : this.entityID,
                entityMode  : this.entityMode,
                dataUID     : tableUID,
                submit      : this.props.dataset.submit,
                cancel      : this.props.dataset.cancel,
            });

            // 2. 请求接口获取数据(生成实体页面元素)
            let data = await this.getEntityConfig(this.entityID);

            // 3. 关闭loading
            await LayoutWindow.instance.setState({
                iframeHidden: false,
                title       : `${ data.name } - ${ this.entityMode === 'create' ? '创建' : '编辑' }`, // 实体名称
            });

            // 4. 解析json渲染页面
            // TODO 性能优化: 不用 ref={} 获取DOM 实例 而在这里去操作DOM是因为，避免每次setState都会去执行渲染，避免造成大量计算
            let el = document.querySelector('.layout-window-content-entity');
            if (el) {
                el.innerHTML = '';
                let node = vnodeToElement(data.contents, true); // isInit = true,清空默认值

                // 实体如果是编辑模式，则需要查询到默认值进行回显操作
                if (this.entityMode === 'update') {
                    let formData = await this.getRowDetail(this.uid); // {}
                    for (let key in formData) {
                        if (!formData.hasOwnProperty(key)) continue;
                        let value = formData[key];

                        let formItem = node.querySelector(`[name=${ key }]`) as HTMLElement;
                        if (!formItem) continue;
                        formItem?.setAttribute('value', value);
                        formItem['value'] = value;
                    }
                }

                // 如果是实体创建，则初始化表单中的value值为空
                el.append(node);
                new MingleJS({ el: node });
            }

        } else {
            // iframe
            LayoutWindow.instance.setState({
                // 在a标签时可以不用设置,设置后其他标签也通用 <button data-fn="layout-window" href='https://baidu.com'>btn</button>
                iframeUrl   : currentUrl,
                visible     : true,     //弹窗显示
                isEntity    : false,
                entity_id   : '',
                entity_mode : 'update',
                iframeHidden: iframeHidden,     //弹窗内容iframe隐藏,等iframe 加载完成后再显示
                title       : this.props.dataset.title,
                dataUID     : '',
                submit      : this.props.dataset.submit,
                cancel      : this.props.dataset.cancel,
            });
        }
    };

    renderLayoutWindow() {
        let container = document.createElement('div');
        ReactDOM.render(<PrivateLayoutWindow onOk={ this.handleClickOk } ref={ instance => {
            LayoutWindow.instance = instance;
        } } { ...this.props } />, container);
        document.body.append(container);
    }
}

class PrivateLayoutWindow extends Component<IPrivateLayoutWindow, any> {

    state = {
        loading     : false,
        visible     : this.props.dataset.open ?? false,
        width       : this.props.dataset.width ?? 600,
        height      : this.props.dataset.height ?? 400,
        iframeHidden: false,
        disabled    : true,
        iframeUrl   : '',
        title       : this.props.dataset.title,
        isEntity    : true,     // 是否是实体
        entityMode  : 'update' as IEntityOperationMode,       // 实体的操作模式
        entityID    : '',
        dataUID     : '',
        submit      : false,
        cancel      : false,
    };

    constructor(props) {
        super(props);
    }

    handleOk = async () => {
        this.setState({ loading: true });
        try {
            await this.props.onOk?.();
            this.setState({ loading: false, visible: false });
        } catch(e) {
            this.setState({ loading: false });
        }
    };

    handleCancel = () => {
        this.setState({ visible: false });
    };

    renderIframeContent() {
        return <iframe
            className="layout-window-iframe"
            style={ { minHeight: this.state.height, opacity: this.state.iframeHidden ? 0 : 1 } }
            onLoad={ () => this.setState({ iframeHidden: false }) }
            src={ this.state.iframeUrl }
        />;
    }

    renderElementContent() {
        return <div className="layout-window-content-entity"/>;
    }

    render() {
        let { submit, cancel } = this.state;
        return <Modal
            className="layout-modal-window"
            visible={ this.state.visible }
            mask={ this.props.dataset.mask ?? false }
            getContainer={ document.querySelector('#WIN') as HTMLElement }
            // transitionName=""
            // maskTransitionName=""
            title={ <div
                onMouseOverCapture={ () => {
                    if (this.state.disabled) {
                        this.setState({ disabled: false });
                    }
                } }
                onMouseOutCapture={ () => {
                    this.setState({ disabled: true });
                } }
                style={ { width: '100%', cursor: 'move' } }
                onMouseOver={ () => {
                    if (this.state.disabled) {
                        this.setState({ disabled: false });
                    }
                } }
                onMouseOut={ () => {
                    this.setState({ disabled: true });
                } }
            >{ this.state.title }</div> }
            width={ 1000 }
            onOk={ this.handleOk }
            onCancel={ this.handleCancel.bind(this) }
            modalRender={ modal => <Draggable disabled={ this.state.disabled }>{ modal }</Draggable> }
            footer={
                (!submit && !cancel)
                    ? null
                    : [
                        <Button hidden={ !cancel } key="back" onClick={ this.handleCancel }>取消</Button>,
                        <Button hidden={ !submit } key="submit" type="primary" loading={ this.state.loading }
                                onClick={ this.handleOk }>
                            提交
                        </Button>,
                    ]
            }
        >
            <Spin spinning={ this.state.iframeHidden }>
                { this.state.isEntity ? this.renderElementContent() : this.renderIframeContent() }
                {/*<div ref={ element => element?.append(...this.props.subelements) }/>*/ }
            </Spin>
        </Modal>;
    }

}

