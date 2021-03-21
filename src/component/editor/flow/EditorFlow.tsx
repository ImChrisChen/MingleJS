/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/11/16
 * Time: 10:55 下午
 */

import React, { Component } from 'react';
import { IComponentProps } from '@src/interface/common/component';
import GGEditor, { Flow, Mind } from 'gg-editor';

const data = {
    nodes: [
        {
            id   : '0',
            label: 'Node',
            x    : 55,
            y    : 55,
        },
        {
            id   : '1',
            label: 'Node',
            x    : 55,
            y    : 255,
        },
    ],
    edges: [
        {
            label : 'Label',
            source: '0',
            target: '1',
        },
    ],
};


const data2 = {
    label   : 'Central Topic',
    children: [
        {
            label: 'Main Topic 1',
        },
        {
            label: 'Main Topic 2',
        },
        {
            label: 'Main Topic 3',
        },
    ],
};


export default class EditorFlow extends Component<IComponentProps, any> {

    constructor(props) {
        super(props);
    }

    render() {
        return <GGEditor>
            {/*@ts-ignore*/ }
            <Mind style={ { width: 500, height: 500 } } data={ data2 }/>
        </GGEditor>;
        return <GGEditor>
            <Flow style={ { width: 500, height: 500 } } data={ data }/>
        </GGEditor>;
    }
}
