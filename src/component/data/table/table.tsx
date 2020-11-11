/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/18
 * Time: 7:35 下午
 */

import { Button, Dropdown, Input, Menu, message, Space, Table } from 'antd';
import * as React from 'react';
import { parseTpl } from '@utils/parser-tpl';
import { strParseVirtualDOM } from '@utils/parser-dom';
import style from './table.scss';
import { findDOMNode } from 'react-dom';
import $ from 'jquery';
import { SearchOutlined, UnorderedListOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { IApiResult, jsonp } from '@utils/request/request';
import { isNumber, isString } from '@utils/inspect';
import FormAjax from '@component/form/ajax/form';
import { formatObject2Url } from '@utils/format-data';
import Checkbox from 'antd/lib/checkbox';
import { ColumnsType } from 'antd/es/table';
import { IComponentProps } from '@interface/common/component';

interface ITableHeaderItem {
    field: string         //  字段名
    text: string      // name   "成本ID"

    class: string       // 表头item的样式
    if: string          //  "<{pf}> > 0"  show
    else: string        //  hidee
    filter: boolean        //  是否可过滤(搜索)
    frozen: boolean | string        // "1,2"   row column 是否固定
    highlight: boolean      // 是否高亮     0-1
    replace: string         // "1,开启;0,关闭"
    round: string | number           // 保留几位小数
    sortable: boolean      // 是否排序 分前后端
    sum: boolean           // 求和
    thColor: string // bgColor
    visible?: boolean       //是否显示

    [key: string]: any
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

interface ITableApiRes<T = any> extends IApiResult {
    data: Array<T> | any,
}

interface ITableProps extends IComponentProps {
    pageSizeOptions: Array<string>

    [key: string]: any
}

interface ITableState {
    // columns: ColumnsType<ITableHeaderItem>
    columns: ColumnsType<ITableHeaderItem>
    dataSource: Array<any>
    loading: boolean

    [key: string]: any
}

// ! 操作符    https://github.com/Microsoft/TypeScript-Vue-Starter/issues/36

const expandable = { expandedRowRender: record => <p>{ record.description }</p> };

export default class DataTable extends React.Component<ITableProps, any> {

    state: ITableState = {                  // Table https://ant-design.gitee.io/components/table-cn/#Table
        columns          : [],        // Table Column https://ant-design.gitee.io/components/table-cn/#Column
        dataSource       : [],
        selectedRowKeys  : [],
        loading          : true,
        size             : 'small',   // default | middle | small
        showHeader       : true,
        searchText       : '',
        searchedColumn   : '',
        showSorterTooltip: true,        // 是否显示下一次排序的tip
        showDropdown     : false,       // 是否显示下拉菜单
        showDropdownBtn  : false,       // 是否显示下拉框按钮
        bordered         : true,
        pagination       : {      // 分页 https://ant-design.gitee.io/components/pagination-cn/#API
            // current: 0,
            pageSizeOptions : this.props.dataset.pages, /*[ '10', '20', '50', '100', '200' ]*/
            pageSize        : this.props.dataset.pagesize ?? 50,
            position        : [ 'none', this.props.dataset.position /*'bottomLeft'*/ ],     // 分页器展示的位置
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
        // scroll    : {        //  表格是否可以滚动
        //     y: '100vh',
        // },
    };
    private fieldTpl!: string;
    private url: string = this.props.url;
    private searchInput;
    private baseParams = {
        page   : 1,
        pageNum: 100,
    };

    constructor(props: ITableProps) {
        super(props);

        if (this.props.dataset && this.props.dataset.from) {
            let formElement = FormAjax.findFormElement(this.props.dataset.from);
            FormAjax.onFormSubmit(formElement, this.handleFormSubmit.bind(this));
        }

        Promise.all([
            this.getTableHeader(),
            this.getTableContent(),
        ]).then(([ tableHeader, tableContent ]) => {
            console.log(tableHeader);
            console.log(tableContent);
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
                    $tds.css('background', 'transparent');
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
        // this.handleDragSelect();
    }

    // 提交表单
    async handleFormSubmit(formData, e) {
        console.log('表单数据:', formData);
        this.setState({ loading: true });

        let url = formatObject2Url(formData, this.props.dataset.url);
        let tableContent = await this.getTableContent(url);

        this.setState({ dataSource: tableContent, loading: false });
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
            cost                : obj.cost.toFixed(2),
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
        } as object;
    }

    public open() {
        message.success('table open');
    }

    async getTableContent(tableUrl: string = this.props.dataset.url): Promise<Array<ITableContentItem>> {
        let res = await jsonp(tableUrl);
        // let { data }: ITableApiRes<ITableContentItem> = tableContent;
        let { data }: any = res;
        let tableContent: Array<ITableContentItem> = data.map((item, index) => {

            for (const key in item) {
                if (!item.hasOwnProperty(key)) continue;

                if (/<(.*?)>/.test(item[key])) {
                    item[key] = strParseVirtualDOM(item[key]);          // 字符串dom转化
                }
            }

            let result = {
                ...item,
                key         : index/*item.id*/,
                dataIndex   : index,
                name        : '',
                introduction: <h1>1111</h1>,
                // [this.fieldTpl]: '12321321'
            };
            if (this.fieldTpl) {
                let fieldStr = parseTpl(this.fieldTpl, item);
                let fieldJSX = strParseVirtualDOM(fieldStr);
                result[this.fieldTpl] = fieldJSX;
            }
            return result;
        });
        // let sumItem = this.sum(tableContent);
        // tableContent.unshift(sumItem);
        return tableContent;
    }

    async getTableHeader(headerUrl: string = this.props.dataset.headerurl): Promise<Array<ITableHeaderItem>> {
        let res = await jsonp(headerUrl);
        // let { data }: ITableApiRes<ITableHeaderItem> = tableHeader;
        let { data }: ITableApiRes<ITableHeaderItem> = res;

        let tableHeader: Array<ITableHeaderItem> = [];
        for (const item of data) {
            // let index = data.indexOf(item);
            // let width = parseTpl(item.field, item).length * 10;

            // if (!item.visible) continue;

            // field 为模版的时候 <a href="http://e.aidalan.com/manage/useful/advPositionCost/form?pf=1&id=<{id}"> // data-fn='layout-window-open'>编辑</a>
            if (/<(.*?)>/.test(item.field)) {
                this.fieldTpl = item.field;
            }

            let fn: any = null;

            if (item.sortable) {
                let field = item.field;
                fn = (a, b): number => {
                    let aVal = a[field];
                    let bVal = b[field];

                    if (aVal && bVal) {

                        // number
                        if (isNumber(aVal) && isNumber(bVal)) {
                            return aVal - bVal;
                        }

                        // string
                        if (isString(aVal) && isString(bVal)) {
                            // %
                            if (aVal.includes('%') && bVal.includes('%')) {
                                aVal = parseFloat(aVal);
                                bVal = parseFloat(bVal);
                                return (aVal as number) - (bVal as number);
                            }
                            // time 判断是否日期格式
                            if (!isNaN(Date.parse(bVal))) {
                                aVal = Date.parse(aVal);
                                bVal = Date.parse(bVal);
                                return aVal - bVal;
                            }

                        }

                    }

                    return 0;
                };
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

            let filters = item.filter ? this.getColumnSearchProps(item.field) : {};     // 搜索

            tableHeader.push({
                ...item,
                // antd
                ...filters,       // 搜索

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
                // ellipsis    : true,      // 自动省略
                Breakpoint  : 'sm',     // 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs'
                fixed       : false,
                sorter      : fn,
            });
        }

        return tableHeader;
    }

    getColumnSearchProps = dataIndex => ({
        filterDropdown               : ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={ { padding: 8 } }>
                <Input
                    ref={ node => {
                        this.searchInput = node;
                    } }
                    placeholder={ `Search ${ dataIndex }` }
                    value={ selectedKeys[0] }
                    onChange={ e => setSelectedKeys(e.target.value ? [ e.target.value ] : []) }
                    onPressEnter={ () => this.handleSearch(selectedKeys, confirm, dataIndex) }
                    style={ { width: 188, marginBottom: 8, display: 'block' } }
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={ () => this.handleSearch(selectedKeys, confirm, dataIndex) }
                        icon={ <SearchOutlined/> }
                        size="small"
                        style={ { width: 90 } }
                    >
                        Search
                    </Button>
                    <Button onClick={ () => this.handleReset(clearFilters) } size="small" style={ { width: 90 } }>
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon                   : filtered => <SearchOutlined
            style={ { color: filtered ? '#1890ff' : undefined } }/>,
        onFilter                     : (value, record) =>
            record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '',
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => this.searchInput.select(), 100);
            }
        },
        render                       : text =>
            this.state.searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={ { backgroundColor: '#ffc069', padding: 0 } }
                    searchWords={ [ this.state.searchText ] }
                    autoEscape
                    textToHighlight={ text ? text.toString() : '' }
                />
            ) : (
                text
            ),
    });

    handleReset = clearFilters => {
        clearFilters();
        this.setState({ searchText: '' });
    };

    handleSearch = (selectedKeys, confirm, dataIndex) => {
        console.log(selectedKeys, confirm, dataIndex);
        confirm();
        this.setState({
            searchText    : selectedKeys[0],
            searchedColumn: dataIndex,
        });
    };

    onSelectChange(selectedRowKeys) {
        console.log('selectedRowKeys changed: ', selectedRowKeys);
        this.setState({ selectedRowKeys });
    }

    renderTableHeaderConfig(data) {
        const handleClickMenu = e => {
            let index = e.item.props.index;
            let columns = this.state.columns;
            columns[index]['visible'] = !columns[index]['visible'];
            this.setState({ showDropdown: true, columns });
        };
        return <Menu onClick={ handleClickMenu }>
            { data.map(item =>
                <Menu.Item key={ Math.random() } className="ant-dropdown-link">
                    <Checkbox key={ item.dataIndex } checked={ item.visible }>{ item.text }</Checkbox>
                </Menu.Item>,
            ) }
        </Menu>;
    }

    handleDropdownVisibleChange(flag) {
        this.setState({ showDropdown: flag });
    }

    handleTableWrapMouseEnter() {
        this.setState({ showDropdownBtn: true });
    }

    handleTableWrapMouseLeave() {
        this.setState({ showDropdownBtn: false });
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

        return <div onMouseEnter={ this.handleTableWrapMouseEnter.bind(this) }
                    onMouseLeave={ this.handleTableWrapMouseLeave.bind(this) }
        >
            <Dropdown overlay={ this.renderTableHeaderConfig(this.state.columns) }
                      className={ `${ style.dropdown } ${ this.state.showDropdownBtn ? style.show : style.hide }` }
                      placement="bottomRight"
                      onVisibleChange={ this.handleDropdownVisibleChange.bind(this) }
                      visible={ this.state.showDropdown } trigger={ [ 'click' ] } arrow>
                <Button>
                    <a className="ant-dropdown-link" onClick={ e => e.preventDefault() }><UnorderedListOutlined/> </a>
                </Button>
            </Dropdown>

            <Table
                style={ this.props.style }
                className={ style.formTable }
                components={ {} }
                onRow={ record => {
                    return {
                        onClick      : event => {
                        }, // 点击行
                        onDoubleClick: event => {
                        },
                        onContextMenu: event => {
                        },
                        onMouseEnter : event => {
                        }, // 鼠标移入行
                        onMouseLeave : event => {
                        },
                    };
                } }
                onHeaderRow={ (column, index) => {
                    return {
                        onClick: e => {
                            // column[0]['visible'] = false;
                            // this.setState({
                            //     columns: column,
                            // });
                        }, // 点击表头行
                    };
                } }
                // style{this.props}
                sticky={ true }
                // rowSelection={ rowSelection }
                { ...this.state }
                columns={ this.state.columns.filter(item => item['visible'] === true) }
            >
                <h1 style={ { position: 'absolute', top: '50%', left: '50%' } }>-------------------</h1>
            </Table>
        </div>;
    }
}
