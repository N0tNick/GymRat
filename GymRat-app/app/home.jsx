import { useRouter } from 'expo-router';
import React, { useEffect, useState} from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Dimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../components/NavBar';
import * as Calendar from 'expo-calendar';
import { cals } from './goal';
import { useSQLiteContext } from 'expo-sqlite';
import { useUser } from '../UserContext';

const { height: screenHeight } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const db = useSQLiteContext();
  const { userId } = useUser();
  const [dailyTotals, setDailyTotals] = useState(null);

  // first get calendar permissions
  useEffect(() => {
    (async () => {
      const {status} = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        //console.log(calendars)
        const calendarIds = calendars.map(calendar => calendar.id);

        // set the times for the start and end of the day
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const todaysEvents = await Calendar.getEventsAsync(
          calendarIds,
          startOfDay,
          endOfDay
        );

        const sortedEvents = todaysEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        setEvents(sortedEvents);
      }
    })();
  }, []);

  const formatTime = (dateStr) => {
    const data = new Date(dateStr);
    return data.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'});
  };

  const loadTodaysTotals = async (userId) => {
    const date = new Date().toISOString().split('T')[0];

    try {
      const result = await db.getAllAsync(
        `SELECT 
          SUM(CAST(calories AS REAL)) AS totalCalories,
          SUM(CAST(protein AS REAL)) AS totalProtein,
          SUM(CAST(total_Carbs AS REAL)) AS totalCarbs,
          SUM(CAST(total_Fat AS REAL)) AS totalFat
        FROM dailyNutLog
        WHERE user_id = ? AND date = ?`,
        [userId, date]
      );

      // error handing if there are no values for user
      const totals = result[0];
      setDailyTotals({
        totalCalories: totals?.totalCalories || 0,
        totalProtein: totals?.totalProtein || 0,
        totalCarbs: totals?.totalCarbs || 0,
        totalFat: totals?.totalFat || 0,
      });
    } catch (error) {
      console.error('Error loading totals:', error);
      // set default values if query fails
      setDailyTotals({
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
      });
    }
  };

  useEffect(() => {
  loadTodaysTotals(userId);
  }, [db, userId]);

  return (
    <SafeAreaProvider>
        <View style={styles.container}>
          <SafeAreaView style={{ flex: 1, height: screenHeight, width: screenWidth, alignItems:'center', justifyContent: 'center' }}>
          <Text style={styles.text}>Home Screen</Text>

          <View style={styles.homeModule}>
            <Text style={styles.moduleTitle}>Tasks to do today</Text>
            <ScrollView contentContainerStyle={styles.taskList}>
              {events.length === 0 ? (
                <Text style={styles.noTask}>No events for today</Text>
              ) : (
                events.map((event, index) => (
                  <View key={event.id}>
                    {index === 0 && <View style={styles.divider} />}
                    <View  style={styles.taskRow}>
                      <View style={styles.timeWrapper}>
                        <Text style={styles.time}>{formatTime(event.startDate)}</Text>
                      </View>
                      <View style={styles.textWrapper}>
                        <Text style={styles.task}>{event.title}</Text>
                      </View>
                    </View>
                    {index < events.length - 1 && <View style={styles.divider} />}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
          {dailyTotals && (
          <View style={styles.homeModule}>
            <Text style={styles.moduleTitle}>Nutrition Rundown</Text>

            <View style={styles.nutrientRow}>
              <Text style={styles.nutrientLabel}>Energy - {dailyTotals.totalCalories} / {cals} kcal</Text>
              <View style={styles.barContainer}>
                <View style={[styles.barFill, { backgroundColor: '#00eaff', width: `${Math.min((dailyTotals.totalCalories / cals) * 100, 100)}%` }]} />
              </View>
            </View>
              
            <View style={styles.nutrientRow}>
              <Text style={styles.nutrientLabel}>Protein - {dailyTotals.totalProtein} / {Math.round((cals * 0.25) / 4)}g</Text>
              <View style={styles.barContainer}>
                <View style={[styles.barFill, { backgroundColor: '#ff00ff', width: `${Math.min((dailyTotals.totalProtein / ((cals * 0.25) / 4)) * 100, 100)}%` }]} />
              </View>
            </View>
              
            <View style={styles.nutrientRow}>
              <Text style={styles.nutrientLabel}>Carbs - {dailyTotals.totalCarbs} / {Math.round((cals * 0.45) / 4)}g</Text>
              <View style={styles.barContainer}>
                <View style={[styles.barFill, { backgroundColor: '#00ff00', width: `${Math.min((dailyTotals.totalCarbs / ((cals * 0.45) / 4)) * 100, 100)}%` }]} />
              </View>
            </View>
              
            <View style={styles.nutrientRow}>
              <Text style={styles.nutrientLabel}>Fat - {dailyTotals.totalFat} / {Math.round((cals * 0.30) / 9)}g</Text>
              <View style={styles.barContainer}>
                <View style={[styles.barFill, { backgroundColor: '#ff0000', width: `${Math.min((dailyTotals.totalFat / ((cals * 0.30) / 9)) * 100, 100)}%` }]} />
              </View>
            </View>
          </View>
        )}

          <TouchableOpacity
            style={styles.nutsplashButton}
            onPress={() => router.push('/nutsplash')}
          >
            <Text style={styles.buttonText}>Go to Nutrition Splash Page</Text>
          </TouchableOpacity>
          </SafeAreaView>
        </View>

        <NavBar />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1b1c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  nutsplashButton: {
    marginTop: 10,
    backgroundColor: '#32a852',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  homeModule: {
    backgroundColor: '#2c2c2e',
    borderRadius: 12,
    padding: 4,
    paddingTop: 10,
    marginTop: 20,
    width: '90%',
    maxHeight: 300,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  taskList: {
    paddingBottom: 10,
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  time: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'left',
    flex: 1,
  },
  task: {
    color: '#ccc',
    textAlign: 'right',
    flex: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#444',
    marginHorizontal: 20,
  },
  noTask: {
    color: '#999',
    textAlign: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  timeWrapper: {
    flex: 1,
    justifyContent: 'center'
  },
  textWrapper: {
    flex: 2,
    justifyContent: 'center'
  },
  nutrientRow: {
    marginBottom: 12,
  },
  nutrientLabel: {
    color: '#fff',
    marginBottom: 4,
    fontWeight: 'bold',
    fontSize: 14,
    paddingLeft: 12
  },
  barContainer: {
    height: 16,
    backgroundColor: '#111',
    borderRadius: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  }
});
