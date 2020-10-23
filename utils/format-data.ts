/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/17
 * Time: 10:39 下午
 */
import { IOptions } from "@root/config/component.config";
import { parseTpl } from "@utils/parser-tpl";

// 将 data-enum的数组对象 装换成 select框需要的数组对象格式
export function formatEnumOptions(list: Array<any>, label: string = 'label', value: string = 'value'): Array<any> {
    if (!Boolean(list)) {
        return []
    }
    let options: Array<any> = [];
    list.forEach(item => {
        for (const key in item) {
            if (!item.hasOwnProperty(key)) continue;
            let val = item[key];
            options.push({
                [label]: val,
                [value]: key,
            });
        }
    });
    return options;
}

// 组件配置转化为 菜单，多级选择器可以渲染的数据格式
export async function formatComponents2Tree(componentMap) {
    let newArr: Array<object> = [];
    for (const key in componentMap) {
        if (!componentMap.hasOwnProperty(key)) continue;
        let val = componentMap[key];
        let children: Array<object> = [];

        for (const k in val) {
            if (!val.hasOwnProperty(k)) continue;

            let v = val[k];
            let { component, document, path, property } = v;
            children.push({
                label    : k,
                value    : k,
                component: await component,
                document : await document,
                property,
                path,
                // children : [],
            });
        }
        newArr.push({
            label   : key,
            children: children,
            value   : key,
        });       // select / datepicker
    }
    return newArr;
}

interface IKeyMap {
    id: string
    pid: string
    name: string
}

export function formatList2Tree(list: Array<any>, { id, pid, name }: IKeyMap): Array<object> {
    let pids = Array.from(new Set(list.map(item => item[pid])));
    let selectTree: Array<object> = pids.map(pid => {
        return {
            id      : pid,              // 父子映射关系
            children: [],
            label   : pid,
            value   : pid,
        }
    })
    list.forEach(item => {
        let superItem: any = selectTree.find((f: any) => f.id == item[pid]);
        if (superItem) {
            superItem.children.push({
                id   : item[name],      // 父子映射关系
                value: item[id],
                label: item[name],
                pid  : item[pid]
            });
        }
    });
    return selectTree;
}

// 列表转化为 antd options
export function formatList2AntdOptions(list: Array<any>, k: string, v: string): Array<IOptions> {
    return list.map(item => {
        console.log(item);
        let label = parseTpl(v, item);
        return {
            value: item[k],
            label: label,
            title: label,
        }
    });
}

/**
 *
 * @param data
 * @param url
 */
export function formatObject2Url(data: object, url: string = ''): string {
    let params = '';
    let [ href, ...args ] = url.split('?');
    for (const key in data) {
        if (!data.hasOwnProperty(key)) continue;
        let val = data[key];
        params += `${ key }=${ val }&`
    }
    params = params.slice(0, params.length - 1);        // 删除最后一个&符
    return href + '?' + params
}

/**
 *
 * @param url
 * @param o
 */
export function formatUrl2Object(url: string, o: object = {}) {
    let [ , search ] = url.split('?')
    search.split('&').forEach(kv => {
        if (kv) {
            let [ k, v ] = kv.split('=')
            o[k] = v;
        }
    });
    return o;
}
