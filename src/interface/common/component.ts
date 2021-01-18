/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/10/14
 * Time: 11:09 上午
 */

export interface IComponentProps {
    el: HTMLElement
    elChildren: Array<HTMLElement>
    style?: IReactStyle
    dataset?: any
    ref?: () => any
    value?: any

    [key: string]: any
}

export interface IReactStyle {
    [key: string]: string | number
}

export interface IRouteItem {
    path: string
    component?: any
    name: string
    target?: string
    children: Array<IRouteItem>
}
