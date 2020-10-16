/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/23
 * Time: 12:54 下午
 */

import React from 'react';
import { deepEach, isObject } from '@utils/util';
import LayoutMenu from '@component/layout/menu/menu';
import componentMap from '@root/config/component.config';
import { Redirect, Route, Switch } from 'react-router-dom';
import style from './Document.scss';
import CodeGenerate from '@component/code/generate/CodeGenerate';
import { formatComponents2Tree } from "@utils/format-data";
import FormEditor from '@component/form/editor/editor'

class Container extends React.Component<any, any> {
    render() {
        return <>
            <FormEditor visibleEditor={ false } value={ this.props.value }/>
        </>;
    }
}

export class Document extends React.Component<any, any> {
    state: any = {
        menuList: [],
        routes  : [],
    };

    constructor(props) {
        super(props);

        formatComponents2Tree(componentMap).then(list => {
            let routes = deepEach(list, item => {
                if (item.component) return item;
            });
            this.setState({ menuList: list, routes });
        });
    }

    render() {
        let Routes = [];
        if (this.state.routes.length > 0) {
            Routes = this.state.routes.map(route => {
                if (route.document) {
                    return <Route key={ Math.random() * 1000 } path={ route.path }
                                  render={ () => <Container value={ route.document['default'] }/> }/>;
                } else {
                    return undefined
                }
            }).filter(t => t);
        }
        return <div className={ style.container }>
            <LayoutMenu menuList={ this.state.menuList }/>

            <div style={ { width: '100%', height: '100%' } }>
                <h1>Document</h1>

                <Switch>
                    { ...Routes }
                    <Redirect from="*" to="/" exact/>
                </Switch>

                <CodeGenerate/>
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

