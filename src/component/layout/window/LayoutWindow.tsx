/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/5
 * Time: 2:48 下午
 */
import React, { Component } from 'react';
import { Button, Modal, Spin } from 'antd';
import { INativeProps, IVnode } from '@interface/common/component';
import Draggable from 'react-draggable';
import './LayoutWindow.css';
import ReactDOM from 'react-dom';
import { FormatDataService, HttpClientService } from '@src/services';
import { Inject } from 'typescript-ioc';
import { BaseUrl, IEntityOperationMode } from '@src/config';
import { isEmptyObject, isString, vnodeToElement } from '@src/utils';
import { Mingle } from '@src/core/Mingle';

interface IPrivateLayoutWindow extends INativeProps {

}

export default class LayoutWindow {

    @Inject private readonly formatDataService: FormatDataService;
    @Inject private readonly httpClientService: HttpClientService;

    public static instance;
    public entityid: string;
    public mode: IEntityOperationMode;         // 实体模式 'create' | 'update'

    // TODO 使用单例模式，复用一个弹窗(但是Layoutwindow还是实例化多个) (减少内存消耗)
    constructor(private readonly props: INativeProps) {
        this.props = props;
        this.entityid = this.props.dataset.entityid;
        this.mode = this.props.dataset.mode;

        this.props.el.addEventListener('click', e => this.handleClickBtn(e));

        /**
         * --------------------------- Single Model --------------------------------------
         */
        if (!LayoutWindow.instance) {
            this.renderLayoutWindow();
        }
    }

    // 获取实体配置
    public async getEntityConfig(id: string): Promise<any> {
        let res = await this.httpClientService.get(`${ BaseUrl }/api/page/${ id }`);
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

    handleClickBtn(e: MouseEvent) {
        e.preventDefault();
        this.handleShowModel();
    }

    async handleShowModel() {

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
        if (this.entityid) {

            // 优化: 如果当前弹窗的实体id和现在的实体id一致说明无变化
            if (this.entityid === LayoutWindow.instance.state.entityid && this.mode === LayoutWindow.instance.state.mode) {
                await LayoutWindow.instance.setState({
                    visible     : true,
                    iframeHidden: false,
                    isEntity    : true,
                });
                return;
            }

            // 1. 先弹窗，显示loading 等
            await LayoutWindow.instance.setState({
                visible     : true,
                iframeHidden: true,
                isEntity    : true,
                entityid    : this.entityid,
                mode        : this.mode,
            });

            // 2. 请求接口获取数据
            let data = await this.getEntityConfig(this.entityid);
            console.log(data);

            // 3. 关闭loading
            await LayoutWindow.instance.setState({
                iframeHidden: false,
                title       : `${ data.name } - ${ this.mode === 'create' ? '创建' : '编辑' }`, // 实体名称
            });

            // 4. 解析json渲染页面
            // TODO 性能优化: 不用 ref={} 获取DOM 实例 而在这里去操作DOM是因为，避免每次setState都会去执行渲染，避免造成大量计算
            let el = document.querySelector('.layout-window-content-entity');
            if (el) {
                el.innerHTML = '';
                let node = vnodeToElement(data.contents, this.mode === 'create'); // isInit = true 如果是实体创建，则初始化表单中的value值为空
                el.append(node);
                new Mingle({ el: node });
            }

        } else {
            // iframe
            LayoutWindow.instance.setState({
                // 在a标签时可以不用设置,设置后其他标签也通用 <button data-fn="layout-window" href='https://baidu.com'>btn</button>
                iframeUrl   : currentUrl,
                visible     : true,     //弹窗显示
                isEntity    : false,
                entityid    : '',
                mode        : 'update',
                iframeHidden: iframeHidden,     //弹窗内容iframe隐藏,等iframe 加载完成后再显示
                title       : this.props.dataset.title,
            });
        }
    };

    renderLayoutWindow() {
        if (!document.querySelector('.layout-window-container')) {
            let container = document.createElement('div');
            container.classList.add('layout-window-container');
            document.body.append(container);
            ReactDOM.render(<PrivateLayoutWindow ref={ instance => {
                LayoutWindow.instance = instance;
            } } { ...this.props } />, container);
        }
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
        mode        : 'update' as IEntityOperationMode,       // 实体的操作模式
    };

    constructor(props) {
        super(props);
    }

    handleOk() {
        this.setState({ loading: true });
        setTimeout(() => {
            this.setState({ loading: false, visible: false });
        }, 3000);
    };

    handleCancel() {
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
        return <Modal
            visible={ this.state.visible }
            mask={ this.props.dataset.mask ?? false }
            getContainer={ document.querySelector('#WIN') as HTMLElement }
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
            onOk={ this.handleOk.bind(this) }
            onCancel={ this.handleCancel.bind(this) }
            modalRender={ modal => <Draggable disabled={ this.state.disabled }>{ modal }</Draggable> }
            footer={
                [
                    <Button key="back" onClick={ this.handleCancel.bind(this) }>
                        Return
                    </Button>,
                    <Button key="submit" type="primary" loading={ this.state.loading }
                            onClick={ this.handleOk.bind(this) }>
                        Submit
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

