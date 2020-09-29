/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/21
 * Time: 10:25 下午
 */
import React from 'react';
import { Tabs } from 'antd';
import $ from 'jquery'

const { TabPane } = Tabs;

export default class Tab extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.renderChild()
    }

    state: any = {
        tabPosition: this.props.tabPosition ?? 'top',
    }

    handleChange() {

    }

    renderChild() {
        let elChildren = this.props.elChildren;
        setTimeout(() => {
            let $tabpanels = $(this.props.el).find('.form-tabpanel');
            elChildren.forEach((elChild, index) => {
                $tabpanels[index].append(elChild)
            })
        })
    }

    render() {
        return <Tabs tabPosition={ this.state.tabPosition } defaultActiveKey="1"
                     onChange={ this.handleChange.bind(this) }>
            {
                this.props.elChildren.map((item, index) => {
                        return <TabPane className="form-tabpanel" tab="Tab 1" key={ index }>
                        </TabPane>
                    }
                )
            }
            {/*{ ...this.renderChild() }*/ }
        </Tabs>;
    }
}
