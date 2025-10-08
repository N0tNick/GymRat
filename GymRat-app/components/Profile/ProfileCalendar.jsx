import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Dimensions, Modal, Text, TouchableOpacity, Pressable } from 'react-native';
import {Calendar, CalendarUtils} from 'react-native-calendars';
import { useSQLiteContext } from 'expo-sqlite';
import dayjs from 'dayjs';

const { width: screenWidth } = Dimensions.get('window');
const { height: screenHeight } = Dimensions.get('window');

const INITIAL_DATE = '2024-11-06';


const ProfileCalendar = () => {
    const [modalOpen, setModalOpen] = React.useState(false);
    const [selected, setSelected] = React.useState(INITIAL_DATE);
    const db = useSQLiteContext()

    useEffect(() => {
        fetchUserStats()
        const intervalId = setInterval(() => {
          fetchUserStats()
        }, 2000)
        return () => clearInterval(intervalId)
      }, []);


    const fetchUserStats = async () => {
        try {
        const result = await db.getFirstAsync('SELECT * FROM userStats')
        } catch (error) {
            console.error('Error fetching workout/nutrition history:', error)
        }
    }

    const getDate = (count)=> {
        const date = new Date(INITIAL_DATE);
        const newDate = date.setDate(date.getDate() + count);
        return CalendarUtils.getCalendarDateString(newDate);
    };

    const onDayPress = React.useCallback((day) => {
        const formattedDate = dayjs(day.dateString).format('MM/DD/YY')
        setSelected(formattedDate);
        setModalOpen(true);
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
            selectedTextColor: '#e0e0e0'
        }
        };
    }, [selected]);

    return (
        <>
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
                style={{width:screenWidth * 0.95, backgroundColor: '#2c2c2e',borderRadius:10}}
                theme={{
                    calendarBackground: '#2c2c2e',
                    dayTextColor:'#e0e0e0',
                    monthTextColor:'#e0e0e0',
                    textDayFontWeight:'600',
                    textMonthFontWeight:'800',
                    textMonthFontSize:18,
                    textDayFontSize:16,
                    todayTextColor:'#6a5acd', 
                    arrowColor:'#6a5acd'}}
            />

            <Modal
                visible={modalOpen}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalOpen(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setModalOpen(false)} >
                    <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{selected}</Text>
                            <TouchableOpacity onPress={() => setModalOpen(false)} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalBody}>
                            <Text style={styles.modalText}>Workout and Nutrition Details</Text>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: screenHeight * 0.5,
        backgroundColor: '#2c2c2e',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#e0e0e0',
    },
    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        fontSize: 24,
        color: '#e0e0e0',
        fontWeight: '600',
    },
    modalBody: {
        flex: 1,
    },
    modalText: {
        fontSize: 16,
        color: '#e0e0e0',
    },
});

export default ProfileCalendar;