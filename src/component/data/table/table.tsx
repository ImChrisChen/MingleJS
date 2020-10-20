/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/18
 * Time: 7:35 下午
 */

import { message, Table } from 'antd';
import * as React from 'react';
import tableHeader from '@root/mock/table/tableHeader.json';
import tableContent from '@root/mock/table/tableContent.json';
import { parseTpl } from '@utils/parser-tpl';
import { strParseVirtualDOM } from '@utils/parser-dom';
import style from './table.scss';
import { ColumnsType } from 'antd/es/table';
import FormAjax from '@component/form/ajax/form';
import { findDOMNode } from 'react-dom';
import $ from 'jquery'

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

    id?: number | string,
    adv_position_id?: number,
    pf?: number,
    date?: string, // '2020-09-23'
    game_name?: string,
    position_name?: string,
    channel_name?: string,
    cost?: number,
    money_cost?: number,
    principal_name?: string,
    remark?: string,
    dl_adv_position_id?: string
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
            return <>我是默认的表格title🤪🤪🤪🤪</>;
        },
        bordered       : true,
        pagination     : {      // 分页 https://ant-design.gitee.io/components/pagination-cn/#API
            // current: 0,
            pageSizeOptions : [ 10, 20, 50, 100, 200 ],
            pageSize        : 100,
            onChange        : (page, pageSize) => {    // 页码改变的回调，参数是改变后的页码及每页条数
                console.log(page, pageSize);
                this.setState({
                    pagination: { pageSize, page },
                });
            },
            onShowSizeChange: (page, pageSize) => {    // pageSize 变化的回调
                this.setState({
                    pagination: { pageSize, page },
                });
            },
        },
        scroll         : {
            y: '100vh',
        },

    };
    private fieldTpl!: string;
    private url: string = this.props.url;

    constructor(props: ITableProps) {
        super(props);

        console.log(this.props.dataset);
        if (this.props.dataset && this.props.dataset.from) {
            console.log(this.props.dataset);
            let formElement = FormAjax.findFormElement(this.props.dataset.from);
            FormAjax.onFormSubmit(formElement, this.handleFormSubmit);
        }

        Promise.all([
            this.getTableHeader(),
            this.getTableContent(),
        ]).then(([ tableHeader, tableContent ]) => {
            let sumItem = this.sum(tableContent);
            tableContent.unshift(sumItem);
            this.setState({
                columns   : tableHeader,
                dataSource: tableContent,
                loading   : false,
            });
        });

    }

    handleDragSelect() {
        let $el = $(this.props.el);
        let el = findDOMNode(this.props.el);
        console.log(el);
        $el.on('mousedown', function (e) {
            let { clientX: startX, clientY: startY } = e;
            $el.one('mouseup', function (e) {
                let { clientX: endX, clientY: endY } = e;
                if (Math.abs(startX - endX) > 100 || Math.abs(startY - endY) > 100) {
                    console.log('拖拽结束');

                    let $tds = $el.find('td');
                    Array.from($tds).forEach(td => {
                        let { top, left } = $(td).offset() as any;

                        // td的x要  大于开始的， 小于结束的 (从左往右)
                        if (
                            (left + $(td).width()) > startX
                            && left < endX
                        ) {
                            // td的y要  大于开始的， 小于结束的 (从上往下)
                            if (
                                (top + $(td).height()) > startY
                                && top < endY) {
                                $(td).css({
                                    background: 'pink',
                                });
                                // $('body').removeClass('unable-selection');
                            }
                        }
                    });
                }
            });
        });

    }

    componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<any>, snapshot?: any) {
        this.handleDragSelect();
    }

    handleFormSubmit(formData, e) {
        console.log(formData);
    }

    sum(list): ITableContentItem {
        let obj = {
            cost      : 0,
            money_cost: 0,
            key       : 0,
        };
        list.forEach((item, index) => {
            obj.cost += item.cost;
            obj.money_cost += item.money_cost;
        });
        return {
            // @ts-ignore
            cost                : obj.cost.toFixed(2),
            // @ts-ignore
            money_cost          : obj.money_cost.toFixed(2),
            key                 : 0,
            'id'                : '合计',
            'adv_position_id'   : undefined,
            'pf'                : undefined,
            'date'              : '', // '2020-09-23'
            'game_name'         : '',
            'position_name'     : '',
            'channel_name'      : '',
            // 'cost':'',
            // 'money_cost'?: number,
            'principal_name'    : '',
            'remark'            : '',
            'dl_adv_position_id': '',
        };
    }

    public open() {
        message.success('table open');
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
            };
        });
    }

    async getTableHeader(): Promise<Array<ITableHeaderItem>> {
        // let url = 'http://e.aidalan.com/manage/useful/advPositionCost/header?pf=1&jsoncallback';
        let { data }: IApiResult<ITableHeaderItem> = tableHeader;
        return data.map((item, index) => {
            // let width = parseTpl(item.field, item).length * 10;

            // field 为模版的时候 <a href="http://e.aidalan.com/manage/useful/advPositionCost/form?pf=1&id=<{id}"> // data-fn='layout-window-open'>编辑</a>
            if (/<(.*?)>/.test(item.field)) {
                this.fieldTpl = item.field;
            }

            let compare = function (a, b): number {
                let result;
                switch (item.field) {
                    case 'id':
                        result = a.id - b.id;
                        break;
                    case 'adv_position_id':
                        result = a.adv_position_id - b.adv_position_id;
                        break;
                    case 'pf':
                        result = a.id - b.id;
                        break;
                    case 'date':
                        result = new Date(a.date).getTime() - new Date(b.date).getTime();
                        break;
                    case 'game_name':
                        result = a.game_name.length - b.game_name.length;
                        break;
                    case 'dl_adv_position_id':
                        result = parseInt(a.dl_adv_position_id) - parseInt(b.dl_adv_position_id);
                        break;
                    default :
                        result = a - b;
                        break;
                }
                return result;
            };

            return {
                ...item,

                // antd
                title       : <div className={ style.tableHeaderCell }
                                   style={ { color: item.thColor } }>{ item.text }</div>,       // 表头的每一列
                // title    : item.text,
                dataIndex   : item.field,
                id          : item.field,
                align       : 'center',
                render      : function (text, item, i) {
                    return text;
                },     // 自定义渲染表格中的每一项
                // className: style.tableHeaderCell,
                // width       : 80,
                onHeaderCell: (column) => {
                    // console.log(column);
                },
                ellipsis    : true,
                Breakpoint  : 'sm',     // 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs'
                fixed       : true,
                sorter      : {
                    compare,
                },
            };
        });
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
                components={ {

                } }
                rowClassName={ style.rowClassName }
                rowSelection={ rowSelection }
                { ...this.state }
            >
            </Table>
        </div>;
    }
}
