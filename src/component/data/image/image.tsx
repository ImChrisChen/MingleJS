/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/10/27
 * Time: 6:31 下午
 */

import { IComponentProps } from '@interface/common/component';
import React from 'react';
import { jsonp } from '@utils/request/request';
// import { DataSet } from '@antv/data-set/lib/data-set';
// import areaUser from '@root/mock/chart/areaUser.json';
import {
    Axis,
    Chart,
    Coordinate,
    FunnelChart,
    Interval,
    Legend,
    LineAdvance,
    Tooltip,
    WordCloudChart,
} from 'bizcharts';
import { Spin } from 'antd';
import FormAjax from '@component/form/ajax/form';
import { formatObject2Url } from '@utils/format-data';

// const { DataView } = DataSet;
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
            let formElement = FormAjax.findFormElement(this.props.dataset.from);
            FormAjax.onFormSubmit(formElement, this.handleFormSubmit.bind(this));
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

    private pie(config) {

        let genreCount = Array.from(new Set(this.state.data.map(item => item[config.genre]).filter(item => item))).length;
        if (genreCount > 32) {
            console.warn(`为了保持更好的用户体验，「${ config.genreName }」此图表不建议用饼图展示`);
        }

        return <>
            <Chart height={ config.height } data={ this.state.data } scale={ cols } autoFit
                   interactions={ [ 'element-single-selected' ] }>
                <Coordinate type="theta" radius={ 0.75 }/>
                {/*<Tooltip showTitle={ false }/>*/ }
                <Axis visible={ false }/>
                <Interval
                    position={ config.compare }
                    adjust="stack"
                    color={ config.genre }
                    label={
                        [ '*', {
                            content: (data) => {
                                return `${ data[config.genre] }: ${ data[config.compare] }`;
                            },
                        } ] }
                />
            </Chart>
        </>;
    }

    private bar(config) {
        let { position, groupby, colors } = config;
        return <>
            <Spin spinning={ this.state.loading } tip="loading...">
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
            </Spin>
        </>;
    }

    private line(config) {
        let { position, groupby, colors, chartType } = config;

        /*
        * TODO line 单独配置
        * area 是否展示区域
        * point 是否展示点
        **/

        return <>
            <Spin spinning={ this.state.loading } tip="loading...">
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
            </Spin>
        </>;
    }

    private word(config) {
        let { position, groupby, colors } = config;

        function formatData(data) {
            return data.map((item, index) => ({
                word  : item[config.genre],
                weight: item[config.compare],
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

    private funnel(config) {
        return <>
            <FunnelChart
                data={ this.state.data }
                xField={ config.compare }
                yField={ config.genre }
            />
        </>;
    }

    formatConfig() {
        let {
            key_field  : genre,
            type       : chartType,
            name       : genreName,
            value_field: compare,
            series,
            size,
            colors,
            title,
            groupby,
        } = this.props.dataset;
        try {
            // let compare = series[0][0];
            // let genreName = series[0][1];       // 地区
            return {
                genre,           // 'location' (地区)
                compare,         // 'count'  (数量)
                groupby,            // 分组统计的key字段名
                position: `${ genre }*${ compare }`,        // name*value
                colors  : colors,
                genreName,       // `按照${genreName('地区')}统计的维度`
                title,
                height  : size.height,
                chartType,
            };
        } catch(e) {
            return {};
        }
    }

    renderChart(config) {
        switch(config.chartType) {
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
            default:
                return this.line(config);
        }
    }

    render() {
        let config = this.formatConfig();
        return <>
            <h2 hidden={ !this.props.dataset.title }
                style={ { textAlign: 'center', padding: '10px 20px' } }>{ this.props.dataset.title }</h2>
            { this.renderChart(config) }
        </>;
    }
}
