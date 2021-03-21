/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/21
 * Time: 11:15 上午
 */
import zhCN from 'antd/es/locale/zh_CN';
import { isUndefined, isUrl } from '@utils/inspect';
import moment from 'moment';

let domain = '';
const isLocation = window.location.href.includes('-test');
if (isLocation) {
    domain = 'http://mingle-test.local.aidalan.com';
} else {
    domain = 'http://mingle.local.aidalan.com';
}
process.env.file = '//file.superdalan.com';
process.env.mobile = '//m.aidalan.com';
process.env.bbs = '//bbs.aidalan.com';

const file = '//file.superdalan.com';
const mobile = '';
const bbs = '';

// 钩子类型
export type hookType = 'load' | 'beforeLoad' | 'update' | 'beforeUpdate';

// 解析类型
export type parseType =
    'string'
    | 'boolean'
    | 'number'
    | 'object[]'
    | 'string[]'
    | 'number[]'
    | 'JSON'
    | 'style'
    | 'null'
    | Function /* 只能用于做验证的方法 比如 isUndefined, isBoolean */

// 组件设计器，属性值渲染类型
export type elType =
    'switch'
    | 'list'
    | 'radio'
    | 'input'
    | 'select'
    | 'datepicker'
    | 'slider'
    | 'number'
    | 'color'
    | 'select-multiple';

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
    name?: string
}

// 公共配置属性 Interface
interface IUniversalProps<T> {
    label: T
    placeholder: T
    url: T
    style: T
    enum: T
    disabled: T
    size: T
    name: T
    required: T
    smart: T
    group: T

    [key: string]: T
}

// TODO 提取公共属性(待调整)
const UniversalProps: IUniversalProps<IPropertyConfig> = {
    label      : {
        el   : 'input',
        value: 'label:',
        desc : '表单控件描述,若没有设置placeholder 属性时，会默认使用label属性的值',
        parse: 'string',
    },
    placeholder: JSON.parse(JSON.stringify({
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
    })),
    style      : {
        render: false,
        parse : 'style',
        value : '',
        desc  : '样式',
    },
    url        : {
        el   : 'input',
        value: '',
        desc : '数据源',
        parse: 'string',
        // verify: value => isUrl(value),
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
        value  : 'middle',
    },
    name       : {
        el   : 'input',
        value: 'form-select',
        parse: 'string',
        desc : 'input 组件的name值',
    },
    required   : {
        el   : 'switch',
        parse: 'boolean',
        value: false,
        desc : '表单项是否必填',
    },
    smart      : {     // form组件
        el    : 'switch',
        render: true,
        value : false,
        parse : 'boolean',
        desc  : '表单快速填充工具,添加后可以配置表单使用，是一个快速填充表格内容的工具',
    },
    exec       : {
        el    : 'switch',
        parse : 'boolean',
        value : false,
        desc  : '是否选择后，立即提交表单加载数据',
        render: true,
    },
    group      : {      // form组件
        el    : 'input',
        parse : 'string',
        value : '',
        desc  : 'data-group的值为一致时，他们则为单选的一组，组内的组件只能选择一个，其他成员的值将被清空',
        render: false,
    },
};

// TODO 注意属性不能使用驼峰例如: data-headerUrl, attribute不区分大小写，但是这里是用的dataset会全部转成小写来获取;
export const componentConfig = {
    // 子应用
    app   : {
        menu  : {
            component: import('@component/app/menu/AppMenu'),
            property : {
                dataset: {
                    // url      : {
                    //     el   : 'input',
                    //     parse: 'string',
                    //     value: domain + '/server/mock/menulist/uesr-menu.json',
                    // },
                    pathfield: {
                        el   : 'input',
                        parse: 'string',
                        // options: 'fromUrl',
                        value: 'url',
                        desc : '菜单URL跳转字段',
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
                            { label: 'horizontal', value: 'horizontal' },
                            { label: 'vertical', value: 'vertical' },
                        ],
                        parse  : 'string',
                        value  : 'vertical',
                    },
                },
            },
        },
        // feishu: {
        //     component: import('@component/app/feishu/AppFeishu'),
        //     document : import('@component/app/feishu/AppFeishu.md'),
        //     path     : '/app-lark',
        //     property : {
        //         dataset: {},
        //     },
        // },
    },
    form  : {
        select    : {
            path     : '/form-select',
            component: import('@component/form/select/FormSelect'),
            document : import('@component/form/select/FormSelect.md'),
            property : {
                dataset    : {
                    label     : UniversalProps.label,
                    enum      : UniversalProps.enum,
                    url       : {
                        el     : 'input',
                        value  : domain + '/server/mock/select.json',
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
                            {
                                label: 'tags',       //显示的值
                                value: 'tags',       //生成的代码的值
                            },
                            {
                                label: 'single',
                                value: 'single',
                            },
                        ],
                        value  : 'single',
                        desc   : '模式 在 tags 和 multiple 模式下自动分词的分隔符',
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
                        el     : 'select',
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
                    required  : UniversalProps.required,
                    smart     : UniversalProps.smart,
                    group     : UniversalProps.group,
                },
                value      : {
                    el     : 'select',
                    parse  : 'string',
                    options: [],            // 通过解析enum来得到
                    value  : '',
                    desc   : '默认值',
                },
                placeholder: UniversalProps.placeholder,
                style      : UniversalProps.style,
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
                        render: false,
                    },
                },
            },
            name     : '下拉框',
        },
        selecttree: {
            path     : '/form-selecttree',
            component: import('@component/form/select/tree/FormSelectTree'),
            document : import('@component/form/select/tree/FormSelectTree.md'),
            property : {
                dataset    : {
                    disabled  : UniversalProps.disabled,
                    label     : UniversalProps.label,
                    size      : UniversalProps.size,
                    url       : {
                        el     : 'input',
                        parse  : 'string',
                        value  : domain + '/server/mock/tree.json',
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
                    required  : UniversalProps.required,
                    smart     : UniversalProps.smart,
                    group     : UniversalProps.group,

                },
                placeholder: UniversalProps.placeholder,
                name       : UniversalProps.name,
                style      : UniversalProps.style,
                value      : {
                    el   : 'input',
                    parse: 'string[]',
                    value: '',
                    desc : '选中的唯一值',
                },
                hook       : {},
            },
            name     : '树形下拉框',
        },
        checkbox  : {
            component: import('@component/form/checkbox/FormCheckbox'),
            document : import('@component/form/checkbox/FormCheckbox.md'),
            path     : '/form-checkbox',
            property : {
                dataset: {
                    disabled: UniversalProps.disabled,
                    url     : UniversalProps.url,
                    enum    : UniversalProps.enum,
                    label   : UniversalProps.label,
                    key     : {
                        el     : 'input',
                        value  : '',
                        options: 'fromUrl',
                        parse  : 'string',
                        desc   : '数据转化的ID唯一值',
                    },
                    value   : {
                        el     : 'input',
                        value  : '',
                        options: 'fromUrl',
                        parse  : 'null',
                        desc   : '数据展示值',
                    },
                    smart   : UniversalProps.smart,
                    group   : UniversalProps.group,
                },
                style  : UniversalProps.style,
                name   : UniversalProps.name,
                value  : {},
            },
            name     : '复选框',
        },
        cascader  : {
            path     : '/form-cascader',
            component: import('@component/form/cascader/FormCascader'),
            document : import('@component/form/cascader/FormCascader.md'),
            property : {
                dataset    : {
                    disabled  : UniversalProps.disabled,
                    label     : UniversalProps.label,
                    url       : {
                        el     : 'input',
                        value  : domain + '/server/mock/select.json',
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
                    required  : UniversalProps.required,
                    smart     : UniversalProps.smart,
                    group     : UniversalProps.group,
                },
                placeholder: UniversalProps.placeholder,
                name       : UniversalProps.name,
                style      : UniversalProps.style,
                value      : {
                    el   : 'input',
                    value: '',
                    parse: 'string',
                },
            },
            name     : '级联选择器',
        },
        datepicker: {
            path     : '/form-datepicker',
            component: import('@component/form/datepicker/FormDatepicker'),
            document : import('@component/form/datepicker/FormDatepicker.md'),
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
                    mode      : {
                        el     : 'select',
                        value  : '',
                        options: [
                            { label: 'time', value: 'time' },
                            { label: 'date', value: 'date' },
                            { label: 'month', value: 'month' },
                            { label: 'year', value: 'year' },
                            { label: 'decade', value: 'decade' },
                        ],
                        parse  : 'string',
                        desc   : '日期面板状态',
                    },
                    showtime  : {
                        el   : 'switch',
                        parse: 'boolean',
                        value: false,
                        desc : '是否显示时间选择(时分秒)',
                    },
                    picker    : {
                        el     : 'select',
                        parse  : 'string',
                        value  : 'date',
                        options: [
                            { label: 'year', value: 'year' },
                            { label: 'month', value: 'month' },
                            { label: 'week', value: 'week' },
                            { label: 'date', value: 'date' },
                        ],
                        desc   : '指定范围选择器类型',
                    },
                    single    : {
                        el   : 'switch',
                        parse: 'boolean',
                        value: false,
                        desc : '是否单选模式，单选 ｜ 多选',
                    },
                    allowClear: {
                        el    : 'switch',
                        parse : 'boolean',
                        render: false,
                        value : false,
                    },
                    required  : UniversalProps.required,
                    smart     : UniversalProps.smart,
                    usenow    : {
                        el   : 'switch',
                        parse: 'boolean',
                        value: true,
                        desc : '是否使用当前时间, 值为false时，时间则为空',
                    },
                    group     : UniversalProps.group,
                },
                name   : UniversalProps.name,
                style  : UniversalProps.style,
                value  : {
                    el   : 'input',
                    parse: 'null',
                    value(parsedDataset) {
                        console.log(parsedDataset);
                        if (!parsedDataset) {
                            return '';
                        }
                        let { single, usenow } = parsedDataset;
                        if (usenow) {
                            let date = moment().subtract(0, 'days').format(parsedDataset.format);  // 今天
                            return single ? date : date + '~' + date;
                        } else {
                            return '';
                        }
                        // let momentDate = moment(date, parsedDataset.format);
                        // return parsedDataset.single ? momentDate : [ momentDate, momentDate ];
                        // return [ moment('2020-10-28', parsedDataset.format), moment('2020-10-28', parsedDataset.format) ];
                    },
                },
            },
            name     : '时间选择器',
        },
        action    : {
            component: import('@component/form/form-action/FormAction'),
            path     : '/form-action',
            property : {
                dataset: {
                    async   : {
                        el   : 'switch',
                        parse: 'boolean',
                        value: true,
                        desc : '是否是异步处理',
                    },
                    url     : {
                        el   : 'input',
                        parse: 'string',
                        value: '',
                        desc : 'form表单提交的url',
                    },
                    method  : {
                        el   : 'radio',
                        parse: 'string',
                        value: 'post',
                        desc : '指定请求类型,提供, get | post | delete | put | options (默认post)',
                    },
                    layout  : {
                        el     : 'radio',
                        options: [
                            { label: 'vertical', value: 'vertical' },
                            { label: 'horizontal', value: 'horizontal' },
                        ],
                        parse  : 'string',
                        value  : 'horizontal',
                        desc   : '布局模式，vertical 表示垂直布局，horizontal 水平布局',
                    },
                    showmsg : {
                        el   : 'switch',
                        parse: 'boolean',
                        value: true,
                        desc : '表单提交后，是否显示URL提示信息',
                    },
                    msgfield: {
                        el     : 'select',
                        parse  : 'string',
                        value  : 'message',
                        options: 'fromUrl',
                        desc   : 'URL返回的参数 ，指定提交后的提示字段',
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
            document : import('@component/form/form-action/FormAction.md'),
            name     : 'form表单',
        },
        radio     : {
            path     : '/form-radio',
            component: import('@component/form/button/FormButton'),
            property : {
                dataset: {
                    disabled   : UniversalProps.disabled,
                    label      : UniversalProps.label,
                    enum       : UniversalProps.enum,
                    size       : UniversalProps.size,
                    type       : {  // optionType
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
                        value  : 'solid',
                        parse  : 'string',
                        render : true,
                    },
                    required   : UniversalProps.required,
                    smart      : UniversalProps.smart,
                    group      : UniversalProps.group,
                    tplSelector: {
                        el   : 'input',
                        parse: 'string',
                        value: '',
                        desc : '要指定的模版的 选择器',
                    },
                },
                style  : UniversalProps.style,
                name   : UniversalProps.name,
                value  : {
                    el     : 'select',
                    options: [],
                    value  : '',
                    parse  : 'string',
                },
            },
            name     : '单选框',
        },
        slider    : {
            path     : '/form-slider',
            component: import('@component/form/slider/FormSlider'),
            document : import('@component/form/slider/FormSlider.md'),
            property : {
                dataset: {
                    max     : {
                        el   : 'number',
                        parse: 'number',
                        value: 100,
                        desc : '最大值',
                    },
                    min     : {
                        el   : 'number',
                        parse: 'number',
                        value: 0,
                        desc : '最小值',
                    },
                    range   : {
                        el   : 'switch',
                        parse: 'boolean',
                        value: false,
                        desc : '双滑块模式',
                    },
                    step    : {
                        el   : 'number',
                        parse: 'number',
                        value: 1,
                        desc : '步长，取值必须大于 0，并且可被 (max - min) 整除。当 marks 不为空对象时，可以设置 step 为 null，此时 Slider 的可选值仅有 marks 标出来的部分',
                    },
                    disabled: UniversalProps.disabled,
                },
                value  : {
                    el   : 'input',
                    parse: 'number[]',
                    desc : '默认值',
                    value(parsedDataset) {
                        if (parsedDataset && parsedDataset.range) {
                            return '0,10';
                        } else {
                            return '0';
                        }
                    },
                },
            },
            name     : '滑动选择器',
        },
        switch    : {
            path     : '/form-switch',
            component: import('@component/form/switch/FormSwtich'),
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
                    smart            : UniversalProps.smart,
                    // required: UniversalProps.required,
                },
                name   : UniversalProps.name,
                style  : UniversalProps.style,
                group  : UniversalProps.group,
            },
            name     : '开关选择器',
        },
        input     : {
            path     : '/form-input',
            component: import('@component/form/input/FormInput'),
            property : {
                dataset    : {
                    type    : {
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
                    label   : UniversalProps.label,
                    required: UniversalProps.required,
                    smart   : UniversalProps.smart,
                    group   : UniversalProps.group,
                    disabled: UniversalProps.disabled,
                },
                name       : UniversalProps.name,
                style      : UniversalProps.style,
                placeholder: UniversalProps.placeholder,
                group      : UniversalProps.group,
                value      : {
                    el   : 'input',
                    parse: 'string',
                    desc : '默认值',
                    value: '',
                },
            },
            name     : '文本框',
        },
        group     : {
            path     : '/form-group',
            component: import('@component/form/group/FormGroup'),
            document : import('@component/form/group/FormGroup.md'),
            property : {
                dataset: {
                    layout: {
                        el     : 'radio',
                        parse  : 'string',
                        value  : 'h',
                        options: [
                            { label: 'h', value: 'h' },
                            { label: 'v', value: 'v' },
                        ],
                    },
                },
            },
            name     : '表单组',
        },
        upload    : {
            component: import('@component/form/upload/FormUpload'),
            path     : '/form-upload',
            property : {
                dataset: {
                    label   : UniversalProps.label,
                    url     : {
                        el   : 'input',
                        parse: 'string',
                        // value: 'http:///server/upload',
                        value: `${ file }/upload/byCode`,
                        desc : '上传的地址',
                    },
                    type    : {
                        el     : 'radio',
                        options: [
                            { label: 'text', value: 'text' },
                            { label: 'picture', value: 'picture' },
                            { label: 'picture-card', value: 'picture-card' },
                        ],
                        value  : 'picture-card',
                        parse  : 'string',
                        desc   : '上传列表的内建样式，支持三种基本样式 text, picture 和 picture-card',
                    },
                    multiple: {
                        el   : 'switch',
                        value: false,
                        parse: 'boolean',
                        desc : '是否支持多选文件，开启后按住 ctrl 可选择多个文件',
                    },
                    accept  : {
                        el   : 'input',
                        value: 'image/*',
                        parse: 'string',
                        desc : `允许上传的文件类型，多个类型用逗号分开,具体参见 👇🏻
                       https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept`,
                    },
                    filename: {
                        el   : 'input',
                        parse: 'string',
                        value: '',
                        desc : '发到后台的文件参数名',
                    },
                    disabled: UniversalProps.disabled,
                    required: UniversalProps.required,
                    group   : UniversalProps.group,
                },
                name   : UniversalProps.name,
                style  : UniversalProps.style,
                smart  : UniversalProps.smart,
            },
            name     : '文件上传',
        },
        color     : {
            component: import('@component/form/color/FormColor'),
            path     : '/form-color',
            property : {
                dataset: {
                    label   : UniversalProps.label,
                    required: UniversalProps.required,
                    smart   : UniversalProps.smart,
                    group   : UniversalProps.group,
                },
                value  : {
                    el   : 'color',
                    value: '#f0f',
                    parse: 'string',
                },
                name   : UniversalProps.name,
                smart  : UniversalProps.smart,
                style  : UniversalProps.style,
            },
            name     : '颜色选择器',
        },
        transfer  : {
            component: import('@component/form/transfer/FormTransfer'),
            path     : '/form-transfer',
            property : {
                dataset: {
                    url     : {
                        el     : 'input',
                        value  : domain + '/server/mock/select.json',
                        desc   : '列表数据的接口地址',
                        request: true,
                        parse  : 'string',
                        verify : value => isUrl(value),
                    },
                    key     : {
                        el     : 'select',
                        parse  : 'string',
                        options: 'fromUrl',
                        value  : 'id',
                        desc   : '数据源唯一id',
                    },
                    value   : {
                        el     : 'input',
                        parse  : 'null',
                        options: 'fromUrl',
                        value  : 'publisher_name',    // TODO 主要要传模版的时候，不能去用 string 解析
                        desc   : '要展示的内容模版/字段',
                    },
                    pagesize: {
                        el   : 'input',
                        parse: 'number',
                        desc : '每页显示数量',
                        value: 100,
                    },
                    height  : {
                        el   : 'number',
                        parse: 'number',
                        desc : '高度',
                        value: 300,
                    },
                    width   : {
                        el   : 'number',
                        parse: 'number',
                        desc : '宽度',
                        value: 240,
                    },
                    titles  : {
                        el   : 'input',
                        parse: 'string[]',
                        desc : '标题',

                        value: 'source,target',
                    },
                },
                value  : {
                    el   : 'input',
                    parse: 'string[]',
                    value: '1,2',
                    desc : '默认值',
                },
            },
        },
    },
    view  : {
        steps   : {
            path     : '/view-steps',
            component: import('@component/view/steps/ViewSteps'),
            document : import('@component/view/steps/ViewSteps.md'),
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
            name     : '步骤',
        },
        dropdown: {
            component: import('@component/view/dropdown/ViewDropdown'),
            property : {
                dataset: {
                    trigger: {
                        el     : 'radio',
                        parse  : 'string',
                        options: [
                            { label: '鼠标点击触发', value: 'click' },
                            { label: '鼠标移入触发', value: 'hover' },
                        ],
                        value  : 'hover',
                        desc   : '触发方式',
                    },
                    content: {
                        el   : 'input',
                        parse: 'string',
                        value: '提示内容',
                        desc : '提示内容',
                    },
                    width  : {
                        el   : 'number',
                        parse: 'number',
                        value: 300,
                        desc : '宽度',
                    },
                },
            },
        },
        calendar: {
            path     : 'view-calendar',
            component: import('@component/view/calendar/ViewCalendar'),
            property : {
                dataset: {},
            },
        },
        panel   : {
            path     : '/view-panel',
            document : import('@component/view/panel/ViewPanel.md'),
            component: import('@component/view/panel/ViewPanel'),
            property : {
                dataset: {
                    // url  : UniversalProps.url,
                    url  : {
                        el   : 'input',
                        parse: 'string',
                        desc : '',
                        value: '',
                    },
                    model: {
                        el   : 'input',
                        parse: 'JSON',
                        value: `{"name":"Chris","age":18,"job":"web"}`,
                        desc : 'JSON 对象字符串',
                    },
                },
            },
        },
        image   : {
            path     : '/view-image',
            component: import('@component/view/image/ViewImage'),
            document : import('@component/view/image/ViewImage.md'),
            property : {
                dataset: {
                    src: {
                        el   : 'input',
                        parse: 'string',
                        value: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
                    },
                },
            },
        },
    },
    data  : {
        table: {
            component: import('@component/data/table/DataTable'),
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
                        value: domain + '/server/mock/table/tableHeader.json',
                        // value: 'http://192.168.20.121:8080/mgm/header',
                        parse: 'string',
                        desc : '表头url',
                    },
                    url        : {
                        el   : 'input',
                        value: domain + '/server/mock/table/tableContent.json',
                        // value: 'http://192.168.20.121:8080/mgm/data',
                        parse: 'string',
                        desc : '表数据url',
                    },
                    bordered   : {
                        el   : 'switch',
                        value: true,
                        desc : '是否显示表格的边框,默认true',
                        parse: 'boolean',
                    },
                    showheader : {
                        el   : 'switch',
                        value: true,
                        parse: 'boolean',
                        desc : '是否显示表头,默认值 true',
                    },
                    size       : {
                        el     : 'radio',
                        options: [
                            { label: 'default', value: 'default' },
                            { label: 'middle', value: 'middle' },
                            { label: 'small', value: 'small' },
                        ],
                        value  : 'small',
                        parse  : 'string',
                        desc   : '表格尺寸，不填则默认small',
                    },
                    pagesize   : {
                        el   : 'input',
                        parse: 'number',
                        desc : '表格每页显示数量',
                        value: 500,
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
                    interval   : {
                        el   : 'number',
                        parse: 'number',
                        value: 0,
                        desc : '自动刷新间隔， 分钟为单位, 设置为 0 则关闭',
                    },
                    height     : {
                        el    : 'number',
                        value : ''/*'300'*/,
                        parse : 'number',
                        desc  : '表格内容高度, 可滚动',
                        render: true,
                    },
                    title      : {
                        el   : 'input',
                        desc : '标题',
                        value: '标题',
                        parse: 'string',
                    },
                    showupdate : {
                        el   : 'switch',
                        parse: 'boolean',
                        value: false,
                        desc : '是否显示数据更新时间',
                    },
                    headfield  : {
                        el   : 'input',
                        parse: 'string',
                        value: '',
                        desc : '表头遍历字段',
                    },
                },
            },
        },
        chart: {
            component: import('@component/data/chart/DataChart'),
            path     : '/data-chart',
            property : {
                dataset: {
                    'from': {
                        el    : 'input',
                        parse : 'string',
                        value : '',
                        render: false,
                    },
                    url   : {
                        el     : 'input',
                        parse  : 'string',
                        request: true,
                        value  : domain + '/server/mock/chart/areauser.json',
                        // value  : domain + '/server/mock/chart/radar.json',
                        // value  : domain + '/server/mock/chart/areauser.json',
                        // value  : domain + '/server/mock/chart/memory.json',
                        // value  : domain + '/server/mock/chart/disk.json',
                        // value  : domain + '/server/mock/chart/disk_default.json',
                        desc: '图表数据接口',
                    },
                    // name      : {
                    //     el   : 'input',
                    //     parse: 'string',
                    //     value: '',
                    //     desc : '图表统计维度名称key_field的字段意思,例如:data-key_field="location", 那该值就是: 地域',
                    // },
                    type  : {
                        el     : 'select',
                        parse  : 'string',
                        options: [
                            { label: '饼图', value: 'pie' },
                            { label: '环型图', value: 'loop' },
                            { label: '柱状图', value: 'bar' },
                            { label: '条型图', value: 'hbar' },
                            { label: '折线图', value: 'line' },
                            { label: '雷达图', value: 'radar' },
                            { label: '水波图', value: 'water' },
                            { label: '漏斗图', value: 'funnel' },
                            { label: '矩形图', value: 'rect' },
                            { label: '玫瑰图', value: 'rose' },
                            { label: '词云', value: 'word' },
                        ],
                        value  : 'bar',
                        desc   : '图表类型,默认柱状图',
                    },
                    key   : {
                        el     : 'select-multiple',
                        value  : '',
                        options: 'fromUrl',
                        parse  : 'string',
                        desc   : '图表统计维度的字段名',
                    },
                    value : {
                        el     : 'select-multiple',
                        parse  : 'string[]',
                        options: 'fromUrl',
                        value  : '',
                        desc   : '图表统计的value值字段名',
                    },
                    colors: {
                        el: 'input',
                        // options: 'fromUrl',
                        value: '#37c9e3',
                        parse: 'string[]',
                        desc : '图表颜色(多个颜色用逗号隔开，例如："#f00,#fff,#f00")',
                    },
                    // legendLocation: {
                    //     el     : 'select',
                    //     parse  : 'string',
                    //     options: [
                    //         { label: 'top', value: 'top' },
                    //         { label: 'left', value: 'left' },
                    //         { label: 'bottom', value: 'bottom' },
                    //         { label: 'right', value: 'right' },
                    //     ],
                    //     value  : 'bottom',
                    //     desc   : 'legendLocation图例的位置',
                    // },
                    // legendLayout  : {
                    //     el     : 'select',
                    //     options: [
                    //         { label: 'horizontal', value: 'horizontal' },
                    //         { label: 'vertical', value: 'vertical' },
                    //     ],
                    //     parse  : 'string',
                    //     value  : 'horizontal',
                    //     desc   : '图例的布局方式',
                    // },
                    groupby  : {
                        el     : 'input',
                        value  : '',
                        options: 'fromUrl',
                        parse  : 'string',
                        desc   : '分组统计,不填写默认不分组(需要数据格式支持), 注意: data-value为多个值时，该选项无效',
                    },
                    interval : {
                        el   : 'number',
                        parse: 'number',
                        value: 0,
                        desc : '自动刷新间隔， 分钟为单位, 设置为 0 则关闭',
                    },
                    height   : {
                        el   : 'number',
                        value: 400,
                        parse: 'number',
                        desc : '图表高度',
                    },
                    point    : {
                        el     : 'select',
                        options: [
                            { label: '实心圆点', value: 'circle' },
                            { label: '矩形', value: 'square' },
                            { label: '领结形状', value: 'bowtie' },
                            { label: '菱形', value: 'diamond' },
                            { label: '六边形', value: 'hexagon' },
                            { label: '三角形', value: 'triangle' },
                            { label: '倒三家形', value: 'triangle-down' },
                            { label: '垂直线断，带头', value: 'tick' },
                            { label: '加号', value: 'plus' },
                            { label: '连字号线段', value: 'hyphen' },
                            { label: '垂直线段', value: 'line' },
                            { label: '交叉', value: 'cross' },
                            { label: '空心圆', value: 'hollow-circle' },
                            { label: '空心矩形', value: 'hollow-square' },
                            { label: '空心领结', value: 'hollow-bowtie' },
                            { label: '空心菱形', value: 'hollow-diamond' },
                            { label: '空心六边形', value: 'hollow-hexagon' },
                            { label: '空心三角', value: 'hollow-triangle' },
                            { label: '空心倒三角', value: 'hollow-triangle-down' },
                        ],
                        parse  : 'string',
                        value  : 'circle',
                        desc   : `"点"的形状，目前只在折线图中有效, 
                            具体展示效果可参考 https://bizcharts.net/product/BizCharts4/category/62/page/85`,
                    },
                    pointsize: {
                        el   : 'input',
                        parse: 'boolean',
                        value: 3,
                        desc : '"点"的大小,目前只在折线图中有效',
                    },
                    // datadirect: {
                    //     el   : 'input',
                    //     value: '',
                    //     parse: 'string',
                    // },
                    title         : {
                        el   : 'input',
                        value: '标题',
                        parse: 'string',
                        desc : '标题',
                    },
                    showupdate    : {
                        el   : 'switch',
                        parse: 'boolean',
                        value: false,
                        desc : '是否显示数据更新时间',
                    },
                    tooltip_suffix: {
                        el   : 'input',
                        parse: 'string',
                        value: '',
                        desc : '鼠标移入的展示提示工具时的值的后缀 （单位）',
                    },
                    tooltip_cross : {
                        el     : 'radio',
                        options: [
                            { label: 'x', value: 'x' },
                            { label: 'y', value: 'y' },
                            { label: 'xy', value: 'xy' },
                        ],
                        parse  : 'string',
                        value  : '',
                        desc   : '图标十字准线（辅助查看数据）',
                    },
                },
            },
        },
        tree : {
            path     : '/layout-tree',
            component: import('@component/data/tree/DataTree'),
            document : import('@component/data/tree/DataTree.md'),
            property : {
                dataset: {
                    url      : {
                        el     : 'input',
                        parse  : 'string',
                        value  : domain + '/server/mock/tree.json',
                        request: true,
                        desc   : '数据源',
                    },
                    key      : {
                        el     : 'select',
                        options: 'fromUrl',
                        parse  : 'string',
                        value  : 'id',
                    },
                    value    : {
                        el     : 'select',
                        options: 'fromUrl',
                        parse  : 'string',
                        value  : 'name',
                    },
                    children : {
                        el     : 'select',
                        options: 'fromUrl',
                        parse  : 'string',
                        value  : 'children',
                    },
                    checkeds : {
                        el   : 'input',
                        parse: 'string[]',
                        value: '',
                        desc : '选中的唯一值, 0个或者多个，用逗号分开',
                    },
                    expands  : {
                        el   : 'input',
                        parse: 'string[]',
                        value: '',
                        desc : '是否展开,唯一值, 0个或者多个，用逗号分开',
                    },
                    disabled : UniversalProps.disabled,
                    draggable: {
                        el   : 'switch',
                        parse: 'boolean',
                        value: false,
                        desc : '是否可拖拽',
                    },
                },
            },
        },
    },
    tips  : {
        card: {
            component: import('@component/tips/card/TipsCard'),
            document : import('@component/tips/card/TipsCard.md'),
            path     : '/tips-card',
            property : {
                dataset: {
                    trigger: {
                        el     : 'radio',
                        parse  : 'string',
                        options: [
                            { label: '鼠标点击触发', value: 'click' },
                            { label: '鼠标移入触发', value: 'hover' },
                        ],
                        value  : 'hover',
                        desc   : '触发方式',
                    },
                    title  : {
                        el   : 'input',
                        parse: 'string',
                        value: '标题',
                        desc : '提示窗标题',
                    },
                    label  : {
                        el   : 'input',
                        parse: 'string',
                        value: '文本',
                        desc : '文本内容',
                    },
                    width  : {
                        el   : 'number',
                        parse: 'number',
                        value: 300,
                        desc : '宽度',
                    },
                },
            },
        },
        text: {
            component: import('@component/tips/text/TipsText'),
            path     : '/tips-text',
            property : {
                dataset: {
                    label  : {
                        el   : 'input',
                        parse: 'string',
                        value: '文本',
                        desc : '文本内容',
                    },
                    color  : {
                        el   : 'color',
                        parse: 'string',
                        value: '#fff',
                        desc : '颜色',
                    },
                    trigger: {
                        el     : 'radio',
                        parse  : 'string',
                        options: [
                            { label: '鼠标点击触发', value: 'click' },
                            { label: '鼠标移入触发', value: 'hover' },
                        ],
                        value  : 'hover',
                        desc   : '触发方式',
                    },
                },
            },
        },
        list: {},
    },
    layout: {
        menu    : {
            component: import('@component/layout/menu/LayoutMenu'),
            path     : '/layout-menu',
            property : {
                dataset: {
                    // url     : UniversalProps.url,
                    url      : {
                        el: 'input',
                        // value: 'http://192.168.20.121:9001/mgm/menlist/',
                        // value: 'http://mingle-test.local.aidalan.com/server/mock/menulist/menu.json',
                        value: domain + '/server/mock/tree.json',
                        parse: 'string',
                        desc : '数据源',
                    },
                    open     : {
                        el   : 'switch',
                        value: true,
                        parse: 'boolean',
                        desc : '是否默认展开',
                    },
                    id       : {
                        el: 'input',
                        // value: 'appMenuId',
                        value: 'id',
                        parse: 'string',
                        desc : '菜单ID映射字段名称,例如:id',
                    },
                    pid      : {
                        el: 'input',
                        // value: 'r_father',
                        value: 'parent',
                        parse: 'string',
                        desc : '菜单父级映射字段名称,例如:parent_id',
                    },
                    name     : {
                        el   : 'input',
                        value: 'name',
                        parse: 'string',
                        desc : '菜单名称映射字段名称,例如:menu_name',
                    },
                    layout   : {
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
                    children : {
                        el   : 'input',
                        value: 'children',
                        parse: 'string',
                        desc : '子菜单映射字段名称,例如:children',
                    },
                    width    : {
                        el   : 'number',
                        value: 200,
                        parse: 'number',
                        desc : '菜单宽度',
                    },
                    menulist : {
                        el    : 'input',
                        parse : 'JSON',
                        desc  : '菜单数据',
                        value : `[{"name":"111111111","path":"http://baidu.com","id":"111111","children":[{"name":"child","id":"123213","path":"http://taobao.com"}]},{"name":"2","path":"http://baidu.com","id":"2"}]`,
                        render: false,
                    },
                    pathfield: {
                        el   : 'input',
                        parse: 'string',
                        // options: 'fromUrl',
                        value: 'url',
                        desc : '菜单URL跳转字段',
                    },
                },
            },
        },
        tab     : {
            component: import('@component/layout/tab/LayoutTab'),
            document : import('@component/layout/tab/LayoutTab.md'),
            path     : '/layout-tab',
            property : {
                dataset: {
                    position: {
                        el     : 'radio',
                        options: [
                            { label: 'top', value: 'top' },
                            { label: 'left', value: 'left' },
                            { label: 'right', value: 'right' },
                            { label: 'bottom', value: 'bottom' },
                        ],
                        value  : 'left',
                        parse  : 'string',
                    },
                    current : {
                        el   : 'input',
                        parse: 'string',
                        value: '0',
                        desc : '默认选中的tab的 index',
                    },
                },
            },
        },
        'window': {
            component: import('@component/layout/window/LayoutWindow'),
            document : import('@component/layout/window/LayoutWindow.md'),
            path     : '/layout-window',
            property : {
                dataset: {
                    title : {
                        el   : 'input',
                        parse: 'string',
                        value: '标题',
                        desc : '弹窗的标题',
                    },
                    label : {
                        el   : 'input',
                        parse: 'string',
                        value: 'submit',
                        desc : '按钮的内容',
                    },
                    height: {
                        el   : 'number',
                        value: 400,
                        parse: 'number',
                        desc : '弹窗的高度',
                    },
                    width : {
                        el   : 'number',
                        value: 600,
                        parse: 'number',
                        desc : '弹窗的宽度',
                    },
                    mask  : {
                        el   : 'switch',
                        value: false,
                        parse: 'boolean',
                        desc : '是否显示遮罩层',
                    },
                    open  : {
                        el   : 'switch',
                        parse: 'boolean',
                        value: false,
                        desc : '是否默认打开弹出窗',
                    },
                },
            },
        },
        drawer  : {
            component: import('@component/layout/drawer/LayoutDrawer'),
            property : {
                dataset: {
                    title   : {
                        el   : 'input',
                        parse: 'string',
                        value: '标题',
                        desc : '弹窗的标题',
                    },
                    label   : {
                        el   : 'input',
                        parse: 'string',
                        value: '点击弹窗',
                        desc : '按钮的内容',
                    },
                    layout  : {
                        el     : 'radio',
                        options: [
                            { label: 'top', value: 'top' },
                            { label: 'bottom', value: 'right' },
                            { label: 'left', value: 'left' },
                            { label: 'right', value: 'right' },
                        ],
                        value  : 'right',
                        parse  : 'string',
                        desc   : '抽屉弹出的方向',
                    },
                    length  : {
                        el   : 'number',
                        value: 400,
                        parse: 'number',
                        desc : '抽屉的宽度(在layout为top，bottom时，则为高度),默认为400',
                    },
                    mask    : {
                        el   : 'switch',
                        value: false,
                        parse: 'boolean',
                        desc : '是否显示遮罩层',
                    },
                    closable: {
                        el   : 'switch',
                        value: true,
                        parse: 'boolean',
                        desc : '是否显示右上角关闭按钮',
                    },
                    open    : {
                        el   : 'switch',
                        value: false,
                        parse: 'boolean',
                        desc : '是否默认展开抽屉',
                    },
                },
            },
        },
        list    : {
            component: import('@component/layout/list/LayoutList'),
            document : import('@component/layout/list/LayoutList.md'),
            path     : '/layout-list',
            property : {
                dataset: {
                    cols      : {
                        el   : 'number',
                        value: 2,
                        parse: 'number',
                        desc : '每行显示的数量',
                    },
                    space     : {
                        el   : 'input',
                        parse: 'number[]',
                        value: '20,10',
                        desc : '前面的值(20)代表上下的间距,后面的值(10)代表左右的间距',
                    },
                    selectable: {
                        el   : 'switch',
                        parse: 'boolean',
                        value: false,
                        desc : '是否可以选中列表中的某一项',
                    },
                    single    : {
                        el   : 'switch',
                        parse: 'boolean',
                        value: false,
                        desc : '是否单选,开启选择模式后生效(data-selectable="true"时)',
                    },
                    searchable: {
                        el   : 'switch',
                        parse: 'boolean',
                        value: false,
                        desc : '是否显示搜索框',
                    },
                },
            },
        },
        grid    : {
            component: import('@component/layout/grid/LayoutGrid'),
            document : import('@component/layout/grid/LayoutGrid.md'),
            path     : '/layout-grid',
            property : {
                dataset: {},
            },
        },
    },
    handle: {
        request: {
            component: import('@component/handle/request/HandleRequest'),
            document : import('@component/handle/request/HandleRequest.md'),
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
                        value : domain + '/server/mock/menulist/uesr-menu.json',
                        parse : 'string',
                        verify: v => isUrl(v),
                    },
                },
            },
        },
    },
    editor: {
        // flow    : {     // 流程图
        //     component: import('@component/editor/flow/EditorFlow'),
        //     property : {
        //         dataset: {},
        //     },
        // },
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
        // code    : {     // 代码编辑器
        //     component: import('@component/code/editor/CodeEditor'),
        //     path     : '/editor-code',
        //     property : {
        //         dataset: {},
        //     },
        // },
    },
} as IModulesConfig<IPropertyConfig<IOptions>>;

// 组件全局配置
export const globalComponentConfig: any = {
    locale       : zhCN,
    componentSize: 'small',
    direction    : 'ltr',        // ltr | rtl
    space        : { size: 'small' },
    // virtual                 : true,
    dropdownMatchSelectWidth: true,
};
