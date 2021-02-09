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
import { IRouteItem } from '@interface/common/component';
import MarkdownEditor from '@src/private-component/markdown-editor/MarkdownEditor';
import { LayoutGenerator } from '@src/private-component/layout-generator/LayoutGenerator';
import Logs from '@src/pages/logs/logs';

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
        path     : '/logs',
        component: <Logs/>,
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
        name  : 'ant.design',
        path  : 'https://ant-design.gitee.io/components/overview-cn/',
        target: '_blank',
    },
] as Array<IRouteItem>;

