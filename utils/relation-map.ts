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

import componentMap from '../config/component.config'

async function deep(keys, object) {

    let key = keys[0];

    if (!object[key]) {
        return false;
    }

    // 判断是否是 import 进来的模块
    if (object[key] instanceof Promise) {
        return await object[key];         // 找到模块直接 return 出去
    } else {
        keys.shift();           // 删除第一项
        return await deep(keys, object[key]);
    }
}

// TODO 后续可优化成读取目录的形式，不过感觉要配合 命令行生成目录会比较好
export async function getComponent(keys: string) {
    keys = keys.toLowerCase();

    // let esModule = keys.split('-').reduce((target: object, key) => {
    //     return target[key];
    // }, ComponentMap);
    let esModule = await deep(keys.split('-'), componentMap);
    if (!esModule) {
        console.error(`没有${ keys }这个组件`);
        return false;
    }

    return esModule['default'];
}


