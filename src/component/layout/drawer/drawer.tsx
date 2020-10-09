/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/7
 * Time: 3:43 下午
 */

import { Button, Col, Drawer, Form, Radio, Row, Select, Switch } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React from 'react';
import componentMap from '@root/config/component.config';
import CodeEditor from "@component/code/editor/CodeEditor";

interface IComponentProps {
    el: string
    label: string
    value: string
    options: Array<any>

    [key: string]: any
}

const { Option } = Select;

export default class LayoutDrawer extends React.Component<any, any> {
    private template = `<input data-fn="form-button" data-enum="1,Apple;2,iOS" />`;
    state = {
        visible              : true,
        components           : this.getComponents(),
        componentUseHtml     : '',
        currentComponentProps: [],
    };

    constructor(props) {
        super(props);
    }

    showDrawer = () => {
        this.setState({
            visible: true,
        });
    };

    onClose = () => {
        this.setState({
            visible: false,
        });
    };

    getComponents() {
        let components: Array<any> = [];
        for (const key in componentMap) {
            if (!componentMap.hasOwnProperty(key)) continue;
            let value = componentMap[key];
            for (const k in value) {
                let v = value[k];
                components.push({
                    label: key + '-' + k,
                    value: key + '-' + k,
                    props: v.props,
                });
            }
        }
        return JSON.parse(JSON.stringify(components));
    }

    handleChangeComponent(e, v) {
        let props = v.props;

        let arr: Array<IComponentProps> = [];
        for (const k in props) {
            if (!props.hasOwnProperty(k)) continue;
            let v = props[k];
            arr.push({
                label  : k,       //
                el     : v.el,
                options: v.options,
                value  : v.value,
            });
        }
        this.setState({ currentComponentProps: arr });
    }

    handleChangeSelect(index, e) {
        let value = e.target.value;
        let currentComponentProps: Array<IComponentProps> = this.state.currentComponentProps;
        currentComponentProps[index].value = value;
        this.setState({ currentComponentProps })
        this.generateCode();
    }

    handleChangeSwitch(index, e) {
        let currentComponentProps: Array<IComponentProps> = this.state.currentComponentProps;
        currentComponentProps[index].value = e;
        this.setState({ currentComponentProps })
        this.generateCode()
    }

    handleSubmit() {
        this.generateCode()
    }

    // 生成代码
    generateCode() {
        let components: Array<IComponentProps> = this.state.currentComponentProps;
        let attrs = components.map(item => `data-${ item.label }="${ item.value }"`).join(' ');
        let componentUseHtml = this.template.replace(/data-fn="(.*?)"/, v => v + ' ' + attrs);
        console.log(componentUseHtml);
        this.setState({ componentUseHtml })
    }

    render() {
        return (
            <>
                <Button type="primary" onClick={ this.showDrawer }>
                    <PlusOutlined/> New account
                </Button>

                <Drawer
                    title="组件设计器"
                    width={ 600 }
                    onClose={ this.onClose }
                    visible={ this.state.visible }
                    bodyStyle={ { paddingBottom: 80 } }
                    mask={ false }
                    footer={
                        <div
                            style={ {
                                textAlign: 'right',
                            } }
                        >
                            <Button onClick={ this.onClose } style={ { marginRight: 8 } }>
                                Cancel
                            </Button>
                            <Button onClick={ this.handleSubmit.bind(this) } type="primary">
                                Submit
                            </Button>
                        </div>
                    }
                >
                    <Form layout="vertical" hideRequiredMark>
                        <Row gutter={ 24 }>
                            <Col span={ 18 }>
                                <Form.Item
                                    name="owner"
                                    label="Owner"
                                    rules={ [ { required: true, message: 'Please select an owner' } ] }
                                >
                                    <Select placeholder="Please select an owner" options={ this.state.components }
                                            onChange={ this.handleChangeComponent.bind(this) }>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        {
                            ...this.state.currentComponentProps.map((item: any, key) => {
                                if (item.el === 'switch') {
                                    return <Row key={ key }>
                                        <Col span={ 18 }>
                                            <Form.Item label={ item.label }>
                                                <Switch checked={ item.value }
                                                        onChange={ this.handleChangeSwitch.bind(this, key) }/>
                                            </Form.Item>
                                        </Col>
                                    </Row>;
                                } else if (item.el === 'radio') {
                                    return <Row key={ key }>
                                        <Col span={ 18 }>
                                            <Form.Item label={ item.label }>
                                                <Radio.Group
                                                    onChange={ this.handleChangeSelect.bind(this, key) }
                                                    options={ item.options }
                                                    value={ item.value }
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>;
                                }
                            })
                        }
                        <Row hidden={ true } gutter={ 24 }>
                            <Col span={ 18 }>
                                <Form.Item
                                    name="type"
                                    label="Type"
                                    rules={ [ { required: true, message: 'Please choose the type' } ] }
                                >
                                    <Select placeholder="Please choose the type">
                                        <Option value="private">Private</Option>
                                        <Option value="public">Public</Option>
                                    </Select>
                                </Form.Item>
                            </Col>

                        </Row>

                        <Row gutter={ 16 }>
                            <Col span={ 24 }>
                                <Form.Item
                                    name="description"
                                    label="Description"
                                    rules={ [
                                        {
                                            required: true,
                                            message : 'please enter url description',
                                        },
                                    ] }
                                >
                                    <CodeEditor dataset={ {
                                        value: this.state.componentUseHtml
                                    } }/>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Drawer>
            </>
        );
    }
}
