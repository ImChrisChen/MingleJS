/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/21
 * Time: 9:36 下午
 */
import React from 'react';
import { trigger } from '@utils/trigger';
import { formatEnumOptions } from '@utils/format-value';
import { Form, Radio } from 'antd';
import { IComponentProps } from "@interface/ElDatasetAttrs";

export default class Button extends React.Component<IComponentProps, any> {
    state: any = {
        value  : this.props.value,
        options: []
    };

    constructor(props) {
        super(props);
        this.getData().then(options => {
            this.setState({ options })
        })
    }

    async getData() {
        return formatEnumOptions(this.props.dataset.enum);
    }

    handleChange(e: any) {
        let value = e.target.value;
        console.log(value);
        this.setState({ value }, () => trigger(this.props.el, value));
    }

    render() {
        // rules={ [ { required: this.props.required, message: this.props.message } ] }

        // return <div>
        //     <label className="ant-radio-button-wrapper ant-radio-button-wrapper-checked">
        //         <span className="ant-radio-button ant-radio-button-checked">
        //             <input type="checkbox" className="ant-radio-button-input" value="orange" checked={ false }/>
        //                 <span className="ant-radio-button-inner"/>
        //         </span>
        //         <span>Orange</span>
        //     </label>
        //     <label className="ant-radio-button-wrapper ">
        //         <span className="ant-radio-button ">
        //             <input type="checkbox" className="ant-radio-button-input" value="orange" checked={ false }/>
        //                 <span className="ant-radio-button-inner"/>
        //         </span>
        //         <span>Orange</span>
        //     </label>
        //     <label className="ant-radio-button-wrapper ant-radio-button-wrapper-checked">
        //         <span className="ant-radio-button ant-radio-button-checked">
        //             <input type="checkbox" className="ant-radio-button-input" value="orange" checked={ false }/>
        //                 <span className="ant-radio-button-inner"/>
        //         </span>
        //         <span>Orange</span>
        //     </label>
        // </div>;

        return <>
            <Form.Item label={ this.props.dataset.label }>
                <Radio.Group
                    onChange={ this.handleChange.bind(this) }
                    value={ this.state.value }
                    options={ this.state.options }
                    { ...this.props.dataset }
                />
            </Form.Item>
        </>;
    }
}
