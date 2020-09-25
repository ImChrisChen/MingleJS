/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/21
 * Time: 11:19 上午
 */

// 配置dataset 属性的值和类型 name 表示this.props获取的属性值 和 html传入的 data-* 属性一致
const property = {
    multi           : {
        name: 'multi',
        type: 'boolean',
    },
    options         : {
        name: 'options',
        type: 'object',
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
        type: 'string[]'
    },
    urlData         : {
        type: 'string',
        name: 'urlData',
    }
}

// 对象属性值统一成小写,因为在dataset中只能获取到小写的值，这里提供一层映射关系
function formatKeys(property) {
    for (let key in property) {
        if (!property.hasOwnProperty(key)) continue

        let val = property[key];
        let newKey = key.toLowerCase();

        if (newKey !== key) {       // 大小写转换了
            property[newKey] = val;
            delete property[key]
        }
    }
    console.log(property);
    return property
}

export default formatKeys(property);
