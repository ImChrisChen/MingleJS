/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/5
 * Time: 2:48 下午
 */
import React from 'react';
import ReactDOM from 'react-dom';
// import { Row, Col, Icon, Button, Layout, Menu, Card } from 'antd';

export default class LayoutWindow extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = {
            iFrameHeight: '100px',
        };
    }

    render() {
        return (
            <iframe
                style={ { width: '100%', height: this.state.iFrameHeight, overflow: 'visible' } }
                onLoad={ () => {
                    const obj: any = ReactDOM.findDOMNode(this);
                    this.setState({
                        'iFrameHeight': obj.contentWindow.document.body.scrollHeight + 'px',
                    });
                } }
                ref="iframe"
                src="https://baidu.com"
                width="100%"
                height={ this.state.iFrameHeight }
                scrolling="no"
                frameBorder="0"
            />
        );
    }

}



