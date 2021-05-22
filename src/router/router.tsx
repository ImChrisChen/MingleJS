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
import MarkdownEditor from '@src/private-component/markdown-editor/MarkdownEditor';

export interface IRouteItem {
    path: string
    component?: any
    name: string
    target?: string
    children: Array<IRouteItem>
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
        component: <CodeGenerator/>,
    },
    {
        name  : 'ant.design',
        path  : 'https://ant-design.gitee.io/components/overview-cn/',
        target: '_blank',
    },
] as Array<IRouteItem>;


