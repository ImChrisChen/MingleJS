/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/23
 * Time: 12:54 下午
 */

import React from 'react';
import { deepEach, isObject } from '@utils/util';
import LayoutMenu from '@component/layout/menu/menu';
import componentMap from '../../config/component.config';
import { Route, Switch } from 'react-router';
import style from './Document.scss';

import FormSelect from '@component/form/select/select';
import FormSelectTree from '@component/form/select/tree/tree';
import FormSelectButton from '@component/form/button/button';
import FormDatepicker from '@component/form/datepicker/datepicker';
import Editor from '@component/form/editor/editor';

// @ts-ignore
import FormSelectMD from '@component/form/select/select.md'
console.log(FormSelectMD);

console.log(FormSelect);

export class Document extends React.Component<any, any> {
    state: any = {
        menuList: [],
        routes  : [],
    };

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        console.log('componentWillMount');
        this.componentFormatArray(componentMap).then(list => {


            let routes = deepEach(list, item => {
                if (item.component) return item;
            });

            this.setState({ menuList: list, routes });
        });
    }

    async componentFormatArray(componentMap) {
        let newArr: Array<object> = [];
        for (const key in componentMap) {
            if (!componentMap.hasOwnProperty(key)) continue;
            let val = componentMap[key];
            let children: Array<object> = [];

            for (const k in val) {
                let v = val[k];
                let { component, docs, path } = v;
                children.push({
                    name     : k,
                    component: await component,
                    docs     : await docs,
                    path,
                    children : [],
                });
            }
            newArr.push({ name: key, children: children });       // select / datepicker
        }
        return newArr;
    }

    render() {
        console.log(this.state.routes);
        let Routes = [];
        if (this.state.routes.length > 0) {
            Routes = this.state.routes.map(route => {
                // console.log(route.component['default']);
                return <Route key={ Math.random() * 1000 } path={ route.path }
                              component={ route.component['default'] }/>;
            });
        }
        return <div className={ style.container }>
            <LayoutMenu menuList={ this.state.menuList }/>
            <div style={ { width: '100%' } }>
                <h1>Content</h1>

                <Switch>
                    <div hidden={ true }>
                        { <Route path="/form-datepicker" component={ FormDatepicker }/> }
                        { <Route path="/form-button" component={ FormSelectButton }/> }
                        { <Route path="/form-select" component={ FormSelectTree }/> }
                    </div>
                </Switch>

                <Editor value={FormSelectMD}></Editor>

                {/*{ ...Routes }*/ }
            </div>
        </div>;
    }
}

function deepEachObject(root, fn, temp: Array<any> = []) {

    for (const key in root) {
        if (!root.hasOwnProperty(key)) continue;
        let val = root[key];

        if (fn) {
            let callbackResult = fn(key, val, root, temp);
            if (callbackResult) {
                temp.push({
                    [key]: val,
                });
            }
        }

        if (isObject(val)) {
            deepEachObject(val, fn, temp);
        }
    }

    return temp;
}

