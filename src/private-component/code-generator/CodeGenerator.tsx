/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/7
 * Time: 1:37 下午
 */

import {
    Button,
    Card,
    Cascader,
    Col,
    Form,
    Input,
    InputNumber,
    message,
    Radio,
    Row,
    Select,
    Slider,
    Space,
    Switch,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import React, { Component, PureComponent } from 'react';
import componentConfig, { IOptions, IPropertyConfig } from '@root/config/component.config';
import CodeEditor from '@component/code/editor/CodeEditor';
import { FormInstance } from 'antd/lib/form';
import { parseEnum } from '@utils/parser-tpl';
import { formatComponents2Tree, formatEnumOptions } from '@utils/format-data';
import { arraylastItem } from '@root/utils/util';
import { withRouter } from 'react-router';
import { jsonp } from '@utils/request/request';
import { isObject, isString, isUndefined } from '@utils/inspect';
import { SketchPicker } from 'react-color';
import style from './CodeGenerator.scss';
import { ExecCode } from '@src/private-component/exec-code/ExecCode';

interface IComponentDataset {
    el: string
    label: string
    value: string
    options: Array<any>

    [key: string]: any
}

interface IComponentProperty extends IPropertyConfig {
    defaultValue: any
}

interface ICodeGenerateProps {
    name?: string
    config?: any
    visibleCode?: boolean
    onGenerateCode?: (code: string) => void
}

class CodeGenerator extends PureComponent<ICodeGenerateProps, any> {
    private form: any = React.createRef<FormInstance>();

    state = {
        components        : this.getComponents(),
        componentsProperty: [],          // 组件dataset

        componentUseCode  : '',          // 生成的组件代码
        componentName     : '',          // 组件名称
        componentInitValue: '',          // 组件初始值
        currentComponent  : null,         // 当前选择的组件

        componentsTree: [],
        dataEnum      : [
            // { label: 'Android', value: '1' },
            // { label: 'iOS', value: '2' },
        ],
    };

    constructor(props) {
        super(props);
        formatComponents2Tree(componentConfig).then(tree => {
            console.log(tree);
            this.setState({
                componentsTree: tree,
            });
        });
    }

    setAttributeValue(index, value) {
        let componentsProperty: Array<IComponentDataset> = this.state.componentsProperty;
        componentsProperty[index].value = value;
        this.setState({ componentsProperty });
        console.log(componentsProperty[index]);
    }

    getComponents(): Array<any> {
        let components: Array<any> = [];
        for (const key in componentConfig) {
            if (!componentConfig.hasOwnProperty(key)) continue;
            let value = componentConfig[key];
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

    //  区分form组件 和其他组件的调用标签 input  / div
    getTemplate(componentName) {
        let [ group ] = componentName.split('-');
        if (group === 'form') {
            return '<input data-fn="form-button" />';
        } else {
            return '<div data-fn="form-button" ></div>';
        }
    }

    async reloadChangeComponent(componentName: string, currentComponent) {

        let fieldOptions: Array<IOptions> = [];
        if (!currentComponent.property) {
            console.error(`组件:${ componentName }请配置组件的proerty属性`);
            this.setState({
                componentsProperty: [],
                currentComponent,
                componentName,
            }, () => this.generateCode());
            return false;
        }

        let { dataset, hook, ...attrs } = currentComponent.property;
        let arr: Array<IComponentProperty> = [];
        let dataEnum: Array<any> = [];

        // dataset 属性
        for (const k in dataset) {
            if (!dataset.hasOwnProperty(k)) continue;
            let val: IComponentProperty = dataset[k];

            // TODO 当值为函数时，执行函数
            if (typeof val.value === 'function') {
                val.value = val.value();
            }

            if (k === 'url' && val.request) {
                let res = await jsonp(val.value);
                let dataItem = res.status ? res?.data[0] : undefined;
                if (dataItem && isObject(dataItem)) {
                    for (const itemKey in dataItem) {
                        if (!dataItem.hasOwnProperty(itemKey)) continue;
                        fieldOptions.push({ label: itemKey, value: itemKey });
                    }
                }
            }

            if (k === 'enum') {
                dataEnum = formatEnumOptions(parseEnum(val.value));           // 1,Android;2,iOS => // [{label:'',value:''}]
            }

            // value验证不通过
            if (!(val.verify && val.verify(val.value))) {

            }

            let options = val.options;
            let el = val.el;

            if (options === 'fromUrl') {
                if (fieldOptions.length > 0) {
                    options = fieldOptions;
                    el = 'select-multiple';
                }
            }

            arr.push({
                label       : `data-${ k }`,       //
                el          : el,
                options     : options,
                value       : val.value,
                defaultValue: val.value,
                desc        : val.desc,
                render      : val.render !== false,
            });
        }

        // 普通属性
        for (const k in attrs) {
            if (!attrs.hasOwnProperty(k)) continue;
            let val = attrs[k];

            // TODO 当值为函数时，执行函数
            if (typeof val.value === 'function') {
                val.value = val.value();
            }

            // value值的有选范围的时候
            if (k === 'value' && val.el !== 'input') {
                val.options = dataEnum;
            }

            arr.push({
                label       : k,
                el          : val.el,
                options     : val.options,
                value       : val.value,
                defaultValue: val.value,
                desc        : val.desc,
                render      : val.render !== false,
            });
        }

        // 钩子属性
        for (const k in hook) {
            if (!hook.hasOwnProperty(k)) continue;
            let val = hook[k];
            arr.push({
                label       : `hook:${ k }`,
                el          : val.el,
                options     : val.options,
                value       : val.value,
                defaultValue: val.value,
                desc        : val.desc,
                render      : val.render !== false,
            });
        }

        // TODO setState: 异步更新 https://github.com/Advanced-Frontend/Daily-Interview-Question/issues/18
        this.setState({
            componentsProperty: arr,
            componentName,
            dataEnum,
        }, () => this.generateCode());
    }

    // 组件的Props更新时触发
    componentWillReceiveProps(nextProps: Readonly<ICodeGenerateProps>, nextContext: any) {
        let { name, config } = nextProps;
        if (name && config) {
            console.log('-------------');
            this.reloadChangeComponent(name, config);
        }
    }

    // 选择组件
    async handleChangeComponent(e, v) {
        console.log(v);
        let componentName = e.join('-');
        let currentComponent = arraylastItem<any>(v);
        this.reloadChangeComponent(componentName, currentComponent);
    }

    handleChangeRadio(index, e) {
        let value = e.target.value;
        this.setAttributeValue(index, value);
        this.generateCode();
    }

    handleChangeSwitch(index, value) {
        console.log(value);
        this.setAttributeValue(index, value);
        this.generateCode();
    }

    handleSubmit() {
        this.generateCode();
    }

    // 生成代码
    generateCode() {
        message.success('generate');
        let components: Array<IComponentDataset> = this.state.componentsProperty;
        let funcNames: Array<object> = [];
        let componentName = this.state.componentName;
        let template = this.getTemplate(componentName);
        console.log(template, componentName);

        // 处理属性,生成属性代码
        let attrs = components.map(item => {
            if (!item.render) {
                return undefined;
            }

            if (item.label.includes('hook:')) {
                let [ , hookName ] = item.label.split(':');
                let funcName = item.value;
                funcNames.push({ funcName, hookName });
            }

            // TODO 后续需要完善，选中的值如果和默认值相等，就不用生成对应的属性代码
            // 有属性默认值则，生成对应的属性代码
            if (isUndefined(item.value) || item.value === '' // || (item.value === item.defaultValue)
            ) {
                return undefined;
            } else {
                return `${ item.label }='${ item.value ?? '' }'\n\t`;
            }
        }).filter(t => t).join(' ');

        // 正则替换生成代码
        let componentUseCode = template.replace(/data-fn="(.*?)"/, v => {
            v = v.replace(/data-fn="(.*?)"/, `data-fn='${ this.state.componentName }'\n\t`);      //替换组件名称
            return `${ v } ${ attrs }`;
        });

        // 生成钩子函数代码
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

        this.props.onGenerateCode?.(componentUseCode);
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
        console.log(index, e);
        let value = e.target.value;
        console.log(value);
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

    handleSliderChange(index, value) {
        // console.log(value);
        // this.setAttributeValue(index);
    }

    handleChangeColor(index, value) {
        console.log(index, value.hex);
        this.setAttributeValue(index, value.hex);
        this.generateCode();
    }

    async setDataEnum() {
        let dataEnum = this.form.current.getFieldValue('dataEnum').filter(item => item);
        await this.setState({ dataEnum });
    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any) {

    }

    renderSwitch(key, item) {
        return <Switch
            checked={ item.value }
            onChange={ this.handleChangeSwitch.bind(this, key) }/>;
    }

    renderRadio(key, item) {
        return <Radio.Group
            onChange={ this.handleChangeRadio.bind(this, key) }
            options={ item.options }
            value={ item.value }
        />;
    }

    renderNumberInput(key, item) {
        return <InputNumber
            min={ 50 } max={ 800 } defaultValue={ 3 }
            step={ 10 }
            onChange={ e => {
                this.setAttributeValue(key, e);
                this.generateCode();
            } }
            value={ item.value }
        />;
    }

    renderList(key, item) {
        return <Form.List name="dataEnum">
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
        </Form.List>;
    }

    renderInput(key, item) {
        console.log(item);
        return <Input
            onChange={ this.handleInputChange.bind(this, key) }
            onBlur={ this.handleInputBlur.bind(this, key) }
            value={ item.value }
        />;
    }

    renderSelect(key, item) {
        return <Select
            options={ item.options }
            onChange={ this.handleChangeSelect.bind(this, key) }
            allowClear={ true }
            showSearch={ true }
            value={ item.value }
        />;
    }

    renderSelectMultiple(key, item) {
        if (item.value === '') {
            item.value = [];
        }
        return <Select
            options={ item.options }
            mode="multiple"
            onChange={ this.handleChangeSelect.bind(this, key) }
            allowClear={ true }
            showSearch={ true }
            value={ item.value }
        />;
    }

    renderSlider(key, item) {
        return <Slider
            defaultValue={ 30 }
            tooltipVisible
            max={ 1000 }
            min={ 200 }
            onChange={ this.handleSliderChange.bind(this, key) }/>;
    }

    renderColorPicker(key, item) {
        return <SketchPicker
            color={ item.value }
            onChangeComplete={ this.handleChangeColor.bind(this, key) }
        />;
    }

    render() {
        let visibleCode = this.props.visibleCode ?? true;
        return <div style={ { display: 'flex', justifyContent: 'space-around' } }>

            { visibleCode ? <Card className={ style.panelCard }>
                <CodeEditor dataset={ {
                    value: this.state.componentUseCode,
                } }/>
                <ExecCode code={ this.state.componentUseCode }/>
            </Card> : '' }

            <Card className={ style.panelCard } style={ visibleCode ? {} : { width: '100%' } }>
                <Form layout="vertical"
                      style={ { width: '100%' } }
                      hideRequiredMark
                      ref={ this.form }
                      initialValues={ {
                          dataEnum: this.state.dataEnum,
                      } }
                >
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
                            let label = item.label + '   ' + (item.desc ? `「${ item.desc }」` : '');

                            let formItem;
                            switch (item.el) {
                                case 'switch':
                                    formItem = this.renderSwitch(key, item);
                                    break;
                                case 'radio':
                                    formItem = this.renderRadio(key, item);
                                    break;
                                case 'list':
                                    formItem = this.renderList(key, item);
                                    break;
                                case 'input':
                                    formItem = this.renderInput(key, item);
                                    break;
                                case 'select':
                                    formItem = this.renderSelect(key, item);
                                    break;
                                case 'select-multiple':
                                    formItem = this.renderSelectMultiple(key, item);
                                    break;
                                case 'slider':
                                    formItem = this.renderSlider(key, item);
                                    break;
                                case 'number':
                                    formItem = this.renderNumberInput(key, item);
                                    break;
                                case 'color':
                                    formItem = this.renderColorPicker(key, item);
                                    break;
                                default  :
                                    break;
                            }

                            return <Row key={ key }>
                                <Col span={ 18 }>
                                    <Form.Item label={ label }>
                                        { formItem }
                                    </Form.Item>
                                </Col>
                            </Row>;
                        })
                    }
                </Form>
            </Card>

        </div>;
    }
}

// export default withRouter(CodeGenerator);
export default CodeGenerator;
