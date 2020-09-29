/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/21
 * Time: 12:35 上午
 */
import React from 'react';
import { message } from "antd";

export default class FormAjax extends React.Component<any, any> {
    submitBtn;

    constructor(props) {
        super(props);
        this.init();
    }

    private init() {
        let form: HTMLFormElement = this.props.el;
        form.onsubmit = async function (e) {
            // e.preventDefault();
            console.log(e);

            message.info('提交表单')
            // let url: string = form.getAttribute('action') ?? '';
            // let res = await Axios.get(url);
            // console.log(res);
            // return false;
        };
    }

    render() {
        return <>

        </>;
    }
}
