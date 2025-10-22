import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Dimensions, Modal, Text, TouchableOpacity, Pressable, ScrollView } from 'react-native';
import {Calendar, CalendarUtils} from 'react-native-calendars';
import { useSQLiteContext } from 'expo-sqlite';
import dayjs from 'dayjs';
import { useUser} from '../../UserContext';

const { width: screenWidth } = Dimensions.get('window');
const { height: screenHeight } = Dimensions.get('window');

const INITIAL_DATE = '2024-11-06';


const ProfileCalendar = () => {
    const [modalOpen, setModalOpen] = React.useState(false);
    const [selected, setSelected] = React.useState(INITIAL_DATE);
    const [dayData, setDayData] = useState(null);
    const [markedDates, setMarkedDates] = useState({});
    const db = useSQLiteContext();
    const { userId } = useUser();

    useEffect(() => {
        loadTotalsForDate()
      }, []);


    const loadTotalsForDate = async (dateString) => {
        try {
            const result = await db.getAllAsync(
                `SELECT 
                SUM(CAST(calories AS REAL)) AS totalCalories,
                SUM(CAST(protein AS REAL)) AS totalProtein,
                SUM(CAST(total_Carbs AS REAL)) AS totalCarbs,
                SUM(CAST(total_Fat AS REAL)) AS totalFat,
                SUM(CAST(sugar AS REAL)) AS totalSugar
                FROM historyLog
                WHERE user_id = ? AND date = ?`,
                [userId, dateString]
            );

            const totals = result[0];
            return {
                totalCalories: totals?.totalCalories || 0,
                totalProtein: totals?.totalProtein || 0,
                totalCarbs: totals?.totalCarbs || 0,
                totalFat: totals?.totalFat || 0,
                totalSugar: totals?.totalSugar || 0,
            };
        } catch (error) {
            console.error(`Error loading totals:`, error);
            return {
                totalCalories: 0,
                totalProtein: 0,
                totalCarbs: 0,
                totalFat: 0,
                totalSugar: 0,
            };
        }
    };

    const getDate = (count)=> {
        const date = new Date(INITIAL_DATE);
        const newDate = date.setDate(date.getDate() + count);
        return CalendarUtils.getCalendarDateString(newDate);
    };

    const onDayPress = React.useCallback(async (day) => {
        setSelected(day.dateString);
        
        // Subtract one day to compensate for timezone offset
        const adjustedDate = dayjs(day.dateString).format('YYYY-MM-DD');
        
        // Fetch nutrition data using adjusted date
        const nutritionTotals = await loadTotalsForDate(adjustedDate);
        
        // Fetch workout data
        let workoutName = null;
        try {
            const workoutResult = await db.getAllAsync(
                `SELECT workout_name FROM workoutLog
                WHERE user_id = ? AND date = ?`,
                [userId, adjustedDate]
            );
            workoutName = workoutResult[0]?.workout_name || null;
        } catch (error) {
            console.error('Error loading workout:', error);
        }
        
        setDayData({
            ...nutritionTotals,
            workout: workoutName,
            hasNutrition: nutritionTotals.totalCalories > 0,
            hasWorkout: !!workoutName
        });
        
        setModalOpen(true);
    }, [db]);

    const loadMarkedDates = async () => {
        try {
            // Get all dates with nutrition logs
            const nutritionDates = await db.getAllAsync(
                `SELECT DISTINCT date FROM historyLog WHERE calories > 0 AND user_id = ?`, [userId]
            );
            
            // Get all dates with workout logs
            const workoutDates = await db.getAllAsync(
                `SELECT DISTINCT date FROM workoutLog WHERE user_id = ?`, [userId]
            );
            
            // Create marked dates object
            const marked = {};
            
            // Mark nutrition dates with green dot
            nutritionDates.forEach(row => {
                const adjustedDate = dayjs(row.date).format('YYYY-MM-DD');
                marked[adjustedDate] = {
                    ...marked[adjustedDate],
                    dots: [
                        ...(marked[adjustedDate]?.dots || []),
                        { key: 'nutrition', color: '#4ade80' }
                    ]
                };
            });
            
            // Mark workout dates with red dot
            workoutDates.forEach(row => {
                const adjustedDate = dayjs(row.date).format('YYYY-MM-DD');
                marked[adjustedDate] = {
                    ...marked[adjustedDate],
                    dots: [
                        ...(marked[adjustedDate]?.dots || []),
                        { key: 'workout', color: '#f87171' }
                    ]
                };
            });
            
            setMarkedDates(marked);
        } catch (error) {
            console.error('Error loading marked dates:', error);
        }
    };

    useEffect(() => {
        loadMarkedDates();
    }, []);

    const marked = React.useMemo(() => {
        return {
            ...markedDates,
            [selected]: {
                ...markedDates[selected],
                selected: true,
                disableTouchEvent: true,
                selectedColor: '#6a5acd',
                selectedTextColor: '#e0e0e0'
            }
        };
    }, [selected, markedDates]);

    return (
        <>
            <Calendar
                onDayPress={onDayPress}
                onDayLongPress={day => { console.log('selected day', day)}}
                monthFormat={'MMMM yyyy'} 
                hideArrows={false}
                hideExtraDays={true}
                disableMonthChange={true}
                firstDay={1}
                hideDayNames={false}
                showWeekNumbers={false}
                onPressArrowLeft={subtractMonth => subtractMonth()}
                onPressArrowRight={addMonth => addMonth()}
                enableSwipeMonths={false}
                markedDates={marked}
                markingType={'multi-dot'}
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
                <Pressable style={styles.modalOverlay} onPress={() => setModalOpen(false)}>
                    <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                {dayjs(selected).format('MM/DD/YY')}
                            </Text>
                            <TouchableOpacity onPress={() => setModalOpen(false)} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            {/* Workout Section */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Workout</Text>
                                {dayData?.hasWorkout ? (
                                    <Text style={styles.workoutName}>{dayData.workout}</Text>
                                ) : (
                                    <Text style={styles.noDataText}>No workout logged</Text>
                                )}
                            </View>

                            {/* Nutrition Section */}
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Nutrition</Text>
                                {dayData?.hasNutrition ? (
                                    <>
                                        <View style={styles.nutrientRow}>
                                            <Text style={styles.nutrientLabel}>Calories:</Text>
                                            <Text style={styles.nutrientValue}>
                                                {Math.round(dayData.totalCalories)} kcal
                                            </Text>
                                        </View>
                                        <View style={styles.nutrientRow}>
                                            <Text style={styles.nutrientLabel}>Protein:</Text>
                                            <Text style={styles.nutrientValue}>
                                                {Math.round(dayData.totalProtein)}g
                                            </Text>
                                        </View>
                                        <View style={styles.nutrientRow}>
                                            <Text style={styles.nutrientLabel}>Carbs:</Text>
                                            <Text style={styles.nutrientValue}>
                                                {Math.round(dayData.totalCarbs)}g
                                            </Text>
                                        </View>
                                        <View style={styles.nutrientRow}>
                                            <Text style={styles.nutrientLabel}>Fat:</Text>
                                            <Text style={styles.nutrientValue}>
                                                {Math.round(dayData.totalFat)}g
                                            </Text>
                                        </View>
                                        <View style={styles.nutrientRow}>
                                            <Text style={styles.nutrientLabel}>Sugar:</Text>
                                            <Text style={styles.nutrientValue}>
                                                {Math.round(dayData.totalSugar)}g
                                            </Text>
                                        </View>
                                    </>
                                ) : (
                                    <Text style={styles.noDataText}>No food logged</Text>
                                )}
                            </View>
                        </ScrollView>
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
    section: {
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#444',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6a5acd',
        marginBottom: 10,
    },
    workoutName: {
        fontSize: 16,
        color: '#e0e0e0',
        fontWeight: '600',
    },
    noDataText: {
        fontSize: 14,
        color: '#888',
        fontStyle: 'italic',
    },
    nutrientRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 10,
        backgroundColor: '#3a3a3c',
        borderRadius: 8,
        marginBottom: 8,
    },
    nutrientLabel: {
        fontSize: 15,
        color: '#e0e0e0',
        fontWeight: '600',
    },
    nutrientValue: {
        fontSize: 15,
        color: '#6a5acd',
        fontWeight: 'bold',
    },
});

export default ProfileCalendar;