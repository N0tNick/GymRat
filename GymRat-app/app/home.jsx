import DateTimePicker from '@react-native-community/datetimepicker';
import * as Calendar from 'expo-calendar';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import NavBar from '../components/NavBar';
import { useUser } from '../UserContext';
import { cals } from './goal';





const { height: screenHeight } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');


export default function HomeScreen() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const db = useSQLiteContext();
  const { userId } = useUser();
  const [dailyTotals, setDailyTotals] = useState(null);
  // add a task
  const [modalVisible, setModalVisible] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventTime, setNewEventTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  // weekly calendar
  const [dayModalVisible, setDayModalVisible] = useState(false);
  const [dayTotals, setDayTotals] = useState(null);
  const [weekData, setWeekData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const [customizeModalVisible, setCustomizeModalVisible] = useState(false);
  const [showTasks, setShowTasks] = useState(true);
  const [showNutrition, setShowNutrition] = useState(true);
  const [showWeekly, setShowWeekly] = useState(true);
  const [moduleOrder, setModuleOrder] = useState(['tasks', 'nutrition', 'weekly']);

  // function to add daily event
  const handleAddEvent = () => {
    const newEvent = {
      id: Date.now().toString(),
      title: newEventName,
      startDate: newEventTime.toISOString(),
    };

    const updatedEvents = [...events, newEvent].sort(
      (a, b) => new Date(a.startDate) - new Date(b.startDate)
    );

    setEvents(updatedEvents);

    // reset modal
    setNewEventName('');
    setNewEventTime(new Date());
    setModalVisible(false);
  };

  useEffect(() => {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday

    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      return d;
    });

    const loadWeekData = async () => {
      const results = [];
      for (const dateObj of days) {
        const dateStr = dateObj.toISOString().split("T")[0];
        const res = await db.getAllAsync(
          `SELECT COUNT(*) as count FROM historyLog WHERE user_id = ? AND date = ?`, // change to FROM storedNutLog when it works
          [userId, dateStr]
        );
        results.push({
          date: dateObj,
          hasLog: res[0]?.count > 0
        });
      }
      setWeekData(results);
    };

    loadWeekData();
  }, [db, userId]);

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

  const loadTotalsForDate = async (date, tableName = "dailyNutLog") => {
    const dateStr = date.toISOString().split("T")[0];

    try {
      const result = await db.getAllAsync(
        `SELECT 
          SUM(CAST(calories AS REAL)) AS totalCalories,
          SUM(CAST(protein AS REAL)) AS totalProtein,
          SUM(CAST(total_Carbs AS REAL)) AS totalCarbs,
          SUM(CAST(total_Fat AS REAL)) AS totalFat
        FROM ${tableName}
        WHERE user_id = ? AND date = ?`,
        [userId, dateStr]
      );

      const totals = result[0];
      return {
        totalCalories: totals?.totalCalories || 0,
        totalProtein: totals?.totalProtein || 0,
        totalCarbs: totals?.totalCarbs || 0,
        totalFat: totals?.totalFat || 0,
      };
    } catch (error) {
      console.error(`Error loading totals from ${tableName}:`, error);
      return {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
      };
    }
  };

  useEffect(() => {
    (async () => {
      const todayTotals = await loadTotalsForDate(new Date(), "dailyNutLog");
      setDailyTotals(todayTotals);
    })();
  }, [db, userId]);

  const gridData = useMemo(() => {
  const enabled = [];
  if (showTasks)    enabled.push('tasks');
  if (showNutrition) enabled.push('nutrition');
  if (showWeekly)   enabled.push('weekly');

  return moduleOrder.filter(k => enabled.includes(k)).map(k => ({ key: k }));}, 
  [showTasks, showNutrition, showWeekly, moduleOrder]);

  const renderModule = useCallback(({ item, drag, isActive }) => {
  switch (item.key) {
    case 'tasks':
      return (
        <ScaleDecorator>
          <TouchableOpacity
            activeOpacity={0.9}
            onLongPress={drag}
            disabled={isActive}
            style={styles.gridItem}
          >
            {/* --- your existing Tasks module content --- */}
            <View style={styles.homeModule}>
              <Text style={styles.moduleTitle}>Tasks to do today</Text>
              <ScrollView contentContainerStyle={styles.taskList}>
                {Array.isArray(events) && events.length > 0 ? (
                  events.map((event, index) => (
                    <View key={event.id}>
                      {index === 0 && <View style={styles.divider} />}
                      <View style={styles.taskRow}>
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
                ) : (
                  <Text style={styles.noTask}>No events for today</Text>
                )}
              </ScrollView>
              <TouchableOpacity style={styles.addEventButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.addEventText}>Add Event</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </ScaleDecorator>
      );

    case 'nutrition':
      return (
        <ScaleDecorator>
          <TouchableOpacity
            activeOpacity={0.9}
            onLongPress={drag}
            disabled={isActive}
            style={styles.gridItem}
          >
            <View style={styles.homeModule}>
              <Text style={styles.moduleTitle}>Nutrition Rundown</Text>

              <View style={styles.nutrientRow}>
                <Text style={styles.nutrientLabel}>Energy - {dailyTotals?.totalCalories ?? 0} / {cals} kcal</Text>
                <View style={styles.barContainer}>
                  <View style={[styles.barFill, { backgroundColor: '#00eaff', width: `${Math.min(((dailyTotals?.totalCalories ?? 0) / cals) * 100, 100)}%` }]} />
                </View>
              </View>

              <View style={styles.nutrientRow}>
                <Text style={styles.nutrientLabel}>Protein - {dailyTotals?.totalProtein ?? 0} / {Math.round((cals * 0.25) / 4)}g</Text>
                <View style={styles.barContainer}>
                  <View style={[styles.barFill, { backgroundColor: '#ff00ff', width: `${Math.min(((dailyTotals?.totalProtein ?? 0) / ((cals * 0.25) / 4)) * 100, 100)}%` }]} />
                </View>
              </View>

              <View style={styles.nutrientRow}>
                <Text style={styles.nutrientLabel}>Carbs - {dailyTotals?.totalCarbs ?? 0} / {Math.round((cals * 0.45) / 4)}g</Text>
                <View style={styles.barContainer}>
                  <View style={[styles.barFill, { backgroundColor: '#00ff00', width: `${Math.min(((dailyTotals?.totalCarbs ?? 0) / ((cals * 0.45) / 4)) * 100, 100)}%` }]} />
                </View>
              </View>

              <View style={styles.nutrientRow}>
                <Text style={styles.nutrientLabel}>Fat - {dailyTotals?.totalFat ?? 0} / {Math.round((cals * 0.30) / 9)}g</Text>
                <View style={styles.barContainer}>
                  <View style={[styles.barFill, { backgroundColor: '#ff0000', width: `${Math.min(((dailyTotals?.totalFat ?? 0) / ((cals * 0.30) / 9)) * 100, 100)}%` }]} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </ScaleDecorator>
      );

    case 'weekly':
      return (
        <ScaleDecorator>
          <TouchableOpacity
            activeOpacity={0.9}
            onLongPress={drag}
            disabled={isActive}
            style={styles.gridItem}
          >
            <View style={styles.homeModule}>
              <Text style={styles.moduleTitle}>Weekly Calendar</Text>
              <View style={styles.weekRow}>
                {weekData.map((dayInfo, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dayColumn}
                    onPress={async () => {
                      setSelectedDate(dayInfo.date);
                      if (dayInfo.hasLog) {
                        const totals = await loadTotalsForDate(dayInfo.date, "historyLog");
                        setDayTotals(totals);
                      } else {
                        setDayTotals(null);
                      }
                      setDayModalVisible(true);
                    }}
                  >
                    <Text style={styles.dayLabel}>
                      {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dayInfo.date.getDay()]}
                    </Text>
                    <View style={styles.dayContent}>
                      <Text style={{ color: "#fff" }}>{dayInfo.date.getDate()}</Text>
                      <View style={[
                        styles.logIndicator,
                        { backgroundColor: dayInfo.hasLog ? "green" : "transparent" }
                      ]}/>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </ScaleDecorator>
      );

    default:
      return null;
  }
}, [events, dailyTotals, weekData, setDayModalVisible]);



  return (
    <SafeAreaProvider>
        <View style={styles.container}>
          <SafeAreaView style={{ flex: 1, height: screenHeight, width: screenWidth, alignItems:'center', justifyContent: 'center' }}>
          <Text style={styles.text}>GymRat</Text>

           <DraggableFlatList
            data={gridData}
            keyExtractor={(item) => item.key}
            renderItem={renderModule}
            numColumns={1}
            contentContainerStyle={{ alignItems: 'center' }}
            onDragEnd={({ data }) => setModuleOrder(data.map(d => d.key))}
          />
          {/* <View style={styles.homeModule}>
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
            <TouchableOpacity style={styles.addEventButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.addEventText}>Add Event</Text>
            </TouchableOpacity>
          </View>
        

          
          
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
        

        
          <View style={styles.homeModule}>
            <Text style={styles.moduleTitle}>Weekly Calendar</Text>
            <View style={styles.weekRow}>
              {weekData.map((dayInfo, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dayColumn}
                  onPress={async () => {
                    setSelectedDate(dayInfo.date);
                    if (dayInfo.hasLog) {
                      const totals = await loadTotalsForDate(dayInfo.date, "historyLog"); // change to STOREDNUTLOG when it works
                      setDayTotals(totals);
                    } else {
                      setDayTotals(null); // no logs for that day
                    }
                    setDayModalVisible(true);
                  }}
                >
                  <Text style={styles.dayLabel}>
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayInfo.date.getDay()]}
                  </Text>
                  <View style={styles.dayContent}>
                    <Text style={{ color: "#fff" }}>{dayInfo.date.getDate()}</Text>
                    <View
                      style={[
                        styles.logIndicator,
                        { backgroundColor: dayInfo.hasLog ? "green" : "transparent" }
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View> */}
        

          {/* Day Modal */}
          <Modal
            transparent={true}
            visible={dayModalVisible}
            onRequestClose={() => setDayModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>
                  {selectedDate?.toDateString()}
                </Text>
                {dayTotals ? (
                  <>
                    <Text style={{ color: "#fff" }}>Calories: {dayTotals.totalCalories}</Text>
                    <Text style={{ color: "#fff" }}>Protein: {dayTotals.totalProtein}</Text>
                    <Text style={{ color: "#fff" }}>Carbs: {dayTotals.totalCarbs}</Text>
                    <Text style={{ color: "#fff" }}>Fat: {dayTotals.totalFat}</Text>
                  </>
                ) : (
                  <Text style={{ color: "#fff", fontStyle: "italic" }}>Nothing logged this day</Text>
                )}
                <TouchableOpacity onPress={() => setDayModalVisible(false)}>
                  <Text style={styles.cancelText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* route to nutrition splashpage */}
          <TouchableOpacity
            style={styles.nutsplashButton}
            onPress={() => router.push('/nutsplash')}
          >
            <Text style={styles.buttonText}>Go to Nutrition Splash Page</Text>
          </TouchableOpacity>
          </SafeAreaView>
        </View>

        <TouchableOpacity
          style={styles.customizeButton}
          onPress={() => setCustomizeModalVisible(true)}
        >
          <Text style={styles.buttonText}>⚙️</Text>
        </TouchableOpacity>


        <NavBar />
        <Modal animation Type="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Add New Event</Text>
              <TextInput style={styles.input} placeholder="Event Name" placeholderTextColor="#888" value={newEventName} onChangeText={setNewEventName}/>
              <TouchableOpacity 
                style={styles.timeButton} 
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.timeButtonText}>
                  Select Time: {newEventTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>

              {showTimePicker && (
                <DateTimePicker
                  value={newEventTime}
                  mode="time"
                  display="default"
                  onChange={(event, selectedTime) => {
                    if (event.type === "set" && selectedTime) { // "set" means OK pressed
                      setNewEventTime(selectedTime);
                    }
                    setShowTimePicker(false); // hides picker regardless of OK or cancel
                  }}
                />
              )}

              <TouchableOpacity style={styles.modalAddButton} onPress={handleAddEvent}>
                <Text style={styles.modalAddText}>Add</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          transparent={true}
          visible={customizeModalVisible}
          onRequestClose={() => setCustomizeModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Customize Home Modules</Text>

              <TouchableOpacity onPress={() => setShowTasks(!showTasks)}>
                <Text style={{ color: showTasks ? '#32a852' : '#888', marginBottom: 10 }}>
                  {showTasks ? '✓ ' : '○ '}Tasks
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowNutrition(!showNutrition)}>
                <Text style={{ color: showNutrition ? '#00eaff' : '#888', marginBottom: 10 }}>
                  {showNutrition ? '✓ ' : '○ '}Nutrition Rundown
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowWeekly(!showWeekly)}>
                <Text style={{ color: showWeekly ? '#ffa500' : '#888', marginBottom: 10 }}>
                  {showWeekly ? '✓ ' : '○ '}Weekly Calendar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setCustomizeModalVisible(false)}>
                <Text style={styles.cancelText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
    width: '95%',
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
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    borderTopWidth: 1,
    borderColor: '#444',
  },
  dayColumn: {
    flex: 1,
    backgroundColor: '#3a3a3c',
    borderRightWidth: 1,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  dayLabel: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dayContent: {
    flex: 1,
    minHeight: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addEventButton: {
    backgroundColor: '#32a852',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 10,
  },
  addEventText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#2c2c2e',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#444',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    width: '100%',
    marginBottom: 15,
  },
  modalAddButton: {
    backgroundColor: '#32a852',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  modalAddText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelText: {
    color: '#ff5555',
    marginTop: 10,
  },
  timeButton: {
    backgroundColor: '#444',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  timeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "green",
    marginTop: 4,
  },
  customizeButton: {
    position: 'absolute',
    bottom: 85,
    left: 20,
    backgroundColor: '#444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    zIndex: 99,
  },
  gridItem: { 
    width: screenWidth * 0.90, 
    alignItems: 'center' 
  },
});
