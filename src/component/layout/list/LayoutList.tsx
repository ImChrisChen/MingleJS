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
import { Inject } from 'typescript-ioc';
import { HttpClientService, ParserElementService } from '@src/services';

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

        if (this.selectable) {
            this.renderSelect(this.props.subelements);
        }
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
            let values = [ ...list ].map(item => $(item).attr('value')).join(',');
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
            element.style.opacity = '0';
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
        let { cols, space, height } = this.props.dataset;
        let [ right, bottom ] = space;

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
                    if (height) element.style.height = height + 'px';

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
