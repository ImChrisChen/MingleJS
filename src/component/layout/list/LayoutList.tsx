/** * Created by WebStorm. * User: MacBook * Date: 2020/12/8 * Time: 3:29 下午 */import React, { Component } from 'react';import { IComponentProps } from '@interface/common/component';import style from './LayoutList.scss';import { trigger } from '@utils/trigger';export default class LayoutList extends Component<IComponentProps, any> {    private selectable = this.props.dataset.selectable;    private single = this.props.dataset.single;       //是否单选    constructor(props) {        super(props);        let self = this;        if (this.selectable) {            $(this.props.elChildren).on('click', function (e) {                // 单选                if (self.single) {                    if ($(this).hasClass(style.layoutListSelected)) {                        $(this).removeClass(style.layoutListSelected);                    } else {                        $(this).addClass(style.layoutListSelected).siblings().removeClass(style.layoutListSelected);                    }                } else {        //多选                    if ($(this).hasClass(style.layoutListSelected)) {                        $(this).removeClass(style.layoutListSelected);                    } else {                        $(this).addClass(style.layoutListSelected);                    }                }                let list = $(this).parent().children('.' + style.layoutListSelected);                let values = [ ...list ].map(item => $(item).attr('value')).join(',');                console.log('layout-list change:', values);                trigger(self.props.el, values);            });        }    }    createElements(count, width, bottom): Array<HTMLElement> {        let elements: Array<HTMLElement> = [];        for (let i = 0; i < count; i++) {            let element = document.createElement('div');            element.style.width = width;            element.style.marginBottom = bottom + 'px';            element.style.visibility = 'hidden';            elements.push(element);        }        return elements;    }    // (cols - 1) * (right / 2)    render() {        let { cols, space } = this.props.dataset;        let [ right, bottom ] = space;        let { elChildren } = this.props;        let width = cols === 1 ? '100%' : `calc(${ 100 / cols }% - ${ (right / 2) }px)`;        let diff = cols - (elChildren.length % cols);        return <div className={ style.layoutList } ref={ node => {            elChildren.forEach((element, index) => {                element.style.width = width;                element.style.marginBottom = bottom + 'px';                $(element).addClass(style.layoutListChildren);                $(element).append(`<div class="${ style.layoutListSelectedIcon }"></div>`);            });            let elements = this.createElements(diff, width, bottom);            node?.append(...[ ...elChildren, ...elements ]);        } }>        </div>;    }}