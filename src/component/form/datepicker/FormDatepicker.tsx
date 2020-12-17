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
import { isArray, isUndefined } from '@utils/inspect';
import { FormSmartIcon } from '@component/form/form-action/FormAction';

const { RangePicker } = DatePicker;

let res = moment().calendar(null, {
    sameDay : '[今天]',
    nextDay : '[明天]',
    nextWeek: 'dddd',
    lastDay : '[昨天]',
    lastWeek: '[上个] dddd',
    sameElse: 'DD/MM/YYYY',
});

export default class FormDatepicker extends React.Component<IComponentProps, any> {

    state: any = {
        format: this.props.dataset.format || 'YYYY-MM-DD',
        // mode        : 'decade',          // time | date | month | year | decade
        // defaultValue: [ "2020-09-11", "2020-09-17" ],
        value : [],
        open  : false,
    };

    constructor(props) {
        super(props);
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
        trigger(this.props.el, value);
    }

    // 今天
    handleSelectDay(item) {
        // 过去 n 天
        let beginTime = moment().subtract(item.amount, item.unit).format(this.state.format);
        let endTime = moment().format(this.state.format);

        let value = beginTime + '~' + endTime;

        console.log(value);

        this.setState({
            // value: [ moment(beginTime, this.state.format), moment(endTime, this.state.format) ],
            value: value,
            open : false,
        }, () => trigger(this.props.el, value));
    }

    renderCustomDay() {
        // moment().format('YYYY-MM-DD HH:mm:ss'); //当前时间
        // moment().subtract(10, 'days').format('YYYY-MM-DD'); //当前时间的前10天时间
        // moment().subtract(1, 'years').format('YYYY-MM-DD'); //当前时间的前1年时间
        // moment().subtract(3, 'months').format('YYYY-MM-DD'); //当前时间的前3个月时间
        // moment().subtract(1, 'weeks').format('YYYY-MM-DD'); //当前时间的前一个星期时间
        let dayMap = [
            { label: '今天', unit: 'days', amount: 0 },
            { label: '昨天', unit: 'days', amount: 1 },
            { label: '前天', unit: 'days', amount: 2 },
            { label: '前7天', unit: 'days', amount: 7 },
            { label: '前两周', unit: 'weeks', amount: 2 },
            { label: '30天', unit: 'days', amount: 30 },
            { label: '前3个月', unit: 'months', amount: 3 },
            { label: '前1年', unit: 'years', amount: 1 },
        ];
        return dayMap.map((item, i) => {
            return <Button key={ i + item.unit }
                           onClick={ this.handleSelectDay.bind(this, item) }>{ item.label } </Button>;
        });
    }

    handleFoucs() {
        this.setState({ open: true });
    }

    handleBlur() {
        this.setState({ open: false });
    }

    // datepicker value 格式转化 value = '2020-12-07' |  '2020-12-07~2020-12-07'
    valueFormat(value: string): any | Array<any> {
        let { format, single, label } = this.props.dataset;
        let dateValue;
        if (single) {
            dateValue = moment(value, format);
        } else {
            if (value.includes('~')) {
                let [ begin, end ] = value.split('~');
                dateValue = [ moment(begin, format), moment(end, format) ];
            } else {
                console.warn(`${ label }格式不正确`);
            }
        }
        return dateValue;
    }

    render() {
        let { single, picker, mode, disabled, format, allowClear, showtime, label } = this.props.dataset;

        let value = this.valueFormat(this.props.value);

        return <Form.Item label={ label } style={ { display: 'flex', ...this.props.style } }>
            { this.props.dataset.smart ? <FormSmartIcon/> : '' }
            { single ?
                // 单选
                <DatePicker
                    picker={ picker }
                    disabled={ disabled }
                    showTime={ showtime }
                    onChange={ this.handleChange.bind(this) }
                    renderExtraFooter={ e => this.renderCustomDay() }
                    mode={ mode }
                    format={ format }
                    value={ value }
                />
                :
                // 多选
                <RangePicker
                    disabled={ disabled }
                    onFocus={ this.handleFoucs.bind(this) }
                    separator={ '~' }
                    onBlur={ this.handleBlur.bind(this) }
                    onChange={ this.handleChange.bind(this) }
                    showTime={ showtime }
                    format={ format }
                    picker={ picker }
                    allowClear={ allowClear }
                    renderExtraFooter={ e => this.renderCustomDay() }
                    mode={ mode }
                    value={ value }
                />
            }
        </Form.Item>;
    }
}
