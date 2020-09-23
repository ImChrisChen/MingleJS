/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/18
 * Time: 7:35 下午
 */

import { Table as AntdTable } from 'antd';
import * as React from 'react';

import jsonp from 'jsonp';

interface ITableOptions {
    data: Array<object>,
    columns: Array<object>
}

export default class Table extends React.Component<any, any> {

    state: ITableOptions = {
        columns: [
            {
                title    : 'Name',
                dataIndex: 'name',
                width    : 150,
            },
            {
                title    : 'Age',
                dataIndex: 'age',
                width    : 150,
                sorter   : {
                    compare : (a, b) => a.age - b.age,
                    multiple: 2,
                },
            },
            {
                title    : 'Address',
                dataIndex: 'address',
            },
        ],
        data   : [],
    };

    constructor(props) {
        super(props);
        for (let i = 0; i < 200; i++) {
            this.state.data.push({
                key    : i,
                name   : `Edward King ${ i }`,
                age    : i,
                address: `London, Park Lane no. ${ i }`,
            });
        }
    }

    async getTableHeaderConfig() {
        jsonp('http://e.aidalan.com/manage/useful/advPositionCost/header?pf=1', function (err, data) {
            console.log(data);
        });
    }

    render() {
        this.getTableHeaderConfig();
        let { data, columns } = this.state;
        return <div>
            <AntdTable columns={ columns } dataSource={ data } pagination={ { pageSize: 50 } } scroll={ { y: 240 } }/>,
        </div>;
    }
}
