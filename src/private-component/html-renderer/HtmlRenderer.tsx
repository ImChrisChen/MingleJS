/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/11/17
 * Time: 3:13 下午
 */

import React from 'react';
import { strParseDOM } from '@src/utils';

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
                // TODO 先把DOM 添加进去再执行代码,有些data数据需要dom做依赖,如input的value值
                if (container) {
                    container.innerHTML = '';
                    container?.append(...element.children);
                    setTimeout(() => {
                        codes.map(code => eval(code));
                    }, 500);
                }
            } catch(e) {
                console.error(e);
            }

        });
    }

    render() {
        return <div className="HtmlRender"/>;
    }
}

