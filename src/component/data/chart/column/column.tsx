/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/20
 * Time: 3:20 下午
 */

import React from 'react';
// https://github.com/alibaba/BizCharts
import { Chart, Interval, Tooltip } from 'bizcharts';
// @ts-ignore
import areaUser from '@root/mock/chart/areaUser.json';

export default class ChartColumn extends React.Component<any, any> {

    // data = [
    //     { name: 'London', 月份: 'Jan.', 月均降雨量: 18.9 },
    //     { name: 'London', 月份: 'Feb.', 月均降雨量: 28.8 },
    //     { name: 'London', 月份: 'Mar.', 月均降雨量: 39.3 },
    //     { name: 'London', 月份: 'Apr.', 月均降雨量: 81.4 },
    //     { name: 'London', 月份: 'May', 月均降雨量: 47 },
    //     { name: 'London', 月份: 'Jun.', 月均降雨量: 20.3 },
    //     { name: 'London', 月份: 'Jul.', 月均降雨量: 24 },
    //     { name: 'London', 月份: 'Aug.', 月均降雨量: 35.6 },
    //     { name: 'Berlin', 月份: 'Jan.', 月均降雨量: 12.4 },
    //     { name: 'Berlin', 月份: 'Feb.', 月均降雨量: 23.2 },
    //     { name: 'Berlin', 月份: 'Mar.', 月均降雨量: 34.5 },
    //     { name: 'Berlin', 月份: 'Apr.', 月均降雨量: 99.7 },
    //     { name: 'Berlin', 月份: 'May', 月均降雨量: 52.6 },
    //     { name: 'Berlin', 月份: 'Jun.', 月均降雨量: 35.5 },
    //     { name: 'Berlin', 月份: 'Jul.', 月均降雨量: 37.4 },
    //     { name: 'Berlin', 月份: 'Aug.', 月均降雨量: 42.4 },
    // ];

    data = areaUser;

    render() {
        return <>
            <Chart height={ 300 } padding="auto" data={ this.data } autoFit>
                <Interval
                    adjust={ [
                        {
                            type       : 'dodge',
                            marginRatio: 0,
                        },
                    ] }
                    color="location"
                    position="count"
                    shape="count"
                    size={ 10 }
                />
                <Tooltip shared/>
            </Chart>
        </>;
    }
}
