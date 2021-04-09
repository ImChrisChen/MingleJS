/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/28
 * Time: 5:32 下午
 */

import { Form, message, Modal, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import React, { Component } from 'react';
import { IComponentProps } from '@interface/common/component';
import { isString } from '@src/utils';
import { FormExecIcon, FormSmartIcon } from '@src/private-component/form-component';
import qs from 'qs';
import { Inject } from 'typescript-ioc';
import { HttpClientService } from '@src/services';

function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

export default class FormUpload extends Component<IComponentProps, any> {

    @Inject private readonly httpClientService: HttpClientService;

    state = {
        previewVisible: false,
        previewImage  : '',
        previewTitle  : '',
        fileList: [] as Array<any>
    };

    constructor(props) {
        super(props);
        console.log(this.props);
    }

    handleCancel = () => this.setState({ previewVisible: false });

    handlePreview = async file => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }

        this.setState({
            previewImage  : file.url || file.preview,
            previewVisible: true,
            previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1)
        });
    };

    async handleUpload(option) {
        let url = this.props.dataset.url;
        let file = option.file;
        let reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = async e => {
            let fileBase64 = '';
            let result = reader.result;
            if (result && isString(result)) {
                [ , fileBase64 ] = result.split('base64,');
            }
            let data = {
                file: fileBase64,           // base64
                name: file.name,           // 文件名
                type: 'm.resume'
            };
            let res = await this.httpClientService.post(url, qs.stringify(data));
            if (res.status) {
                let fileurl = res.data;
                let fileList = [ ...this.state.fileList ];
                fileList.push({
                    uid   : file.uid,
                    name  : file.name,
                    url   : fileurl,
                    status: 'done'
                });
                message.success('文件上传成功');
                this.setState({ fileList });
                return fileurl;
            } else {
                message.error('文件上传失败');
            }
        };
    }

    handleChange = ({ fileList }) => this.setState({ fileList });

    render() {
        const { previewVisible, previewImage, fileList, previewTitle } = this.state;
        let { smart, exec, label, disabled } = this.props.dataset;
        const uploadButton = (
            <div>
                <PlusOutlined />
                <div style={ { marginTop: 8 } }>Upload</div>
            </div>
        );
        return (
            <>
                <Form.Item label={ label } style={ this.props.style }>
                    { smart ? <FormSmartIcon /> : '' }
                    { exec ? <FormExecIcon /> : '' }
                    <Upload
                        disabled={ disabled }
                        customRequest={ option => this.handleUpload(option) }
                        accept='.png,.jpg'
                        listType={ this.props.dataset.type }
                        fileList={ fileList }
                        multiple={ this.props.dataset.multiple }
                        beforeUpload={ (file, fileList) => {

                            console.log(file, fileList);

                            if (file.type === 'xxx') {
                                message.error('文件上传类型不被允许');
                                return false;
                            }

                            // size 字节
                            if (file.size > 5000000) {
                                message.error('文件大小超出限制');
                                return false;
                            }

                            return true;
                        } }
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
                        <img alt='example' style={ { width: '100%' } } src={ previewImage } />
                    </Modal>
                </Form.Item>
            </>
        );
    }
}

