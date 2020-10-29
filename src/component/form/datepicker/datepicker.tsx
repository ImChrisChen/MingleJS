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

export default class Datepicker extends React.Component<IComponentProps, any> {

    state: any = {
        format : 'YYYY-MM-DD',
        single : true,
        picker : 'date',      // date | week | month | quarter | year
        mindate: '',
        maxdate: '',
        // mode        : 'decade',          // time | date | month | year | decade
        // defaultValue: [ "2020-09-11", "2020-09-17" ],
        value  : [],
        open   : false,
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

        trigger(this.props.el, value.join('~'));
    }

    // 今天
    handleClickToday() {
        let beginTime = moment().format('YYYY-MM-DD');
        let endTime = moment().format('YYYY-MM-DD');
        let value = [ beginTime, endTime ];
        this.setState({
            value: [ moment(beginTime, this.state.format), moment(endTime, this.state.format) ],
        });
        trigger(this.props.el, value.join(','));
    }

    handleClickYesterday() {
        // 昨天
        let beginTime = moment().subtract(1, 'days').format('YYYY-MM-DD');
        let endTime = moment().subtract(1, 'days').format('YYYY-MM-DD');

        let value = [ beginTime, endTime ];
        this.setState({
            value: [ moment(beginTime, this.state.format), moment(endTime, this.state.format) ],
            open : false,
        }, () => trigger(this.props.el, value.join(',')));

    }

    handleClickBeforeYesterday() {

    }

    handleClickSevenDay() {

    }

    handleClickCurMonth() {

    }

    handleFoucs() {
        this.setState({ open: true });
    }

    handleBlur() {
        this.setState({ open: false });
    }

    render() {
        console.log(this.props);
        let { singledatepicker: single, picker, mode, defaultValue, value, mindate, maxdate, format } = this.state;
        console.log(this.state);
        return <>
            <Form.Item label={ this.props.dataset.label } style={ { display: 'flex' } }>
                { single ?
                    // 单选
                    <DatePicker
                        picker={ picker }
                        onChange={ this.handleChange.bind(this) }
                        mode={ mode }
                    />
                    :
                    // 多选
                    <RangePicker
                        // open={ this.state.open }
                        onFocus={ this.handleFoucs.bind(this) }
                        onBlur={ this.handleBlur.bind(this) }
                        onChange={ this.handleChange.bind(this) }
                        picker={ picker }
                        // defaultValue={ [ moment('2015-06-06', format), moment('2015-06-06', format) ] }
                        allowClear={ false }
                        value={ value }
                        renderExtraFooter={ e =>
                            <>
                                <Button onClick={ this.handleClickToday.bind(this) }>今天</Button>
                                { <Button onClick={ this.handleClickYesterday.bind(this) }>昨天</Button> }
                                { <Button onClick={ this.handleClickBeforeYesterday.bind(this) }>前天</Button> }
                                { <Button onClick={ this.handleClickSevenDay.bind(this) }>7天</Button> }
                                { <Button onClick={ this.handleClickCurMonth.bind(this) }>本月</Button> }
                            </>
                        }
                        mode={ mode }
                    />
                }
            </Form.Item>
        </>;
    }
}
