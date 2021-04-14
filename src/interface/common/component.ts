/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/10/14
 * Time: 11:09 上午
 */

// react 组件模块 
export interface IComponentProps {
    el: HTMLElement
    subelements: Array<HTMLElement>
    templates: object
    style?: IReactStyle
    container: HTMLElement
    dataset?: any
    ref?: () => any
    value?: any
    cssText: string

    [key: string]: any
}

// class 模块
export interface INativeProps {
    el: HTMLElement
    style?: IReactStyle
    dataset?: any
    value?: any
    cssText: string

    [key: string]: any
}

export interface IReactStyle {
    [key: string]: string | number
}

export interface IVnode {
    key: string | number;
    tag: string;
    pid: string | number;
    children: Array<IVnode>;
    props: object;
    events: any;
    configs?: Array<any>;
}
