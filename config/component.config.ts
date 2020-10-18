/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/21
 * Time: 11:15 上午
 */
import zhCN from 'antd/es/locale/zh_CN';
import { isUrl } from '@utils/inspect';

// 钩子类型
export type hookType = 'load' | 'beforeLoad' | 'update' | 'beforeUpdate';

// 解析类型
export type parseType = 'string' | 'boolean' | 'number' | 'object[]' | 'string[]' | 'JSON';

// 组件设计器，属性值渲染类型
export type elType = 'switch' | 'list' | 'radio' | 'input' | 'select'

export interface IOptions {
    label: string
    value: string

    [key: string]: any
}

export interface IPropertyConfig<OptionItem> {
    el?: elType             //要渲染的组件名称
    value?: any
    options?: Array<OptionItem>       // 选择列表
    label?: string
    parse?: parseType
    render?: boolean
    desc?: string           // 字段描述
    verify?: (v) => any
}

interface IModulesConfig<Property> {
    [key: string]: {
        [key: string]: {
            component?: Promise<any>
            path?: string
            document?: Promise<any>
            property?: {
                dataset?: {
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
    }
}

const SizeOptions = [
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
];

export default {
    form  : {
        select: {
            path     : '/form-select',
            component: import('@component/form/select/select'),
            document : import('@component/form/select/select.md'),
            property : {
                dataset: {
                    label      : {
                        // beforeName: '',     // beforeName其实就是以前的key(在这个属性上是'label')
                        afterName: '',         // TODO 有afterName 表示antd上的新的属性(为了兼容原来的使用方式,做一层属性中间层的交换)
                        el       : 'input',
                        value    : 'form-select',
                        desc     : `label 标签的文本`,
                        parse    : 'string',
                    },
                    enum       : {
                        el   : 'list',
                        value: '1,Android;2,iOS;3,MacOS;4,Windows',
                        desc : '列表数据 逗号两边分别对应 key - value',
                        parse: 'object[]',
                    },
                    url        : {
                        el    : 'input',
                        value : 'http://e.local.aidalan.com/option/game/publisher?pf=0',
                        desc  : '列表数据的接口地址',
                        parse : 'string',
                        verify: value => isUrl(value),
                    },
                    disabled   : {
                        el   : 'switch',
                        value: false,
                        desc : '是否禁用',
                        parse: 'boolean',
                    },
                    mode       : {
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
                    placeholder: {
                        el   : 'input',
                        value: '请选择',
                        desc : '占位符',
                        parse: 'string',
                    },
                    autoFocus  : {
                        el    : 'switch',
                        value : false,
                        desc  : '是否自动获取焦点',
                        parse : 'boolean',
                        render: false,
                    },
                    allowClear : {
                        value : true,
                        render: false,              // TODO render 为false时，不在表单设计器中渲染,为默认值
                        parse : 'boolean',
                    },
                    showSearch : {     // 指定默认选中条目
                        el    : 'input',
                        value : true,
                        parse : 'boolean',
                        render: false,
                    },
                },
                value  : {
                    el     : 'select',
                    options: [],            // 通过解析enum来得到
                    value  : '',
                    desc   : '默认值',
                    parse  : 'string',
                },
                name   : {
                    el   : 'input',
                    value: 'form-select',
                    parse: 'string',
                    desc : '组件的name值',
                },
                hook   : {
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
                    size: {
                        el     : 'radio',
                        options: SizeOptions,
                        parse  : 'string',
                        value  : '',
                    },
                },
                value  : {},
                hook   : {},
            },
        },

        cascader: {
            path     : '/form-cascader',
            component: import('@component/form/cascader/cascader'),
            property : {
                dataset: {
                    showSearch: {
                        value : true,
                        parse : 'boolean',
                        render: false,
                    },
                },
            },
        },

        datepicker: {
            path     : '/form-datepicker',
            component: import('@component/form/datepicker/datepicker'),
            property : {
                dataset: {
                    allowClear: {
                        el    : 'switch',
                        parse : 'boolean',
                        render: false,
                        value : false,
                    },
                },
            },
        },
        ajax      : {
            component: import('@component/form/ajax/form'),
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
                    enum       : {
                        el   : 'list',
                        value: '1,Android;2,iOS',
                        parse: 'object[]',
                    },
                    disabled   : {
                        el   : 'switch',
                        value: false,
                        parse: 'boolean',
                    },
                    size       : {
                        el     : 'radio',
                        options: SizeOptions,
                        value  : 'middle',
                        parse  : 'string',
                    },
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
                    disabled         : {
                        el   : 'switch',
                        value: false,
                    },
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
                dataset: {
                    placeholder: {
                        el   : 'input',
                        value: '请输入',
                    },
                    type       : {
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
                    label      : {
                        el   : 'input',
                        value: '',
                        parse: 'string',
                    },
                },
            },
        },
        file      : {
            component: import('@component/form/file/file'),
            path     : 'form-file',
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
    },
    data  : {
        table          : {
            component: import('@component/data/table/table'),
            path     : '/data-table',
        },
        chartline      : {
            component: import('@component/data/chart/line/line'),
            path     : '/data-chartline',
        },
        chartcolumn    : {
            component: import('@component/data/chart/column/column'),
            path     : '/data-chartcolumn',
        },
        chartCoordinate: {
            component: import('@component/data/chart/coordinate/Coordinate'),
            path     : '/data-coordinate',
        },
        chartWorkCloud : {
            component: import('@component/data/chart/wordcloud/wordCloud'),
            path     : '/data-chartWorkCloud',
        },
        chartMap       : {
            component: import('@component/data/chart/map/map'),
            path     : '/data-chartMap',
        },
        list           : {
            component: import('@component/data/list/list'),
            path     : 'data-list',
        },
    },
    tips  : {
        loading: {
            component: import('@component/tips/loading/loading'),
        },
    },
    layout: {
        menu  : {
            component: import('@component/layout/menu/menu'),
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
} as IModulesConfig<IPropertyConfig<IOptions>>;

// 组件全局配置
export const globalComponentConfig: any = {
    locale                  : zhCN,
    componentSize           : 'middle',
    direction               : 'ltr',
    space                   : { size: 'small' },
    // virtual                 : true,
    dropdownMatchSelectWidth: true,
};
