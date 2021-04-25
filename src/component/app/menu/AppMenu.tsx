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

    private colorUrl = `https://auc.aidalan.com/app/icon`;
    private menuUrl = `https://auc.aidalan.com/user.menu/apps`;

    state = {
        systems   : [],
        current   : 3,
        menulist  : [],
        hoverColor: '',
    };

    constructor(props) {
        super(props);
        this.getSystems().then(data => {
            let findIndex = data.findIndex(item => item.host === location.host);
            let current = this.state.current;
            if (findIndex !== -1) {
                current = findIndex;
            }

            this.setState({
                systems: data,
            });
            this.handleClickSystem(current, data[current]);
        });
    }

    async getSystems() {
        // let { url } = this.props.dataset;
        let res = await this.httpClientService.jsonp(this.props.dataset.menu_url||this.menuUrl);
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
        let url = `https://auc.aidalan.com/user.menu/lists`;
        let res = await this.httpClientService.jsonp(`${ this.props.dataset.menu_list_url|| url }?appId=${ system.appId }`);
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
    }

    render() {
        return <>
            <div style={ { display: 'flex' } }>

                <ul style={ { width: 40 } }> { this.renderSystems() } </ul>

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
