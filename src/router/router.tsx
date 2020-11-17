import React from 'react';
import $ from 'jquery';
import App from '@src/App';
/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/6
 * Time: 12:35 上午
 */
import CodeGenerate from '@component/code/generate/CodeGenerate';
import usageMarkdown from '@root/README-USAGE.md';
import developMarkdown from '@root/README.md';
import temp1 from '@root/template/user_analysis.html';
import user_analysis from '@root/template/user_analysis.html';
import regExpManual from '@root/template/regexp_manual.html';
import { IRouteItem } from '@interface/common/component';
import layoutWindowPage from '@root/template/tpl-engine.html';
import MarkdownEditor from '@component/form/editor/editor';
import layoutSteps from '@root/template/layout-steps.html';

class HtmlRender extends React.Component<{ html: string }, any> {
    constructor(props) {
        super(props);
        this.renderHtml();
    }

    renderHtml() {
        setTimeout(() => {
            let HtmlRender = $('.HtmlRender');
            HtmlRender.html('').append($(this.props.html));
            new App(HtmlRender.get(0));
        });
    }

    render() {
        return <div className="HtmlRender"/>;
    }
}

// nav
export default [
    {
        name     : '使用文档',
        path     : '/',
        component: <MarkdownEditor value={ usageMarkdown } visibleEditor={ false }/>,
    },
    {
        name     : '开发文档',
        path     : '/development-docs',
        component: <MarkdownEditor value={ developMarkdown } visibleEditor={ false }/>,
    },
    {
        name     : '组件设计器',
        path     : '/code-generate',
        component: <CodeGenerate/>,
    },
    {
        name     : '可视化布局',
        path     : '/layout-generate',
        component: <CodeGenerate/>,
    },
    {
        name     : '测试页面',
        path     : '/test-1',
        component: <HtmlRender html={ temp1 }/>,
        children : [
            {
                name     : '用户画像',
                path     : '/user-analysis',
                component: <HtmlRender html={ user_analysis }/>,
            },
        ],
    },
    {
        name     : '弹窗组件测试效果',
        path     : '/layout-winodw-page',
        component: <HtmlRender html={ layoutWindowPage }/>,
    },
    {
        name     : '步骤条组件展示效果',
        path     : '/layout-steps',
        component: <HtmlRender html={ layoutSteps }/>,
    },
    {
        name     : '正则手册',
        path     : '/regexp-manual',
        component: <HtmlRender html={ regExpManual }/>,
    },
    {
        name  : 'ant.design',
        path  : 'https://ant-design.gitee.io/components/overview-cn/',
        target: '_blank',
    },
] as Array<IRouteItem>;

