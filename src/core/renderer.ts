/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/2/26
 * Time: 3:42 下午
 */

const JSON = {
    component: 'layout-list',
    property : {
        name        : '',
        value       : '',
        'data-cols' : 2,
        'data-space': '20,20',
    },
    children : [
        {
            component: 'data-table',
            propery  : {
                name      : 'xx',
                'data-url': 'https://xxxxxxxxx.com',
            },
        },
        {
            component: 'data-table',
            propery  : {
                name      : 'xx',
                'data-url': 'https://xxxxxxxxx.com',
            },
        },
    ],
    slots    : {},
    events   : [
        {
            name: 'handleClick',
        },
    ],
};

export class Renderer {

    private data = JSON;

    constructor(el) {
        // this.generate(this.data);
    }

    createElement(label, property) {

    }

    /**
     *
     * @param props
     */
    getCodeByProperty(props: object): string {
        let propTpl = ``;
        for (const key in props) {
            if (!props.hasOwnProperty(key)) continue;
            let value = props[key];
            propTpl += ` ${ key }=${ value } `;
        }
        return propTpl;
    }

    generate(json) {
        let template = ``;
        for (const item of json) {
            let propsTpl = this.getCodeByProperty(item.property);
        }
    }

}

