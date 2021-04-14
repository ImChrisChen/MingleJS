/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/4/13
 * Time: 10:42 上午
 */

import { INativeProps } from '@interface/common/component';
import { Mingle } from '@src/core/Mingle';

interface IVnode {
    key: string | number;
    tag: string;
    pid: string | number;
    children: Array<IVnode>;
    props: object;
    events: any;
    configs?: Array<any>;
}

export default class AppRender {

    constructor(private readonly props: INativeProps) {
        let el = this.props.el;

        if (el.children.length > 0) {
            [ ...el.children ].forEach(child => child.remove());        // 如果有子节点删除子节点
        }

        let json = this.getData(el);
        let node = this.vnodeToElement(json);
        el.innerHTML = '';
        el.append(node);
        new Mingle({ el: node });
        el.style.opacity = '1';
        el.style.visibility = 'visible';
    }

    getData(el: HTMLElement): IVnode {
        let content = el.innerHTML.trim() || el['value'];
        if (!content) {
            console.warn(`app-render 内容为空`);
        }
        let json;

        try {
            json = JSON.parse(content);
        } catch(e) {
            console.warn(e);
        }

        return json;
    }

    vnodeToElement(node: IVnode): HTMLElement {
        let { key, tag, pid, configs, props, children, events } = node;
        let el = document.createElement(tag);
        // key && el.setAttribute('virtual-key', String(key));

        // 组件的属性key value 都是通过configs去保存的
        for (const name in configs) {
            if (!configs.hasOwnProperty(name)) continue;
            let { value, label } = configs[name];
            el[label] = value;
        }

        // 属性
        for (const name in props) {
            if (!props.hasOwnProperty(name)) continue;
            let value = props[name];

            el.setAttribute(name, value);
        }

        // 事件
        for (const name in events) {
            if (!events.hasOwnProperty(name)) continue;
            let listeners = events[name];
            for (const eventItem of listeners) {
                let { func, type } = eventItem;
                el.addEventListener(type, (e) => {
                    func?.call(el, e);
                });
            }
        }

        // 子元素
        for (const child of children) {
            let childElm = this.vnodeToElement(child);
            el.append(childElm);
        }

        return el;
    }

}
