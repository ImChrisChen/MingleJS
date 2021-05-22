/**
 * Created by WebStorm.
 * User: MacBook
 * Date: 2020/10/13
 * Time: 1:56 下午
 */

import React from 'react';
import { Alert, Calendar } from 'antd';
import moment from 'moment';

export default class viewCalendar extends React.Component<any, any> {

    state = {
        value        : moment('2017-01-25'),
        selectedValue: moment('2017-01-25'),
    };

    onSelect = value => {
        this.setState({
            value,
            selectedValue: value,
        });
    };

    onPanelChange = value => {
        this.setState({ value });
    };

    render() {
        const { value, selectedValue } = this.state;
        return (
            <>
                <Alert
                    message={ `You selected date: ${ selectedValue && selectedValue.format('YYYY-MM-DD') }` }
                />
                <Calendar value={ value } onSelect={ this.onSelect } onPanelChange={ this.onPanelChange }/>
            </>
        );
    }
}
