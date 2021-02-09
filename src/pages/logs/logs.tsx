/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/11/27
 * Time: 5:58 下午
 */
import React, { Component } from 'react';
import { Table } from 'antd';
import axios from 'axios';

export default class Logs extends Component<any, any> {
    state = {
        dataSource: [],
        columns   : [],
    };

    constructor(props) {
        super(props);
        this.getLogs();
    }

    async getLogs() {
        // let res = await axios.get('/server/logs');
        // console.log(res);
    }

    render() {
        return <div>
            123131
            <Table
                dataSource={ [] }
                columns={ [] }
            />
        </div>;
    }
}
