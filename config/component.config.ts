/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/21
 * Time: 11:15 上午
 */

export default {
    form  : {
        select    : {
            path     : '/form-select',
            component: import('@component/form/select/select'),
            // @ts-ignore
            docs     : import('@component/form/select/select.md'),
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
        },
        editor    : {
            component: import('@component/form/editor/editor'),
            path     : '/form-editor',
        },
        switch    : {
            component: import('@component/form/switch/switch'),
        },
        input     : {
            component: import('@component/form/input/input'),
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
    // functional: {
    //     backtop: import('@component/functional/backtop/BackTop')
    // },
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
    },
    code  : {
        editor: {
            component: import('@component/code/CodeEditor'),
        },
    },
};
