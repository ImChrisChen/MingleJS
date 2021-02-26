/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/11/17
 * Time: 3:13 下午
 */

import React from 'react';
import App from '@root/src/App';
import { strParseDOM } from '@utils/trans-dom';
import { isEmptyArray } from '@utils/inspect';

interface IHtmlRendererProps {
    html: string
}

export class HtmlRenderer extends React.Component<IHtmlRendererProps, any> {

    constructor(props) {
        super(props);
        this.renderHtml();
    }

    renderHtml() {
        setTimeout(() => {
            let element = strParseDOM(this.props.html);
            let scripts: Array<HTMLElement> = [ ...element.querySelectorAll('script') ];
            let container = document.querySelector('.HtmlRender');

            let codes: Array<string> = scripts.map(script => {
                let code = script?.innerHTML ?? '';
                script.remove();
                return code;
            });

            try {
                // TODO 先把DOM 添加进去再执行代码,有些data数据需要dom做依赖,如 input的value值
                container?.append(...element.children);
                codes.map(code => eval(code));
                if (isEmptyArray(scripts)) {
                    new App(container as HTMLElement);
                }
            } catch (e) {
                console.error(e);
            }

        });
    }

    render() {
        return <div className="HtmlRender"/>;
    }
}

