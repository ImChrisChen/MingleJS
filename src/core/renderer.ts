/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2021/2/26
 * Time: 3:42 下午
 */

interface IVnode {
    tag: string
    children: Array<IVnode>
    props: object
    events: any
}

const vnodes = {
    tag     : 'layout-list',
    props   : {
        name        : '',
        value       : '',
        'data-cols' : 2,
        'data-space': '20,20',
    },
    children: [
        {
            tag     : 'data-table',
            props   : {},
            children: [],
            events  : {},
        },
        {
            tag     : 'data-table',
            props   : {},
            children: [],
            events  : {},
        },
        {
            tag     : 'data-table',
            props   : {},
            children: [],
            events  : {},
        },
    ],
    events  : {
        click: [
            {
                type: 'click',
                func: function () {
                    alert(this);
                },
            },
        ],
    },
};
const v = {
    tag  : 'data-table',
    props: {
        role: 'table',
    },
};


const vnode = {
    tag     : 'form-datepicker',
    slots   : {
        header: 'header',
    },
    props   : {
        id             : 'table',
        'data-label'   : 'label',
        'data-format'  : 'YYYY-MM-DD',
        'data-showtime': false,
        'data-picker'  : 'date',
        'data-single'  : false,
        'data-usenow'  : true,
        'name'         : 'form-select',
    },
    children: [],
    events  : {},
};

export class Renderer {

    constructor() {

    }

    h(node: IVnode = vnode): HTMLElement {
        let { tag, props, children, events } = node;
        let el = document.createElement(tag);

        for (const name in props) {
            if (!props.hasOwnProperty(name)) continue;
            let value = props[name];
            el.setAttribute(name, value);
        }

        for (const name in events) {
            if (!events.hasOwnProperty(name)) continue;
            let listeners = events[name];
            for (const eventItem of listeners) {
                let { func, type } = eventItem;
                el.addEventListener(type, e => {
                    func?.call(el, e);
                });
            }
        }

        for (const child of children) {
            // let { tag, props, children, events } = child;
            // let childElm = this.h(tag, props, children, events);

            let childElm = this.h(child);
            el.append(childElm);
        }

        return el;

    }

}

