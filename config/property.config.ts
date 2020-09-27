/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/21
 * Time: 11:19 上午
 */

interface IPropertyItem {
    name: string,
    type: string,
}

interface IPropertysConfig<T> {
    [key: string]: T
}

// 配置dataset 属性的值和类型 name 表示this.props获取的属性值 和 html传入的 data-* 属性一致
const property: IPropertysConfig<IPropertyItem> = {
    multi           : {
        name: 'multi',
        type: 'boolean',
    },
    options         : {
        name: 'options',
        type: 'JSON',
    },
    singledatepicker: {
        name: 'singledatepicker',
        type: 'boolean',
    },
    enum            : {
        name: 'enum',
        type: `object[]`,
    },
    pageSizeOptions : {
        name: 'pageSizeOptions',
        type: 'string[]',
    },
    urlData         : {
        type: 'string',
        name: 'urlData',
    },
    maxLength       : {
        name: 'maxLength',
        type: 'number',
    },
    size            : {
        name: 'size',
        type: 'string',
    },
    prefix          : {
        name: 'prefix',
        type: 'string',
    },
    allowClear      : {
        name: 'allowClear',
        type: 'boolean',
    },
    buttonStyle     : {
        name: 'buttonStyle',
        type: 'string',
    },
    optionType      : {
        name: 'optionType',
        type: 'string',
    },
    colors          : {
        name: 'colors',
        type: 'JSON',
    },
    series          : {
        name: 'series',
        type: 'JSON',
    },
    menuList        : {
        name: 'menuList',
        type: 'JSON',
    },
};

// 对象属性值统一成小写,因为在dataset中只能获取到小写的值，这里提供一层映射关系
function formatKeys<T>(property: IPropertysConfig<T>): IPropertysConfig<T> {
    for (let key in property) {
        if (!property.hasOwnProperty(key)) continue;

        let val = property[key];
        let newKey = key.toLowerCase();

        if (newKey !== key) {       // 大小写转换了
            property[newKey] = val;
            delete property[key];
        }
    }
    return property;
}

export default formatKeys(property);
