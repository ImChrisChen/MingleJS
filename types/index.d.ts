/** * Created by WebStorm. * User: MacBook * Date: 2020/10/12 * Time: 4:07 下午 */type ITrigger = (type: string, value: string) => anyinterface IStore {    [key: string]: any}type ISetStore = (k: string, v: any) => anytype IGetStore = (k: string) => anydeclare global {    interface Window {        jsonCallBack: (ret?: any) => any        [key: string]: any    }    interface HTMLElement {        setStore: ISetStore        getStore: IGetStore        store: IStore        trigger: ITrigger    }    interface Node {        setStore: ISetStore        getStore: IGetStore        store: IStore        trigger: ITrigger    }    interface Element {        setStore: ISetStore        getStore: IGetStore        store: IStore        trigger: ITrigger    }}// 这个必须有，将文件转化为模块export {};