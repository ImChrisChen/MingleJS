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
    Annotation,
    Area,
    Axis,
    Chart,
    Coordinate,
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

interface IChartConfig {
    key: string | Array<string>
    value: string | Array<string> | any
    colors: string | Array<string>
    type: string
    name: string
    groupby: string
    position: string
    genreName: string
    title: string
    height: string | number
    chartType: string

    [key: string]: any
}

const { DataView } = DataSet;

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

    private loop(config) {

        const cols = {
            percent: {
                formatter: val => {
                    val = val * 100 + '%';
                    return val;
                },
            },
        };

        let valueSum = this.state.data.reduce((num, current) => {
            return num + current[config.value];
        }, 0);

        let genreCount = this.state.data.length;
        if (genreCount > 32) {
            console.warn(`为了保持更好的用户体验，「${ config.genreName }」此图表不建议用环型图展示`);
        }

        //TODO
        return <>
            <Chart height={ config.height } data={ this.state.data } scale={ cols } autoFit
                   interactions={ [ 'element-single-selected' ] }>
                <Coordinate type="theta" radius={ 0.85 } innerRadius={ 0.75 }/>
                {/*<Tooltip shared showTitle={ false }/>*/ }
                <Axis visible={ false }/>
                <Interval
                    // style={{ stroke: "white", lineWidth: 5 }}
                    position={ config.value }
                    adjust="stack"
                    color={ config.key }
                    label={
                        [ '*', {
                            content: (data) => {
                                return `
                                    ${ data[config.key] }: ${ data[config.value] }
                                    百分比: ${ (data[config.value] / valueSum * 100).toFixed(2) }%
                                `;
                            },
                        } ] }
                />
            </Chart>
        </>;
    }

    // 饼状图
    private pie(config) {

        const cols = {
            percent: {
                formatter: val => {
                    val = val * 100 + '%';
                    return val;
                },
            },
        };


        let valueSum = this.state.data.reduce((num, current) => {
            return num + current[config.value];
        }, 0);

        let genreCount = this.state.data.length;
        if (genreCount > 32) {
            console.warn(`为了保持更好的用户体验，「${ config.genreName }」此图表不建议用饼图展示`);
        }

        //TODO
        return <>
            <Chart height={ config.height } data={ this.state.data } scale={ cols } autoFit
                   interactions={ [ 'element-single-selected' ] }>
                <Coordinate type="theta" radius={ 0.85 }/>
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
                                return `
                                    ${ data[config.key] }: ${ data[config.value] }
                                    百分比: ${ (data[config.value] / valueSum * 100).toFixed(2) }%
                                `;
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
        // let data = [
        //     { action: '浏览网站', pv: 50000 },
        //     { action: '放入购物车', pv: 35000 },
        //     { action: '生成订单', pv: 25000 },
        //     { action: '支付订单', pv: 15000 },
        //     { action: '完成交易', pv: 8000 },
        // ];

        const data = this.state.data;
        const dv = new DataView().source(data);
        const percent = 'percent';        // 百分比值

        dv.transform({
            type: 'map',
            callback(row) {
                row[percent] = row[config.value] / 50000;       // TODO 需要求出最开始流程的数量值作为百分比基数
                return row;
            },
        });
        let tpl = `<li data-index={index} style="margin:4px 0">
                                    <span style="background-color:{color}" class="g2-tooltip-marker"></span>{ name }</br>
                                    <span style="padding-left: 16px">浏览人数：{pv}</span></br>
                                    <span style="padding-left: 16px">占比：{${ percent }}</span></br>
                                </li>`;
        return <>
            <Chart
                height={ config.height }
                data={ dv.rows }
                padding={ [ 20, 120, 95 ] }
                forceFit
            >
                <Tooltip
                    showTitle={ false }
                    itemTpl={ tpl }

                />
                <Axis name={ percent } grid={ null } label={ null }/>
                <Axis name={ config.key } label={ null } line={ null } grid={ null } tickLine={ null }/>
                <Coordinate scale={ [ 1, -1 ] } transpose type="rect"/>
                <Legend/>
                { dv.rows.map((obj: any, i) => {
                    return (
                        <Annotation.Text
                            key={ i }
                            top={ true }
                            position={ {
                                [config.key]: obj[config.key],
                                [percent]   : 'median',
                            } }
                            content={ parseInt(String(obj[percent] * 100)) + '%' }
                            style={ {
                                fill       : '#fff',
                                fontSize   : 12,
                                textAlign  : 'center',
                                shadowBlur : 2,
                                shadowColor: 'rgba(0, 0, 0, .45)',
                            } }
                        />
                    );
                }) }
                <Interval
                    position={ `${ config.key }*${ percent }` }
                    adjust="symmetric"
                    shape="funnel"
                    color={ [
                        config.key,
                        [ '#0050B3', '#1890FF', '#40A9FF', '#69C0FF', '#BAE7FF' ],
                    ] }
                    tooltip={ [
                        // 'action*pv*percent',
                        `${ config.key }*${ config.value }*${ percent }`,
                        (action, pv, percent) => {
                            return {
                                name   : action,
                                percent: parseInt(String(percent * 100)) + '%',
                                pv     : pv,
                            };
                        },
                    ] }
                    label={ [
                        // 'action*pv',
                        `${ config.key }*${ config.value }`,
                        (action, pv) => {
                            return { content: action + ' ' + pv };
                        },
                        {
                            offset   : 35,
                            labelLine: {
                                style: {
                                    lineWidth: 1,
                                    stroke   : 'rgba(0, 0, 0, 0.15)',
                                },
                            },
                        } ] }
                >
                </Interval>
            </Chart>
        </>;
    }

    // 雷达图
    private radar(config: IChartConfig) {

        // const data = [
        //     { item: 'Design', a: 70, b: 30 },
        //     { item: 'Development', a: 60, b: 70 },
        //     { item: 'Marketing', a: 50, b: 60 },
        //     { item: 'Users', a: 40, b: 50 },
        //     { item: 'Test', a: 60, b: 70 },
        //     { item: 'Language', a: 70, b: 50 },
        //     { item: 'Technology', a: 50, b: 40 },
        //     { item: 'Support', a: 30, b: 40 },
        //     { item: 'Sales', a: 60, b: 40 },
        //     { item: 'UX', a: 50, b: 60 },
        // ];
        let data = this.state.data;

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

    formatConfig(): IChartConfig | any {
        let {
            key,       // data数据 key 值映射
            value,     // data数据 value 值映射
            type: chartType,
            name: genreName,
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
            case  'loop':
                return this.loop(config);
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
