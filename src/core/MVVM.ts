/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2021/3/14
 * Time: 12:21 上午
 */

import { IMingleVnode, VirtualDOM } from '@src/core/VirtualDOM';
import { isArray } from '@utils/inspect';
import { Inject } from 'typescript-ioc';
import { ParserTemplateService } from '@services/ParserTemplate.service';

/**
 * 判断vnode 是否是元素节点
 * @param vnode
 */

function isElem(vnode: IMingleVnode): boolean {
    return vnode.value === null;
}

/**
 * 判断vnode 是否是文本节点
 * @param vnode
 */
function isText(vnode: IMingleVnode): boolean {
    return typeof vnode.value === 'string';
}

export class MVVM {
    @Inject private readonly virtualDOM: VirtualDOM;
    @Inject private readonly parserTemplateService: ParserTemplateService;

    createElm(vnode: IMingleVnode): HTMLElement {
        let { tag, data, children, events } = vnode;
        let el = document.createElement(tag);

        for (const name in data) {
            if (!data.hasOwnProperty(name)) continue;
            let value = data[name];
            el.setAttribute(name, value);
        }

        // for (const name in events) {
        //     if (!events.hasOwnProperty(name)) continue;
        //     let listeners = events[name];
        //     for (const eventItem of listeners) {
        //         let { func, type } = eventItem;
        //         el.addEventListener(type, e => {
        //             func?.call(el, e);
        //         });
        //     }
        // }

        if (isArray(children)) {

            if (isText(vnode)) {
                el.textContent = vnode.value;
            }
            if (isElem(vnode)) {
                for (const child of children) {
                    let childElm = this.createElm(child);
                    el.append(childElm);
                }
            }
        }

        vnode.el = el;

        return el;
    }

    patch2(oldVnode: IMingleVnode, vnode: IMingleVnode) {
        const el = vnode.el;
        if (isText(vnode)) {
            el.textContent = vnode.value;
            vnode.isChanged = true;
        }
        if (isElem(vnode)) {
            if (vnode.children) {
                for (let i = 0; i < vnode.children.length; i++) {
                    let newCh = vnode.children[i];
                    let oldCh = oldVnode.children[i];
                    this.patch2(oldCh, newCh);
                }
            }
        }
        return vnode;
    }

    patch(oldVnode: IMingleVnode, vnode: IMingleVnode) {

        let el = vnode.el;
        console.log(el);

        // 虚拟 DOM
        if (oldVnode) {

            if (isText(vnode)) {
                if (oldVnode?.value !== vnode.value) {
                    el.textContent = vnode.value;
                    vnode.isChanged = true;
                    console.log('text => text');
                }
            }

            if (isElem(vnode)) {

                if (oldVnode.tag === vnode.tag) {
                    this.propsOps(oldVnode, vnode);

                    const oldChildren = oldVnode.children;
                    const newChildren = vnode.children;

                    for (let i = 0; i < newChildren.length; i++) {
                        let newCh = newChildren[i];
                        let oldCh = oldChildren[i];
                        let el = newCh.el;
                        let chNodeValue = newCh.value;

                        // 若新节点为文本
                        if (isText(newCh)) {
                            // 若老节点也为文本
                            if (isText(oldCh)) {
                                // 若新老节点文本内容不一致，则文本内容替换为新文本内容
                                if (newCh.value !== oldCh.value) {
                                    el.textContent = chNodeValue;
                                    console.log('text => text');
                                    vnode.isChanged = true;
                                }
                            } else {
                                // 若老节点有子节点，则情况后设置文本内容
                                el.textContent = chNodeValue;
                                console.log('text => text');
                                vnode.isChanged = true;
                            }

                        } else { //  若新节点有子节点
                            // 若老节点无子节点，为文本，则清空文本后创建并新增子节点
                            if (isText(oldCh)) {
                                el.textContent = '';
                                console.log('text => el');
                                vnode.isChanged = true;
                                newCh.children.forEach(child => this.createElm(child));
                            } else {
                                // 若老节点也有子节点，则检查更新
                                // this.updateChildren(oldCh, newCh);
                                this.patch(oldCh, newCh);
                                // console.log('loop');
                            }
                        }
                    }
                }

            }

        } else {
            //  真实DOM 初始化
            // el = this.virtualDOM.vnodeToHtml(vnode);
        }

        return vnode;
    }

    propsOps(oldVnode: IMingleVnode, newVnode: IMingleVnode) {
        let el = newVnode.el;
        // 获取新老节点的属性列表
        const oldProps = oldVnode.data || {};
        const newProps = newVnode.data || {};
        // 遍历新属性列表
        for (const key in newProps) {
            if (!newProps.hasOwnProperty(key)) continue;

            // 若老节点中不存在新节点的属性，则删除该属性
            if (!(key in oldProps)) {
                el.removeAttribute(key);
            } else {
                // 否则更新属性内容
                const oldValue = oldProps[key];
                const newValue = newProps[key];
                if (oldValue !== newValue) {
                    el.setAttribute(key, newValue);
                }
            }
        }
    }

    updateChildren(oldCh: IMingleVnode, newCh: IMingleVnode) {
        const el = newCh.el;
        // const len = Math.min(oldCh)
    }


}
