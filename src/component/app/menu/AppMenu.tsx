/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/11/19
 * Time: 3:05 下午
 */
import React, { Component } from 'react';
import { IComponentProps } from '@interface/common/component';
import style from './AppMenu.scss';
import LayoutMenu from '@src/private-component/views/layout-menu/LayoutMenu';
import { Inject } from 'typescript-ioc';
import { FormatDataService, HttpClientService } from '@src/services';

export default class AppMenu extends Component<IComponentProps, any> {

    @Inject private readonly httpClientService: HttpClientService;
    @Inject private readonly formatDataService: FormatDataService;

    private systemUrl = this.props.dataset.system_url;
    private colorUrl = `https://auc.local.aidalan.com/app/icon`;
    private simple = this.props.dataset.simple;
    private menuUrl = this.props.dataset.url;

    state = {
        systems   : [],
        current   : 0,
        menulist  : [],
        hoverColor: '',
    };

    constructor(props) {
        super(props);

        // 复杂模式，则渲染 系统和菜单
        if (this.simple) {
            this.getMenuList().then(data => {
                let menulist = this.listToTreeList(data, { id: 'appMenuId', pid: 'r_father' });
                // 数据key值转化
                menulist = this.formatDataService.treeKeyReplace(menulist, {
                    id  : 'appMenuId',
                    pid : 'r_father',
                    name: 'name',
                }, {
                    id  : 'value',
                    name: 'label',
                    pid : 'pid',
                });

                this.setState({ menulist });
            });
        } else {
            this.getSystems().then(data => {

                // 优先级 缓存 => domain => 默认值
                let systemActive = localStorage.getItem('system_active');

                let current = this.state.current;
                if (systemActive) {
                    let i = data.findIndex(item => item.host === systemActive);
                    if (i !== -1) current = i;
                } else {
                    let i = data.findIndex(item => item.host === location.host);
                    if (i !== -1) current = i;
                }

                this.setState({ systems: data }, async () => {
                    await this.handleClickSystem(current, data[current]);
                });
            });
        }
    }

    async getMenuList() {
        let res = await this.httpClientService.jsonp(this.menuUrl);
        return res.status ? res.data : [];
    }

    async getSystems() {
        // let { url } = this.props.dataset;
        let res = await this.httpClientService.jsonp(this.systemUrl);
        return res.status ? res.data : [];
    }

    renderSystems() {
        let { bgcolor, bordercolor, activecolor, textcolor } = this.props.dataset;
        [ , bgcolor ] = bgcolor.split('#');
        [ , textcolor ] = textcolor.split('#');
        [ , bordercolor ] = bordercolor.split('#');

        let url = `${ this.colorUrl }?color=${ bgcolor },${ bordercolor },${ textcolor }&str=2&appId=`;
        return this.state.systems.map((system: any, i) => {
            return <li key={ system.appId }
                       className={ style.system }
                       style={ {
                           background: i === this.state.current ? activecolor : '#' + bgcolor,
                       } }
                       onClick={ e => this.handleClickSystem(i, system) }
            >
                <img src={ url + system.appId } alt=""/>
            </li>;
        });
    }

    format(list) {
        for (const item of list) {
            let isroot = (item) => Number(item.r_father) === 0;
            if (isroot(item)) {
                item.children = [];
            }
        }
    }

    listToTreeList(list, { id, pid }) { // 将普通列表转换为树结构的列表
        if (!list || !list.length) {
            return [];
        }
        let treeListMap = {};
        for (let item of list) {
            treeListMap[item[id]] = item;
        }
        for (let i = 0; i < list.length; i++) {
            if (list[i][pid] && treeListMap[list[i][pid]]) {
                if (!treeListMap[list[i][pid]].children) {
                    treeListMap[list[i][pid]].children = [];
                }
                treeListMap[list[i][pid]].children.push(list[i]);
                list.splice(i, 1);
                i--;
            }
        }
        return list;
    }

    async handleClickSystem(i, system) {
        let res = await this.httpClientService.jsonp(`${ this.menuUrl }?appId=${ system.appId }`);
        let data = res.status ? res.data : [];

        // list 转为 tree
        let menulist = this.listToTreeList(data, { id: 'appMenuId', pid: 'r_father' });
        // let menulist = this.formatDataService.list2Tree(data, {
        //     id  : 'appMenuId',
        //     pid : 'r_father',
        //     name: 'name',
        // });

        // 数据key值转化
        menulist = this.formatDataService.treeKeyReplace(menulist, {
            id  : 'appMenuId',
            pid : 'r_father',
            name: 'name',
        }, {
            id  : 'value',
            name: 'label',
            pid : 'pid',
        });

        this.setState({
            current: i,
            menulist,
        });
        localStorage.setItem('system_active', system.host);
    }

    render() {
        return <>
            <div style={ { display: 'flex' } }>

                { !this.simple ? <ul style={ { width: 40 } }> { this.renderSystems() } </ul> : '' }

                <LayoutMenu
                    key={ this.state.current }
                    width={ this.props.dataset.width }
                    data={ this.state.menulist }
                    open={ this.props.dataset.open }
                    layout={ this.props.dataset.layout }
                    pathfield={ this.props.dataset.pathfield || 'url' }/>

            </div>
        </>;
    }

}
