/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/19
 * Time: 11:23 上午
 */

import { ElementDataAttrs } from '@interface/ElDatasetAttrs';
import { parseTpl } from '@utils/tpl-parse';
import { isBool, isObject, isStr } from '@utils/util';


enum KeyMap {
    multi = 'multi',
    options = 'options'
}
export function parseDataAttr(dataAttrs: ElementDataAttrs):object {
    let isParseTplAttr = true;

    // TODO 这里需要深拷贝处理一下，值和DOM元素是引用关系(避免破坏传入的参数，造成不必要的影响)
    let dataset = JSON.parse(JSON.stringify(dataAttrs));

    for(const key in dataset) {

        if(!dataset.hasOwnProperty(key)) continue;

        let val = dataset[key];

        if(isParseTplAttr) {

            if(!isStr(key)) continue;
            dataset[key] = parseTpl(val);

        }

        if(key === KeyMap.multi && !isBool(val)) {

            dataset[key] = eval(val);

        } else if(key === KeyMap.options && !isObject(val)) {

            let ret = /({.*?}|\[.*?\])/.test(val);
            if(!ret) {
                console.error(`data-${ key }的值传入的不是一个JSON`);
                dataset[key] = {};
                continue;
            }
            dataset[key] = JSON.parse(val);

        } else {

        }
    }

    return dataset;
}

