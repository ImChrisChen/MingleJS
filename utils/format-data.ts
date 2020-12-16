/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/17
 * Time: 10:39 下午
 */
import { IOptions } from '@root/config/component.config';
import { parseTpl } from '@utils/parser-tpl';
import { isDOMString, isWuiTpl } from '@utils/inspect';
import { strParseVirtualDOM } from '@utils/parser-dom';
import { deepEach } from '@utils/util';

// 将 data-enum的数组对象 装换成 select框需要的数组对象格式
export function formatEnumOptions(list: Array<any>, label: string = 'label', value: string = 'value'): Array<any> {
    if (!Boolean(list)) {
        return [];
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
export async function formatComponents2Tree(componentConfig) {
    let newArr: Array<object> = [];
    for (const key in componentConfig) {
        if (!componentConfig.hasOwnProperty(key)) continue;
        let val = componentConfig[key];
        let children: Array<object> = [];

        for (const k in val) {
            if (!val.hasOwnProperty(k)) continue;

            let v = val[k];
            let { component, document, path, property } = v;
            let d = (await document)?.default;
            console.log(d);
            let item = {
                label    : k,
                value    : k,
                component: component,
                document : d,
                property,
                path,
                ...v,
            };
            children.push(item);
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
    children?: string
}

/**
 *
 * @param list  需要数据转化的列表
 * @param id    id 唯一值
 * @param pid   pid/id 形成父级关系映射
 * @param name  展示的内容字段 / 模版
 * @param children
 */
export function formatList2Group(list: Array<any>, { id, pid, name, children = 'children' }: IKeyMap): Array<object> {
    let pids = Array.from(new Set(list.map(item => item[pid])));
    let selectTree: Array<object> = pids.map(pid => {
        return {
            id        : pid,              // 父子映射关系
            [children]: [],
            label     : pid,
            value     : pid,
        };
    });
    list.forEach(item => {
        let superItem: any = selectTree.find((f: any) => f.id == item[pid]);

        let label = templateVerifyParser(name, item);

        if (superItem) {
            superItem[children].push({
                id   : label,
                value: item[id],
                label: label,
                pid  : item[pid],       // 父子映射关系
            });
        }
    });
    return selectTree;
}

export function formatList2Tree(list: Array<any>, { id, pid, name }) {
    const isRoot = (item): boolean => Number(item[pid]) === 0;

    let treeData: Array<any> = [];
    list.forEach(item => {
        if (isRoot(item)) {
            item.children = [];
            treeData.push(item);
        }
        deepEach(treeData, node => {
            if (Number(node[id]) === Number(item[pid])) {
                node.children.push(item);
            }
        });
    });
    return treeData;
}

/**
 * 格式化树的key值
 * @param root
 * @param before
 * @param after
 */
export function formatTreeKey(root, before: IKeyMap, after: IKeyMap) {

    function replaceKey(beforeKey, afterKey, node) {
        if (beforeKey !== afterKey && beforeKey && afterKey) {
            node[afterKey] = node[beforeKey];
            if (typeof node[beforeKey] !== 'object') {      // 如果是引用数据类型则不删除
                delete node[beforeKey];
            }
        }
        return node;
    }

    deepEach(root, function (node) {
        replaceKey(before.id, after.id, node);
        replaceKey(before.name, after.name, node);
        replaceKey(before.pid, after.pid, node);
        replaceKey(before.children, after.children, node);
        // if (after.id !== before.id) {
        //     node[after.id] = node[before.id];
        //     delete node[before.id];
        // }
        // if (after.name !== before.name) {
        //     node[after.name] = node[before.name];
        //     delete node[before.name];
        // }
        // if (after.pid !== before.pid) {
        //     node[after.pid] = node[before.pid];
        //     delete node[before.pid];
        // }
        // if (after.children && before.children) {
        //     node[after.children] = node[before.children];
        //     // delete node[before.children];
        // }
    });
    return root;
}

// 验证 && 解析模版 && DOM转化
function templateVerifyParser(tpl: string, item: object): string {

    let label: string;

    if (isWuiTpl(tpl)) { // template
        label = parseTpl(tpl, item);
    } else {
        label = item[tpl];
    }

    if (isDOMString(label)) {
        label = strParseVirtualDOM(label);
    }

    return label;
}

// 列表转化为 antd options
export function formatList2AntdOptions(list: Array<any>, k: string, v: string): Array<IOptions> {
    return list.map(item => {

        let label = templateVerifyParser(v, item);

        return {
            // https://ant-design.gitee.io/components/select-cn/#Option-props
            // TODO 这里有点坑，非要转换成string类型才可以正常使用(不然有很多问题), 官网都说可以用 string 或者 number,有空提个issues 🥲
            value: String(item[k]),
            label: label,
            // title: label,
        };
    });
}

/**
 * @param data
 * @param url
 */
export function formatObject2Url(data: object, url: string = ''): string {
    let params = '';
    let [ href, search ] = url.split('?');

    //TODO 带参数的url传进来，会把url上的参数和data合并了
    let object = {};
    if (search) {
        let o = formatUrl2Object(search);
        object = Object.assign(o, data);
    } else {
        object = data;
    }

    for (const key in object) {
        if (!object.hasOwnProperty(key)) continue;
        let val = object[key];
        params += `${ key }=${ val }&`;
    }
    params = params.slice(0, params.length - 1);        // 删除最后一个&符

    return href + '?' + params;
}

/**
 * pf=1&game_id=123 => {pf:1,game_id:123}
 * @param url
 * @param o
 */
export function formatUrl2Object(url: string, o: object = {}): object {
    let search = url;
    if (url.includes('?')) {
        [ , search ] = url.split('?');
    }
    search.split('&').forEach(kv => {
        if (kv) {
            let [ k, v ] = kv.split('=');
            o[k] = v;
        }
    });
    return o;
}
