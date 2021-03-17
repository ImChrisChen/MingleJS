/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/3/17
 * Time: 9:54 上午
 */

import React, { Component } from 'react';
import { Transfer, Button } from 'antd';

export default class FormTransfer extends Component {
    state = {
        mockData  : [],
        targetKeys: [],
    };

    componentDidMount() {
        this.getMock();
    }

    getMock = () => {
        const targetKeys: Array<any> = [];
        const mockData: Array<any> = [];
        for (let i = 0; i < 20; i++) {
            const data = {
                key        : i.toString(),
                title      : `content${ i + 1 }`,
                description: `description of content${ i + 1 }`,
                chosen     : Math.random() * 2 > 1,
            };
            if (data.chosen) {
                targetKeys.push(data.key);
            }
            mockData.push(data);
        }
        this.setState({ mockData, targetKeys });
    };

    handleChange = targetKeys => {
        this.setState({ targetKeys });
    };

    renderFooter = () => (
        <Button size="small" style={ { float: 'right', margin: 5 } } onClick={ this.getMock }>
            reload
        </Button>
    );

    render() {
        return (
            <Transfer
                dataSource={ this.state.mockData }
                showSearch
                listStyle={ {
                    width : 250,
                    height: 300,
                } }
                operations={ [ 'to right', 'to left' ] }
                targetKeys={ this.state.targetKeys }
                onChange={ this.handleChange }
                render={ (item: any) => `${ item.title }-${ item.description }` }
                footer={ this.renderFooter }
            />
        );
    }
}
