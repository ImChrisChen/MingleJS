/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/16
 * Time: 7:56 下午
 */


interface esModule {
    default: any,
    __esModule: boolean
}

async function deep(keys, object) {

    let key = keys[0];

    if(!object[key]) {
        return false;
    }

    // 判断是否是 import 进来的模块
    if(object[key] instanceof Promise) {
        return await object[key];         // 找到模块直接 return 出去
    } else {
        keys.shift();           // 删除第一项
        return await deep(keys, object[key]);
    }
}

// TODO 后续可优化成读取目录的形式，不过感觉要配合 命令行生成目录会比较好
export async function getComponent(keys: string) {
    keys = keys.toLowerCase();
    const ComponentMap: object = {
        form  : {
            select    : import('@component/form/select/select'),
            selecttree: import('@component/form/select/tree/tree'),
            datepicker: import('@component/form/datepicker/datepicker'),
            ajax      : import('@component/form/ajax/form'),
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
        },
    };

    // let esModule = keys.split('-').reduce((target: object, key) => {
    //     return target[key];
    // }, ComponentMap);
    let esModule = await deep(keys.split('-'), ComponentMap);
    if(!esModule) {
        console.error(`没有${ keys }这个组件`);
        return false;
    }

    return esModule['default'];
}


