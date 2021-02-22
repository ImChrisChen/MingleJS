/** * Created by WebStorm. * User: MacBook * Date: 2020/11/19 * Time: 3:05 下午 */import React, { Component } from 'react';import { IComponentProps } from '@interface/common/component';import style from './AppMenu.scss';import LayoutMenu from '@src/private-component/views/layout-menu/LayoutMenu';import { formatList2Tree, formatTreeKey } from '@utils/format-data';import { Inject } from 'typescript-ioc';import { HttpClientService } from '@services/HttpClient.service';export default class AppMenu extends Component<IComponentProps, any> {    @Inject private readonly httpClientService: HttpClientService;    private fs;    state = {        systems : [],        current : 0,        url     : '',        menulist: [],    };    constructor(props) {        super(props);        this.getSystems().then(data => {            console.log(data);            this.setState({ systems: data });        });    }    async getSystems() {        let { url } = this.props.dataset;        let res = await this.httpClientService.jsonp(url);        return res.status ? res.data : [];    }    renderSystems() {        let bgColor = 'FFF';        let borderColor = 'CCC';        let textColor = '999';        return this.state.systems.map((system: any, i) => {            return <li key={ system.appId } className={ style.system }                       style={ { background: i === this.state.current ? '#000' : 'transparent' } }                       onClick={ e => this.handleClickSystem(i, e) }>                <img src={                    `https://auc.aidalan.com/app/icon?color=${ bgColor },${ borderColor },${ textColor }&str=2&appId=${ system.appId }`                } alt=""/>            </li>;        });    }    async handleClickSystem(i, e) {        let url = `https://auc.aidalan.com/user.menu/lists`;        let res = await this.httpClientService.jsonp(`${ url }?appId=${ i }`);        let data = res.status ? res.data : [];        let menulist = formatList2Tree(data, {            id  : 'appMenuId',            pid : 'r_father',            name: 'name',        });        menulist = formatTreeKey(menulist, {            id  : 'appMenuId',            pid : 'r_father',            name: 'name',        }, {            id  : 'value',            name: 'label',            pid : 'pid',        });        this.setState({            current: i,            menulist,        });    }    render() {        return <>            <div style={ { display: 'flex' } }>                <ul style={ { width: 40 } }>                    { this.renderSystems() }                </ul>                <LayoutMenu                    key={ this.state.current }                    width={ this.props.dataset.width }                    data={ this.state.menulist }                    open={ this.props.dataset.open }                    layout={ this.props.dataset.layout }                    pathfield={ this.props.dataset.pathfield }/>            </div>        </>;    }}