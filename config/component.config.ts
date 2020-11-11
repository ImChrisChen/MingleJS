/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/21
 * Time: 11:15 上午
 */
import zhCN from 'antd/es/locale/zh_CN';
import { isUrl } from '@utils/inspect';
import moment from 'moment';

// 钩子类型
export type hookType = 'load' | 'beforeLoad' | 'update' | 'beforeUpdate';

// 解析类型
export type parseType = 'string' | 'boolean' | 'number' | 'object[]' | 'string[]' | 'JSON' | 'style' | 'null';

// 组件设计器，属性值渲染类型
export type elType = 'switch' | 'list' | 'radio' | 'input' | 'select' | 'datepicker' | 'slider';

export interface IOptions {
    label: string
    value: string | number
    title?: string

    [key: string]: any
}

export interface IPropertyConfig<OptionItem = IOptions> {
    el?: elType             //要渲染的组件名称
    value?: ((config: IComponentConfig) => any) | any
    options?: Array<OptionItem>       // 选择列表
    label?: string
    parse?: parseType
    render?: boolean
    desc?: string           // 字段描述
    verify?: (v) => any
}

interface IModulesConfig<Property> {
    [key: string]: {
        [key: string]: IComponentConfig<Property>
    }
}

export interface IComponentConfig<Property = IPropertyConfig> {
    component?: Promise<any>
    path?: string
    document?: Promise<any>
    property?: {
        dataset: {
            [key: string]: Property
        }
        value?: Property
        hook?: {
            [key in hookType]?: {
                el?: string
                value?: string
                render?: boolean
            }
        }
    }
}

// TODO 提取公共属性(待调整)
const UniversalProps = {
    label      : {},
    placeholder: {
        render: false,
        desc  : 'placeholder 属性提供可描述输入字段预期值的提示信息（hint)。',
        parse : 'string',
        value : (parsedDataset) => {
            if (!parsedDataset) return '';
            let label = parsedDataset.label.includes(':')
                ? parsedDataset.label.substring(0, parsedDataset.label.length - 1)
                : parsedDataset.label;
            return '请选择' + label;
        },
    },
    style      : {
        render: false,
        parse : 'style',
        value : '',
    },
    url        : {
        el    : 'input',
        value : '',
        desc  : '数据源',
        parse : 'string',
        verify: value => isUrl(value),
    },
    'enum'     : {
        el   : 'list',
        value: '1,Android;2,iOS;3,MacOS;4,Windows',
        // value: '',
        desc : '列表数据 逗号两边分别对应 key - value; 注意：如果有了data-url属性，data-enum则失效，data-enum,data-url二选一',
        parse: 'object[]',
    },
    disabled   : {
        el   : 'switch',
        value: false,
        parse: 'boolean',
        desc : '是否禁用',
    },
    size       : {
        el     : 'radio',
        options: [
            {
                label: 'large',
                value: 'large',
            },
            {
                label: 'middle',
                value: 'middle',
            },
            {
                label: 'small',
                value: 'small',
            },
        ],
        parse  : 'string',
        value  : '设置大小',
    },
} as {
    label: IPropertyConfig
    placeholder: IPropertyConfig
    url: IPropertyConfig
    style: IPropertyConfig
    enum: IPropertyConfig
    disabled: IPropertyConfig
    size: IPropertyConfig
    [key: string]: IPropertyConfig
};

export default {
    form  : {
        select    : {
            path     : '/form-select',
            component: import('@component/form/select/select'),
            document : import('@component/form/select/select.md'),
            property : {
                dataset    : {
                    label     : {
                        // beforeName: '',     // beforeName其实就是以前的key(在这个属性上是'label')
                        afterName: '',         // TODO 有afterName 表示antd上的新的属性(为了兼容原来的使用方式,做一层属性中间层的交换)
                        el       : 'input',
                        value    : 'form-select',
                        desc     : `label 标签的文本`,
                        parse    : 'string',
                    },
                    enum      : UniversalProps.enum,
                    url       : {
                        el    : 'input',
                        // value : 'http://e.local.aidalan.com/option/game/publisher?pf=0',
                        value : 'http://mingle-test.local.aidalan.com/mock/select.json',
                        desc  : '列表数据的接口地址',
                        parse : 'string',
                        verify: value => isUrl(value),
                    },
                    disabled  : UniversalProps.disabled,
                    mode      : {
                        el     : 'radio',
                        options: [
                            {
                                label: 'multiple',
                                value: 'multiple',
                            },
                            // {
                            //     label: 'tags',       //显示的值
                            //     value: 'tags',       //生成的代码的值
                            // },
                            {
                                label: 'single',
                                value: 'single',
                            },
                        ],
                        value  : 'multiple',
                        desc   : '模式',
                        parse  : 'string',
                    },
                    autoFocus : {
                        el    : 'switch',
                        value : false,
                        desc  : '是否自动获取焦点',
                        parse : 'boolean',
                        render: false,
                    },
                    allowClear: {
                        value : true,
                        render: false,              // TODO render 为false时，不在表单设计器中渲染,为默认值
                        parse : 'boolean',
                    },
                    showSearch: {     // 指定默认选中条目
                        el    : 'input',
                        value : true,
                        parse : 'boolean',
                        render: false,
                    },
                    key       : {
                        el   : 'input',
                        parse: 'string',
                        value: 'id',
                        desc : '数据源唯一id',
                    },
                    value     : {
                        el   : 'input',
                        parse: 'null',
                        value: '<{publisher_name}>',    // TODO 主要要传模版的时候，不能去用 string 解析
                        desc : '要展示的内容模版/字段',
                    },
                    groupby   : {
                        el   : 'input',
                        parse: 'string',
                        value: '',
                        desc : '按照groupby的值来进行分组排列',
                    },
                },
                value      : {
                    el     : 'select',
                    options: [],            // 通过解析enum来得到
                    value  : '',
                    desc   : '默认值',
                    parse  : 'string',
                },
                placeholder: UniversalProps.placeholder,
                name       : {
                    el   : 'input',
                    value: 'form-select',
                    parse: 'string',
                    desc : '组件的name值',
                },
                hook       : {
                    load        : {
                        el    : 'input',
                        value : 'componentLoad',
                        desc  : '组件加载完成的触发的函数',
                        render: false,
                    },
                    beforeLoad  : {
                        el    : 'input',
                        value : 'componentBeforeLoad',
                        desc  : '组件加载前触发的函数',
                        render: false,
                    },
                    update      : {
                        el    : 'input',
                        value : 'componentUpdate',
                        desc  : '组件更新后触发的函数',
                        render: false,
                    },
                    beforeUpdate: {
                        el    : 'input',
                        value : 'componentBeforeUpdate',
                        desc  : '组件更新前触发的函数',
                        render: false,
                    },
                },
            },
        },
        selectTree: {
            path     : '/form-selecttree',
            component: import('@component/form/select/tree/tree'),
            property : {
                dataset: {
                    size: UniversalProps.size,
                },
                value  : {},
                hook   : {},
            },
        },
        cascader  : {
            path     : '/form-cascader',
            component: import('@component/form/cascader/cascader'),
            property : {
                dataset: {
                    label     : {
                        el   : 'input',
                        value: '',
                        parse: 'string',
                    },
                    url       : {
                        el   : 'input',
                        value: 'http://e.aidalan.com/option/pf/list',
                        parse: 'string',
                    },
                    key       : {
                        el   : 'input',
                        value: '',
                        parse: 'string',
                        desc : '数据转化的ID唯一值',
                    },
                    value     : {
                        el   : 'input',
                        value: '',
                        parse: 'null',
                        desc : '数据展示值',
                    },
                    groupby   : {
                        el   : 'input',
                        value: '',
                        parse: 'string',
                        desc : '与data-key形成关系映射 id/pid',
                    },
                    showSearch: {
                        value : true,
                        parse : 'boolean',
                        render: false,
                    },
                },
                value  : {
                    el   : 'input',
                    value: [ '346_删除' ],
                    parse: 'null',
                },
            },
        },
        datepicker: {
            path     : '/form-datepicker',
            component: import('@component/form/datepicker/datepicker'),
            property : {
                dataset: {
                    label     : {
                        el   : 'input',
                        parse: 'string',
                        value: 'form-datepicker',
                    },
                    format    : {
                        el   : 'input',
                        parse: 'string',
                        value: 'YYYY-MM-DD',
                    },
                    single    : {
                        el   : 'switch',
                        parse: 'boolean',
                        value: true,
                    },
                    mindate   : {
                        el    : 'datepicker',
                        parse : 'string',
                        render: false,
                    },
                    maxdate   : {
                        el    : 'datepicker',
                        parse : 'string',
                        render: false,
                    },
                    allowClear: {
                        el    : 'switch',
                        parse : 'boolean',
                        render: false,
                        value : false,
                    },
                },
                value  : {
                    el   : 'input',
                    parse: 'null',
                    value: (config: IComponentConfig) => {      // TODO config 是 form-datepicker的配置
                        let date = moment().format('YYYY-MM-DD');
                        return [ date, date ];
                    },
                },
            },
        },
        ajax      : {
            component: import('@component/form/ajax/form'),
            property : {
                dataset: {
                    layout: {
                        el     : 'radio',
                        options: [
                            { label: 'v', value: 'v' },
                            { label: 'h', value: 'h' },
                        ],
                        parse  : 'string',
                        value  : 'flex',
                    },
                },
            },
        },
        button    : {
            path     : '/form-button',
            component: import('@component/form/button/button'),
            property : {
                dataset: {
                    label      : {
                        el   : 'input',
                        value: 'form-button',
                        desc : '',
                        parse: 'string',
                    },
                    enum       : UniversalProps.enum,
                    disabled   : UniversalProps.disabled,
                    size       : UniversalProps.size,
                    optionType : {
                        el     : 'radio',
                        options: [
                            {
                                label: 'button',
                                value: 'button',
                            },
                            {
                                label: 'default',
                                value: 'default',
                            },
                        ],
                        value  : 'button',
                        parse  : 'string',
                    },
                    buttonStyle: {
                        el     : 'radio',
                        options: [
                            {
                                label: 'solid',
                                value: 'solid',
                            }, {
                                label: 'online',
                                value: 'online',
                            },
                        ],
                        value  : '',
                        parse  : 'string',
                    },
                },
                value  : {
                    el     : 'select',
                    options: [],
                    value  : '',
                    parse  : 'string',
                },
            },
        },
        editor    : {
            component: import('@component/form/editor/editor'),
            path     : '/form-editor',
            property : {
                dataset: {
                    visibleEditor: {
                        el   : 'switch',
                        value: false,
                    },
                },
            },

        },
        switch    : {
            component: import('@component/form/switch/switch'),
            property : {
                dataset: {
                    disabled         : UniversalProps.disabled,
                    label            : {
                        el   : 'input',
                        value: 'form-switch',
                    },
                    checkedChildren  : {
                        el   : 'input',
                        value: '开启',
                    },
                    unCheckedChildren: {
                        el   : 'input',
                        value: '关闭',
                    },
                },
            },
        },
        input     : {
            component: import('@component/form/input/input'),
            property : {
                dataset    : {
                    type : {
                        el     : 'select',
                        options: [
                            {
                                label: 'text',
                                value: 'text',
                            },
                            {
                                label: 'password',
                                value: 'password',
                            },
                            {
                                label: 'number',
                                value: 'number',
                            },
                            //'button' | 'checkbox' | 'color' | 'date' | 'datetime-local' | 'email' | 'file' | 'hidden' | 'image' | 'month' | 'number' | 'password' | 'radio' | 'range' | 'reset' | 'search' | 'submit' | 'tel' | 'text' | 'time' | 'url' | 'week'
                        ],
                        value  : 'text',
                    },
                    label: {
                        el   : 'input',
                        value: '',
                        parse: 'string',
                    },
                },
                placeholder: UniversalProps.placeholder,
            },
        },
        file      : {
            component: import('@component/form/file/file'),
            path     : 'form-file',
            property : {
                dataset: {},
            },
        },
    },
    view  : {
        popover : {
            component: import('@component/view/popover/popover'),
        },
        dropdown: {
            component: import('@component/view/dropdown/dropdown'),
        },
        calendar: {
            path     : 'view-calendar',
            component: import('@component/view/calendar/calendar'),
            property : {
                dataset: {},
            },
        },
        template: {
            path     : 'view-template',
            component: import('@component/view/template/template'),
            property : {
                dataset: {},
            },
        },
    },
    data  : {
        table          : {
            component: import('@component/data/table/table'),
            path     : '/data-table',
            property : {
                dataset: {
                    'from'   : {
                        el   : 'input',
                        value: '',
                        parse: 'string',
                        desc : '要关联的 form表单的ID, 关联后form表单提交即可重新加载table组件的数据',
                    },
                    headerurl: {
                        el   : 'input',
                        value: 'http://mingle-test.local.aidalan.com/mock/table/tableHeader.json',
                        parse: 'string',
                        desc : '表头url',
                    },
                    url      : {
                        el   : 'input',
                        value: 'http://mingle-test.local.aidalan.com/mock/table/tableContent.json',
                        parse: 'string',
                        desc : '表数据url',
                    },
                    pagesize : {
                        el   : 'input',
                        parse: 'number',
                        desc : '表格每页显示数量',
                        value: 50,
                    },
                    pages    : {
                        el   : 'input',
                        parse: 'string[]',
                        value: '50,100,200',
                        desc : '自定义分页器页码',
                    },
                    position : {
                        el     : 'radio',
                        options: [
                            { label: 'bottomLeft', value: 'bottomLeft' },
                            { label: 'bottomCenter', value: 'bottomCenter' },
                            { label: 'bottomRight', value: 'bottomRight' },
                        ],
                        parse  : 'string',
                        value  : 'bottomRight',
                        desc   : '分页器的位置',
                    },
                },
                style  : {
                    el   : 'input',
                    parse: 'style',
                    value: 'overflow: auto',
                    desc : '样式',
                },
                height : {
                    el    : 'slider',
                    value : 500,
                    parse : 'number',
                    render: false,
                },
            },
        },
        image          : {
            component: import('@component/data/image/image'),
            path     : '/data-image',
            property : {
                dataset: {
                    'from'     : {
                        el    : 'input',
                        parse : 'string',
                        value : '',
                        render: false,
                    },
                    name       : {
                        el   : 'input',
                        parse: 'string',
                        value: '',
                        desc : '图表统计维度名称key_field的字段意思,例如:data-key_field="location", 那该值就是: 地域',
                    },
                    type       : {
                        el     : 'select',
                        parse  : 'string',
                        options: [
                            { label: '饼图', value: 'pie' },
                            { label: '柱状图', value: 'bar' },
                            { label: '折线图', value: 'line' },
                        ],
                        value  : 'bar',
                        desc   : '图表类型,默认柱状图',
                    },
                    url        : {
                        el   : 'input',
                        parse: 'string',
                        value: 'http://mingle-test.local.aidalan.com/mock/chart/areauser.json',
                        // value: 'http://e.aidalan.com/presenter/user/normal/chart?the_group=location&pf=0&date_way=multi&group_way=&date_range=2020-10-28~2020-10-28&dl_game_id=&dl_channel_id=&media_id=&dl_adv_position_id=&dl_publisher_id=&principal_id=&original_id=&group_type=reg_count',     // 地域统计
                        desc : '图表数据接口',
                    },
                    key_field  : {
                        el   : 'input',
                        value: 'location',
                        parse: 'string',
                        desc : '图表统计维度的字段名',
                    },
                    value_field: {
                        el   : 'input',
                        parse: 'string',
                        value: 'count',
                        desc : '图表统计的value值字段名',
                    },
                    colors     : {
                        el   : 'input',
                        value: '#6ad6b6',
                        parse: 'string[]',
                        desc : '图表颜色(多个颜色用逗号隔开，例如："#f00,#fff,#f00")',
                    },
                    groupby    : {
                        el   : 'input',
                        value: '',
                        parse: 'string',
                        desc : '分组统计,不填写默认不分组(需要数据格式支持)',
                    },
                    size       : {
                        el   : 'input',
                        value: '{"height": 400}',
                        parse: 'JSON',
                        desc : '图表大小',
                    },
                    datadirect : {
                        el   : 'input',
                        value: '',
                        parse: 'string',
                    },
                    title      : {
                        el   : 'input',
                        value: '',
                        parse: 'string',
                    },
                },
            },
        },
        charts         : {
            component: import('@component/data/chart/demo'),
            property : {
                dataset: {},
            },
        },
        panel          : {
            component: import('@component/data/panel/panel'),
            property : {
                dataset: {
                    url  : UniversalProps.url,
                    model: {
                        el   : 'input',
                        parse: 'JSON',
                        value: `{}`,
                    },
                },
            },
        },
        panel2         : {
            component: import('@component/data/panel/panel2'),
            property : {
                dataset: {
                    url  : UniversalProps.url,
                    model: {
                        el   : 'input',
                        parse: 'JSON',
                        value: `{}`,
                    },
                },
            },
        },
        chartline      : {
            component: import('@component/data/chart/line/line'),
            path     : '/data-chartline',
        },
        // chartcolumn    : {
        //     component: import('@component/data/chart/column/column'),
        //     path     : '/data-chartcolumn',
        // },
        chartCoordinate: {
            component: import('@component/data/chart/coordinate/Coordinate'),
            path     : '/data-coordinate',
        },
        // chartWorkCloud : {
        //     component: import('@component/data/chart/wordcloud/wordCloud'),
        //     path     : '/data-chartWorkCloud',
        // },
        // chartMap       : {
        //     component: import('@component/data/chart/map/map'),
        //     path     : '/data-chartMap',
        // },
        list           : {
            component: import('@component/data/list/list'),
            path     : 'data-list',
        },
        virtualTable   : {
            component: import('@component/data/table/_table'),
            path     : '/virtualTable',
        },
    },
    tips  : {
        loading: {
            component: import('@component/tips/loading/loading'),
        },
    },
    layout: {
        menu  : {
            component: import('@component/layout/menu/menu2'),
            path     : '/layout-menu',
            property : {
                dataset: {
                    // url     : UniversalProps.url,
                    url     : {
                        el   : 'input',
                        value: 'http://192.168.20.121:8081/mgm/menlist/',
                        parse: 'string',
                        desc : '数据源',
                    },
                    width   : {
                        el   : 'input',
                        value: 200,
                        parse: 'number',
                        desc : '菜单宽度',
                    },
                    menulist: {
                        el   : 'input',
                        parse: 'JSON',
                        desc : '菜单数据',
                        value: `[{"name":"111111111","path":"http://baidu.com","id":"111111","children":[{"name":"child","id":"123213","path":"http://taobao.com"}]},{"name":"2","path":"http://baidu.com","id":"2"}]`,
                    },
                },
            },
        },
        tab   : {
            component: import('@component/layout/tab/tab'),
            property : {
                dataset: {
                    tabPosition: {
                        el     : 'radio',
                        options: [
                            { label: 'top', value: 'top' },
                            { label: 'left', value: 'left' },
                        ],
                        value  : 'left',
                        parse  : 'string',
                    },
                },
            },
        },
        window: {
            component: import('@component/layout/window/window'),
            property : {
                dataset: {
                    title: {
                        el   : 'input',
                        parse: 'string',
                        value: '标题',
                    },
                },
            },
        },
        drawer: {
            component: import('@component/layout/drawer/drawer'),
        },
    },
    code  : {
        editor: {
            component: import('@component/code/editor/CodeEditor'),
        },
    },
    handle: {
        request: {
            component: import('@component/handle/request/request'),
            property : {
                dataset: {
                    trigger: {
                        el     : 'switch',
                        parse  : 'string',
                        value  : 'click',     // 'click' | 'hover'
                        options: [
                            { label: 'click', value: 'click' },
                            { label: 'hover', value: 'hover' },
                        ],
                    },
                    url    : {
                        el    : 'input',
                        value : '',
                        parse : 'string',
                        verify: v => isUrl(v),
                    },
                },
                value  : {
                    el   : 'input',
                    value: '',
                    parse: 'string',
                },
            },
        },
    },
} as IModulesConfig<IPropertyConfig<IOptions>>;

// 组件全局配置
export const globalComponentConfig: any = {
    locale                  : zhCN,
    componentSize           : 'small',
    direction               : 'ltr',        // ltr | rtl
    space                   : { size: 'small' },
    // virtual                 : true,
    dropdownMatchSelectWidth: true,
};
