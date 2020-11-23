/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/21
 * Time: 11:15 上午
 */
import zhCN from 'antd/es/locale/zh_CN';
import { isUrl } from '@utils/inspect';

let domain = '';
const isLocation = window.location.href.includes('-test');
if (isLocation) {
    domain = 'http://mingle-test.local.aidalan.com';
} else {
    domain = 'http://mingle.local.aidalan.com';
}

// 钩子类型
export type hookType = 'load' | 'beforeLoad' | 'update' | 'beforeUpdate';

// 解析类型
export type parseType = 'string' | 'boolean' | 'number' | 'object[]' | 'string[]' | 'JSON' | 'style' | 'null';

// 组件设计器，属性值渲染类型
export type elType = 'switch' | 'list' | 'radio' | 'input' | 'select' | 'datepicker' | 'slider' | 'number' | 'color';

export interface IOptions {
    label: string
    value: string | number
    title?: string

    [key: string]: any
}

export interface IPropertyConfig<OptionItem = IOptions> {
    el?: elType             // (组件设计器) 要渲染的组件名称
    value?: ((parsedDataset) => any) | any          // TODO 在组件设计器中是没有这个参数传入的
    options?: Array<OptionItem> | 'fromUrl'       // 选择列表
    label?: string            // 组件设计器中的label值
    parse?: parseType         // 解析类型
    request?: boolean         //  url 上才有这个属性，request为true时在组件设计器中会立即请求
    render?: boolean         // 是否可在组件设计器中配置
    desc?: string           // 字段描述
    verify?: (v) => boolean     // 验证属性值是否合法
    // template?: string,          // 生成代码用的基本模版
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
    label      : {
        el   : 'input',
        value: 'label:',
        desc : '表单控件描述,若没有设置placeholder 属性时，会默认使用label属性的值',
        parse: 'string',
    },
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
    name       : {
        el   : 'input',
        value: 'form-select',
        parse: 'string',
        desc : 'input 组件的name值',
    },

} as {
    label: IPropertyConfig
    placeholder: IPropertyConfig
    url: IPropertyConfig
    style: IPropertyConfig
    enum: IPropertyConfig
    disabled: IPropertyConfig
    size: IPropertyConfig
    name: IPropertyConfig
    [key: string]: IPropertyConfig
};

export default {
    // 子应用
    app   : {
        menu: {
            component: import('@component/app/menu/AppMenu'),
            property : {
                dataset: {
                    url: {
                        el    : 'input',
                        parse : 'string',
                        render: false,
                        value : domain + '/mock/menulist/uesr-menu.json',
                    },
                },
            },
        },

        layout: {
            component: import('@component/app/layout/AppLayout'),
            document : import('@component/app/layout/AppLayout.md'),
            path     : '/app-layout',
            property : {
                dataset: {
                    theme : {
                        el     : 'radio',
                        options: [
                            { label: 'light', value: 'light' },
                            { label: 'dark', value: 'dark' },
                        ],
                        value  : 'light',
                        parse  : 'string',
                        desc   : '主题色',
                    },
                    layout: {
                        el     : 'radio',
                        options: [
                            { label: 'h', value: 'h' },
                            { label: 'v', value: 'v' },
                        ],
                        parse  : 'string',
                        value  : 'v',
                    },
                },
            },
        },
    },
    form  : {
        select    : {
            path     : '/form-select',
            component: import('@component/form/select/select'),
            document : import('@component/form/select/select.md'),
            property : {
                dataset    : {
                    label     : UniversalProps.label,
                    enum      : UniversalProps.enum,
                    url       : {
                        el     : 'input',
                        value  : domain + '/mock/select.json',
                        desc   : '列表数据的接口地址',
                        request: true,
                        parse  : 'string',
                        verify : value => isUrl(value),
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
                        el    : 'switch',
                        value : true,
                        parse : 'boolean',
                        render: false,
                    },
                    key       : {
                        el     : 'input',
                        parse  : 'string',
                        options: 'fromUrl',
                        value  : 'id',
                        desc   : '数据源唯一id',
                    },
                    value     : {
                        el     : 'input',
                        parse  : 'null',
                        options: 'fromUrl',
                        value  : '<{publisher_name}>',    // TODO 主要要传模版的时候，不能去用 string 解析
                        desc   : '要展示的内容模版/字段',
                    },
                    groupby   : {
                        el     : 'input',
                        parse  : 'string',
                        options: 'fromUrl',
                        value  : '',
                        desc   : '按照groupby的值来进行分组排列',
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
                name       : UniversalProps.name,
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
                        render: true,
                    },
                },
            },
        },
        selectTree: {
            path     : '/form-selecttree',
            component: import('@component/form/select/tree/tree'),
            property : {
                dataset    : {
                    label     : UniversalProps.label,
                    size      : UniversalProps.size,
                    url       : {
                        el     : 'input',
                        parse  : 'string',
                        value  : domain + '/mock/tree.json',
                        request: true,
                        desc   : '数据源',
                    },
                    key       : {
                        el     : 'select',
                        options: 'fromUrl',
                        parse  : 'string',
                        value  : 'id',
                    },
                    value     : {
                        el     : 'select',
                        options: 'fromUrl',
                        parse  : 'string',
                        value  : 'name',
                    },
                    children  : {
                        el     : 'select',
                        options: 'fromUrl',
                        parse  : 'string',
                        value  : 'children',
                    },
                    allowClear: {
                        el    : 'switch',
                        parse : 'boolean',
                        render: false,
                        value : true,
                    },
                },
                placeholder: UniversalProps.placeholder,
                name       : UniversalProps.name,
                value      : {},
                hook       : {},
            },
        },
        cascader  : {
            path     : '/form-cascader',
            component: import('@component/form/cascader/cascader'),
            property : {
                dataset    : {
                    label     : UniversalProps.label,
                    url       : {
                        el     : 'input',
                        value  : domain + '/mock/select.json',
                        request: true,
                        parse  : 'string',
                    },
                    key       : {
                        el     : 'input',
                        value  : '',
                        options: 'fromUrl',
                        parse  : 'string',
                        desc   : '数据转化的ID唯一值',
                    },
                    value     : {
                        el     : 'input',
                        value  : '',
                        options: 'fromUrl',
                        parse  : 'null',
                        desc   : '数据展示值',
                    },
                    groupby   : {
                        el     : 'input',
                        value  : '',
                        options: 'fromUrl',
                        parse  : 'string',
                        desc   : '与data-key形成关系映射 id/pid',
                    },
                    showSearch: {
                        value : true,
                        parse : 'boolean',
                        render: false,
                    },
                },
                placeholder: UniversalProps.placeholder,
                name       : UniversalProps.name,
                value      : {
                    el   : 'input',
                    value: '',
                    parse: 'null',
                },
            },
        },
        datepicker: {
            path     : '/form-datepicker',
            component: import('@component/form/datepicker/datepicker'),
            property : {
                dataset: {
                    label     : UniversalProps.label,
                    disabled  : UniversalProps.disabled,
                    format    : {
                        el   : 'input',
                        parse: 'string',
                        value: 'YYYY-MM-DD',
                        desc : '日期格式，参考 moment.js 👉🏿 http://momentjs.cn/ ',
                    },
                    picker    : {
                        el     : 'select',
                        parse  : 'string',
                        value  : 'date',
                        options: [
                            { label: 'date', value: 'date' },
                            { label: 'month', value: 'month' },
                            { label: 'week', value: 'week' },
                        ],
                        desc   : '指定范围选择器类型',
                    },
                    single    : {
                        el   : 'switch',
                        parse: 'boolean',
                        value: false,
                        desc : '是否单选模式，单选 ｜ 多选',
                    },
                    mindate   : {
                        el   : 'datepicker',
                        parse: 'string',
                        value: '',
                        desc : '最小时间',
                    },
                    maxdate   : {
                        el   : 'datepicker',
                        parse: 'string',
                        value: '',
                        desc : '最大时间',
                    },
                    allowClear: {
                        el    : 'switch',
                        parse : 'boolean',
                        render: false,
                        value : false,
                    },
                },
                name   : UniversalProps.name,
                value  : {
                    el   : 'input',
                    parse: 'null',
                    value: '',
                    // value: (parsedDataset) => {      // TODO config 是 form-datepicker的配置
                    //     let date = moment().format('YYYY-MM-DD');
                    //     return [ date, date ];
                    // },
                },
            },
        },
        action    : {
            component: import('@component/form/form-action/form'),
            property : {
                dataset: {
                    async : {
                        el   : 'switch',
                        parse: 'boolean',
                        value: true,
                        desc : '是否是异步处理',
                    },
                    url   : {
                        el   : 'input',
                        parse: 'string',
                        value: 'http://baidu.com',
                        desc : 'form表单提交的url',
                    },
                    method: {
                        el   : 'radio',
                        parse: 'string',
                        value: 'post',
                        desc : '指定请求类型,提供, get | post | delete | put | options (默认post)',
                    },
                    layout: {
                        el     : 'radio',
                        options: [
                            { label: 'v', value: 'v' },
                            { label: 'h', value: 'h' },
                        ],
                        parse  : 'string',
                        value  : 'h',
                        desc   : '布局模式，v 表示垂直布局，h 水平布局',
                    },
                },
                id     : {
                    el   : 'input',
                    parse: 'string',
                    value: '',
                    desc : 'Form表单唯一ID,用户关联表格，图表，列表的data-from属性',
                },
                action : {
                    el   : 'input',
                    parse: 'string',
                    value: '',
                    desc : 'form表单要请求跳转的地址(会跳转到这个页面),只在data-async为false的情况下生效',
                },
            },
        },
        button    : {
            path     : '/form-button',
            component: import('@component/form/button/button'),
            property : {
                dataset: {
                    label      : UniversalProps.label,
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
                name   : UniversalProps.name,
                value  : {
                    el     : 'select',
                    options: [],
                    value  : '',
                    parse  : 'string',
                },
            },
        },
        switch    : {
            component: import('@component/form/switch/switch'),
            property : {
                dataset: {
                    disabled         : UniversalProps.disabled,
                    label            : UniversalProps.label,
                    checkedChildren  : {
                        el   : 'input',
                        value: '开启',
                    },
                    unCheckedChildren: {
                        el   : 'input',
                        value: '关闭',
                    },
                },
                name   : UniversalProps.name,
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
                    label: UniversalProps.label,
                },
                name       : UniversalProps.name,
                placeholder: UniversalProps.placeholder,
            },
        },
        file      : {
            component: import('@component/form/file/file'),
            path     : 'form-file',
            property : {
                dataset: {
                    label: UniversalProps.label,
                },
                name   : UniversalProps.name,
            },
        },
        color     : {
            component: import('@component/form/color/color'),
            path     : 'form-color',
            property : {
                dataset: {
                    label: UniversalProps.label,
                },
                value  : {
                    el   : 'color',
                    value: '#f0f',
                    parse: 'string',
                },
            },
        },
    },
    view  : {
        // popover : {
        //     component: import('@component/view/popover/popover'),
        // },
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
        // template: {
        //     path     : 'view-template',
        //     component: import('@component/view/template/template'),
        //     property : {
        //         dataset: {},
        //     },
        // },
    },
    data  : {
        table          : {
            component: import('@component/data/table/table'),
            path     : '/data-table',
            property : {
                dataset: {
                    'from'     : {
                        el   : 'input',
                        value: '',
                        parse: 'string',
                        desc : '要关联的 form表单的ID, 关联后form表单提交即可重新加载table组件的数据',
                    },
                    headerurl  : {
                        el   : 'input',
                        value: domain + '/mock/table/tableHeader.json',
                        // value: 'http://192.168.20.121:8080/mgm/header',
                        parse: 'string',
                        desc : '表头url',
                    },
                    url        : {
                        el   : 'input',
                        value: domain + '/mock/table/tableContent.json',
                        // value: 'http://192.168.20.121:8080/mgm/data',
                        parse: 'string',
                        desc : '表数据url',
                    },
                    pagesize   : {
                        el   : 'input',
                        parse: 'number',
                        desc : '表格每页显示数量',
                        value: 50,
                    },
                    currentpage: {
                        el   : 'input',
                        parse: 'number',
                        desc : '当前页',
                        value: 1,
                    },
                    pages      : {
                        el   : 'input',
                        parse: 'string[]',
                        value: '50,100,200',
                        desc : '自定义分页器页码',
                    },
                    pagination : {
                        el   : 'switch',
                        parse: 'boolean',
                        value: true,
                        desc : '是否显示分页器',
                    },
                    position   : {
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
                    height     : {
                        el    : 'number',
                        value : ''/*'300'*/,
                        parse : 'number',
                        desc  : '表格内容高度, 可滚动',
                        render: true,
                    },
                },
                // style  : {
                //     el   : 'input',
                //     parse: 'style',
                //     value: 'overflow: auto;height:200px',
                //     desc : '样式',
                // },
            },
        },
        chart          : {
            component: import('@component/data/image/image'),
            path     : '/data-chart',
            property : {
                dataset: {
                    'from'    : {
                        el    : 'input',
                        parse : 'string',
                        value : '',
                        render: false,
                    },
                    url       : {
                        el     : 'input',
                        parse  : 'string',
                        request: true,
                        value  : domain + '/mock/chart/areauser.json',
                        desc   : '图表数据接口',
                    },
                    name      : {
                        el   : 'input',
                        parse: 'string',
                        value: '',
                        desc : '图表统计维度名称key_field的字段意思,例如:data-key_field="location", 那该值就是: 地域',
                    },
                    type      : {
                        el     : 'select',
                        parse  : 'string',
                        options: [
                            { label: '饼图', value: 'pie' },
                            { label: '柱状图', value: 'bar' },
                            { label: '折线图', value: 'line' },
                            { label: '词云', value: 'word' },
                        ],
                        value  : 'bar',
                        desc   : '图表类型,默认柱状图',
                    },
                    key       : {
                        el     : 'input',
                        value  : 'location',
                        options: 'fromUrl',
                        parse  : 'string',
                        desc   : '图表统计维度的字段名',
                    },
                    value     : {
                        el     : 'input',
                        parse  : 'string',
                        options: 'fromUrl',
                        value  : 'count',
                        desc   : '图表统计的value值字段名',
                    },
                    colors    : {
                        el   : 'color',
                        value: '#6ad6b6',
                        parse: 'string[]',
                        desc : '图表颜色(多个颜色用逗号隔开，例如："#f00,#fff,#f00")',
                    },
                    groupby   : {
                        el     : 'input',
                        value  : '',
                        options: 'fromUrl',
                        parse  : 'string',
                        desc   : '分组统计,不填写默认不分组(需要数据格式支持)',
                    },
                    height    : {
                        el   : 'number',
                        value: 400,
                        parse: 'number',
                        desc : '图表高度',
                    },
                    // datadirect: {
                    //     el   : 'input',
                    //     value: '',
                    //     parse: 'string',
                    // },
                    title     : {
                        el   : 'input',
                        value: '',
                        parse: 'string',
                    },
                },
            },
        },
        // charts         : {
        //     component: import('@component/data/chart/demo'),
        //     property : {
        //         dataset: {},
        //     },
        // },
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
        // panel2         : {
        //     component: import('@component/data/panel/panel2'),
        //     property : {
        //         dataset: {
        //             url  : UniversalProps.url,
        //             model: {
        //                 el   : 'input',
        //                 parse: 'JSON',
        //                 value: `{}`,
        //             },
        //         },
        //     },
        // },
        // chartline      : {
        //     component: import('@component/data/chart/line/line'),
        //     path     : '/data-chartline',
        // },
        // chartcolumn    : {
        //     component: import('@component/data/chart/column/column'),
        //     path     : '/data-chartcolumn',
        // },
        // chartCoordinate: {
        //     component: import('@component/data/chart/coordinate/Coordinate'),
        //     path     : '/data-coordinate',
        // },
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
    },
    tips  : {
        // loading: {
            // component: import('@component/tips/loading/loading'),
        // },
    },
    layout: {
        menu  : {
            component: import('@component/layout/menu/LayoutMenu'),
            path     : '/layout-menu',
            property : {
                dataset: {
                    // url     : UniversalProps.url,
                    url     : {
                        el   : 'input',
                        // value: 'http://192.168.20.121:8081/mgm/menlist/',
                        // value: 'http://mingle-test.local.aidalan.com/mock/menulist/menu.json',
                        value: domain + '/mock/tree.json',
                        parse: 'string',
                        desc : '数据源',
                    },
                    open    : {
                        el   : 'switch',
                        value: true,
                        parse: 'boolean',
                        desc : '是否默认展开',
                    },
                    id      : {
                        el   : 'input',
                        // value: 'appMenuId',
                        value: 'id',
                        parse: 'string',
                        desc : '菜单ID映射字段名称,例如:id',
                    },
                    pid     : {
                        el   : 'input',
                        // value: 'r_father',
                        value: 'parent',
                        parse: 'string',
                        desc : '菜单父级映射字段名称,例如:parent_id',
                    },
                    name    : {
                        el   : 'input',
                        value: 'name',
                        parse: 'string',
                        desc : '菜单名称映射字段名称,例如:menu_name',
                    },
                    layout  : {
                        el     : 'radio',
                        options: [
                            { label: 'vertical', value: 'vertical' },
                            { label: 'horizontal', value: 'horizontal' },
                            { label: 'inline', value: 'inline' },
                        ],
                        value  : 'inline',
                        parse  : 'string',
                        desc   : '菜单类型，现在支持垂直(vertical)、水平(horizontal)、和内嵌模式(inline)三种',
                    },
                    children: {
                        el   : 'input',
                        value: 'children',
                        parse: 'string',
                        desc : '子菜单映射字段名称,例如:children',
                    },
                    width   : {
                        el   : 'number',
                        value: 200,
                        parse: 'number',
                        desc : '菜单宽度',
                    },
                    menulist: {
                        el    : 'input',
                        parse : 'JSON',
                        desc  : '菜单数据',
                        value : `[{"name":"111111111","path":"http://baidu.com","id":"111111","children":[{"name":"child","id":"123213","path":"http://taobao.com"}]},{"name":"2","path":"http://baidu.com","id":"2"}]`,
                        render: false,
                    },
                },
            },
        },
        tab   : {
            component: import('@component/layout/tab/tab'),
            document : import('@component/layout/tab/tab.md'),
            path     : '/layout-tab',
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
            document : import('@component/layout/window/window.md'),
            path     : '/layout-window',
            property : {
                dataset: {
                    title  : {
                        el   : 'input',
                        parse: 'string',
                        value: '标题',
                        desc : '弹窗的标题',
                    },
                    content: {
                        el   : 'input',
                        parse: 'string',
                        value: '标题',
                        desc : '按钮的内容',
                    },
                },
            },
        },
        drawer: {
            component: import('@component/layout/drawer/drawer'),
        },
        steps : {
            path     : '/layout-steps',
            component: import('@component/layout/steps/steps'),
            document : import('@component/layout/steps/steps.md'),
            property : {
                dataset: {
                    current: {
                        el   : 'number',
                        parse: 'number',
                        desc : '指定当前步骤，从 0 开始记数。',
                        value: 0,
                    },
                    layout : {
                        el     : 'radio',
                        parse  : 'string',
                        desc   : '布局方式',
                        options: [
                            { label: 'horizontal', value: 'horizontal' },
                            { label: 'vertical', value: 'vertical' },
                        ],
                        value  : undefined,
                    },
                    type   : {
                        el     : 'radio',
                        parse  : 'string',
                        options: [
                            { label: 'navigation', value: 'navigation' },
                            { label: 'default', value: 'default' },
                        ],
                        value  : undefined,
                        desc   : '步骤条类型，有 default 和 navigation 两种',
                    },
                },
            },
        },
    },
    handle: {
        request: {
            component: import('@component/handle/request/request'),
            document : import('@component/handle/request/request.md'),
            path     : '/handle-request',
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
                        value : domain + '/mock/menulist/uesr-menu.json',
                        parse : 'string',
                        verify: v => isUrl(v),
                    },
                },
            },
        },
    },
    editor: {
        flow    : {     // 流程图
            component: import('@component/editor/flow/flow'),
            property : {
                dataset: {},
            },
        },
        markdown: {     // markdown 编辑器
            component: import('@component/editor/markdown-editor/MarkdownEditor'),
            path     : '/editor-markdown',
            property : {
                dataset: {
                    visibleEditor: {
                        el   : 'switch',
                        value: true,
                        parse: 'boolean',
                        desc : '是否显示编辑区域',
                    },
                },
                value  : {
                    el   : 'input',
                    parse: 'string',
                    value: '# 哈哈哈🙄',
                    desc : '内容',
                },
            },
        },
        code    : {     // 代码编辑器
            component: import('@component/code/editor/CodeEditor'),
            path     : '/editor-code',
            property : {
                dataset: {},
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
