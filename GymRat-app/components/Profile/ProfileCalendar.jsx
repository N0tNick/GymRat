import React from 'react';
import { StyleSheet, View, Dimensions, useMemo, useState, useCallback } from 'react-native';
import {Calendar, CalendarUtils} from 'react-native-calendars';

const { width: screenWidth } = Dimensions.get('window');
const INITIAL_DATE = '2024-11-06';


const ProfileCalendar = () => {
    const [selected, setSelected] = React.useState(INITIAL_DATE);

    const getDate = (count)=> {
        const date = new Date(INITIAL_DATE);
        const newDate = date.setDate(date.getDate() + count);
        return CalendarUtils.getCalendarDateString(newDate);
    };

    const onDayPress = React.useCallback((day) => {
        setSelected(day.dateString);
    }, []);

    const marked = React.useMemo(() => {
        return {
        [getDate(-1)]: {
            dotColor: '#6a5acd',
            marked: true
        },
        [selected]: {
            selected: true,
            disableTouchEvent: true,
            selectedColor: '#6a5acd',
            selectedTextColor: 'white'
        }
        };
    }, [selected]);

    return (
        <Calendar
            onDayPress={onDayPress}
            onDayLongPress={day => { console.log('selected day', day)}}
            monthFormat={'MMMM yyyy'} 
            hideArrows={false} //false is default
            hideExtraDays={true} //don't show days of other months
            // If hideArrows = false and hideExtraDays = false do not switch month when tapping on greyed out
            // day from another month that is visible in calendar page. Default = false
            disableMonthChange={true}
            firstDay={1}
            hideDayNames={false}
            showWeekNumbers={false}
            onPressArrowLeft={subtractMonth => subtractMonth()}
            onPressArrowRight={addMonth => addMonth()}
            enableSwipeMonths={false}
            markedDates={marked}
            style={{width:screenWidth * 0.95, backgroundColor: 'transparent', borderRadius:10, borderWidth:3, borderColor:'#6a5acd'}}
            theme={{
                calendarBackground: '#2a2a2aff', 
                dayTextColor:'white',
                monthTextColor:'white',
                textDayFontWeight:'bold',
                textMonthFontWeight:'bold',
                textMonthFontSize:'17',
                todayTextColor:'#6a5acd', 
                arrowColor:'#6a5acd'}}
        />
    )
};

export default ProfileCalendar