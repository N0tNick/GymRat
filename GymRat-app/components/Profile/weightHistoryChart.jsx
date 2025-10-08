import { React, useState, useEffect, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { LineChart } from "react-native-gifted-charts";
import { Dimensions} from 'react-native';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(weekOfYear);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { height: screenHeight } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');

const lineChart = () => {
    const db = useSQLiteContext()
    const [data, setData] = useState([]) // Change data to state
    const [yAxisOffset, setYAxisOffset] = useState(0)

    useEffect(() => {
        fetchWeightHistory()
        const intervalId = setInterval(() => {
          fetchWeightHistory()
        }, 2000)
        return () => clearInterval(intervalId)
      }, []);


    const fetchWeightHistory = async () => {
        try {
            const result = await db.getAllAsync('SELECT * FROM weightHistory ORDER BY date')

            // Get current week's start (Sunday) and end (Saturday)
            const now = dayjs()
            const startOfWeek = now.startOf('week') // Sunday
            const endOfWeek = now.endOf('week') // Saturday

            const chartData = result
                // Filter by current week days
                .filter(entry => {
                    const entryDate = dayjs(entry.date)
                    return entryDate.isValid() && 
                           entryDate.isSameOrAfter(startOfWeek, 'day') && 
                           entryDate.isSameOrBefore(endOfWeek, 'day')
                })
                .map((entry, index) => {
                const date = dayjs(entry.date)
                const formattedDate = date.isValid() ? date.format('MM/DD/YY') : `Entry ${index + 1}`
                                
                return {
                    value: parseFloat(entry.weight),
                    label: formattedDate
                }
                })
            
            // Calculate yAxisOffset as lowest weight minus 50
            if (chartData.length > 0) {
                const minWeight = Math.min(...chartData.map(d => d.value))
                setYAxisOffset(minWeight - 10)
            } else {
                setYAxisOffset(0)
            }

            setData(chartData)
        } catch (error) {
            console.error('Error fetching weight history:', error)
            setData([])
            setYAxisOffset(0)
        }
    }

    return (
        <LineChart 
            data={data}
            adjustToWidth={false}
            thickness={8}
            dataPointsRadius={6}
            showVerticalLines={true}
            verticalLinesUptoDataPoint={true}
            verticalLinesThickness={2}
            verticalLinesShift={1}
            hideRules={true}
            color='#6a5acd'
            dataPointsColor={'#e0e0e0'}
            hideYAxisText={true}
            showValuesAsDataPointsText={true}
            textColor={'#e0e0e0'}
            textFontSize={16}
            textShiftX={-10}
            textShiftY={-10}
            xAxisLabelTextStyle={{fontSize:8,fontWeight:'600',color:'#e0e0e0',letterSpacing:0.3,marginRight:5}}
            verticalLinesColor={'#6a5acd'}
            backgroundColor={'transparent'}
            yAxisColor={'#2c2c2e'}
            xAxisColor={'#6a5acd'}
            xAxisThickness={2}
            yAxisOffset={yAxisOffset}
            renderDataPointsAfterAnimationEnds={true}
            animateOnDataChange={true}
            disableScroll={true}
        />
    )
}

export default lineChart