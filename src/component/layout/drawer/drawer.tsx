/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/10/7
 * Time: 3:43 下午
 */

import React from 'react';
import { IComponentProps } from "@interface/common/component";
import { Button } from "antd";

export class LayoutDrawer extends React.Component<IComponentProps, any> {
    constructor(props) {
        super(props);
    }

    render() {
        return <>
            <Button>展开</Button>
        </>
    }
}
