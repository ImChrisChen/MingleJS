/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/17
 * Time: 10:39 下午
 */

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
export async function componentFormatTree(componentMap) {
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
            id      : pid,
            children: [],
            label   : pid,
            value   : pid,
        }
    })
    list.forEach(item => {
        let superItem: any = selectTree.find((f: any) => f.id == item[pid]);
        if (superItem) {
            superItem.children.push({
                id   : item[name],
                value: item[id],
                label: item[name],
                pid  : item[pid]
            });
        }
    });
    return selectTree;
}


