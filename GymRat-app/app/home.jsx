import { useRouter } from 'expo-router';
import React, { useEffect, useState} from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../components/NavBar';
import * as Calendar from 'expo-calendar';

export default function HomeScreen() {
  const router = useRouter();
  const [events, setEvents] = useState([]);

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

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <Text style={styles.text}>Home Screen</Text>

          <View style={styles.taskModule}>
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
          <TouchableOpacity
            style={styles.nutsplashButton}
            onPress={() => router.push('/nutsplash')}
          >
            <Text style={styles.buttonText}>Go to Nutrition Splash Page</Text>
          </TouchableOpacity>
        </View>

        <NavBar />
      </SafeAreaView>
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
  taskModule: {
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
  }
});
