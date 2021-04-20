import zhCN from 'antd/es/locale/zh_CN';

/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/4/20
 * Time: 3:32 下午
 */

// 组件全局配置
export const globalComponentConfig: any = {
    locale       : zhCN,
    componentSize: 'small',
    direction    : 'ltr',        // ltr | rtl
    space        : { size: 'small' },
    // virtual                 : true,
    dropdownMatchSelectWidth: true,
};

// 实体的操作模式
export type IEntityOperationMode = 'create' | 'update';

// 钩子类型
export type hookType = 'load' | 'beforeLoad' | 'update' | 'beforeUpdate';

// 解析类型
export type parseType =
    'string'
    | 'boolean'
    | 'number'
    | 'object[]'
    | 'string[]'
    | 'number[]'
    | 'JSON'
    | 'style'
    | 'class'
    | 'null'
    | Function /* 只能用于做验证的方法 比如 isUndefined, isBoolean */

// 组件设计器，属性值渲染类型
export type elType =
    'switch'
    | 'list'
    | 'radio'
    | 'input'
    | 'select'
    | 'datepicker'
    | 'slider'
    | 'number'
    | 'color'
    | 'select-multiple';

/**
 * 模块类型
 * web-components 组件调用方式为 - 自定义组件 <form-select></form-select>
 * functional 交互拓展函数 调用方式为 -  <div data-fn="layout-window"></div>
 */

export type ModuleType = 'web-components' | 'functional';

export interface IOptions {
    label: string
    value: string | number
    title?: string

    [key: string]: any
}

export interface IPropertyConfig {
    el?: elType             // (组件设计器) 要渲染的组件名称
    value?: ((parsedDataset) => any) | any          // TODO 在组件设计器中是没有这个参数传入的
    options?: Array<IOptions> | Function // 选择列表
    options_from?: string,      // 寻找当前的属性
    label?: string            // 组件设计器中的label值
    parse?: parseType         // 解析类型
    request?: boolean         //  url 上才有这个属性，request为true时在组件设计器中会立即请求
    render?: boolean         // 是否可在组件设计器中配置
    desc?: string           // 字段描述
    verify?: (v) => boolean     // 验证属性值是否合法
}

export interface IComponentConfig<Property = IPropertyConfig> {
    name?: string               // 组件 | 组 名称
    children?: {                // 组下的组件
        [key: string]: IComponentConfig
    },
    component?: Promise<any>    // 组件类
    path?: string               // 组件文档路径
    document?: Promise<any>     // 组件Markdown文档
    property?: {                // 组件属性配置
        dataset: {
            [key: string]: Property | (() => any)
        }
        name?: Property
        value?: Property
        style?: Property
        class?: Property
        id?: Property
        group?: Property
        placeholder?: Property
        hook?: {
            [key in hookType]?: {
                el?: string
                value?: string
                render?: boolean
            }
        }
        [key: string]: any
    }
    type?: ModuleType           // 组件类型
    icon?: string,              // 组件展示的图标
    visible?: boolean
}

// 公共配置属性 Interface
export interface IUniversalProps<T> {
    label: T
    placeholder: T
    url: T
    style: T
    class: T
    enum: T
    disabled: T
    size: T
    name: T
    required: T
    smart: T
    group: T
    exec: T

    [key: string]: T
}

