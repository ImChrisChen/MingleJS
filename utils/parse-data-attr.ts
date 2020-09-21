/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/19
 * Time: 11:23 上午
 */

import { ElementDataAttrs } from '@interface/ElDatasetAttrs';
import { parseTpl } from '@utils/tpl-parse';

import keyMap from '../config/property.config'

export function parseDataAttr(dataAttrs: ElementDataAttrs): object {

    // TODO 这里需要深拷贝处理一下，值和DOM元素是引用关系(避免破坏传入的参数，造成不必要的影响)
    let dataset = JSON.parse(JSON.stringify(dataAttrs));

    for (const key in dataset) {

        if (!dataset.hasOwnProperty(key)) continue;

        let val = dataset[key];

        if (keyMap[key] && keyMap[key].name) {

            let type = keyMap[key].type;

            switch (type) {
                case String:            // 模版解析
                    dataset[key] = parseTpl(val);
                    break

                case Number:
                    dataset[key] = Number(val)
                    break

                case Boolean:
                    dataset[key] = eval(val)
                    break

                case Array:             // 分割成数组
                    dataset[key] = val ? val.split(',') : []
                    break

                case Object:
                    let ret = /({.*?}|\[.*?\])/.test(val);
                    if (!ret) {
                        console.error(`data-${ key }的值传入的不是一个JSON`);
                        dataset[key] = {};
                        continue;
                    }
                    dataset[key] = JSON.parse(val);
                    break

                // case type === Function:
                //     break
                //
                // case type === undefined:
                //     break
                //
                // case type === null:
                //     break
                //
                // default:
                //     break
            }

        }
    }

    return dataset;
}

