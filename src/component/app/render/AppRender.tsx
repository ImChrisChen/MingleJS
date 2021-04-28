/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/4/13
 * Time: 10:42 上午
 */

import { INativeProps, IVnode } from '@interface/common/component';
import { MingleJS } from '@src/core/MingleJS';
import { Inject } from 'typescript-ioc';
import { ViewRenderService } from '@src/services';
import { vnodeToElement } from '@src/utils';

export default class AppRender {

    @Inject private readonly viewRenderService: ViewRenderService;

    constructor(private readonly props: INativeProps) {
        let el = this.props.el;
        if (el.children.length > 0) {
            [ ...el.children ].forEach(child => child.remove());        // 如果有子节点删除子节点
        }

        let json = this.getData(el);
        let node = vnodeToElement(json);

        el.innerHTML = '';
        el.append(node);
        new MingleJS({ el: node });
        el.style.opacity = '1';
    }

    getData(el: HTMLElement): IVnode {
        let content = el.innerHTML.trim() || el['value'];
        if (!content) {
            console.warn(`app-render 内容为空`);
        }
        let json;

        try {
            console.time('JSON.parse');
            json = JSON.parse(content);
            console.timeEnd('JSON.parse'); // 0.33203125ms
        } catch(e) {
            console.warn(e);
        }

        return json;
    }

}
