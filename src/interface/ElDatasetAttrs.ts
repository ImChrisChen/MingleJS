/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/19
 * Time: 11:42 上午
 */

interface Options {
    [propName: string]: any
}

// element.dataset 属性
export interface ElementDataAttrs {
    fn?: string
    options?: Options
    onload?: string
    multi?: boolean
}

export interface IComponentProps {
    el: HTMLElement
    elChildren: Array<HTMLElement>
    box: HTMLElement
    style: object
    dataset: any
    defaultProperty: object
    role?: string
    ref: () => any
}
