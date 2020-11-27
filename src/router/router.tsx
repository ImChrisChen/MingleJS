import React from 'react';
/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/6
 * Time: 12:35 上午
 */
import CodeGenerator from '@src/private-component/code-generator/CodeGenerator';
import usageMarkdown from '@root/README-USAGE.md';
import developMarkdown from '@root/README.md';
import temp1 from '@root/template/user_analysis.html';
import user_analysis from '@root/template/user_analysis.html';
import regExpManual from '@root/template/regexp_manual.html';
import { IRouteItem } from '@interface/common/component';
import layoutWindowPage from '@root/template/tpl-engine.html';
import MarkdownEditor from '@src/private-component/markdown-editor/MarkdownEditor';
import layoutSteps from '@root/template/layout-steps.html';
import { HtmlRenderer } from '@src/private-component/html-renderer/HtmlRenderer';
import { LayoutGenerator } from '@src/private-component/layout-generator/LayoutGenerator';
import AppLayoutHtml from '@root/template/layout.html';
import AppMenuHtml from '@root/template/app-menu.html';
import tplHtml from '@root/template/tpl.html';

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
        name     : '日志统计',
        path     : '/error',
        component: <MarkdownEditor value={ developMarkdown } visibleEditor={ false }/>,
    },
    {
        name     : '组件设计器',
        path     : '/code-generate',
        component: <CodeGenerator/>,
    },
    {
        name     : '可视化布局',
        path     : '/layout-generate',
        component: <LayoutGenerator/>,
    },
    {
        name     : '测试页面',
        path     : '/test-1',
        component: <HtmlRenderer html={ temp1 }/>,
        children : [
            {
                name     : '用户画像',
                path     : '/user-analysis',
                component: <HtmlRenderer html={ user_analysis }/>,
            },
        ],
    },
    {
        name     : '子应用布局 app-layout',
        path     : '/nav-app-layout',
        component: <HtmlRenderer html={ AppLayoutHtml }/>,
    },
    {
        name     : '子应用菜单 app-layout',
        path     : '/nav-app-menu',
        component: <HtmlRenderer html={ AppMenuHtml }/>,
    },
    {
        name     : '弹窗组件测试效果',
        path     : '/nav-layout-winodw-page',
        component: <HtmlRenderer html={ layoutWindowPage }/>,
    },
    {
        name     : '模版引擎',
        path     : '/nav-tpl',
        component: <HtmlRenderer html={ tplHtml }/>,
    },
    {
        name     : '步骤条组件展示效果',
        path     : '/nav-layout-steps',
        component: <HtmlRenderer html={ layoutSteps }/>,
    },
    {
        name     : '正则手册',
        path     : '/nav-regexp-manual',
        component: <HtmlRenderer html={ regExpManual }/>,
    },
    {
        name  : 'ant.design',
        path  : 'https://ant-design.gitee.io/components/overview-cn/',
        target: '_blank',
    },
] as Array<IRouteItem>;

