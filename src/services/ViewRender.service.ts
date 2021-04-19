/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/4/14
 * Time: 6:15 下午
 */

export class ViewRenderService {

    public createComponent(name: string, property?: object, content?: string) {
        let element = document.createElement(name);
        if (!property) return element;

        for (const key in property) {
            if (!property.hasOwnProperty(key)) continue;
            let value = property[key];
            if (key === 'name' || key === 'value') {
                element['name'] = key;
                element['value'] = value;
            }
            element.setAttribute(key, value);
        }
        return element;
    }

}
