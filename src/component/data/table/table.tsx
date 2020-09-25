/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/18
 * Time: 7:35 下午
 */

import { Table } from 'antd';
import * as React from 'react';
// @ts-ignore
import tableHeader from '@root/mock/table/tableHeader.json';
// @ts-ignore
import tableContent from '@root/mock/table/tableContent.json'
import { parseTpl } from "@utils/tpl-parse";
import { strParseVirtualDOM } from "@utils/dom-parse";
import style from './table.scss'
import { ColumnsType } from "antd/es/table";

interface ITableHeaderItem {
    field: string         //  字段名
    text: string      // name   "成本ID"

    class: string       // 表头item的样式
    if: string          //  "<{pf}> > 0"  show
    else: string        //  hidee
    filter: boolean        //  是否可过滤
    frozen: boolean | string        // "1,2"   row column 是否固定
    highlight: boolean      // 是否高亮     0-1
    replace: string         // "1,开启;0,关闭"
    round: string | number           // 保留几位小数
    sortable: boolean      // 是否排序 分前后端
    sum: boolean           // 求和
    thColor: string // bgColor
}

interface ITableContentItem {
    [key: string]: any

    "id": 12815468,
    "adv_position_id": 396598,
    "pf": 1,
    "date": "2020-09-23",
    "game_name": "\u67ab\u4e4b\u6218\u7eaa-SDK\u5e7f\u70b9\u901a-10",
    "position_name": "gdt-\u67ab\u4e4b\u6218\u7eaaSDK\u5e7f\u70b9\u901a10-17630041-hyc-1",
    "channel_name": "gdt-\u67ab\u4e4b\u6218\u7eaaSDK\u5e7f\u70b9\u901a10-hyc-17630041",
    "cost": 1.8,
    "money_cost": 1.7,
    "principal_name": "\u9ec4\u6bc5\u8bda",
    "remark": "\u9ec4\u6bc5\u8bda",
    "dl_adv_position_id": "1396598"
}

interface IApiResult<T> {
    status: boolean
    nums?: number | string,
    page?: number | string,
    data: Array<T>,

    [key: string]: any
}

interface ITableProps {
    pageSizeOptions: Array<string>

    [key: string]: any
}

interface ITableState {
    columns: ColumnsType<ITableHeaderItem>
    dataSource: Array<any>
    loading: boolean

    [key: string]: any
}

// ! 操作符    https://github.com/Microsoft/TypeScript-Vue-Starter/issues/36

const expandable = { expandedRowRender: record => <p>{ record.description }</p> };
const footer = () => 'Here is footer';

export default class DataTable extends React.Component<any, any> {

    state: ITableState = {                  // Table https://ant-design.gitee.io/components/table-cn/#Table
        columns        : [],        // Table Column https://ant-design.gitee.io/components/table-cn/#Column
        dataSource     : [],
        selectedRowKeys: [],
        loading        : true,
        size           : 'small',   // default | middle | small
        showHeader     : true,
        // summary        : (e, v) => {
        // },
        // expandable,
        footer,
        title          : function () {
            return <>我是默认的表格title🤪🤪🤪🤪</>
        },
        bordered       : true,
        pagination     : {      // 分页 https://ant-design.gitee.io/components/pagination-cn/#API
            // current: 0,
            pageSizeOptions : [ 10, 20, 50, 100, 200 ],
            pageSize        : 100,
            onChange        : (page, pageSize) => {    // 页码改变的回调，参数是改变后的页码及每页条数
                console.log(page, pageSize);
                this.setState({
                    pagination: { pageSize, page }
                })
            },
            onShowSizeChange: (page, pageSize) => {    // pageSize 变化的回调
                this.setState({
                    pagination: { pageSize, page }
                })
            }
        },
        scroll         : {
            y: '100vh'
        }

    };
    private fieldTpl!: string
    private url: string = this.props.url;

    constructor(props: ITableProps) {
        super(props);
        Promise.all([
            this.getTableHeader(),
            this.getTableContent(),
        ]).then(([ tableHeader, tableContent ]) => {
            this.setState({
                columns   : tableHeader,
                dataSource: tableContent,
                loading   : false,
            })
        })
    }

    async getTableContent(): Promise<Array<ITableContentItem>> {
        let { data }: IApiResult<ITableContentItem> = tableContent;
        return data.map(item => {
            let fieldStr = parseTpl(this.fieldTpl, item);
            let fieldJSX = strParseVirtualDOM(fieldStr);
            return {
                ...item,
                key            : item.id,
                name           : '',
                [this.fieldTpl]: fieldJSX,
                // [this.fieldTpl]: '12321321'
            }
        });
    }

    async getTableHeader(): Promise<Array<ITableHeaderItem>> {
        // let url = 'http://e.aidalan.com/manage/useful/advPositionCost/header?pf=1&jsoncallback';
        let { data }: IApiResult<ITableHeaderItem> = tableHeader;
        return data.map(item => {
            // let width = parseTpl(item.field, item).length * 10;

            // field 为模版的时候 <a href="http://e.aidalan.com/manage/useful/advPositionCost/form?pf=1&id=<{id}"> // data-fn='layout-window-open'>编辑</a>
            if (/<(.*?)>/.test(item.field)) {
                this.fieldTpl = item.field
            }

            let compare = function (a, b): number {
                let result;
                switch (item.field) {
                    case 'id':
                        result = a.id - b.id
                        break
                    case 'adv_position_id':
                        result = a.adv_position_id - b.adv_position_id
                        break
                    case 'pf':
                        result = a.id - b.id
                        break
                    case 'date':
                        result = new Date(a.date).getTime() - new Date(b.date).getTime()
                        break
                    case 'game_name':
                        result = a.game_name.length - b.game_name.length
                        break
                    case 'dl_adv_position_id':
                        result = parseInt(a.dl_adv_position_id) - parseInt(b.dl_adv_position_id)
                        break
                    default :
                        result = a - b
                        break
                }
                return result
            }


            return {
                ...item,

                // antd
                title       : <div className={ style.tableHeaderCell }
                                   style={ { color: item.thColor } }>{ item.text }</div>,       // 表头的每一列
                // title    : item.text,
                dataIndex   : item.field,
                id          : item.field,
                align       : 'center',
                render      : text => text,     // 自定义渲染表格中的每一项
                // className: style.tableHeaderCell,
                // width       : 80,
                onHeaderCell: (column) => {
                    // console.log(column);
                },
                ellipsis    : true,
                Breakpoint  : 'sm',     // 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs'
                fixed       : true,
                sorter      : {
                    compare
                }
            }
        })
    }

    onSelectChange(selectedRowKeys) {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ selectedRowKeys });
    }

    render() {
        const { selectedRowKeys } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange  : this.onSelectChange.bind(this),
            selections: [
                Table['SELECTION_ALL'],
                Table['SELECTION_INVERT'],
                {
                    key     : 'odd',
                    text    : 'Select Odd Row',
                    onSelect: changableRowKeys => {
                        let newSelectedRowKeys = [];
                        newSelectedRowKeys = changableRowKeys.filter((key, index) => {
                            if (index % 2 !== 0) {
                                return false;
                            }
                            return true;
                        });
                        this.setState({ selectedRowKeys: newSelectedRowKeys });
                    },
                },
                {
                    key     : 'even',
                    text    : 'Select Even Row',
                    onSelect: changableRowKeys => {
                        let newSelectedRowKeys = [];
                        newSelectedRowKeys = changableRowKeys.filter((key, index) => {
                            if (index % 2 !== 0) {
                                return true;
                            }
                            return false;
                        });
                        this.setState({ selectedRowKeys: newSelectedRowKeys });
                    },
                },
            ],
        };
        return <div>
            <Table
                rowClassName={ style.rowClassName }
                rowSelection={ rowSelection }
                { ...this.state }
            >
            </Table>
        </div>;
    }
}
