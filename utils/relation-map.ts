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

import componentMap from '../config/component.config';

async function deepGetComponent(keys, object) {

    let key = keys[0];

    if (!object[key]) {
        return false;
    }

    // 判断是否是 import 进来的模块
    if (object[key] instanceof Promise) {
        return {
            // docs: await  object[key]
            docs     : undefined,
            component: await object[key],
        };         // 找到模块直接 return 出去
    } else {
        if (object[key]['component']) {
            return {
                component: await object[key]['component'],
                docs     : await object[key]['docs'],
            };
        } else {
            keys.shift();           // 删除第一项
            return await deepGetComponent(keys, object[key]);       // 加载模块
        }
    }
}

// TODO 后续可优化成读取目录的形式，不过感觉要配合 命令行生成目录会比较好
export async function getComponent(keys: Array<string>) {
    let { component: esModule, docs } = await deepGetComponent(keys, componentMap);
    if (!esModule) {
        console.error(`没有${ keys }这个组件`);
        return false;
    }

    console.log(esModule['default']);

    return esModule['default'];
}

