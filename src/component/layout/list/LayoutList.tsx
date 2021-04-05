/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/12/8
 * Time: 3:29 下午
 */

import React, { Component } from 'react';
import { IComponentProps } from '@interface/common/component';
import style from './LayoutList.scss';
import { elementWrap, trigger } from '@src/utils';
import Search from 'antd/lib/input/Search';
import $ from 'jquery';
import { directiveForeach } from '@src/config/directive.config';
import { Inject } from 'typescript-ioc';
import { HttpClientService } from '@services/HttpClient.service';
import { ParserElementService } from '@services/ParserElement.service';

export default class LayoutList extends Component<IComponentProps, any> {

    private selectable = this.props.dataset.selectable;
    private single = this.props.dataset.single;       //是否单选
    private searchable = this.props.dataset.searchable;
    private url = this.props.dataset?.url;

    @Inject private readonly httpClientService: HttpClientService;
    @Inject private readonly parserElementService: ParserElementService;

    state = {
        searchText : '',
        subelements: this.props.subelements as Array<HTMLElement>,
    };

    constructor(props) {
        super(props);

        if (this.url) {

        }

        if (this.selectable) {
            this.renderSelect(this.props.subelements);
        }
    }

    componentDidMount() {
        if (this.props.dataset.url && this.state.subelements) {
            this.getLayoutListChildren().then(subelements => {
                this.setState({ subelements });
            });
        }
    }

    async getLayoutListChildren() {
        let { cols, space, url, item, index } = this.props.dataset;
        let subelements = this.state.subelements;
        let [right, bottom] = space;
        let width = cols === 1 ? '100%' : `calc(${ 100 / cols }% - ${ (right / 2) }px)`;
        let children: Array<HTMLElement> = [];

        if (url && subelements) {
            let template = subelements[0];
            let res = await this.httpClientService.jsonp(url);
            let data = res.status ? res.data : [];

            if (!template) {
                return [];
            }

            template.setAttribute(directiveForeach, `data as (${ item || 'default_item' },${ index || 'default_index' })`);
            let elements = this.parserElementService.parseElement(elementWrap(template), { data });
            let ch = [...elements.children] as Array<HTMLElement>;
            children.push(...ch);
        }
        return children;
    }

    renderSelect(subelements: Array<HTMLElement>) {
        let self = this;
        $(subelements).on('click', function (e) {

            e.stopPropagation();
            e.preventDefault();

            // 单选
            if (self.single) {
                if ($(this).hasClass(style.layoutListSelected)) {
                    $(this).removeClass(style.layoutListSelected);
                } else {
                    $(this).addClass(style.layoutListSelected).siblings().removeClass(style.layoutListSelected);
                }
            } else {        //多选
                if ($(this).hasClass(style.layoutListSelected)) {
                    $(this).removeClass(style.layoutListSelected);
                } else {
                    $(this).addClass(style.layoutListSelected);
                }
            }
            let list = $(this).parent().children('.' + style.layoutListSelected);
            let values = [...list].map(item => $(item).attr('value')).join(',');
            console.log('layout-list change:', values);
            trigger(self.props.el, values);
        });
    }

    createElements(count, width, bottom): Array<HTMLElement> {
        let elements: Array<HTMLElement> = [];
        for (let i = 0; i < count; i++) {
            let element = document.createElement('div');
            element.style.width = width;
            element.style.marginBottom = bottom + 'px';
            // element.style.visibility = 'hidden';
            elements.push(element);
        }
        return elements;
    }

    handleChange = e => {
        let value = e.target.value;
        this.setState({
            searchText: value,
        });
    };

    handleSearch = (value) => {
        this.setState({
            searchText: value,
        });
    };

    // (cols - 1) * (right / 2)
    render() {
        let { cols, space } = this.props.dataset;
        let [right, bottom] = space;

        // let { subelements } = this.props;
        let subelements = this.state.subelements;
        let width = cols === 1 ? '100%' : `calc(${ 100 / cols }% - ${ (right / 2) }px)`;
        let diff = cols - (subelements.length % cols);

        return <>
            { this.searchable
                ? <Search placeholder="input search text"
                          onSearch={ e => this.handleSearch(e) }
                          onChange={ e => this.handleChange(e) }
                          style={ { width: 200 } }/>
                : <></>
            }
            <div className={ style.layoutList } ref={ node => {
                if (!node) return;
                node.innerHTML = '';

                let children = subelements.map((element, index) => {
                    let search = element.innerText.includes(this.state.searchText);
                    if (search) {
                        element.style.width = width;
                        element.style.marginBottom = bottom + 'px';
                        $(element).addClass(style.layoutListChildren);
                        $(element).append(`<div class="${ style.layoutListSelectedIcon }">✅</div>`);
                        return element;
                    }
                }).filter(t => t) as Array<HTMLElement>;

                let elements = this.createElements(diff, width, bottom);        // 剩余补位的Elements元素

                node?.append(...children, ...elements);
            } }>
            </div>
        </>;
    }
}
