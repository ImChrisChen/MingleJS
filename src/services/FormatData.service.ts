/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/2/7
 * Time: 3:32 下午
 */

import { deepEach, isArray, isDOMString, isWuiTpl, strParseVirtualDOM } from '@src/utils';
import { ParserTemplateService } from '@src/services';
import { IOptions } from '@src/config';
import { Inject } from 'typescript-ioc';

interface IKeyMap {
    id: string
    pid: string
    name: string
    children?: string
}

export class FormatDataService {

    @Inject private readonly parserTemplateService: ParserTemplateService;

    /**
     * 将 data-enum 的数组对象 装换成 antd options 结构
     * @param list
     * @return
     */
    public enum2AntdOptions(list: Array<any>): Array<any> {
        if (!Boolean(list)) {
            return [];
        }
        return list.map(item => {
            for (const key in item) {
                if (!item.hasOwnProperty(key)) continue;
                let val = item[key];
                return {
                    label: val,
                    value: key,
                };
            }
        });
    }

    /**
     * 列表转化为 antd options 数据格式
     * @param list
     * @param k
     * @param v
     */
    public list2AntdOptions(list: Array<any>, k: string, v: string): Array<IOptions> {

        // 存在多个data-key值的情况
        let isMultipleKey = k.includes(',') && k.split(',').length > 1;

        return list.map(item => {

            let label = this.templateVerifyParser(v, item);
            let value = String(item[k]);

            if (isMultipleKey) {
                let ks = k.split(',');
                value = '';
                ks.forEach(k => {
                    value += String(item[k]) + '|';
                });
                value = value.substr(0, value.length - 1);
            }

            return {
                // https://ant-design.gitee.io/components/select-cn/#Option-props
                // TODO 这里有点坑，非要转换成string类型才可以正常使用(不然有很多问题), 官网都说可以用 string 或者 number,有空提个issues 🥲
                value: value,
                label: label,
                // title: label,
            };
        });
    }

    /**
     * 组件配置转化为 菜单，多级选择器可以渲染的数据格式
     * @param componentConfig
     */
    public async components2MenuTree(componentConfig) {
        let newArr: Array<object> = [];
        for (const key in componentConfig) {
            if (!componentConfig.hasOwnProperty(key)) continue;
            let val = componentConfig[key];
            let children: Array<object> = [];

            for (const k in val) {
                if (!val.hasOwnProperty(k)) continue;

                let v = val[k];
                let { component, document, path, property, ...args } = v;
                let item = {
                    label    : k,
                    value    : k,
                    component: await component,
                    document : await document,
                    property,
                    path,
                    ...args,
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

    /**
     *
     * @param list  需要数据转化的列表
     * @param id    id 唯一值
     * @param pid   pid/id 形成父级关系映射
     * @param name  展示的内容字段 / 模版
     * @param children
     */
    public list2Group(list: Array<any>, { id, pid, name, children = 'children' }: IKeyMap): Array<object> {
        let pids = Array.from(new Set(list.map(item => item[pid])));
        let selectGroup: Array<object> = pids.map(pid => {
            return {
                id        : pid,              // 父子映射关系
                [children]: [],
                label     : pid,
                value     : pid,
            };
        });
        list.forEach(item => {
            let superItem: any = selectGroup.find((f: any) => f.id == item[pid]);

            let label = this.templateVerifyParser(name, item);

            if (superItem) {
                superItem[children].push({
                    id   : id,
                    value: item[id],
                    label: label,
                    pid  : item[pid],       // 父子映射关系
                });
            }
        });
        return selectGroup;
    }

    // 列表 => 树
    public list2Tree(list: Array<any>, { id, pid, name }) {
        const isRoot = (item): boolean => Number(item[pid]) === 0;

        let treeData: Array<any> = [];
        let tempArr: Array<any> = [];
        list.forEach(item => {
            if (isRoot(item)) {
                item.children = [];
                treeData.push(item);
            } else {
                tempArr.push(item);
            }
        });

        deepEach(treeData, node => {
            for (const item of tempArr) {
                if (
                    Number(node[id]) === Number(item[pid])
                    && isArray(node.children)
                ) {
                    node.children.push(item);
                }
            }
        });
        return treeData;
    }

    // 树 => 列表
    public tree2List(tree: object) {
        return deepEach([{ children: tree }], node => node);
    }

    /**
     * 替换树的key值
     * @param root
     * @param before
     * @param after
     */
    public treeKeyReplace(root, before: IKeyMap, after: IKeyMap) {

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

    /**
     * 验证 && 解析模版 && DOM转化
     * @param tpl
     * @param item
     * @private
     */
    public templateVerifyParser(tpl: string, item: object): string {

        let label: string;

        if (isWuiTpl(tpl)) { // template
            // label = parseTpl(tpl, item);
            label = this.parserTemplateService.parseTpl(tpl, item, 'tpl');
        } else {
            label = item[tpl];
        }

        if (isDOMString(label)) {
            label = strParseVirtualDOM(label);
        }

        return label;
    }

    /**
     * @param data
     * @param url
     */
    public obj2Url(data: object, url: string = ''): string {
        let params = '';
        let [href, search] = url.split('?');

        //TODO 带参数的url传进来，会把url上的参数和data合并了
        let object = {};
        if (search) {
            let o = this.url2Obj(search);
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
    public url2Obj(url: string, o: object = {}): object {
        let search = url;
        if (url.includes('?')) {
            [, search] = url.split('?');
        }
        search.split('&').forEach(kv => {
            if (kv) {
                let [k, v] = kv.split('=');
                o[k] = v;
            }
        });
        return o;
    }

}
