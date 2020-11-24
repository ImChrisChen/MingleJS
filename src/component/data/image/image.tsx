/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/10/27
 * Time: 6:31 下午
 */

import { IComponentProps } from '@interface/common/component';
import React from 'react';
import { jsonp } from '@utils/request/request';
import {
    Area,
    Axis,
    Chart,
    Coordinate,
    FunnelChart,
    Interval,
    Legend,
    Line,
    LineAdvance,
    Point,
    Tooltip,
    WordCloudChart,
} from 'bizcharts';
import { Spin } from 'antd';
import FormAction from '@component/form/form-action/form';
import { formatObject2Url } from '@utils/format-data';
import DataSet from '@antv/data-set';


const cols = {
    percent: {
        formatter: val => {
            val = val * 100 + '%';
            return val;
        },
    },
};

export default class DataImage extends React.Component<IComponentProps, any> {

    state = {
        loading: true,
        data   : [],
    };

    constructor(props) {
        super(props);

        if (this.props.dataset && this.props.dataset.from) {
            let formElement = FormAction.findFormElement(this.props.dataset.from);
            FormAction.onFormSubmit(formElement, this.handleFormSubmit.bind(this));
        }

        this.getData().then(data => {
            this.setState({ data, loading: false });
        });
    }

    async handleFormSubmit(formData) {
        this.setState({
            loading: true,
        });
        let url = formatObject2Url(formData, this.props.dataset.url);
        let res = await jsonp(url);

        if (res.status) {
            this.setState({ data: res.data, loading: false });
        }
    }

    async getData() {
        let res = await jsonp(this.props.dataset.url);
        return res.status ? res.data : [];
    }

    // 饼状图
    private pie(config) {

        let genreCount = Array.from(new Set(this.state.data.map(item => item[config.key]).filter(item => item))).length;
        if (genreCount > 32) {
            console.warn(`为了保持更好的用户体验，「${ config.genreName }」此图表不建议用饼图展示`);
        }

        return <>
            <Chart height={ config.height } data={ this.state.data } scale={ cols } autoFit
                   interactions={ [ 'element-single-selected' ] }>
                <Coordinate type="theta" radius={ 0.85 } innerRadius={ 0.75 }/>
                {/*<Tooltip showTitle={ false }/>*/ }
                <Axis visible={ false }/>
                <Interval
                    // style={{ stroke: "white", lineWidth: 5 }}
                    position={ config.value }
                    adjust="stack"
                    color={ config.key }
                    label={
                        [ '*', {
                            content: (data) => {
                                return `${ data[config.key] }: ${ data[config.value] }`;
                            },
                        } ] }
                />
            </Chart>
        </>;
    }

    // 柱状图
    private bar(config) {
        let { position, groupby, colors } = config;
        return <>
            <Chart height={ config.height } padding="auto" data={ this.state.data } autoFit
                   interactions={ [ 'active-region' ] }>

                <Interval position={ position } color={ groupby || colors }
                          adjust={ [ { type: 'dodge', marginRatio: 0 } ] }/>

                <Tooltip shared/>
                <Legend layout="vertical" position="top-left"
                        itemName={ {
                            spacing  : 10, // 文本同滑轨的距离
                            style    : {
                                // stroke: 'blue',
                                fill: 'red',
                            },
                            formatter: (text, item, index) => {
                                return text === 'Berlin' ? 'Berlin【重点关注】' : text;
                            },
                        } }
                />
            </Chart>
        </>;
    }

    // 折线图
    private line(config) {
        let { position, groupby, colors, chartType } = config;

        /*
        * TODO line 单独配置
        * area 是否展示区域
        * point 是否展示点
        **/

        return <>
            <Chart height={ config.height } padding="auto" data={ this.state.data } autoFit
                   interactions={ [ 'active-region' ] }>

                {/*<Line position={ position } color={ groupby || colors }/>*/ }
                {/*<Point position={ position } color={ groupby || colors }/>*/ }

                <LineAdvance area shape="smooth" position={ position } point={ true }
                             color={ groupby || colors } label="first"/>

                <Tooltip shared/>
                <Legend layout="vertical" position="top-left"
                        itemName={ {
                            spacing  : 10, // 文本同滑轨的距离
                            style    : {
                                // stroke: 'blue',
                                fill: 'red',
                            },
                            formatter: (text, item, index) => {
                                return text === 'Berlin' ? 'Berlin【重点关注】' : text;
                            },
                        } }
                />

            </Chart>
        </>;
    }

    // 词云
    private word(config) {
        let { position, groupby, colors } = config;

        function formatData(data) {
            return data.map((item, index) => ({
                word  : item[config.key],
                weight: item[config.value],
                id    : index,
            }));
        }

        return <>
            <WordCloudChart
                data={ formatData(this.state.data) }
                maskImage={ 'https://gw.alipayobjects.com/mdn/rms_2274c3/afts/img/A*07tdTIOmvlYAAAAAAAAAAABkARQnAQ' }
                shape={ 'cardioid' }
                wordStyle={ {
                    fontSize: [ 30, 40 ],
                } }
            />
        </>;
    }

    //漏斗图
    private funnel(config) {
        return <>
            <FunnelChart
                data={ this.state.data }
                xField={ config.value }
                yField={ config.key }
            />
        </>;
    }

    // 雷达图
    private radar(config) {

        const data = [
            { item: 'Design', a: 70, b: 30 },
            { item: 'Development', a: 60, b: 70 },
            { item: 'Marketing', a: 50, b: 60 },
            { item: 'Users', a: 40, b: 50 },
            { item: 'Test', a: 60, b: 70 },
            { item: 'Language', a: 70, b: 50 },
            { item: 'Technology', a: 50, b: 40 },
            { item: 'Support', a: 30, b: 40 },
            { item: 'Sales', a: 60, b: 40 },
            { item: 'UX', a: 50, b: 60 },
        ];

        const { DataView } = DataSet;
        const dv = new DataView().source(data);
        console.log(DataSet);
        console.log(dv);
        dv.transform({
            type  : 'fold',
            // fields: [ 'a', 'b' ], // 展开字段集
            fields: config.value, // 展开字段集
            key   : 'user', // key字段
            value : 'score', // value字段
        });

        let position = `${ config.key }*score`;

        return <Chart
            height={ 400 }
            data={ dv.rows }
            autoFit
            scale={ {
                score: {
                    min: 0,
                    max: 80,
                },
            } }
            interactions={ [ 'legend-highlight' ] }
        >
            <Coordinate type="polar" radius={ 0.8 }/>
            <Tooltip shared/>
            <Point
                // position="item*score"
                position={ position }
                color="user"
                shape="circle"
            />
            <Line
                position={ position }
                color="user"
                size="2"
            />
            <Area
                position={ position }
                color="user"
            />
        </Chart>;
    }

    formatConfig() {
        let {
            key,       // data数据 key 值映射
            value,     // data数据 value 值映射
            type: chartType,
            name: genreName,
            series,
            height,
            colors,
            title,
            groupby,
        } = this.props.dataset;
        try {
            // let value = series[0][0];
            // let genreName = series[0][1];       // 地区
            return {
                key,           // 'location' (地区)
                value,         // 'count'  (数量)
                groupby,            // 分组统计的key字段名
                position: `${ key }*${ value }`,        // name*value
                colors  : colors,
                genreName,       // `按照${genreName('地区')}统计的维度`
                title,
                height,
                chartType,
            };
        } catch (e) {
            return {};
        }
    }

    renderChart(config) {
        switch (config.chartType) {
            case 'bar':
                return this.bar(config);
            case 'line':
                return this.line(config);
            case  'pie':
                return this.pie(config);
            case 'word':
                return this.word(config);
            case 'funnel':
                return this.funnel(config);
            case 'radar':
                return this.radar(config);
            default:
                return this.line(config);
        }
    }

    render() {
        console.log(this.props);
        let config = this.formatConfig();
        return <>
            <h2 hidden={ !this.props.dataset.title }
                style={ { textAlign: 'center', padding: '10px 20px' } }>{ this.props.dataset.title }</h2>
            <Spin spinning={ this.state.loading } tip="loading...">
                { this.renderChart(config) }
            </Spin>
        </>;
    }
}
