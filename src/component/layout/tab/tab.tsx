/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/21
 * Time: 10:25 下午
 */
import React from 'react';
import { Tabs } from 'antd';
import { elementParseAllVirtualDOM } from '@utils/dom-parse';

const { TabPane } = Tabs;

export default class Tab extends React.Component<any, any> {

    handleChange() {

    }

    renderChild() {
        let elChildren = this.props.elChildren;
        elChildren.pop();       // TODO 后续优化
        let tabChildren = elementParseAllVirtualDOM(elChildren);
        console.log(elChildren);
        return tabChildren.map((child, index) => <TabPane tab={ index } key={ index }>{ child }</TabPane>);
    }

    render() {
        return <Tabs defaultActiveKey="1" onChange={ this.handleChange.bind(this) }>
            { ...this.renderChild() }
        </Tabs>;
    }
}
