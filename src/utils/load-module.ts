/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/3/17
 * Time: 10:22 上午
 */

import { componentConfig, IComponentConfig, IPropertyConfig } from '@src/config/component.config';

// 递归加载模块
async function getModules(keys, object) {
    let [ key ] = keys;
    if (!object[key]) return {};

    // 判断是否是 import 进来的模块
    if (object[key] && object[key]['component']) {
        return {
            component: await object[key]['component'],
            document : await object[key]['document'],
            property : object[key]['property'],
            path     : object[key]['path'],
            config   : object[key],
        };
    } else {
        keys.shift();           // 删除第一项
        return await getModules(keys, object[key]);       // 加载模块
    }
}

// TODO 后续可优化成读取目录的形式，不过感觉要配合 命令行生成目录会比较好
export async function loadModules(keys: Array<string>) {
    let module = await getModules(keys, componentConfig);
    if (!module.component) {
        console.error(`没有${ keys }这个组件`);
        return false;
    }
    return module;
}

export function loadModule(key: string) {

    if (!key) {
        console.warn(`没有${ key }这个组件`);
        return {};
    }

    let keys = key.toLowerCase().trim().split('-');
    // let mod = componentConfig[keys[0]][keys[1]];
    let mod = componentConfig?.[keys[0]]?.children?.[keys[1]] as IComponentConfig<IPropertyConfig>;
    if (!mod) {
        console.warn(`没有${ key }这个模块`);
    }
    return {
        component: mod.component,
        property : mod.property,
        path     : mod.path,
        type     : mod.type,
    };
}
