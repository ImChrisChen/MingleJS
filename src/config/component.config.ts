/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/21
 * Time: 11:15 上午
 */
import zhCN from 'antd/es/locale/zh_CN';
import { isUrl } from '@src/utils';
import moment from 'moment';
import { IComponentConfig, IEntityOperationMode, IPropertyConfig, IUniversalProps } from '@src/config/interface';

const isLocation = window.location.href.includes('-test');
const domain = isLocation ? 'http://mingle-test.local.aidalan.com' : 'http://mingle.local.aidalan.com';
const file = '//file.superdalan.com';

// TODO 提取公共属性(待调整)
const UniversalProps: IUniversalProps<IPropertyConfig> = {
    label      : {
        el   : 'input',
        value: 'label:',
        desc : '表单控件描述,若没有设置placeholder 属性时，会默认使用label属性的值',
        parse: 'string',
    },
    placeholder: JSON.parse(JSON.stringify({
        el    : 'input',
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
        el    : 'input',
        render: true,
        parse : 'style',
        value : '',
        desc  : '样式',
    },
    class      : {
        el    : 'input',
        render: true,
        parse : 'class',
        value : '',
        desc  : '样式类名',
    },
    url        : {
        el     : 'input',
        value  : '',
        options: [],
        desc   : '数据源',
        parse  : 'null',
        // verify: value => isUrl(value),
    },
    enum       : {
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
        value: '',
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

const APIMethodOptions = [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
    { label: 'PUT', value: 'PUT' },
    { label: 'DELETE', value: 'DELETE' },
    { label: 'OPTIONS', value: 'OPTIONS' },
];

interface IConfig {
    [key: string]: IComponentConfig
}

// TODO 注意属性不能使用驼峰例如: data-headerUrl, attribute不区分大小写，但是这里是用的dataset会全部转成小写来获取;
export const componentConfig: IConfig = {
    app   : {
        name    : '子应用',
        children: {
            menu  : {
                children: {},
                //component: import('@component/app/menu/AppMenu'),
                property: {
                    dataset: {
                        system_url   : {
                            el   : 'input',
                            parse: 'string',
                            value: 'https://auc.local.aidalan.com/user.menu/apps',
                            desc : '系统列表接口',
                        },
                        url          : {
                            el   : 'input',
                            parse: 'string',
                            value: 'https://auc.local.aidalan.com/user.menu/lists',
                            desc : '菜单接口',
                        },
                        simple       : {
                            el   : 'switch',
                            parse: 'boolean',
                            value: false,
                            desc : 'true 则只显示菜单,false则渲染 系统>菜单',
                        },
                        pathfield    : {
                            el   : 'input',
                            parse: 'string',
                            // options: 'fromUrl',
                            value: 'url',
                            desc : '菜单URL跳转字段',
                        },
                        menu_url     : {
                            el   : 'input',
                            parse: 'string',
                            // options: 'fromUrl',
                            value: 'https://auc.aidalan.com/user.menu/apps',
                            desc : '一级菜单URL',
                        },
                        menu_list_url: {
                            el   : 'input',
                            parse: 'string',
                            // options: 'fromUrl',
                            value: 'https://auc.aidalan.com/user.menu/lists',
                            desc : '二级菜单URL',
                        },
                        bgcolor      : {
                            el   : 'color',
                            parse: 'string',
                            value: '#FFF',
                            desc : '菜单的背景颜色',
                        },
                        activecolor  : {
                            el   : 'color',
                            parse: 'string',
                            value: '#0382f2',
                            desc : '菜单的边框颜色',
                        },
                        textcolor    : {
                            el   : 'color',
                            parse: 'string',
                            value: '#0678fd',
                            desc : '菜单的文本颜色',
                        },
                        bordercolor  : {
                            el   : 'color',
                            parse: 'string',
                            value: '#0678fd',
                            desc : '菜单的文本颜色',
                        },

                    },
                },
                type    : 'web-components',
                name    : '菜单',
                icon    : 'icon-layoutmenuv',
            },
            layout: {
                //component: import('@component/app/layout/AppLayout'),
                //document : import('@component/app/layout/AppLayout.md'),
                path    : '/app-layout',
                property: {
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
                        title : {
                            el   : 'input',
                            parse: 'string',
                            value: '大蓝后台',
                            desc : 'logo位置, 系统名称',
                        },
                    },
                },
                type    : 'web-components',
                icon    : 'icon-layout',
                name    : '布局',
            },
            render: {
                //component: import('@component/app/render/AppRender'),
                property: {
                    dataset: {},
                },
                path    : '/app-render',
                type    : 'web-components',
                name    : '组件渲染器',
                visible : false,
            },
            // entity: {
            //     name     : '实体模块',
            //     //component: import('@component/app/entity/AppEntity'),
            //     property : {
            //         dataset: {},
            //     },
            //     type     : 'functional',
            // },
            // feishu: {
            //     //component: import('@component/app/feishu/AppFeishu'),
            //     //document : import('@component/app/feishu/AppFeishu.md'),
            //     path     : '/app-lark',
            //     property : {
            //         dataset: {},
            //     },
            // },
        },
    },
    form  : {
        name    : '表单',
        children: {
            select    : {
                path: '/form-select',
                //component: import('@component/form/select/FormSelect'),
                //document : import('@component/form/select/FormSelect.md'),
                property: {
                    dataset    : {
                        label     : UniversalProps.label,
                        enum      : UniversalProps.enum,
                        url       : {
                            el: 'input',
                            // value  : domain + '/server/mock/select.json',
                            // value  : 'http://e.aidalan.com/option/pf/list?jsoncallback=callback1617932910291_936',
                            value: '',
                            desc : '列表数据的接口地址',
                            // request: true,
                            parse : 'null',
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
                            el          : 'select',
                            parse       : 'string',
                            options     : [],
                            options_from: 'data-url',
                            value       : 'id',
                            desc        : '数据源唯一id',
                        },
                        value     : {
                            el          : 'select',
                            parse       : 'null',
                            options     : [],
                            options_from: 'data-url',
                            value       : '<{publisher_name}>',    // TODO 主要要传模版的时候，不能去用 string 解析
                            desc        : '要展示的内容模版/字段',
                        },
                        groupby   : {
                            el          : 'select',
                            parse       : 'string',
                            options     : [],
                            options_from: 'data-url',
                            value       : '',
                            desc        : '按照groupby的值来进行分组排列',
                        },
                        required  : UniversalProps.required,
                        smart     : UniversalProps.smart,
                        exec      : UniversalProps.exec,
                        group     : UniversalProps.group,
                    },
                    value      : {
                        el   : 'input',
                        parse: 'string',
                        // options: [],            // 通过解析enum来得到
                        value: '',
                        desc : '默认值',
                    },
                    placeholder: UniversalProps.placeholder,
                    style      : UniversalProps.style,
                    name       : UniversalProps.name,
                    // hook       : {
                    //     load        : {
                    //         el    : 'input',
                    //         value : 'componentLoad',
                    //         desc  : '组件加载完成的触发的函数',
                    //         render: false
                    //     },
                    //     beforeLoad  : {
                    //         el    : 'input',
                    //         value : 'componentBeforeLoad',
                    //         desc  : '组件加载前触发的函数',
                    //         render: false
                    //     },
                    //     update      : {
                    //         el    : 'input',
                    //         value : 'componentUpdate',
                    //         desc  : '组件更新后触发的函数',
                    //         render: false
                    //     },
                    //     beforeUpdate: {
                    //         el    : 'input',
                    //         value : 'componentBeforeUpdate',
                    //         desc  : '组件更新前触发的函数',
                    //         render: false
                    //     }
                    // }
                },
                name    : '下拉框',
                type    : 'web-components',
                icon    : 'icon-xuanzekuang',
            },
            selecttree: {
                path: '/form-selecttree',
                //component: import('@component/form/select/tree/FormSelectTree'),
                //document : import('@component/form/select/tree/FormSelectTree.md'),
                property: {
                    dataset    : {
                        disabled  : UniversalProps.disabled,
                        label     : UniversalProps.label,
                        url       : {
                            el     : 'select',
                            parse  : 'null',
                            value  : domain + '/server/mock/tree.json',
                            request: true,
                            desc   : '数据源',
                        },
                        key       : {
                            el          : 'select',
                            options     : [],
                            options_from: 'data-url',
                            parse       : 'string',
                            desc        : '数据源唯一id',
                            value       : 'id',
                        },
                        value     : {
                            el          : 'select',
                            options     : [],
                            options_from: 'data-url',
                            parse       : 'string',
                            desc        : '要展示的内容模版/字段',
                            value       : 'name',
                        },
                        children  : {
                            el          : 'select',
                            options     : [],
                            options_from: 'data-url',
                            parse       : 'string',
                            desc        : '子节点关联key值',
                            value       : 'children',
                        },
                        allowClear: {
                            el    : 'switch',
                            parse : 'boolean',
                            render: false,
                            value : true,
                        },
                        required  : UniversalProps.required,
                        smart     : UniversalProps.smart,
                        exec      : UniversalProps.exec,
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
                name    : '树形下拉框',
                type    : 'web-components',
                icon    : 'icon-select-tree',
            },
            checkbox  : {
                //component: import('@component/form/checkbox/FormCheckbox'),
                //document : import('@component/form/checkbox/FormCheckbox.md'),
                path    : '/form-checkbox',
                property: {
                    dataset: {
                        disabled: UniversalProps.disabled,
                        url     : UniversalProps.url,
                        enum    : UniversalProps.enum,
                        label   : UniversalProps.label,
                        key     : {
                            el          : 'select',
                            value       : '',
                            options     : [],
                            options_from: 'data-url',
                            parse       : 'string',
                            desc        : '数据转化的ID唯一值',
                        },
                        value   : {
                            el          : 'select',
                            value       : '',
                            options     : [],
                            options_from: 'data-url',
                            parse       : 'null',
                            desc        : '数据展示值',
                        },
                        smart   : UniversalProps.smart,
                        exec    : UniversalProps.exec,
                        group   : UniversalProps.group,
                        required: UniversalProps.required,
                    },
                    style  : UniversalProps.style,
                    name   : UniversalProps.name,
                    value  : {
                        el   : 'input',
                        parse: 'string[]',
                        value: '',
                        desc : '值',
                    },
                },
                name    : '复选框',
                type    : 'web-components',
                icon    : 'icon-check-box',
            },
            cascader  : {
                path: '/form-cascader',
                //component: import('@component/form/cascader/FormCascader'),
                //document : import('@component/form/cascader/FormCascader.md'),
                property: {
                    dataset    : {
                        disabled  : UniversalProps.disabled,
                        label     : UniversalProps.label,
                        url       : {
                            el   : 'input',
                            value: domain + '/server/mock/select.json',
                            // value  : '',
                            request: true,
                            parse  : 'null',
                            desc   : '数据源',
                        },
                        key       : {
                            el          : 'select',
                            value       : '',
                            options     : [],
                            options_from: 'data-url',
                            parse       : 'string',
                            desc        : '数据转化的ID唯一值',
                        },
                        value     : {
                            el          : 'select',
                            value       : '',
                            options     : [],
                            options_from: 'data-url',
                            parse       : 'null',
                            desc        : '数据展示值',
                        },
                        groupby   : {
                            el          : 'select',
                            value       : '',
                            options     : [],
                            options_from: 'data-url',
                            parse       : 'string',
                            desc        : '与data-key形成关系映射 id/pid',
                        },
                        showSearch: {
                            value : true,
                            parse : 'boolean',
                            render: false,
                        },
                        required  : UniversalProps.required,
                        smart     : UniversalProps.smart,
                        exec      : UniversalProps.exec,
                        group     : UniversalProps.group,
                    },
                    placeholder: UniversalProps.placeholder,
                    name       : UniversalProps.name,
                    style      : UniversalProps.style,
                    value      : {
                        el   : 'input',
                        value: '',
                        parse: 'string',
                        desc : '默认值',
                    },
                },
                name    : '级联选择器',
                type    : 'web-components',
                icon    : 'icon-cascader',
            },
            datepicker: {
                path: '/form-datepicker',
                //component: import('@component/form/datepicker/FormDatepicker'),
                //document : import('@component/form/datepicker/FormDatepicker.md'),
                property: {
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
                        exec      : UniversalProps.exec,
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
                        desc : '默认值',
                        value(parsedDataset) {
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
                name    : '时间选择器',
                type    : 'web-components',
                icon    : 'icon-icon-el-date-picker',
            },
            action    : {
                //component: import('@component/form/form-action/FormAction'),
                path    : '/form-action',
                property: {
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
                            el     : 'radio',
                            parse  : 'string',
                            options: APIMethodOptions,
                            value  : 'POST',
                            desc   : '指定请求类型,提供, get | post | delete | put | options (默认post)',
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
                            el          : 'select',
                            parse       : 'string',
                            value       : 'message',
                            options     : [],
                            options_from: 'data-url',
                            desc        : 'URL返回的参数 ，指定提交后的提示字段',
                        },
                        submit  : {
                            el   : 'switch',
                            parse: 'boolean',
                            value: true,
                            desc : '是否生产submit按钮',
                        },
                        reset   : {
                            el   : 'switch',
                            parse: 'boolean',
                            value: true,
                            desc : '是否生成reset按钮',
                        },
                    },
                    id     : {
                        el    : 'input',
                        parse : 'string',
                        value : '',
                        desc  : 'Form表单唯一ID,用户关联表格，图表，列表的data-from属性',
                        render: false,
                    },
                },
                //document : import('@component/form/form-action/FormAction.md'),
                name: 'form表单',
                type: 'web-components',
                icon: 'icon-form1',
            },
            radio     : {
                path: '/form-radio',
                //component: import('@component/form/radio/FormRadio'),
                property: {
                    dataset: {
                        disabled   : UniversalProps.disabled,
                        label      : UniversalProps.label,
                        enum       : UniversalProps.enum,
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
                            desc   : 'Radio类型',
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
                            desc   : 'Radio样式类型',
                        },
                        required   : UniversalProps.required,
                        smart      : UniversalProps.smart,
                        exec       : UniversalProps.exec,
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
                        el: 'input',
                        // options: [],
                        value: '',
                        parse: 'string',
                        desc : '默认值',
                    },
                },
                name    : '单选框',
                type    : 'web-components',
                icon    : 'icon-Ioniconsmdradiobuttonon',
            },
            slider    : {
                path: '/form-slider',
                //component: import('@component/form/slider/FormSlider'),
                //document : import('@component/form/slider/FormSlider.md'),
                property: {
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
                        smart   : UniversalProps.smart,
                        exec    : UniversalProps.exec,
                        required: UniversalProps.required,
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
                name    : '滑动选择器',
                type    : 'web-components',
                icon    : 'icon-slider',
            },
            switch    : {
                path: '/form-switch',
                //component: import('@component/form/switch/FormSwitch'),
                property: {
                    dataset: {
                        disabled         : UniversalProps.disabled,
                        label            : UniversalProps.label,
                        checkedChildren  : {
                            el   : 'input',
                            value: '开启',
                            desc : '选中显示内容',
                        },
                        unCheckedChildren: {
                            el   : 'input',
                            value: '关闭',
                            desc : '非选中是内容',
                        },
                        smart            : UniversalProps.smart,
                        exec             : UniversalProps.exec,
                        // required: UniversalProps.required,
                    },
                    name   : UniversalProps.name,
                    style  : UniversalProps.style,
                    group  : UniversalProps.group,
                    value  : {
                        el   : 'input',
                        parse: 'number',
                        value: 0,
                        desc : '0,1',
                    },
                },
                name    : '开关选择器',
                type    : 'web-components',
                icon    : 'icon-youxiao',
            },
            input     : {
                path: '/form-input',
                //component: import('@component/form/input/FormInput'),
                property: {
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
                            desc   : 'input类型',
                        },
                        label   : UniversalProps.label,
                        required: UniversalProps.required,
                        smart   : UniversalProps.smart,
                        group   : UniversalProps.group,
                        disabled: UniversalProps.disabled,
                        exec    : UniversalProps.exec,
                    },
                    name       : UniversalProps.name,
                    style      : UniversalProps.style,
                    placeholder: UniversalProps.placeholder,
                    value      : {
                        el   : 'input',
                        parse: 'string',
                        desc : '默认值',
                        value: '',
                    },
                },
                name    : '文本框',
                type    : 'web-components',
                icon    : 'icon-input',
            },
            group     : {
                path: '/form-group',
                //component: import('@component/form/group/FormGroup'),
                //document : import('@component/form/group/FormGroup.md'),
                property: {
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
                name    : '表单组',
                type    : 'web-components',
                icon    : 'icon-lie1',
            },
            upload    : {
                //component: import('@component/form/upload/FormUpload'),
                path    : '/form-upload',
                property: {
                    dataset: {
                        label   : UniversalProps.label,
                        url     : {
                            el   : 'input',
                            parse: 'null',
                            value: `_{ file }/upload/byCode`,
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
                name    : '文件上传',
                type    : 'web-components',
                icon    : 'icon-shangchuan5',
            },
            color     : {
                //component: import('@component/form/color/FormColor'),
                path    : '/form-color',
                property: {
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
                name    : '颜色选择器',
                type    : 'web-components',
                icon    : 'icon-color',
            },
            transfer  : {
                //component: import('@component/form/transfer/FormTransfer'),
                path    : '/form-transfer',
                property: {
                    dataset: {
                        url     : {
                            el: 'input',
                            // value  : domain + '/server/mock/select.json',
                            value  : '',
                            desc   : '列表数据的接口地址',
                            request: true,
                            parse  : 'null',
                            verify : value => isUrl(value),
                        },
                        key     : {
                            el          : 'select',
                            parse       : 'string',
                            options     : [],
                            options_from: 'data-url',
                            value       : 'id',
                            desc        : '数据源唯一id',
                        },
                        value   : {
                            el          : 'select',
                            parse       : 'null',
                            options     : [],
                            options_from: 'data-url',
                            value       : 'publisher_name',    // TODO 主要要传模版的时候，不能去用 string 解析
                            desc        : '要展示的内容模版/字段',
                        },
                        pagesize: {
                            el   : 'input',
                            parse: 'number',
                            desc : '每页显示数量',
                            value: 100,
                        },
                        height  : {
                            el   : 'input',
                            parse: 'string',
                            desc : '高度',
                            value: '300px',
                        },
                        width   : {
                            el   : 'input',
                            parse: 'string',
                            desc : '宽度',
                            value: '100%',
                        },
                        titles  : {
                            el   : 'input',
                            parse: 'string[]',
                            desc : '标题',

                            value: 'source,target',
                        },
                        exec    : UniversalProps.exec,
                        smart   : UniversalProps.smart,
                        required: UniversalProps.required,
                    },
                    value  : {
                        el   : 'input',
                        parse: 'string[]',
                        value: '',
                        desc : '默认值',
                    },
                },
                name    : '穿梭框',
                type    : 'web-components',
                icon    : 'icon-transfer',
            },
            button    : {
                //component: import('@component/form/button/FormButton'),
                path    : '/form-button',
                property: {
                    dataset: {
                        size    : {
                            el     : 'radio',
                            options: [
                                { label: 'large', value: 'large' },
                                { label: 'middle', value: 'middle' },
                                { label: 'small', value: 'small' },
                            ],
                            value  : 'small',
                            parse  : 'string',
                            desc   : '按钮尺寸，不填则默认small',
                        },
                        type    : {
                            el     : 'radio',
                            options: [
                                { label: 'primary ', value: 'primary ' },
                                { label: 'dashed', value: 'dashed' },
                                { label: 'link', value: 'link' },
                                { label: 'text', value: 'text' },
                                { label: 'default', value: 'default' },
                            ],
                            value  : 'default',
                            parse  : 'string',
                            desc   : '按钮样式',
                        },
                        title   : {
                            el   : 'input',
                            desc : '按钮显示文本',
                            value: '按钮',
                            parse: 'string',
                        },
                        disabled: UniversalProps.disabled,
                    },
                    style  : UniversalProps.style,
                },
                name    : '按钮',
                type    : 'web-components',
            },
        },
    },
    view  : {
        name    : '视图',
        children: {
            steps: {
                path: '/view-steps',
                //component: import('@component/view/steps/ViewSteps'),
                //document : import('@component/view/steps/ViewSteps.md'),
                property: {
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
                name    : '步骤',
                type    : 'web-components',
                icon    : 'icon-steps',
            },
            // handle
            dropdown: {
                //component: import('@component/view/dropdown/ViewDropdown'),
                property: {
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
                type    : 'web-components',
                name    : '下拉菜单',
                icon    : 'icon-drop-down',
            },
            calendar: {
                path: 'view-calendar',
                //component: import('@component/view/calendar/ViewCalendar'),
                property: {
                    dataset: {},
                },
                type    : 'web-components',
                name    : '日历',
                icon    : 'icon-canlender',
            },
            panel   : {
                path: '/view-panel',
                //document : import('@component/view/panel/ViewPanel.md'),
                //component: import('@component/view/panel/ViewPanel'),
                property: {
                    dataset: {
                        // url  : UniversalProps.url,
                        url  : {
                            el   : 'input',
                            parse: 'null',
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
                type    : 'web-components',
                name    : '面板',
                icon    : 'icon-panel',
            },
            image   : {
                path: '/view-image',
                //component: import('@component/view/image/ViewImage'),
                //document : import('@component/view/image/ViewImage.md'),
                property: {
                    dataset: {
                        src: {
                            el   : 'input',
                            parse: 'string',
                            value: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
                            desc : '图片地址',
                        },
                    },
                    style  : UniversalProps.style,
                    class  : UniversalProps.class,
                },
                type    : 'web-components',
                name    : '图片',
                icon    : 'icon-imageloading',
            },
        },
    },
    data  : {
        name    : '数据',
        children: {
            table: {
                //component: import('@component/data/table/DataTable'),
                path    : '/data-table',
                property: {
                    dataset: {
                        from       : {
                            el   : 'input',
                            value: '',
                            parse: 'string',
                            desc : '要关联的 form表单的ID, 关联后form表单提交即可重新加载table组件的数据',
                        },
                        headerurl  : {
                            el   : 'input',
                            value: domain + '/server/mock/table/tableHeader.json',
                            // value: 'http://192.168.20.121:8080/mgm/header',
                            parse: 'null',
                            desc : '表头url',
                        },
                        url        : {
                            el   : 'input',
                            value: domain + '/server/mock/table/tableContent.json',
                            // value: 'http://192.168.20.121:8080/mgm/data',
                            request: true,
                            parse  : 'null',
                            desc   : '表数据url',
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
                            value: true,
                            desc : '是否显示数据更新时间',
                        },
                        headkey    : {
                            el   : 'input',
                            parse: 'string',
                            value: '',
                            desc : '表头遍历字段',
                        },
                        rowkey     : {
                            el          : 'select',
                            options     : [],
                            options_from: 'data-url',
                            parse       : 'string',
                            value       : '',
                            desc        : '指定 表格每一行的key值,多选表格的ID 就是 这里指定的key,有这个值则开启表格的多选操作',
                        },
                        rowstylekey: {
                            el          : 'input',
                            options_from: 'data-url',
                            parse       : 'string',
                            value       : 'rowstylekey',
                            desc        : '指定字段名为设置表格每一行的样式',
                        },
                        entity_id  : {
                            el   : 'input',
                            parse: 'string',
                            value: '',
                            desc : '表格对应的实体ID(表格内无实体逻辑，主要用于layout-window内dom元素获取)',
                        },
                        entity_url : {
                            el   : 'input',
                            parse: 'string',
                            value: '',
                            desc : '实体操作的URL(CURD),请支持RESTFul API规范',
                        },
                    },
                },
                type    : 'web-components',
                name    : '表格',
                icon    : 'icon-table',
                support : [ 'app-entity' ],
            },
            chart: {
                //component: import('@component/data/chart/DataChart'),
                path    : '/data-chart',
                property: {
                    dataset: {
                        'from': {
                            el    : 'input',
                            parse : 'string',
                            value : '',
                            render: false,
                        },
                        url   : {
                            el     : 'input',
                            parse  : 'null',
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
                            el          : 'select-multiple',
                            value       : '',
                            options     : [],
                            options_from: 'data-url',
                            parse       : 'string',
                            desc        : '图表统计维度的字段名',
                        },
                        value : {
                            el          : 'select-multiple',
                            parse       : 'string[]',
                            options     : [],
                            options_from: 'data-url',
                            value       : '',
                            desc        : '图表统计的value值字段名',
                        },
                        colors: {
                            el   : 'input',
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
                            el          : 'select',
                            value       : '',
                            options     : [],
                            options_from: 'data-url',
                            parse       : 'string',
                            desc        : '分组统计,不填写默认不分组(需要数据格式支持), 注意: data-value为多个值时，该选项无效',
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
                            value: true,
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
                type    : 'web-components',
                name    : '图表',
                icon    : 'icon-chartpartten',
            },
            tree : {
                path: '/layout-tree',
                //component: import('@component/data/tree/DataTree'),
                //document : import('@component/data/tree/DataTree.md'),
                property: {
                    dataset: {
                        url      : {
                            el     : 'input',
                            parse  : 'null',
                            value  : domain + '/server/mock/tree.json',
                            request: true,
                            desc   : '数据源',
                        },
                        key      : {
                            el          : 'select',
                            options     : [],
                            options_from: 'data-url',
                            parse       : 'string',
                            desc        : '数据源唯一id',
                            value       : 'id',
                        },
                        value    : {
                            el          : 'select',
                            options     : [],
                            options_from: 'data-url',
                            parse       : 'string',
                            desc        : '要展示的内容模版/字段',
                            value       : 'name',
                        },
                        children : {
                            el          : 'select',
                            options     : [],
                            options_from: 'data-url',
                            parse       : 'string',
                            desc        : '关联children键值',
                            value       : 'children',
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
                type    : 'web-components',
                name    : '树状结构选择器',
                icon    : 'icon-tree',
            },
            list : {
                name: '循环列表',
                //component: import('@component/data/list/DataList'),
                path    : '/data-list',
                property: {
                    dataset: {
                        cols      : {
                            el   : 'number',
                            value: 2,
                            parse: 'number',
                            desc : '每行显示的数量',
                        },
                        url       : {
                            el   : 'input',
                            parse: 'null',
                            value: '',
                            desc : 'URL',
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
                        item      : {
                            el   : 'input',
                            parse: 'null',
                            value: 'item',
                            desc : '循环模版的变量',
                        },
                        index     : {
                            el   : 'input',
                            parse: 'null',
                            value: 'index',
                            desc : '列表的下标',
                        },
                        height    : {
                            el   : 'number',
                            parse: 'number',
                            value: 0,
                            desc : '高度',
                        },
                    },
                },
                type    : 'web-components',
                icon    : 'icon-tubiao04',
            },
        },
    },
    tips  : {
        name    : '提示信息',
        children: {
            card   : {
                //component: import('@component/tips/card/TipsCard'),
                //document : import('@component/tips/card/TipsCard.md'),
                path    : '/tips-card',
                property: {
                    dataset : {},
                    _trigger: {
                        el     : 'radio',
                        parse  : 'string',
                        options: [
                            { label: '鼠标点击触发', value: 'click' },
                            { label: '鼠标移入触发', value: 'hover' },
                        ],
                        value  : 'hover',
                        desc   : '触发方式',
                    },
                    _title  : {
                        el   : 'input',
                        parse: 'string',
                        value: '标题',
                        desc : '提示窗标题',
                    },
                    _label  : {
                        el   : 'input',
                        parse: 'string',
                        value: '文本',
                        desc : '文本内容',
                    },
                    _width  : {
                        el   : 'number',
                        parse: 'number',
                        value: 300,
                        desc : '宽度',
                    },
                },
                type    : 'functional',
                name    : '内容提示',
                icon    : 'icon-liaotianneirongtishi',
            },
            text   : {
                //component: import('@component/tips/text/TipsText'),
                path    : '/tips-text',
                property: {
                    _label  : {
                        el   : 'input',
                        parse: 'string',
                        value: '文本',
                        desc : '文本内容',
                    },
                    _color  : {
                        el   : 'color',
                        parse: 'string',
                        value: '#fff',
                        desc : '颜色',
                    },
                    _trigger: {
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
                type    : 'functional',
                name    : '文本提示',
                icon    : 'icon-ziyuan1',
            },
            popconfirm:{
                path    : '/tips-popconfirm',
                property:{
                    dataset:{
                    },
                    _label  : {
                        el   : 'input',
                        parse: 'string',
                        value: '文本',
                        desc : '文本内容',
                    },
                    _okText : {
                        el  : 'input',
                        parse: 'string',
                        value: 'Ok',
                        desc : '确认按钮文本'
                    },
                    _cancelText: {
                        el : 'input',
                        parse: 'string',
                        value: 'Cancel',
                        desc : '取消按钮文本'
                    }
                },
                type    : 'functional',
                name    : '确定气泡框',
                icon    : 'icon-ziyuan1',
            },
            confirm: {
                path    : '/tips-confirm',
                property: {
                    dataset: {},
                },
                type    : 'web-components',
                name    : '确认提示框',
                icon    : '',
            },
        },
    },
    layout: {
        name    : '布局设计',
        children: {
            menu  : {
                //component: import('@component/layout/menu/LayoutMenu'),
                path    : '/layout-menu',
                property: {
                    dataset: {
                        // url     : UniversalProps.url,
                        url      : {
                            el: 'input',
                            // value: 'http://192.168.20.121:9001/mgm/menlist/',
                            // value: 'http://mingle-test.local.aidalan.com/server/mock/menulist/menu.json',
                            value: domain + '/server/mock/tree.json',
                            parse: 'null',
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
                            el          : 'input',
                            parse       : 'string',
                            options     : [],
                            options_from: 'data-url',
                            value       : 'url',
                            desc        : '菜单URL跳转字段',
                        },
                    },
                },
                type    : 'web-components',
                name    : '菜单',
                icon    : 'icon-layoutmenuv',
            },
            tab   : {
                //component: import('@component/layout/tab/LayoutTab'),
                //document : import('@component/layout/tab/LayoutTab.md'),
                path    : '/layout-tab',
                property: {
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
                type    : 'web-components',
                name    : '选项卡',
                icon    : 'icon-tab',
            },
            window: {
                //component: import('@component/layout/window/LayoutWindow'),
                //document : import('@component/layout/window/LayoutWindow.md'),
                path    : '/layout-window',
                property: {
                    dataset     : {},
                    _title      : {
                        el   : 'input',
                        parse: 'string',
                        value: '标题',
                        desc : '弹窗的标题',
                    },
                    _label      : {
                        el   : 'input',
                        parse: 'string',
                        value: 'submit',
                        desc : '按钮的内容',
                    },
                    _height     : {
                        el   : 'number',
                        value: 600,
                        parse: 'number',
                        desc : '弹窗的高度',
                    },
                    _width      : {
                        el   : 'number',
                        value: 600,
                        parse: 'number',
                        desc : '弹窗的宽度',
                    },
                    _mask       : {
                        el   : 'switch',
                        value: false,
                        parse: 'boolean',
                        desc : '是否显示遮罩层',
                    },
                    _open       : {
                        el   : 'switch',
                        parse: 'boolean',
                        value: false,
                        desc : '是否默认打开弹出窗',
                    },
                    _cancel     : {
                        el   : 'switch',
                        parse: 'boolean',
                        value: true,
                        desc : '是否显示取消按钮',
                    },
                    _submit     : {
                        el   : 'switch',
                        parse: 'boolean',
                        value: true,
                        desc : '是否显示提交按钮',
                    },
                    _entity_id  : {
                        el   : 'input',
                        parse: 'string',
                        value: '',
                        desc : '实体ID, 如果不是加载实体，则无须传入',
                    },
                    _entity_mode: {
                        el     : 'radio',
                        parse  : 'string',
                        options: [
                            { label: '新增', value: 'create' },
                            { label: '编辑', value: 'update' },
                        ],
                        value  : 'update' as IEntityOperationMode,
                        desc   : '实体操作模式， 新增或者删除',
                    },
                    _uid        : {
                        el   : 'input',
                        parse: 'string',
                        desc : '表格 / 列表的唯一ID',
                        value: '',
                    },
                },
                type    : 'functional',
                name    : '弹窗',
                icon    : 'icon-iFrame',
            },
            drawer: {
                //component: import('@component/layout/drawer/LayoutDrawer'),
                property: {
                    dataset  : {},
                    _title   : {
                        el   : 'input',
                        parse: 'string',
                        value: '标题',
                        desc : '弹窗的标题',
                    },
                    _label   : {
                        el   : 'input',
                        parse: 'string',
                        value: '点击弹窗',
                        desc : '按钮的内容',
                    },
                    _layout  : {
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
                    _width   : {
                        el   : 'number',
                        value: 400,
                        parse: 'number',
                        desc : '抽屉的宽度(在layout为top，bottom时，则为高度),默认为400',
                    },
                    _mask    : {
                        el   : 'switch',
                        value: false,
                        parse: 'boolean',
                        desc : '是否显示遮罩层',
                    },
                    _closable: {
                        el   : 'switch',
                        value: true,
                        parse: 'boolean',
                        desc : '是否显示右上角关闭按钮',
                    },
                    _open    : {
                        el   : 'switch',
                        value: false,
                        parse: 'boolean',
                        desc : '是否默认展开抽屉',
                    },

                },
                type    : 'functional',
                name    : '抽屉',
                icon    : 'icon-drawer',
            },
            list  : {
                //component: import('@component/layout/list/LayoutList'),
                //document : import('@component/layout/list/LayoutList.md'),
                path    : '/layout-list',
                property: {
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
                        height    : {
                            el   : 'number',
                            parse: 'number',
                            value: 'auto',
                            desc : '高度',
                        },
                    },
                },
                type    : 'web-components',
                name    : '列表',
                icon    : 'icon-tubiao04',
            },
            row   : {
                //component: import('@component/layout/row/LayoutRow'),
                //document : import('@component/layout/row/LayoutRow.md'),
                path    : '/layout-row',
                property: {
                    dataset: {
                        space: {
                            el   : 'input',
                            parse: 'number[]',
                            value: '20,10',
                            desc : '前面的值(20)代表上下的间距,后面的值(10)代表左右的间距',
                        },

                    },
                    style  : {
                        el: 'input',
                        // render: true,
                        parse: 'string',
                        value: '',
                        desc : '样式',
                    },

                },
                type    : 'web-components',
                name    : '栅格布局(行)',
                icon    : 'icon-hang',
            },
            col   : {
                //component: import('@component/layout/row/col/LayoutCol'),
                path    : '/layout-col',
                property: {
                    dataset: {
                        col: {
                            el   : 'number',
                            parse: 'number',
                            value: '12',
                            desc : '栅格系统所占的比例,总共24份',
                        },
                    },
                    style  : {
                        el   : 'input',
                        parse: 'string',
                        value: '',
                        desc : '样式',
                    },
                },
                type    : 'web-components',
                name    : '栅格布局(列)',
                icon    : 'icon-lie',
            },
        },
    },
    handle: {
        name    : '处理',
        children: {
            request: {
                //component: import('@component/handle/request/HandleRequest'),
                //document : import('@component/handle/request/HandleRequest.md'),
                property: {
                    dataset : {},
                    _trigger: {
                        el     : 'switch',
                        parse  : 'string',
                        value  : 'click',     // 'click' | 'hover'
                        options: [
                            { label: 'click', value: 'click' },
                            { label: 'hover', value: 'hover' },
                        ],
                    },
                    _url    : {
                        el    : 'input',
                        value : domain + '/server/mock/menulist/uesr-menu.json',
                        parse : 'string',
                        verify: v => isUrl(v),
                    },
                    _method : {
                        el     : 'radio',
                        parse  : 'string',
                        options: APIMethodOptions,
                        value  : 'GET',
                        desc   : '请求类型',
                    },
                },
                type    : 'functional',
                name    : '请求',
                icon    : 'icon-qingqiu',
            },
        },
    },
    editor: {
        name    : '编辑',
        children: {
            markdown: {     // markdown 编辑器
                //component: import('@component/editor/markdown-editor/MarkdownEditor'),
                path    : '/editor-markdown',
                property: {
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
                type    : 'web-components',
                name    : 'Markdown编辑器',
                icon    : 'icon-mark_down',
            },
        },
    },
};

