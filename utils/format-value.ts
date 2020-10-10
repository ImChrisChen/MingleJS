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
            let { component, docs, path, property } = v;
            children.push({
                label    : k,
                value    : k,
                component: await component,
                docs     : await docs,
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

