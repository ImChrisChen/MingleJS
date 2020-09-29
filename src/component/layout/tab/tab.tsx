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

    handleChange() {

    }

    renderChild() {
        let elChildren = this.props.elChildren;
        console.log(elChildren);
        setTimeout(() => {
            let $tabpanels = $(this.props.el).find('.form-tabpanel');
            console.log($tabpanels);
            elChildren.forEach((elChild, index) => {
                $tabpanels[index].append(elChild)
            })
        })

        // let tabChildren = elementParseAllVirtualDOM(elChildren);
        // return tabChildren.map((child, index) => <TabPane tab={ index } key={ index }>{ child }</TabPane>);
    }

    render() {
        return <Tabs defaultActiveKey="1" onChange={ this.handleChange.bind(this) }>
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
