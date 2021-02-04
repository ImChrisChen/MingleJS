/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/19
 * Time: 11:23 上午
 */

import { parseEnum, parseLineStyle, parseTpl } from '@utils/parser-tpl';
import { IPropertyConfig, parseType } from '@root/config/component.config';
import { isJSON, isString } from '@utils/inspect';

// 解析dataset data-*
export function parserDataset(dataset, defaultDataset): object {

    // TODO 这里需要深拷贝处理一下，值和DOM元素是引用关系(避免破坏传入的参数，造成不必要的影响)
    dataset = JSON.parse(JSON.stringify(dataset));
    let props = {};

    for (const datasetKey in defaultDataset) {

        if (!defaultDataset.hasOwnProperty(datasetKey)) continue;

        if (datasetKey === 'fn') continue;

        let currentProperty: IPropertyConfig<any> = defaultDataset[datasetKey];

        // 如何该属性有映射, 数据处理和key值转换
        if (!currentProperty /*!currentProperty.parse*/) continue;

        let {
            parse,                      // dataset值解析类型
            value: defaultVal,           // 属性默认值
            verify,
        } = currentProperty;
        let useValue = dataset[datasetKey];         // 传入的属性值

        let value = useValue ?? defaultVal ?? '';

        // value值函数解析
        if (value && typeof value === 'function') value = value();

        // 属性函数验证
        if (verify && !verify(value)) {
            console.warn(`${ datasetKey }属性的值格式验证不通过`, dataset);
            continue;
        }

        let { k, v } = parserProgram(datasetKey, value, parse);
        props[k] = v;
    }

    return props;
}

// 解析普通属性 name value placeholder ...
export function parserAttrs(attrs, defaultAttrsConfig, parsedDataset) {
    let defaultAttrs = {};

    for (const key in defaultAttrsConfig) {
        if (!defaultAttrsConfig.hasOwnProperty(key)) continue;
        let currentProperty = defaultAttrsConfig[key];
        if (currentProperty) {

            let { value, parse, verify } = currentProperty;

            // value值函数解析
            if (value && typeof value === 'function') {
                currentProperty.value = value = value(parsedDataset);
            }

            // 属性函数验证
            if (verify && !verify(value)) {
                console.error(`${ key }属性的值格式验证不通过`);
                continue;
            }
            // console.log(key, value, parse);
            defaultAttrs[key] = parserProgram(key, value, parse).v;
        }
    }
    let finalAttrs = Object.assign(defaultAttrs, attrs);

    // TODO 默认处理属性，不用写/读取配置去解析
    for (const key in finalAttrs) {
        if (!finalAttrs.hasOwnProperty(key)) continue;

        // TODO 兼容处理
        if (key === 'required' && finalAttrs[key] !== false) {
            finalAttrs[key] = true;
        }
        if (key === 'style' && isString(finalAttrs[key])) {
            finalAttrs[key] = parseLineStyle(finalAttrs[key]);
        }
    }

    return finalAttrs;

}

export function parserProgram(key, value, parse?: parseType): { k: string, v: any } {

    if (typeof parse === 'function') {
        // console.log(parse);
        // console.log(value, typeof value);
        value = parse(value);
    }

    switch (parse) {

        case 'string':            // 模版解析
            value = parseTpl(value, document.body, 'tpl');
            break;

        case 'number':
            value = Number(value);
            break;

        case 'boolean':
            value = eval(value);
            break;

        case 'string[]':             // 分割成数组
            value = value ? value.split(',') : [];
            break;

        case 'number[]':             // 分割成数组
            value = (value ? value.split(',') : []) as Array<any>;
            value = value.map(item => Number(item));
            break;

        case 'object[]':
            value = parseEnum(value);
            break;

        case 'JSON':
            // let ret = /({.*?}|\[.*?\])/.test(value);
            if (isJSON(value)) {
                value = JSON.parse(value);
            } else {
                console.error(`data-${ key }的值传入的不是一个JSON`);
                value = {};
            }
            break;

        case 'style':       // 行内样式解析成 JSX Style
            value = parseLineStyle(value);
            break;

        case 'null':
            break;

        default :   // 默认不解析
            break;
    }

    return { k: key, v: value };
}
