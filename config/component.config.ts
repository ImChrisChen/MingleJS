/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/21
 * Time: 11:15 上午
 */

export default {
    form  : {
        select    : import('@component/form/select/select'),
        selecttree: import('@component/form/select/tree/tree'),
        datepicker: import('@component/form/datepicker/datepicker'),
        ajax      : import('@component/form/ajax/form'),
        button    : import('@component/form/button/button'),
        editor    : import('@component/form/editor/editor'),
        switch    : import('@component/form/switch/switch')
    },
    view  : {
        popover : import('@component/view/popover/popover'),
        dropdown: import('@component/view/dropdown/dropdown'),
    },
    data  : {
        table      : import('@component/data/table/table'),
        chartline  : import('@component/data/chart/line/line'),
        chartcolumn: import('@component/data/chart/column/column'),
    },
    tips  : {
        loading: import('@component/tips/loading/loading'),
    },
    // functional: {
    //     backtop: import('@component/functional/backtop/BackTop')
    // },
    layout: {
        menu: import('@component/layout/menu/menu'),
        tab : import('@component/layout/tab/tab'),
    },
};
