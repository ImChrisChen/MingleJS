/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/7
 * Time: 3:43 下午
 */

import { Button, Col, Drawer, Form, Input, Radio, Row, Select, Space, Switch } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import React from 'react';
import componentMap from '@root/config/component.config';
import CodeEditor from '@component/code/editor/CodeEditor';
import { FormInstance } from 'antd/lib/form';

interface IComponentDataset {
    el: string
    label: string
    value: string
    options: Array<any>

    [key: string]: any
}

interface IComponentAttrs {

}


const { Option } = Select;

export default class LayoutDrawer extends React.Component<any, any> {
    private template = `<input data-fn="form-button" />`;
    private form: any = React.createRef<FormInstance>();
    state = {
        visible                  : true,
        components               : this.getComponents(),
        componentUseHtml         : '',          // 生成的组件代码
        currentComponentDataset  : [],          // 组件dataset
        currentComponentName     : '',          // 组件名称
        currentComponentInitValue: '',          // 组件初始值
        dataEnum                 : [
            { label: 'Android', value: '1' },
            { label: 'iOS', value: '2' },
        ],
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
                if (!value.hasOwnProperty(k)) continue;

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

    // 选择组件
    handleChangeComponent(e, v) {
        let { dataset, ...attrs } = v.props;

        let arr: Array<IComponentDataset> = [];
        for (const k in dataset) {
            if (!dataset.hasOwnProperty(k)) continue;
            let v = dataset[k];
            arr.push({
                label  : `data-${ k }`,       //
                el     : v.el,
                options: v.options,
                value  : v.value,
            });
        }

        for (const k in attrs) {
            if (!attrs.hasOwnProperty(k)) continue
            let v = attrs[k];
            arr.push({
                label  : k,
                el     : v.el,
                options: v.options,
                value  : v.value
            });
        }

        console.log(attrs);

        // TODO setState: 异步更新 https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/18
        this.setState({
            currentComponentDataset: arr,
            currentComponentName   : e,
        }, () => this.generateCode());

    }

    handleChangeRadio(index, e) {
        let value = e.target.value;
        let currentComponentDataset: Array<IComponentDataset> = this.state.currentComponentDataset;
        currentComponentDataset[index].value = value;
        this.setState({ currentComponentDataset });
        this.generateCode();
    }

    handleChangeSwitch(index, e) {
        let currentComponentDataset: Array<IComponentDataset> = this.state.currentComponentDataset;
        currentComponentDataset[index].value = e;
        this.setState({ currentComponentDataset });
        this.generateCode();
    }

    handleSubmit() {
        this.generateCode();
    }

    // 生成代码
    generateCode() {
        let components: Array<IComponentDataset> = this.state.currentComponentDataset;

        let attrs = components.map(item => `${ item.label }="${ item.value || '' }"`).join(' ');

        let componentUseHtml = this.template.replace(/data-fn="(.*?)"/, v => {
            v = v.replace(/data-fn="(.*?)"/, `data-fn="${ this.state.currentComponentName }"`);      //替换组件名称
            return `${ v } ${ attrs }`
        });

        this.setState({ componentUseHtml });

    }

    handleFormListAdd(index, add) {
        this.handleFormListGetDataEnum(index);
        add();
    }

    handleFormListRemove(index, remove, fieldName) {
        remove(fieldName);
        this.handleFormListGetDataEnum(index);
    }

    handleFormListGetDataEnum(index) {
        let dataEnum = this.form.current.getFieldValue('dataEnum').filter(item => item);            // 把undefined过滤出去
        console.log(dataEnum);

        let enumStr = dataEnum.map(item => `${ item.value },${ item.label }`).join(';');
        console.log(enumStr);

        let currentComponentDataset: Array<IComponentDataset> = this.state.currentComponentDataset;
        currentComponentDataset[index].value = enumStr;
        this.setState({ currentComponentDataset });
        this.generateCode();
    }

    handleInputChange(index, e) {
        let value = e.target.value;
        let currentComponentDataset: Array<IComponentDataset> = this.state.currentComponentDataset;
        currentComponentDataset[index].value = value;
        this.setState({ currentComponentDataset });
    }

    handleInputBlur() {
        this.generateCode();
    }

    handleChangeSelect(index, e) {
        console.log(e);
        let currentComponentDataset: Array<IComponentDataset> = this.state.currentComponentDataset;
        currentComponentDataset[index].value = e;
        this.setState({ currentComponentDataset });
        this.generateCode();
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
                    <Form layout="vertical"
                          hideRequiredMark
                          ref={ this.form }
                          initialValues={ {
                              dataEnum: this.state.dataEnum,
                          } }
                    >
                        <Row gutter={ 24 }>
                            <Col span={ 18 }>
                                <Form.Item
                                    name="componentName"
                                    label="组件名称"
                                    rules={ [ { required: true, message: '请选择组件' } ] }
                                >
                                    <Select placeholder="请选择组件" options={ this.state.components }
                                            onChange={ this.handleChangeComponent.bind(this) }>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        {
                            ...this.state.currentComponentDataset.map((item: any, key) => {
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
                                                    onChange={ this.handleChangeRadio.bind(this, key) }
                                                    options={ item.options }
                                                    value={ item.value }
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>;
                                } else if (item.el === 'list') {
                                    return <Row key={ key }>
                                        <Col span={ 18 }>
                                            <Form.Item label={ item.label } name={ item.label }>
                                                <Form.List name="dataEnum">
                                                    { (fields, { add, remove }) => {
                                                        return (
                                                            <div>
                                                                { fields.map(field => (
                                                                    <Space key={ field.key }
                                                                           style={ {
                                                                               display     : 'flex',
                                                                               marginBottom: 8,
                                                                           } }
                                                                           align="start">
                                                                        <Form.Item
                                                                            { ...field }
                                                                            name={ [ field.name, 'value' ] }
                                                                            fieldKey={ [ field.fieldKey, 'value' ] }
                                                                            rules={ [ {
                                                                                required: true,
                                                                                message : 'Missing value',
                                                                            } ] }
                                                                        >
                                                                            <Input placeholder="value"/>
                                                                        </Form.Item>
                                                                        <Form.Item
                                                                            { ...field }
                                                                            name={ [ field.name, 'label' ] }
                                                                            fieldKey={ [ field.fieldKey, 'label' ] }
                                                                            rules={ [ {
                                                                                required: true,
                                                                                message : 'Missing label',
                                                                            } ] }
                                                                        >
                                                                            <Input placeholder="label"/>
                                                                        </Form.Item>

                                                                        <MinusCircleOutlined
                                                                            onClick={ this.handleFormListRemove.bind(this, key, remove, field.name) }
                                                                        />
                                                                    </Space>
                                                                )) }

                                                                <Form.Item>
                                                                    <Button
                                                                        type="dashed"
                                                                        onClick={ this.handleFormListAdd.bind(this, key, add) }
                                                                        block
                                                                    >
                                                                        <PlusOutlined/> 保存
                                                                    </Button>
                                                                </Form.Item>
                                                            </div>
                                                        );
                                                    } }
                                                </Form.List>
                                            </Form.Item>
                                        </Col>
                                    </Row>;
                                } else if (item.el === 'input') {
                                    console.log(item);
                                    return <Row key={ key }>
                                        <Col span={ 18 }>
                                            <Form.Item label={ item.label }>
                                                <Input onChange={ this.handleInputChange.bind(this, key) }
                                                       onBlur={ this.handleInputBlur.bind(this) }
                                                       value={ item.value }
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>;
                                } else if (item.el === 'select') {
                                    return <Row key={ key }>
                                        <Col span={ 18 }>
                                            <Form.Item label={ item.label }>
                                                <Select options={ item.options }
                                                        onChange={ this.handleChangeSelect.bind(this, key) }
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>;

                                }
                            })
                        }

                        <Row gutter={ 16 }>
                            <Col span={ 24 }>
                                <Form.Item
                                    name="generateCode"
                                    label="对应代码"
                                >
                                    <CodeEditor dataset={ {
                                        value: this.state.componentUseHtml,
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
