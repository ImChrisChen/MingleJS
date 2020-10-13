/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/21
 * Time: 10:25 下午
 */
import React from 'react';
import { Tabs } from 'antd';
import $ from 'jquery';

const { TabPane } = Tabs;

export default class Tab extends React.Component<any, any> {

    constructor(props) {
        super(props);
        this.renderChild()
    }

    state: any = {
        tabPosition: this.props.dataset.tabPosition ?? 'top',
    };

    handleChange() {

    }

    renderChild() {
        let elChildren = this.props.elChildren;
        let el = this.props.el;
        $(elChildren).hide();

        // TODO 不能在组件卸载之后操作组件 https://www.cnblogs.com/aloneindefeat/p/12106450.html
        setTimeout(() => {
            let $tabpanels = $(el).find('.form-tabpanel');
            elChildren.forEach((elChild, index) => {
                $tabpanels[index].append(elChild);
                $(elChild).show();      //渲染后再显示
            });
        });
    }

    componentWillUnmount() {

    }

    refCallback(element) {

    }

    render() {
        return <Tabs tabPosition={ this.state.tabPosition }
                     defaultActiveKey="1"
                     onChange={ this.handleChange.bind(this) }
        >
            {
                this.props.elChildren.map((item, index) => {
                        return <TabPane className="form-tabpanel" tab="Tab 1"
                                        key={ index }>
                        </TabPane>;
                    },
                )
            }
            {/*{ ...this.renderChild() }*/ }
        </Tabs>;
    }
}
