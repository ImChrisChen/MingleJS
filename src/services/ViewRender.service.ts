/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/4/14
 * Time: 6:15 下午
 */

import { IVnode } from '@interface/common/component';
import { isArray, isEmptyObject } from '@src/utils';

export class ViewRenderService {

    createComponent(name: string, property?: object, content?: string) {
        let element = document.createElement(name);
        if (!property) return element;

        for (const key in property) {
            if (!property.hasOwnProperty(key)) continue;
            let value = property[key];
            if (key === 'name' || key === 'value') {
                element['name'] = key;
                element['value'] = value;
            }
            element.setAttribute(key, value);
        }
        return element;
    }

    vnodeToElement(node: IVnode): HTMLElement {

        if (isEmptyObject(node)) {
            return document.createElement('div');
        }

        let { tag, props, children, events } = node;
        let el = document.createElement(tag);

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
        if (children) {
            for (const child of children) {
                let childElm = this.vnodeToElement(child);
                el.append(childElm);
            }
        }

        return el;
    }

}
