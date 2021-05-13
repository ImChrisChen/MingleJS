/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/18
 * Time: 7:35 下午
 */

import { Button, Dropdown, Input, Menu, message, Space, Table } from 'antd';
import * as React from 'react';
import {
    deepEach, hashCode,
    isDataFn,
    isHtmlTpl,
    isNumber,
    isString,
    isWuiComponent,
    isWuiTpl,
    strParseDOM,
    strParseVirtualDOM,
    trigger,
} from '@src/utils';
import style from './DataTable.scss';
import { findDOMNode } from 'react-dom';
import $ from 'jquery';
import { SearchOutlined, UnorderedListOutlined } from '@ant-design/icons';
import Checkbox from 'antd/lib/checkbox';
import { ColumnsType } from 'antd/es/table';
import { IComponentProps } from '@interface/common/component';
import { DataUpdateTime, PanelTitle } from '@component/data/chart/DataChart';
import moment from 'moment';
import FormAction from '@component/form/action/FormAction';
import { Inject } from 'typescript-ioc';
import {
    FormatDataService,
    HttpClientService,
    IApiResult,
    ParserTemplateService,
    ViewRenderService,
} from '@src/services';
import App from '@src/App';
import { TableEntity } from '@component/data/table/module/TableEntity';

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

export default class DataTable extends React.Component<ITableProps, any> {

    @Inject private readonly parserTemplateService: ParserTemplateService;
    @Inject private readonly httpClientService: HttpClientService;
    @Inject private readonly formatDataService: FormatDataService;
    @Inject private readonly viewRenderService: ViewRenderService;

    private readonly appEntity;
    private searchInput;
    private entityID = this.props.dataset.entity_id ?? '';      // 实体ID
    private entityUrl = this.props.dataset.entity_url ?? '';    // 实体编辑的URL
    private timer;

    state = {                  // Table https://ant-design.gitee.io/components/table-cn/#Table
        columns        : [],        // Table Column https://ant-design.gitee.io/components/table-cn/#Column
        dataSource     : [],
        selectedRowKeys: [],
        rowkey         : this.props.dataset.rowkey,     // id
        loading        : true,

        currentpage: this.props.dataset.currentpage || 1,
        pages      : this.props.dataset.pages,
        pagesize   : this.props.dataset.pagesize,

        searchText       : '',
        searchedColumn   : '',
        showSorterTooltip: true,        // 是否显示下一次排序的tip
        showDropdown     : false,       // 是否显示下拉菜单
        showDropdownBtn  : false,       // 是否显示下拉框按钮
        // scroll           : {        //  表格是否可以滚动
        //     y: this.props.dataset.height || undefined,
        // },
        indentSize: 30,     //  

        updateDate: moment().format('YYYY-MM-DD HH:mm:ss'),
        rowstyles : {},
    };

    constructor(props: ITableProps) {
        super(props);
        this.appEntity = new TableEntity(this.props.el);

    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    componentDidMount() {
        Promise.all([
            this.getTableHeader(),
            this.getTableContent(),
        ]).then(([ tableHeader, tableContent ]) => {
            this.setState({
                columns   : tableHeader,
                dataSource: tableContent,
                loading   : false,
            }, () => {
                let addEntityBtn = this.props.el.querySelector('.entity-add-btn') as HTMLElement;
                addEntityBtn && new App(addEntityBtn,true);

                /**
                 * --------------------------- rowStyle --------------------------------------
                 */
                let content = '';
                for (let key in this.state.rowstyles) {
                    let value = this.state.rowstyles[key];
                    content += ` .${ key } { ${ value } } \n`;
                }
                let id = `#mingle-row-style`;
                $(id).remove();
                let s = `<style id="mingle-row-style">
                    ${ content }
                </style>`;
                $('head').append(s);
            });
            this.handleDragSelect();
        });

        let { interval } = this.props.dataset;      // 单位为分钟
        if (interval) {
            this.timer = setInterval(() => {
                this.FormSubmit({}).then(r => {
                    // message.success(`表格数据自动更新了,每次更新间隔为${ interval }分钟`);
                });
            }, interval * 60 * 1000);
        }

    }

    handleShowSizeChange(page, pageSize) {    // pageSize 变化的回调
        this.setState({
            pagination: { pageSize, page },
        });
    }

    handleChangePagination(page, pageSize) {
        console.log(page, pageSize);
        this.setState({
            currentpage: page,
            pagesize   : pageSize,
        });
    }

    handleDragSelect() {
        let $el = $(this.props.el);
        let el = findDOMNode(this.props.el);
        $el.on('mousedown', function (e) {
            let { clientX: startX, clientY: startY } = e;
            $el.one('mouseup', function (e) {
                let { clientX: endX, clientY: endY } = e;
                if (Math.abs(startX - endX) > 100 || Math.abs(startY - endY) > 100) {
                    // console.log('拖拽结束');

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

    // 提交表单
    public async FormSubmit(formData = {}) {
        console.log('DataTable:', formData);
        this.setState({ loading: true });

        let url = this.formatDataService.obj2Url(formData, this.props.dataset.url);
        let tableContent = await this.getTableContent(url);
        let updateDate = moment().format('YYYY-MM-DD HH:mm:ss');

        this.setState({
            dataSource: tableContent,
            updateDate: updateDate,
            loading   : false,
        });
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
            cost             : obj.cost.toFixed(2),
            money_cost       : obj.money_cost.toFixed(2),
            key              : 0,
            'id'             : '合计',
            'adv_position_id': undefined,
            'pf'             : undefined,
            'date'           : '', // '2020-09-23'
            'game_name'      : '',
            'position_name'  : '',
            'channel_name'   : '',
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
        let res = await this.httpClientService.jsonp(tableUrl);
        if (!res.status) {
            return [];
        }

        let { data }: ITableApiRes<ITableContentItem> = res;

        return this.formatTableContent(data);
    }

    //  处理 table 的数据格式
    formatTableContent(data: Array<ITableContentItem>) {
        deepEach(data, (item, index) => {
            for (const key in item) {
                if (!item.hasOwnProperty(key)) continue;
                let value = item[key];

                // 解析wui模版
                if (isWuiTpl(value)) {
                    value = this.parserTemplateService.parseTpl(value, item, 'tpl');
                }

                // 解析html模版
                if (isHtmlTpl(value)) {
                    if (isWuiComponent(value)) {        // 自定义组件和 data-fn模块都可以识别
                        let element = strParseDOM(value);
                        value = <div ref={ node => {
                            if (node) {
                                if (!node.innerHTML) {
                                    node.append(...element.children);       // 减少一层DOM包裹
                                    new App(node,true);
                                }
                            }
                        } }/>;

                    } else {
                        value = strParseVirtualDOM(value);          // 字符串dom转化
                    }
                }

                item[key] = value;

                item.key = index;
                item.dataIndex = index;
                item.name = '';
            }
        }, 'children');
        return data;

    }

    async getTableHeader(headerUrl: string = this.props.dataset.headerurl): Promise<Array<ITableHeaderItem>> {
        let res = await this.httpClientService.jsonp(headerUrl);
        let { data }: ITableApiRes<ITableHeaderItem> = res;

        let tableHeader: Array<ITableHeaderItem> = [];
        for (const item of data) {

            let sortCallback: any = null;

            if (item.sortable) {
                let field = item.field;
                sortCallback = (a, b): number => {
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
                switch(item.field) {
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

                title: <div className={ style.tableHeaderCell }
                            style={ { color: item.thColor } }>{ item.text }</div>,       // 表头的每一列
                // title    : item.text,
                dataIndex: item.field,
                id       : item.field,
                align    : 'center',
                render   : function (text, item, i) {
                    return text;
                },     // 自定义渲染表格中的每一项
                // className: style.tableHeaderCell,
                // width       : 80,
                onHeaderCell: (column) => {
                    // console.log(column);
                },
                // ellipsis    : true,      // 自动省略
                Breakpoint: 'sm',     // 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs'
                // fixed       : false,
                sorter: sortCallback,
            });
        }

        return tableHeader;
    }

    // 表头搜索
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
        // render                       : text =>
        //     this.state.searchedColumn === dataIndex ? (
        //         <Highlighter
        //             highlightStyle={ { backgroundColor: '#ffc069', padding: 0 } }
        //             searchWords={ [ this.state.searchText ] }
        //             autoEscape
        //             textToHighlight={ text ? text.toString() : '' }
        //         />
        //     ) : (text),
    });

    // 点击表头搜索重置按钮
    handleReset = clearFilters => {
        clearFilters();
        this.setState({ searchText: '' });
    };

    // 点击表头搜索按钮
    handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        this.setState({
            searchText    : selectedKeys[0],
            searchedColumn: dataIndex,
        });
    };

    // 选择表格中的每一项
    onSelectChange = (selectedRowKeys) => {
        this.setState({ selectedRowKeys });
        trigger(this.props.el, selectedRowKeys, 'selectchange');
    };

    renderTableHeaderConfig(data) {
        const handleClickMenu = e => {
            let index = e.item.props.index;
            let columns: any = this.state.columns;
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

    // 表格row 选择功能
    renderRowSelection() {
        const { selectedRowKeys } = this.state;
        return {
            selectedRowKeys,
            onChange  : this.onSelectChange,
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
    }

    // 重新加载表格数据
    async handleReload() {
        let id = this.props.dataset.from;
        if (id) {
            let form = document.querySelector(`#${ id }`) as HTMLElement;
            if (form) {
                let formData = await FormAction.getFormData(form);
                this.FormSubmit(formData);
            } else {
                this.FormSubmit();
            }
        } else {
            this.FormSubmit();
        }
    }

    // 删除多条
    async handleTableDeleteRows() {
        let ids = this.state.selectedRowKeys;
        let tasks: Array<Promise<any>> = ids.map(id => {
            let url = `//amis.local.superdalan.com/api/random/${ id }`;
            return this.httpClientService.delete(url);
        });
        Promise.all(tasks).then(res => {
            message.success('删除成功');
            this.handleReload();
        }, e => {
            console.log(e);
            message.error('删除失败');
        });
    }

    render() {
        return <div onMouseEnter={ this.handleTableWrapMouseEnter.bind(this) }
                    onMouseLeave={ this.handleTableWrapMouseLeave.bind(this) }>
            <Dropdown overlay={ this.renderTableHeaderConfig(this.state.columns) }
                      className={ `${ style.dropdown } ${ this.state.showDropdownBtn ? style.show : style.hide }` }
                      placement="bottomRight"
                      onVisibleChange={ this.handleDropdownVisibleChange.bind(this) }
                      visible={ this.state.showDropdown } trigger={ [ 'click' ] } arrow>
                <Button>
                    <a className="ant-dropdown-link" onClick={ e => e.preventDefault() }><UnorderedListOutlined/> </a>
                </Button>
            </Dropdown>

            <PanelTitle type="table"
                        title={ this.props.dataset.title }
                        handleReload={ this.handleReload.bind(this) }
                        handleTableDeleteRows={ this.handleTableDeleteRows.bind(this) }
            />

            <Table
                indentSize={ this.state.indentSize }
                // style={ this.props.style }       // TODO 在layout-list 的子元素下，会被影响到
                className={ style.formTable }
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
                // 指定 表格每一行的key值,多选表格的ID 就是 这里指定的key
                rowKey={ row => {
                    let keyField = this.state.rowkey;
                    return keyField ? row[keyField] : row;
                } }
                // 点击表头
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
                sticky={ true }
                // 表格行选择操作 (有 data-rowkey 属性才显示表格行多选操作 )
                rowSelection={ this.state.rowkey ? this.renderRowSelection() : undefined }
                loading={ this.state.loading }
                dataSource={ this.state.dataSource }
                showHeader={ this.props.dataset.showheader }
                size={ this.props.dataset.size }
                showSorterTooltip={ this.state.showSorterTooltip }        // 是否显示下一次排序的tip
                bordered={ this.props.dataset.bordered }
                pagination={ this.props.dataset.pagination ? {
                    pageSizeOptions: this.state.pages || [ '10', '20', '50', '100', '200' ],
                    pageSize       : this.state.pagesize || 50,
                    onChange       : this.handleChangePagination.bind(this),
                    current        : this.state.currentpage,
                    position       : [ 'none', this.props.dataset.position /*'bottomLeft'*/ ],     // 分页器展示的位置
                } : false }
                columns={ this.state.columns.filter(item => item['visible'] === true) }
                scroll={ {        //  表格是否可以滚动
                    y: this.props.dataset.height - 80 || undefined,     // 减去分页器的高度和title的高度
                } }
                // 表格行背景颜色 返回数据要有固定属性 antd 只能读样式名 不方便
                rowClassName={ (value: any, index) => {
                    let { rowstylekey } = this.props.dataset;
                    let className = 'class-name-' + hashCode(value[rowstylekey]);
                    if (value[rowstylekey]) {

                        let rowstyles = this.state.rowstyles;
                        if (!rowstyles[className]) {
                            rowstyles[className] = value[rowstylekey];
                            this.setState({ rowstyles });
                        }
                        return className;
                    }
                    return '';
                } }
            >
            </Table>
            <DataUpdateTime hidden={ !this.props.dataset.showupdate } content={ this.state.updateDate }/>

        </div>;
    }
}

