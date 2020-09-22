/** * Created by WebStorm. * User: MacBook * Date: 2020/9/22 * Time: 10:44 下午 */import React from "react";import { Switch } from "antd";import { trigger } from "@utils/trigger";export default class FormSwitch extends React.Component<any, any> {    state: any = {        attr: {            value            : this.props.el.value ?? false,            checkedChildren  : "开启",            unCheckedChildren: "关闭",            checked          : this.props.value,            size             : this.props.state        }    }    handleChange(value) {        this.setState({            attr: { value }        })        trigger(this.props.el, value)    }    render() {        return <>            <Switch                onChange={ this.handleChange.bind(this) }                { ...this.state.attr }            />        </>;    }}