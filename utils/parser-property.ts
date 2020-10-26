/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/19
 * Time: 11:23 上午
 */

import { parseEnum, parseTpl } from '@utils/parser-tpl';
import { IPropertyConfig } from '@root/config/component.config';

export function parserProperty(dataAttrs = {}, defaultDataset?): object {

    // TODO 这里需要深拷贝处理一下，值和DOM元素是引用关系(避免破坏传入的参数，造成不必要的影响)
    let dataset = JSON.parse(JSON.stringify(dataAttrs));
    let newDataSet = {};

    for (const datasetKey in defaultDataset) {

        if (!defaultDataset.hasOwnProperty(datasetKey)) continue;
        if (datasetKey === 'fn') continue;
        let currentProperty: IPropertyConfig<any> = defaultDataset[datasetKey];

        // 如何该属性有映射, 数据处理和key值转换
        if (currentProperty && currentProperty.parse) {

            let {
                parse,                      // dataset值解析类型
                value: defaultVal,           // 属性默认值
                verify,
            } = currentProperty;
            let useValue = dataset[datasetKey];         // 传入的属性值
            let value = useValue ?? defaultVal ?? '';

            if (verify && !verify(value)) {
                console.log(verify(value), value);
                console.error(`${ datasetKey }属性的值格式验证不通过`);
                continue;
            }

            switch (parse) {
                case 'string':            // 模版解析
                    newDataSet[datasetKey] = parseTpl(value);
                    break;

                case 'number':
                    newDataSet[datasetKey] = Number(value);
                    break;

                case 'boolean':
                    newDataSet[datasetKey] = eval(value);
                    break;

                case 'string[]':             // 分割成数组
                    newDataSet[datasetKey] = value ? value.split(',') : [];
                    break;

                case 'object[]':
                    newDataSet[datasetKey] = parseEnum(value);
                    break;

                case 'JSON':
                    let ret = /({.*?}|\[.*?\])/.test(value);
                    if (!ret) {
                        console.error(`data-${ datasetKey }的值传入的不是一个JSON`);
                        newDataSet[datasetKey] = {};
                        continue;
                    }
                    newDataSet[datasetKey] = JSON.parse(value);
                    break;
                case 'null':
                    newDataSet[datasetKey] = value;
                    break;

                // 默认不解析
                default:
                    newDataSet[datasetKey] = value;
                    break;
            }

        }
    }

    return newDataSet;
}

