/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/7
 * Time: 3:43 下午
 */

import { Button, Cascader, Col, Drawer, Form, Input, Radio, Row, Select, Space, Switch } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import React from 'react';
import componentMap from '@root/config/component.config';
import CodeEditor from '@component/code/editor/CodeEditor';
import { FormInstance } from 'antd/lib/form';
import { parseEnum } from '@utils/tpl-parse';
import { componentFormatTree, formatEnumOptions } from '@utils/format-value';
import { arraylastItem } from '@root/utils/util';
import { withRouter } from 'react-router-dom';

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

class LayoutDrawer extends React.Component<any, any> {
    private template = `<input data-fn="form-button" />`;
    private form: any = React.createRef<FormInstance>();
    state = {
        visible: true,

        components        : this.getComponents(),
        componentsProperty: [],          // 组件dataset

        componentUseCode  : '',          // 生成的组件代码
        componentName     : '',          // 组件名称
        componentInitValue: '',          // 组件初始值

        componentsTree: [],
        dataEnum      : [
            // { label: 'Android', value: '1' },
            // { label: 'iOS', value: '2' },
        ],
    };

    constructor(props) {
        super(props);
        componentFormatTree(componentMap).then(tree => {
            this.setState({
                componentsTree: tree,
            });
        });
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

    setAttributeValue(index, value) {
        let componentsProperty: Array<IComponentDataset> = this.state.componentsProperty;
        componentsProperty[index].value = value;
        this.setState({ componentsProperty });
    }

    getComponents(): Array<any> {
        let components: Array<any> = [];
        for (const key in componentMap) {
            if (!componentMap.hasOwnProperty(key)) continue;
            let value = componentMap[key];
            for (const k in value) {
                if (!value.hasOwnProperty(k)) continue;

                let v = value[k];
                components.push({
                    label   : key + '-' + k,
                    value   : key + '-' + k,
                    property: v.property,
                });
            }
        }
        return JSON.parse(JSON.stringify(components));
    }

    // 选择组件
    handleChangeComponent(e, v) {
        let componentName = e.join('-');
        let currentComponent = arraylastItem<any>(v);
        if (!currentComponent.property) {
            console.error('请配置组件的proerty属性');
            this.setState({
                componentsProperty: [],
                componentName,
            }, () => this.generateCode());
            return false;
        }

        let { dataset, hook, ...attrs } = currentComponent.property;
        let arr: Array<IComponentDataset> = [];
        let dataEnum: Array<any> = [];

        for (const k in dataset) {
            if (!dataset.hasOwnProperty(k)) continue;
            let val = dataset[k];

            if (k === 'enum') {
                dataEnum = formatEnumOptions(parseEnum(val.value));           // 1,Android;2,iOS => // [{label:'',value:''}]
            }

            arr.push({
                label  : `data-${ k }`,       //
                el     : val.el,
                options: val.options,
                value  : val.value,
                render : val.render !== false,
            });
        }

        for (const k in attrs) {
            if (!attrs.hasOwnProperty(k)) continue;
            let val = attrs[k];
            // value值的有选范围的时候
            if (k === 'value' && val.el !== 'input') {
                val.options = dataEnum;
            }

            arr.push({
                label  : k,
                el     : val.el,
                options: val.options,
                value  : val.value,
                render : val.render !== false,
            });
        }

        for (const k in hook) {
            if (!hook.hasOwnProperty(k)) continue;
            let val = hook[k];
            arr.push({
                label  : `hook:${ k }`,
                el     : val.el,
                options: val.options,
                value  : val.value,
                render : val.render !== false,
            });
        }

        // TODO setState: 异步更新 https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/18
        this.setState({
            componentsProperty: arr,
            componentName,
            dataEnum,
        }, () => this.generateCode());

        this.props.history.push(componentName)
    }


    handleChangeRadio(index, e) {
        let value = e.target.value;
        this.setAttributeValue(index, value);
        this.generateCode();
    }

    handleChangeSwitch(index, value) {
        this.setAttributeValue(index, value);
        this.generateCode();
    }

    handleSubmit() {
        this.generateCode();
    }

    // 生成代码
    generateCode() {
        let components: Array<IComponentDataset> = this.state.componentsProperty;
        let funcNames: Array<object> = [];
        let attrs = components.map(item => {
            if (!item.render) {
                return undefined
            }

            if (item.label.includes('hook:')) {
                let [ , hookName ] = item.label.split(':');
                let funcName = item.value;
                funcNames.push({ funcName, hookName });
            }

            if (item.value) {
                return `${ item.label }="${ item.value || '' }"`;
            } else {
                return undefined;
            }
        }).filter(t => t).join(' ');

        let componentUseCode = this.template.replace(/data-fn="(.*?)"/, v => {
            v = v.replace(/data-fn="(.*?)"/, `data-fn="${ this.state.componentName }"`);      //替换组件名称
            return `${ v } ${ attrs }`;
        });

        if (componentUseCode.includes('hook:')) {
            let funcs = funcNames.map((item: any) => {
                let { funcName, hookName } = item;
                if (funcName) {
                    return `function ${ funcName }() {
                        Message.success("触发组件钩子 ${ hookName }");
                    }\n`;
                } else {
                    return undefined;
                }
            }).filter(t => t);
            componentUseCode += `\n<script> \n ${ funcs.join('\n') } \n</script>`;
        }

        this.setState({ componentUseCode });

        // TODO setState 后 initValues 不生效的的解决方案 https://www.cnblogs.com/lanshu123/p/10966395.html
        this.form.current.resetFields();
    }

    handleFormListAdd(index, add) {
        this.handleFormListGetDataEnum(index).then(r => add());
        // add();
    }

    handleFormListRemove(index, remove, fieldName) {
        remove(fieldName);
        this.handleFormListGetDataEnum(index);
    }

    async handleFormListGetDataEnum(index) {
        let dataEnum = this.form.current.getFieldValue('dataEnum').filter(item => item);            // 把undefined过滤出去
        let enumStr = dataEnum.map(item => `${ item.value },${ item.label }`).join(';');
        let componentsProperty: Array<IComponentDataset> = this.state.componentsProperty;

        // data-enum 动态修改来来，value的options也要修改
        let valueProps: any = componentsProperty.find(item => item.label === 'value');
        valueProps.options = dataEnum;

        componentsProperty[index].value = enumStr;
        await this.setState({
            componentsProperty,
            dataEnum,
        });
        this.generateCode();
    }

    // input
    handleInputChange(index, e) {
        let value = e.target.value;
        this.setAttributeValue(index, value);
    }

    handleInputBlur(index, e) {
        let value = e.target.value;
        this.setAttributeValue(index, value);
        this.generateCode();
    }

    handleChangeSelect(index, value) {
        this.setAttributeValue(index, value);
        this.generateCode();
    }

    async setDataEnum() {
        let dataEnum = this.form.current.getFieldValue('dataEnum').filter(item => item);
        await this.setState({ dataEnum });
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any) {

    }

    render() {
        return (
            <>
                <Button type="primary" onClick={ this.showDrawer }>
                    <PlusOutlined/> New account
                </Button>

                <Drawer
                    title="组件设计器"
                    width={ '40%' }
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
                        <Row hidden={ true } gutter={ 24 }>
                            <Col span={ 18 }>
                                <Form.Item
                                    label="组件名称"
                                    rules={ [ { required: true, message: '请选择组件' } ] }
                                >
                                    <Select placeholder="请选择组件" options={ this.state.components }
                                            onChange={ this.handleChangeComponent.bind(this) }>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={ 24 }>
                            <Col span={ 18 }>
                                <Form.Item
                                    label="组件名称"
                                    rules={ [ { required: true, message: '请选择组件' } ] }>
                                    <Cascader options={ this.state.componentsTree }
                                              onChange={ this.handleChangeComponent.bind(this) }
                                              placeholder="请选择组件"/>
                                </Form.Item>
                            </Col>
                        </Row>

                        {
                            ...this.state.componentsProperty.map((item: any, key) => {
                                if (item.render === false) return '';

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
                                    return <Row key={ key }>
                                        <Col span={ 18 }>
                                            <Form.Item label={ item.label }>
                                                <Input onChange={ this.handleInputChange.bind(this, key) }
                                                       onBlur={ this.handleInputBlur.bind(this, key) }
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
                                                        allowClear={ true }
                                                        showSearch={ true }
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
                                    label="对应代码"
                                >
                                    <CodeEditor dataset={ {
                                        value: this.state.componentUseCode,
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

export default withRouter(LayoutDrawer)
