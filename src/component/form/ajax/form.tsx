/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/21
 * Time: 12:35 上午
 */
import React from 'react';
import { message } from 'antd';
import $ from 'jquery';

export default class FormAjax extends React.Component<any, any> {
    submitBtn;

    constructor(props) {
        super(props);
        this.init();
    }

    private init() {
        let { async } = this.props.dataset;
        let form: HTMLFormElement = this.props.el;
        form.onsubmit = async function (e) {
            async && e.preventDefault();

            let $elements = $(this).find(`[name]`);
            $elements.each((index, el) => {
                let name = $(el).attr('name');
                let value = $(el).val();
                console.log(name, value);
            });

            message.info('提交表单');
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
