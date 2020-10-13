/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/21
 * Time: 11:15 上午
 */

import property from '@root/config/property.config';

interface IComponentConfig {
    path?: string
    component: Promise<object>
    document?: Promise<object>
    property?: {
        dataset?: object
        value?: object
        hook?: object
    }
}

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
                        label    : `${ property.label.label }`,
                    },
                    enum       : {
                        el   : 'list',
                        value: '1,Android;2,iOS;3,MacOS;4,Windows',
                        label: '数据 - data-enum',
                    },
                    disabled   : {
                        el   : 'switch',
                        value: false,
                        label: '是否禁用 - data-disabled',
                    },
                    mode       : {
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
                                value: 'single'
                            }
                        ],
                        value  : 'multiple',
                        label  : '模式 - data-mode',
                    },
                    placeholder: {
                        el   : 'input',
                        value: '请选择',
                        label: '占位符 - data-placeholder',
                    },
                    autoFocus  : {
                        el   : 'switch',
                        value: false,
                        label: '是否自动获取焦点',
                    },
                    allowClear : {
                        value : true,
                        render: false,              // TODO render 为false时，不在表单设计器中渲染,为默认值
                    },
                    showSearch : {     // 指定默认选中条目
                        el    : 'input',
                        value : true,
                        render: false
                    }
                },
                value  : {
                    el     : 'select',
                    options: [],            // 通过解析enum来得到
                    value  : '',
                    label  : '默认值 - value',
                },
                // hook   : {
                //     load        : {
                //         el    : 'input',
                //         value : 'componentLoad',
                //         render: false
                //     },
                //     beforeLoad  : {
                //         el    : 'input',
                //         value : 'componentBeforeLoad',
                //         render: false
                //     },
                //     update      : {
                //         el    : 'input',
                //         value : 'componentUpdate',
                //         render: false
                //     },
                //     beforeUpdate: {
                //         el    : 'input',
                //         value : 'componentBeforeUpdate',
                //         render: false
                //     },
                // },
            },
        },

        selectTree: {
            path     : '/form-selecttree',
            component: import('@component/form/select/tree/tree'),
            document : import('@component/form/selectTree/selectTree.md'),
            property : {
                dataset: {},
                value  : {},
                hook   : {}
            },
        },
        datepicker: {
            path     : '/form-datepicker',
            component: import('@component/form/datepicker/datepicker'),
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
                        label: '',
                    },
                    enum       : {
                        el   : 'list',
                        value: '1,Android;2,iOS',
                    },
                    disabled   : {
                        el   : 'switch',
                        value: false,
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
                        value  : 'middle',
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
                    },
                    buttonStyle: {
                        el     : 'radio',
                        options: [
                            {
                                label: 'solid',
                                value: 'solid',
                            }, {
                                label: 'online',
                                value: 'online'
                            }
                        ]
                    }
                },
                value  : {
                    el     : 'select',
                    options: [],
                    value  : '',
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
                        value: false
                    }
                }
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
                dataset: {}
            }
        }
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
            property : {}
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
} as object;
