/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/21
 * Time: 12:35 上午
 */
import React from 'react';
import { elementParseVirtualDOM } from '@utils/dom-parse';
import { Form } from "antd";

export default class FormAjax extends React.Component<any, any> {
    submitBtn;

    constructor(props) {
        super(props);
        this.init();
    }

    private init() {
        let submitBtn: HTMLElement = this.props.box.querySelector('[type=submit]');
        let box = this.props.box;
        let form: HTMLFormElement = this.props.el;
        form.onsubmit = async function (e) {
            e.preventDefault();
            console.log(e);

            // let url: string = form.getAttribute('action') ?? '';
            // let res = await Axios.get(url);
            // console.log(res);
            return false;
        };

        console.log(submitBtn);
        this.submitBtn = elementParseVirtualDOM(submitBtn);
        console.log(this.submitBtn);
    }

    render() {
        // {}
        return <>
            { this.submitBtn }
            <Form>
            </Form>
        </>;
    }
}
