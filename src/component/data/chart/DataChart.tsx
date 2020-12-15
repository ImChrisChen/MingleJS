/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/10/27
 * Time: 6:31 下午
 */

import { IComponentProps } from '@interface/common/component';
import React, { Component, ReactNode } from 'react';
import { jsonp } from '@utils/request/request';
import {
    Annotation,
    Area,
    Axis,
    Chart,
    Coordinate, Geom, Guide,
    Interaction,
    Interval,
    Legend,
    Line,
    LineAdvance,
    Point, Polygon,
    Tooltip,
    WordCloudChart,
} from 'bizcharts';
import { message, Spin, Typography } from 'antd';
import FormAction from '@component/form/form-action/FormAction';
import { formatObject2Url } from '@utils/format-data';
import DataSet from '@antv/data-set';
import { isArray, isEmptyArray } from '@utils/inspect';
import antvImage from '@static/images/antv.png';
import moment from 'moment';

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
    dataSource: Array<any> | any

    [key: string]: any
}

const { DataView } = DataSet;

export function PanelTitle(props: { title: string }) {
    let style: any = {
        textAlign : 'center',
        // background: '#f0f2f5',
        fontSize  : '18px',
        height    : '28px',
        lineHeight: '28px',
        color     : '#464c54',
        marginTop : '0px',
        cursor    : 'pointer',
    };
    return props.title ?
        <Typography.Title style={ { ...style } } level={ 5 }>{ props.title }</Typography.Title> : <></>;
}

export function DataUpdateTime(props: { content: string }) {
    let style: any = {
        position: 'absolute',
        bottom  : 30,
        left    : 8,
    };
    return <Typography.Text style={ { ...style } } type="secondary">数据上次更新于: { props.content }</Typography.Text>;
}

export default class DataChart extends Component<IComponentProps, any> {

    state = {
        loading   : true,
        data      : [],
        updateDate: moment().format('YYYY-MM-DD HH:mm:ss'),

    };

    constructor(props) {
        super(props);

        this.getData(this.props.dataset.url).then(data => {
            this.setState({ data, loading: false });
        });

        let { interval } = this.props.dataset;
        if (interval) {
            setInterval(() => {
                this.FormSubmit({}).then(r => {
                    // message.success(`图表数据自动更新了,每次更新间隔为${ interval }分钟`);
                });
            }, interval * 60 * 1000);
        }
    }

    // TODO 点击表单提交触发
    public async FormSubmit(formData) {
        console.log('DataChart:', formData);
        this.setState({ loading: true });
        let url = formatObject2Url(formData, this.props.dataset.url);
        let data = await this.getData(url);
        let updateDate = moment().format('YYYY-MM-DD HH:mm:ss');
        this.setState({ data, loading: false, updateDate });
    }

    async handleFormSubmit(formData) {
    }

    async getData(url) {
        let res = await jsonp(url);
        return res.status ? res.data : [];
    }

    // 环型图
    public static loop(config) {

        const cols = {
            percent: {
                formatter: val => {
                    val = val * 100 + '%';
                    return val;
                },
            },
        };

        let valueSum = config.dataSource.reduce((num, current) => {
            return num + current[config.value];
        }, 0);

        let genreCount = config.dataSource.length;
        if (genreCount > 32) {
            console.warn(`为了保持更好的用户体验，「${ config.genreName }」此图表不建议用环型图展示`);
        }

        //TODO
        return <>
            <Chart height={ config.height } data={ config.dataSource } scale={ cols } autoFit
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
    public static pie(config) {

        const cols = {
            percent: {
                formatter: val => {
                    val = val * 100 + '%';
                    return val;
                },
            },
        };
        let valueSum = config.dataSource.reduce((num, current) => {
            return num + current[config.value];
        }, 0);

        let genreCount = config.dataSource.length;
        if (genreCount > 32) {
            console.warn(`为了保持更好的用户体验，「${ config.genreName }」此图表不建议用饼图展示`);
        }

        //TODO
        return <>
            <Chart height={ config.height } data={ config.dataSource } scale={ cols } autoFit
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

    // 玫瑰图
    public static rose(config) {
        // const data = [ { year: '2002', population: 38 } ];
        return <Chart height={ config.height } data={ config.dataSource } autoFit>
            <Coordinate type="polar"/>
            <Axis visible={ false }/>
            <Tooltip showTitle={ false }/>
            <Interval
                position={ config.position }
                adjust="stack"
                element-highlight
                color={ config.key }
                style={ {
                    lineWidth: 1,
                    stroke   : '#fff',
                } }
                label={ [ config.key, {
                    offset: -15,
                } ] }
            />
        </Chart>;
    }

    // 柱状图
    public static bar(config) {
        let { position, groupby, colors } = config;
        return <>
            <Chart height={ config.height } padding="auto" data={ config.dataSource } autoFit
                   interactions={ [ 'active-region' ] }>

                <Interval position={ position } color={ groupby || colors }
                          adjust={ [ { type: 'dodge', marginRatio: 0 } ] }/>

                <Tooltip shared/>
                <Legend
                    // layout={ config.legendLayout }
                    // position={ config.legendLocation }
                    visible={ true }
                    itemName={ {
                        spacing  : 20, // 文本同滑轨的距离
                        style    : {
                            // stroke: 'blue',
                            fill: 'red',
                        },
                        formatter: (text, item, index) => {
                            return text;
                        },
                    } }
                />
            </Chart>
        </>;
    }

    // 条型图
    public static hbar(config) {
        // 数据源
        config.value = isArray(config.value) ? config.value[0] : config.value;
        return <>
            <Chart
                height={ config.height }
                data={ config.dataSource }
                autoFit

                scale={ {
                    [config.value]: {
                        formatter: (v) => v /*Math.round(v / 10000) + '万'*/,
                    },
                } }
                onAxisLabelClick={ (event, chart) => {
                    // console.log('event', event, 'chart', chart);
                    // console.log('data', chart.filteredData);
                    // console.log('mytext', event.target.attrs.text);
                    // console.log('selectedRecord', chart.getSnapRecords(event)[0]._origin);
                } }
            >
                <Coordinate transpose/>
                <Interval
                    position={ `${ config.key }*${ config.value }` }
                    color={ config.groupby || config.colors }
                    label={ [
                        config.value,
                        (val) => ({
                            position: 'middle', // top|middle|bottom|left|right
                            offsetX : -15,
                            // content: numeral(val).format('0,0'),
                            style   : {
                                fill: '#fff',
                            },
                        }),
                        // {
                        //   layout: {
                        //     type: "overlap",
                        //   },
                        // },
                    ] }
                />
                <Interaction type="active-region"/>
            </Chart>
        </>;
    }

    // 折线图
    public static line(config) {
        let { position, groupby, colors } = config;

        /*
        * TODO line 单独配置
        * area 是否展示区域
        * point 是否展示点
        **/

        return <>
            <Chart height={ config.height } padding="auto" data={ config.dataSource } autoFit
                   interactions={ [ 'active-region' ] }>

                {/*<Line position={ position } color={ groupby || colors }/>*/ }
                {/*<Point position={ position } color={ groupby || colors }/>*/ }
                {/*<Area position={ position } color={ groupby || colors }/>*/ }

                <LineAdvance area shape="smooth" position={ position } point={ true }
                             color={ groupby || colors } label="first"/>

                <Tooltip shared/>

                <Legend
                    visible={ true }
                    itemName={ {
                        spacing  : 20, // 文本同滑轨的距离
                        style    : {
                            // stroke: 'blue',
                            fill: 'red',
                        },
                        formatter: (text, item, index) => {
                            return text;
                        },
                    } }
                />

            </Chart>
        </>;
    }

    // 词云
    public static word(config) {
        function formatData(data) {
            return data.map((item, index) => ({
                word  : item[config.key],
                weight: item[config.value],
                id    : index,
            }));
        }

        return <>
            <WordCloudChart
                data={ formatData(config.dataSource) }
                maskImage={ antvImage }
                shape={ 'cardioid' }
                wordStyle={ {
                    fontSize: [ 30, 40 ],
                } }
            />
        </>;
    }

    //漏斗图
    public static funnel(config) {
        // let data = [
        //     { action: '浏览网站', pv: 50000 },
        //     { action: '放入购物车', pv: 35000 },
        //     { action: '生成订单', pv: 25000 },
        //     { action: '支付订单', pv: 15000 },
        //     { action: '完成交易', pv: 8000 },
        // ];

        const data = config.dataSource;
        const dv = new DataView().source(data);
        const percent = 'percent';        // 百分比值

        dv.transform({
            type: 'map',
            callback(row) {
                row[percent] = row[config.value] / 50000;       // TODO 需要求出最开始流程的数量值作为百分比基数
                return row;
            },
        });
        // let tpl = `<li data-index={index} style="margin:4px 0">
        //                             <span style="background-color:{color}" class="g2-tooltip-marker"></span>{ name }</br>
        //                             <span style="padding-left: 16px">浏览人数：{pv}</span></br>
        //                             <span style="padding-left: 16px">占比：{${ percent }}</span></br>
        //                         </li>`;
        let tpl = ``;
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
    public static radar(config: IChartConfig) {

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
        let data = config.dataSource;

        const { DataView } = DataSet;
        const dv = new DataView().source(data);
        dv.transform({
            type  : 'fold',
            // fields: [ 'a', 'b' ], // 展开字段集
            fields: config.value, // 展开字段集
            key   : 'user', // key字段
            value : 'score', // value字段
        });

        let position = `${ config.key }*score`;

        return <Chart
            height={ config.height }
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

    // 矩形图
    public static rect(config) {
        const data = {
            name    : 'root',
            children: config.dataSource,
            // children: [
            //     { name: '分类 1', value: 560 },
            //     { name: '分类 2', value: 500 },
            //     { name: '分类 3', value: 150 },
            //     { name: '分类 4', value: 140 },
            //     { name: '分类 5', value: 115 },
            //     { name: '分类 6', value: 95 },
            //     { name: '分类 7', value: 90 },
            //     { name: '分类 8', value: 75 },
            //     { name: '分类 9', value: 98 },
            //     { name: '分类 10', value: 60 },
            //     { name: '分类 11', value: 45 },
            //     { name: '分类 12', value: 40 },
            //     { name: '分类 13', value: 40 },
            //     { name: '分类 14', value: 35 },
            //     { name: '分类 15', value: 40 },
            //     { name: '分类 16', value: 40 },
            //     { name: '分类 17', value: 40 },
            //     { name: '分类 18', value: 30 },
            //     { name: '分类 19', value: 28 },
            //     { name: '分类 20', value: 16 },
            // ],
        };
        const { DataView } = DataSet;
        const dv = new DataView();
        dv.source(data, {
            type: 'hierarchy',
        }).transform({
            field: config.value/*'value'*/,
            type : 'hierarchy.treemap',
            tile : 'treemapResquarify',
            as   : [ 'x', 'y' ],
        });
        // 将 DataSet 处理后的结果转换为 G2 接受的数据
        const nodes: Array<any> = [];
        for (const node of dv.getAllNodes()) {
            if (node.data.name === 'root') {
                continue;
            }
            const eachNode: any = {
                name : node.data[config.key]/*node.data.name*/,
                x    : node.x,
                y    : node.y,
                value: node.data[config.value],
            };

            nodes.push(eachNode);
        }

        const scale = {
            x: {
                nice: true,
            },
            y: {
                nice: true,
            },
        };

        return <Chart
            scale={ scale }
            pure
            height={ config.height }
            autoFit
            data={ nodes }
        >
            <Polygon
                color="name"
                // color={ config.key }
                position="x*y"
                style={ {
                    lineWidth: 1,
                    stroke   : '#fff',
                } }
                label={ [ config.key/*'name'*/, {
                    offset : 0,
                    style  : {
                        textBaseline: 'middle',
                    },
                    content: (obj) => {
                        if (obj.name !== 'root') {
                            return obj.name;
                        }
                        // if (obj[config.key] !== 'root') {
                        //     return obj[config.key];
                        // }
                    },
                } ] }
            />
        </Chart>;
    }

    public static water(config) {
        let data = config.dataSource;
        const { Text } = Guide;
        const scale = {
            value: {
                min: 0,
                max: 100,
            },
        };

        return (
            <Chart data={ data } padding="auto" scale={ scale } forceFit>
                <Tooltip/>
                <Geom
                    type="interval"
                    position={ config.position }
                    color={ config.groupby || config.colors }
                    shape="liquid-fill-gauge"
                    style={ {
                        lineWidth  : 10,
                        fillOpacity: 0.75,
                    } }
                />
                <Guide>
                    {
                        data.map(
                            row => (<Text
                                content={ `${ row[config.value] }%` }
                                top
                                position={ {
                                    [config.key]  : row[config.key],
                                    [config.value]: 50,
                                } }
                                style={ {
                                    opacity  : 0.75,
                                    fontSize : window.innerWidth / 60,
                                    textAlign: 'center',
                                } }
                            />))
                    }
                </Guide>
            </Chart>
        );
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
            legendLocation,     // 图例位置
            legendLayout,
        } = this.props.dataset;

        if (isEmptyArray(colors) || colors === '') {
            colors = '#37c9e3';
        }

        if (isArray(colors) && colors.length === 1) {
            colors = colors[0];
        }

        try {
            // let value = series[0][0];
            // let genreName = series[0][1];       // 地区
            return {
                key,           // 'location' (地区)
                value,         // 'count'  (数量)
                groupby,            // 分组统计的key字段名
                position  : `${ key }*${ value }`,        // name*value
                colors,
                genreName,       // `按照${genreName('地区')}统计的维度`
                title,
                height,
                chartType,
                legendLocation,     // 图例位置
                legendLayout,       // 图例的布局方式
                dataSource: this.state.data,
            };
        } catch (e) {
            return {};
        }
    }

    public static renderChart(config): ReactNode {
        switch (config.chartType) {
            case 'bar':
                return this.bar(config);
            case 'hbar':
                return this.hbar(config);
            case 'line':
                return this.line(config);
            case  'pie':
                return this.pie(config);
            case  'rose':
                return this.rose(config);
            case  'loop':
                return this.loop(config);
            case 'word':
                return this.word(config);
            case 'funnel':
                return this.funnel(config);
            case 'radar':
                return this.radar(config);
            // case 'water':
            //     return this.water(config);
            case 'rect':
                return this.rect(config);
            default:
                return this.line(config);
        }
    }

    render() {
        let config = this.formatConfig();
        return <>
            <PanelTitle title={ this.props.dataset.title }/>
            <Spin spinning={ this.state.loading } tip="loading...">
                { DataChart.renderChart(config) }
            </Spin>
            <DataUpdateTime content={ this.state.updateDate }/>
        </>;
    }
}
