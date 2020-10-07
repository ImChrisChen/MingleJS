/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/7
 * Time: 3:43 下午
 */

import { Button, Col, Drawer, Form, Input, Radio, Row, Select, Switch } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React from 'react';
import componentMap from '@root/config/component.config';


const { Option } = Select;

export default class LayoutDrawer extends React.Component<any, any> {
    state = {
        visible              : true,
        components           : this.getComponents(),
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
        console.log(props);

        let arr: Array<object> = [];
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

    handleChangeSelect(e) {
        console.log(arguments);
    }

    handleChangeSwitch(e) {
        console.log(e);
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
                            <Button onClick={ this.onClose } type="primary">
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
                                    return <Row key={ key } onChange={ this.handleChangeSwitch.bind(this) }>
                                        <Col span={ 18 }>
                                            <Form.Item label={ item.label }>
                                                <Switch checked={ item.value }/>
                                            </Form.Item>
                                        </Col>
                                    </Row>;
                                } else if (item.el === 'radio') {
                                    return <Row key={ key }>
                                        <Col span={ 18 }>
                                            <Form.Item label={ item.label }>
                                                <Radio.Group
                                                    onChange={ this.handleChangeSelect.bind(this) }
                                                    options={ item.options }
                                                    value={ item.value }
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>;
                                }
                            })
                        }
                        <Row gutter={ 24 }>
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
                                    <Input.TextArea rows={ 4 } placeholder="please enter url description"/>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Drawer>
            </>
        );
    }
}
