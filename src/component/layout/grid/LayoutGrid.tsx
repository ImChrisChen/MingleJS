/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/12/24
 * Time: 5:35 下午
 */

import React, { Component } from 'react';
import { IComponentProps } from '@interface/common/component';
import { Col, Row } from 'antd';

export default class LayoutGrid extends Component<IComponentProps, any> {
    render() {
        return <>
            <Row>
                { this.props.subelements.map((child, index) => {
                    let span = child.getAttribute('data-grid');
                    if (span) {
                        return <Col span={ span } key={ index }>
                            <div ref={ el => el && el.append(child) }/>
                        </Col>;
                    }
                }) }
            </Row>
        </>;
    }
}
