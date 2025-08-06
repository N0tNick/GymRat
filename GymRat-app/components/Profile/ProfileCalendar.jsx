import React from 'react';
import { StyleSheet, View } from 'react-native';
import {Calendar, CalendarUtils} from 'react-native-calendars';


const ProfileCalendar = () => {
    return (
        <Calendar
            onDayPress={day => { console.log('day pressed', day)}}
            onDayLongPress={day => { console.log('selected day', day)}}
            monthFormat={'yyyy MM'}
            hideArrows={false} //false is default
            hideExtraDays={true} //don't show days of other months
            // If hideArrows = false and hideExtraDays = false do not switch month when tapping on greyed out
            // day from another month that is visible in calendar page. Default = false
            disableMonthChange={true}
            firstDay={1}
            hideDayNames={true}
            showWeekNumbers={true}
            onPressArrowLeft={subtractMonth => subtractMonth()}
            onPressArrowRight={addMonth => addMonth()}
            enableSwipeMonths={true}
        />
    )
};

export default ProfileCalendar