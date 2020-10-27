/**
 * Created by WebStorm.
 * User: chrischen
 * Date: 2020/9/20
 * Time: 3:20 下午
 */
import React from 'react';
// import { DataSet } from "@antv/data-set/lib/data-set";
import areaUser from '@root/mock/chart/areaUser.json';
import { Chart, Interval, Tooltip } from 'bizcharts';
import { Spin } from 'antd';

// const dataSet = new DataSet({
//     state: {
//         year: '2010'
//     }
// })
//
// const dataView = dataSet.createView().source(areaUser);
//
// dataView.transform({
//     type: 'filter',
//     callback (row) {
//         return row.year === dataSet.state.year
//     }
// })
//
// 注册自己的主题
// registerTheme('my-theme', {
//     defaultColor: '#6DC8EC',
//     geometries  : {
//         interval: {
//             rect: {
//                 default : { style: { fill: '#6DC8EC', fillOpacity: 0.95 } },
//                 active  : { style: { stroke: '#5AD8A6', lineWidth: 1 } },
//                 inactive: { style: { fillOpacity: 0.3, strokeOpacity: 0.3 } },
//                 selected: {},
//             }
//         }
//     }
// })

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

    state = {
        loading: true,
        data   : [],
    };

    constructor(props) {
        super(props);
        this.getData().then(data => {
            this.setState({ data, loading: false });
        });
    }

    data = areaUser;

    async getData() {
        return new Promise(function (resolve, reject) {
            setTimeout(() => {
                resolve(areaUser);
            }, 2000);
        });
    }

    onAfterchangedata(e) {
        console.log(e);
    }

    onBeforerender(e) {
        console.log(e);
    }

    onAfterrender(e) {
        console.log(e);
    }

    onBeforepaint(e) {
        console.log(e);
    }

    onClick(e) {
        console.log(e);
    }

    render() {
        console.log(this.props);
        return <>
            <h2 style={ { textAlign: 'center', padding: '10px 20px' } }>地域用户画像</h2>
            <Spin spinning={ this.state.loading } tip="loading...">
                <Chart
                    height={ 300 }
                    padding="auto"
                    data={ this.state.data }
                    autoFit
                    onClick={ this.onClick.bind(this) }
                    onBeforerender={ this.onBeforerender.bind(this) }
                    onAfterrender={ this.onAfterrender.bind(this) }
                    onBeforepaint={ this.onBeforepaint.bind(this) }
                    onAfterchangedata={ this.onAfterchangedata.bind(this) }
                >
                    <Interval
                        // adjust={ [
                        //     {
                        //         type       : 'dodge',
                        //         marginRatio: 0,
                        //     },
                        // ] }
                        // color="count"
                        position="location*count"
                        // animate={ {
                        //     enter: {
                        //         duration: 1000, // enter 动画执行时间
                        //     },
                        //     leave: false, // 关闭 leave 销毁动画
                        // } }
                        // shape="x"
                        // size={ 10 }
                    />
                    <Tooltip shared/>
                </Chart>
            </Spin>
        </>;
    }
}
