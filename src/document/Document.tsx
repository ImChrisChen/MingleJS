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
import { Redirect, Route, Switch } from 'react-router-dom';
import style from './Document.scss';
// import FormSelect from '@component/form/select/select';
import FormSelectTree from '@component/form/select/tree/tree';
import FormSelectButton from '@component/form/button/button';
import FormDatepicker from '@component/form/datepicker/datepicker';
// @ts-ignore
import DataTable from '@component/data/table/table';
// import CodeEditor from '@component/code/editor/CodeEditor';
import CodeGenerate from '@component/code/generate/CodeGenerate';
import { componentFormatTree } from "@utils/format-value";

// console.log(FormSelectMD);

// console.log(FormSelect);

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
        componentFormatTree(componentMap).then(list => {
            let routes = deepEach(list, item => {
                if (item.component) return item;
            });
            this.setState({ menuList: list, routes });
        });
    }

    render() {
        console.log(this.state.menuList);
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

            <div style={ { width: '100%', height: '100%' } }>
                <h1>Content</h1>

                <Switch>
                    <div className="route-content">
                        <Route path="/form-datepicker" component={ FormDatepicker }/>
                        <Route path="/form-button" component={ FormSelectButton }/>
                        <Route path="/form-select" component={ FormSelectTree }/>
                        <Route path="/data-table" component={ DataTable }/>
                        {/*<Route exact path="/form" component={ CodeGenerate }/>*/ }
                        <Route path="*" component={ CodeGenerate }/>
                        <Redirect from="/*" to={ '/' }/>
                    </div>
                </Switch>

                {/*<CodeEditor dataset={ {*/ }
                {/*    value: `<div data-fn="form-input"></div>`,*/ }
                {/*} }/>*/ }

                {/*<Editor value={ FormSelectMD }/>*/ }

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

