/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/21
 * Time: 11:15 上午
 */

export default {
    form  : {
        select: {
            path     : '/form-select',
            component: import('@component/form/select/select'),
            // @ts-ignore
            docs     : import('@component/form/select/select.md'),
            props    : {
                dataset: {
                    label      : {
                        el   : 'input',
                        value: 'form-select',
                    },
                    enum       : {
                        el   : 'list',
                        value: '',
                    },
                    disabled   : {
                        el   : 'switch',
                        value: false,
                    },
                    mode       : {
                        el     : 'radio',
                        options: [
                            {
                                label: 'multiple',
                                value: 'multiple',
                            },
                            {
                                label: 'tag',       //显示的值
                                value: 'tag',       //生成的代码的值
                            },
                        ],
                        value  : 'multiple',
                    },
                    placeholder: {
                        el   : 'input',
                        value: '请选择',
                    },
                },
                value  : {
                    el   : 'input',
                    value: ''
                }
            }
        },

        selectTree: {
            path     : '/form-selecttree',
            component: import('@component/form/select/tree/tree'),
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
            props    : {
                dataset: {
                    label     : {
                        el   : 'input',
                        value: 'form-button',
                    },
                    enum      : {
                        el   : 'list',
                        value: '1,Android;2,iOS',
                    },
                    disabled  : {
                        el   : 'switch',
                        value: false,
                    },
                    size      : {
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
                    optionType: {
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
                },
                value  : '',
            }
        },
        editor    : {
            component: import('@component/form/editor/editor'),
            path     : '/form-editor',
        },
        switch    : {
            component: import('@component/form/switch/switch'),
            props    : {
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
            }
        },
        input     : {
            component: import('@component/form/input/input'),
            props    : {
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
            }
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
