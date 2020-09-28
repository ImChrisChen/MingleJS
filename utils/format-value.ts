/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/17
 * Time: 10:39 下午
 */

export function formatEnumOptions(list: Array<any>, label: string = 'label', value: string = 'value') {
    if (!Boolean(list)) {
        return []
    }
    let options: Array<any> = [];
    list.forEach(item => {
        for (const key in item) {
            if (!item.hasOwnProperty(key)) continue;
            let val = item[key];
            options.push({
                [label]: val,
                [value]: key,
            });
        }
    });
    return options;
}

