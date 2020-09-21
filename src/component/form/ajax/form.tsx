/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/21
 * Time: 12:35 上午
 */
import React from 'react';
import { elementParseVirtualDOM } from '@utils/dom-parse';
import Axios from 'axios';

export default class FormAjax extends React.Component<any, any> {
    submitBtn;

    constructor(props) {
        super(props);
        this.init();
    }

    private init() {
        let submitBtn: HTMLElement = this.props.el.querySelector('[type=submit]');
        let form: HTMLFormElement = this.props.el;
        form.onsubmit = async function (e) {
            e.preventDefault();

            let url: string = form.getAttribute('action') ?? '';
            let res = await Axios.get(url);
            console.log(res);
        };

        this.submitBtn = elementParseVirtualDOM(submitBtn);
    }

    render() {
        return <>
            { this.submitBtn }
        </>;
    }
}
