/** * Created by WebStorm. * User: MacBook * Date: 2020/10/14 * Time: 11:09 上午 */export interface IComponentProps {    el: HTMLElement    elChildren: Array<HTMLElement>    box: HTMLElement    style: IReactStyle    dataset: any    role?: string    ref: () => any    value?: any}export interface IReactStyle {    [key: string]: string | number}export interface IDataset {}