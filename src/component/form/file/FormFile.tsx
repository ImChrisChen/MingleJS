/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/28
 * Time: 5:32 下午
 */

import { Form, Modal, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React, { Component } from 'react';
import { IComponentProps } from '@interface/common/component';

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

export default class FormFile extends Component<IComponentProps, any> {
    state = {
        previewVisible: false,
        previewImage  : '',
        previewTitle  : '',
        fileList      : [],
    };

    handleCancel = () => this.setState({ previewVisible: false });

    handlePreview = async file => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }

        this.setState({
            previewImage  : file.url || file.preview,
            previewVisible: true,
            previewTitle  : file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
        });
    };

    handleChange = ({ fileList }) => this.setState({ fileList });

    render() {
        const { previewVisible, previewImage, fileList, previewTitle } = this.state;
        const uploadButton = (
            <div>
                <PlusOutlined/>
                <div style={ { marginTop: 8 } }>Upload</div>
            </div>
        );
        return (
            <>
                <Form.Item label={ this.props.dataset.label }>
                    <Upload
                        // action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                        action={ this.props.dataset.url }
                        accept=".png,.jpg"
                        listType={ this.props.dataset.type }
                        fileList={ fileList }
                        multiple={ true }
                        onPreview={ this.handlePreview }
                        onChange={ this.handleChange }
                    >
                        { fileList.length >= 8 ? null : uploadButton }
                    </Upload>
                    <Modal
                        visible={ previewVisible }
                        title={ previewTitle }
                        footer={ null }
                        onCancel={ this.handleCancel }
                    >
                        <img alt="example" style={ { width: '100%' } } src={ previewImage }/>
                    </Modal>
                </Form.Item>
            </>
        );
    }
}

