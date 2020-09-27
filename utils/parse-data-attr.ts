/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/19
 * Time: 11:23 上午
 */

import { ElementDataAttrs } from '@interface/ElDatasetAttrs';
import { parseEnum, parseTpl } from '@utils/tpl-parse';

import keyMap from '../config/property.config';

export function parseDataAttr(dataAttrs: ElementDataAttrs): object {

    // TODO 这里需要深拷贝处理一下，值和DOM元素是引用关系(避免破坏传入的参数，造成不必要的影响)
    let dataset = JSON.parse(JSON.stringify(dataAttrs));
    let newDataSet = {};

    for (const datasetKey in dataset) {

        if (!dataset.hasOwnProperty(datasetKey)) continue;

        let val = dataset[datasetKey];

        // 如何该属性有映射, 数据处理和key值转换
        if (keyMap[datasetKey]) {

            let type = keyMap[datasetKey].type;
            let propsName = keyMap[datasetKey].name;

            switch (type) {
                case 'string':            // 模版解析
                    newDataSet[propsName] = parseTpl(val);
                    break;

                case 'number':
                    newDataSet[propsName] = Number(val);
                    break;

                case 'boolean':
                    newDataSet[propsName] = eval(val);
                    break;

                case 'string[]':             // 分割成数组
                    newDataSet[propsName] = val ? val.split(',') : [];
                    break;

                case 'object[]':
                    console.log(val);
                    newDataSet[propsName] = parseEnum(val);
                    break;

                case 'JSON':
                    let ret = /({.*?}|\[.*?\])/.test(val);
                    if (!ret) {
                        console.error(`data-${ propsName }的值传入的不是一个JSON`);
                        newDataSet[propsName] = {};
                        continue;
                    }
                    newDataSet[propsName] = JSON.parse(val);
                    break;

                default:
                    break;
            }

        }
    }

    return newDataSet;
}

