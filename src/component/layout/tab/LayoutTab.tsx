/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/21
 * Time: 10:25 下午
 */
import React from 'react';
import { Tabs } from 'antd';
import $ from 'jquery';
import { IComponentProps } from '@interface/common/component';

const { TabPane } = Tabs;

export default class Tab extends React.Component<IComponentProps, any> {

    constructor(props) {
        super(props);
        this.renderChild();
    }

    state: any = {
        position: this.props.dataset.position ?? 'top',
    };

    handleChange(e) {
        console.log(e);
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
                $(elChild).show();      // TODO 渲染后再显示,写在这里防止抖动
            });
        });
        // $(elChildren).hide(); // TODO 写在这里会有抖动
    }

    render() {
        return <Tabs tabPosition={ this.state.position }
                     defaultChecked={ true }
                     defaultActiveKey={ this.props.dataset.current ?? '0' }
                     onChange={ e => this.handleChange(e) }
        >
            {
                this.props.elChildren.map((child, index) => {
                        return <TabPane className="form-tabpanel" tab={ child.dataset.title }
                                        key={ index }>
                            {/*<div ref={ el => {*/ }
                            {/*    if (el) {*/ }
                            {/*        console.log(child);*/ }
                            {/*        el.append(child);*/ }
                            {/*    }*/ }
                            {/*} }/>*/ }
                        </TabPane>;
                    },
                )
            }
        </Tabs>;
    }
}
