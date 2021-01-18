/** * Created by WebStorm. * User: MacBook * Date: 2020/12/25 * Time: 5:30 下午 */import { Form, Input, Button, Space } from 'antd';import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';import React, { Component } from 'react';import { IComponentProps } from '@interface/common/component';import App from '@src/App';export default class FormGroup extends Component<IComponentProps, any> {    state = {};    constructor(props) {        super(props);        FormGroup.getPropertyByElement(this.props.el).then(components => {            console.log(components);        });    }    public static async getPropertyByElement(formGroup: HTMLElement) {        let $inputs = [ ...$(formGroup).children('[name][data-fn]') ];        let components: Array<any> = [];        for (const input of $inputs) {            let property = await App.parseElementProperty(input);            components.push(property);        }        return components;    }    handleFinsh(values) {        console.log('Received values of form:', values);    };    render() {        return <Form name="dynamic_form_nest_item" onFinish={ e => this.handleFinsh(e) } autoComplete="off">            <Form.List name="users">                { (fields, { add, remove }) => (                    <>                        { fields.map(field => (                            <Space key={ field.key } style={ { display: 'flex', marginBottom: 8 } } align="baseline">                                <Form.Item                                    { ...field }                                    name={ [ field.name, 'first' ] }                                    fieldKey={ [ field.fieldKey, 'first' ] }                                    rules={ [ { required: true, message: 'Missing first name' } ] }                                >                                    <Input placeholder="First Name"/>                                </Form.Item>                                <Form.Item                                    { ...field }                                    name={ [ field.name, 'last' ] }                                    fieldKey={ [ field.fieldKey, 'last' ] }                                    rules={ [ { required: true, message: 'Missing last name' } ] }                                >                                    <Input placeholder="Last Name"/>                                </Form.Item>                                <MinusCircleOutlined onClick={ () => remove(field.name) }/>                            </Space>                        )) }                        <Form.Item>                            <Button type="dashed" onClick={ () => add() } block icon={ <PlusOutlined/> }>                                Add field                            </Button>                        </Form.Item>                    </>                ) }            </Form.List>            <Form.Item>                <Button type="primary" htmlType="submit">                    Submit                </Button>            </Form.Item>        </Form>;    }}