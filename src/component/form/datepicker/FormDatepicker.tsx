/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/9/16
 * Time: 8:00 下午
 */

import React from 'react';
import { Button, DatePicker, Form } from 'antd';
import moment from 'moment';
import { trigger } from '@utils/trigger';
import { IComponentProps } from '@interface/common/component';
import { isArray } from '@utils/inspect';

const { RangePicker } = DatePicker;

let res = moment().calendar(null, {
    sameDay : '[今天]',
    nextDay : '[明天]',
    nextWeek: 'dddd',
    lastDay : '[昨天]',
    lastWeek: '[上个] dddd',
    sameElse: 'DD/MM/YYYY',
});

interface IDatepickerState {
    picker: string
    mode: string
    single: boolean
    defaultValue: ''
}

export default class FormDatepicker extends React.Component<IComponentProps, any> {

    state: any = {
        format: 'YYYY-MM-DD',
        // mode        : 'decade',          // time | date | month | year | decade
        // defaultValue: [ "2020-09-11", "2020-09-17" ],
        value : [],
        open  : false,
    };

    constructor(props) {
        super(props);
        //
        // let beginTime = moment().format("YYYY-MM-DD 00:00:00");
        // let endTime = moment().format("YYYY-MM-DD 23:59:59"); // 本周
        //
        // let beginTime = moment().day("Monday").format("YYYY-MM-DD 00:00:00");
        // let endTime = moment().day("Monday").day(+7).format("YYYY-MM-DD 23:59:59");
        //
        // // 本月
        // let beginTime = moment().startOf("month").format("YYYY-MM-DD 00:00:00");
        // let endTime = moment().endOf("month").format("YYYY-MM-DD 23:59:59");
    }

    handleChange(_, value) {
        console.log(_, value);
        let format = this.state.format;
        let [ startValue, endValue ] = value;
        this.setState({
            value: [ moment(startValue, format), moment(endValue, format) ],
            open : false,
        });

        value = isArray(value) ? value.join('~') : value;
        console.log(value);
        trigger(this.props.el, value);
    }

    // 今天
    handleSelectDay(diffDay) {
        // let beginTime = moment().format('YYYY-MM-DD');
        // let endTime = moment().format('YYYY-MM-DD');
        // let value = [ beginTime, endTime ];
        // this.setState({
        //     value: [ moment(beginTime, this.state.format), moment(endTime, this.state.format) ],
        // });
        // trigger(this.props.el, value.join(','));

        // 昨天
        let beginTime = moment().subtract(diffDay, 'days').format('YYYY-MM-DD');
        let endTime = moment().subtract(0, 'days').format('YYYY-MM-DD');

        let value = [ beginTime, endTime ];
        this.setState({
            value: [ moment(beginTime, this.state.format), moment(endTime, this.state.format) ],
            open : false,
        }, () => trigger(this.props.el, value.join(',')));
    }

    renderCustomDay() {
        let dayMap = [
            { label: '今天', day: 0 },
            { label: '昨天', day: 1 },
            { label: '前天', day: 2 },
            { label: '7天', day: 7 },
            { label: '30天', day: 30 },
        ];
        return dayMap.map(item => {
            return <Button key={ item.day }
                           onClick={ this.handleSelectDay.bind(this, item.day) }>{ item.label } </Button>;
        });
    }

    handleFoucs() {
        this.setState({ open: true });
    }

    handleBlur() {
        this.setState({ open: false });
    }

    render() {
        console.log(this.props);
        // let date = moment().format('YYYY-MM-DD');
        let { single, picker, mode, mindate, maxdate, format, allowClear } = this.props.dataset;
        return <>
            <Form.Item label={ this.props.dataset.label } style={ { display: 'flex' } }>
                { single ?
                    // 单选
                    <DatePicker
                        picker={ picker }
                        onChange={ this.handleChange.bind(this) }
                        mode={ mode }
                        format={ format }
                    />
                    :
                    // 多选
                    <RangePicker
                        // open={ this.state.open }
                        onFocus={ this.handleFoucs.bind(this) }
                        onBlur={ this.handleBlur.bind(this) }
                        onChange={ this.handleChange.bind(this) }
                        format={ format }
                        picker={ picker }
                        allowClear={ allowClear }
                        renderExtraFooter={ e => this.renderCustomDay() }
                        mode={ mode }
                    />
                }
            </Form.Item>
        </>;
    }
}