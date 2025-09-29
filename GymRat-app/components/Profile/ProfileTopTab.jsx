import { React, useState, useEffect, useCallback } from 'react';
import { StyleSheet, Dimensions, TouchableOpacity, Image, View, Modal, Pressable, Text } from 'react-native';
import { Layout, Tab, TabView } from '@ui-kitten/components'
import { useFocusEffect, useRouter } from 'expo-router';
import Calendar from './ProfileCalendar'
import { QuestionModal1, QuestionModal2, QuestionModal3, WeightTouchable ,GoalWeightTouchable, BodyFatTouchable, BMRTouchable } from './bodyTabModals'
import { useSQLiteContext } from 'expo-sqlite';
import standards from '../ui/appStandards'


const { height: screenHeight } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');

const TopTab = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isQuestionModal1Visible, setQuestionModal1Visible] = useState(false);
  const [isQuestionModal2Visible, setQuestionModal2Visible] = useState(false);
  const [isQuestionModal3Visible, setQuestionModal3Visible] = useState(false);
  const [isWeightTouchableVisible, setWeightTouchableVisible] = useState(false);
  const [isGoalWeightTouchableVisible, setGoalWeightTouchableVisible] = useState(false);
  const [isBodyFatTouchableVisible, setBodyFatTouchableVisible] = useState(false);
  const [isBMRTouchableVisible, setBMRTouchableVisible] = useState(false);
  const router = useRouter();
 
  const [weight, setWeight] = useState('')
  const [lastWeight, setLastWeight] = useState(null) 
  
  const [goalWeight, setGoalWeight] = useState('')
  const [lastGoalWeight, setLastGoalWeight] = useState(null) 

  const [BMI, setBMI] = useState('')
  const [lastBMI, setLastBMI] = useState(null) 

  const [body_fat, setBodyFat] = useState('')
  const [lastBodyFat, setLastBodyFat] = useState(null)
  
  const [BMR, setBMR] = useState('')
  const [lastBMR, setLastBMR] = useState(null) 
  
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
      //console.log(result)
      setLastWeight(result['weight']) 
      setLastGoalWeight(result['goal_weight'])
      setLastBodyFat(result['body_fat'])
      setLastBMI(result['BMI']) 
      setLastBMR(result['BMR']) 
    } catch (error) {
      console.error('Error fetching last weight:', error)
    }
  }
    useFocusEffect(
      useCallback(() => {
      }, [])
    )
  return (
      <TabView 
      selectedIndex={selectedIndex} 
      onSelect={index => setSelectedIndex(index)} 
      indicatorStyle={styles.indicator}
      style={{backgroundColor: '#1a1b1c', borderTopWidth:3, borderRadius:1, borderColor:'#6a5acd'}}
      >
        <Tab 
          title={evaProps => <Text {...evaProps} style={standards.headerText}>Overview</Text>}
          style={styles.tabStyle}
        >         
          <Layout style={styles.tabContainer}>
              <Calendar />
              <TouchableOpacity style = {{margin:20, width: screenWidth*0.95,height:120,borderWidth:3,borderRadius: 10, borderColor: '#6a5acd'}}
              onPress={() => router.push('/ExerciseGoals')}
              >
                <Text style = {standards.regularText}>Exercise Goals</Text>
                <Image style={{width:50, height:50, position:'absolute',right:20,marginTop: 25,borderWidth:2,borderRadius:25, borderColor:'gray', backgroundColor:'white'}} 
                  source={{
                    uri: 'https://www.freeiconspng.com/thumbs/plus-icon/plus-icon-black-2.png',
                  }}
                />
              </TouchableOpacity>
          </Layout>
        </Tab>
        
        <Tab 
          title={evaProps => <Text {...evaProps} style={standards.headerText}>Body</Text>}
          style={styles.tabStyle}
        >         
          <Layout style={styles.tabContainer}>

            <View style={{width:screenWidth*0.95,height:screenHeight*0.11, paddingTop:5, paddingLeft:5, marginBottom:20,borderWidth:3, borderRadius:8, borderColor:'#6a5acd'}}>
              <Text category='h6' style={standards.headerText}>Progress</Text>
              <View style = {{ flexDirection:'row',padding:5,justifyContent:'space-between'}}>
                <View style={{flexDirection:'column'}}>
                  <View>
                    <Text category='h6' style={standards.regularText}>Weight</Text>
                  </View>
                  <WeightTouchable isVisible={isWeightTouchableVisible} onClose={() => setWeightTouchableVisible(false)}/>
                  <TouchableOpacity 
                    style = {styles.bodyCompContainers}
                    onPress={() => setWeightTouchableVisible(true)}>
                    <Text category='h7' style = {standards.regularText}>
                      - {lastWeight ? `${lastWeight}` : '___'}
                    </Text>
                  </TouchableOpacity>
                </View>  

                <View style={{flexDirection:'column'}}>
                  <View style={{flexDirection:'row'}}>
                    <Text category='h6' style={standards.regularText}>Goal Weight</Text>
                  </View>
                  <GoalWeightTouchable isVisible={isGoalWeightTouchableVisible} onClose={() => setGoalWeightTouchableVisible(false)}/>
                  <TouchableOpacity 
                    style = {styles.bodyCompContainers}
                    onPress={() => setGoalWeightTouchableVisible(true)}>
                    <Text category='h7' style = {standards.regularText}>
                      - {lastGoalWeight ? `${lastGoalWeight}` : '___'} 
                    </Text>
                  </TouchableOpacity>
                </View>  

              </View>
            </View>

            <View style={{width:screenWidth*0.95,height:screenHeight*0.11, paddingTop:5, paddingLeft:5, marginBottom:20,borderWidth:3, borderRadius:8, borderColor:'#6a5acd'}}>
              <Text category='h6' style={standards.headerText}>Composition</Text>
              <View style = {{ flexDirection:'row',padding:5,justifyContent:'space-between'}}>
                      <View>
                        <View style={{flexDirection:'row'}}>
                          <Text category='h6' style={standards.regularText}>Body Fat %</Text>
                            <QuestionModal1 isVisible={isQuestionModal1Visible} onClose={() => setQuestionModal1Visible(false)}/>
                            <TouchableOpacity 
                              style ={styles.logoContainer}
                              onPress={() => setQuestionModal1Visible(true)} >
                              <Image style={styles.logo} source={{uri:'https://upload.wikimedia.org/wikipedia/commons/2/28/Question_mark_white.png'}}/>
                            </TouchableOpacity>
                        </View>
                        <BodyFatTouchable isVisible={isBodyFatTouchableVisible} onClose={() => setBodyFatTouchableVisible(false)}/>
                        <TouchableOpacity 
                          style = {styles.bodyCompContainers}
                          onPress={() => setBodyFatTouchableVisible(true)}>
                          <Text category='h7' style = {standards.regularText}>
                            - {lastBodyFat ? `${lastBodyFat}%` : '___'} </Text>
                        </TouchableOpacity>
                      </View>
 
                      <View>
                        <View style={{flexDirection:'row'}}>
                          <Text category='h6' style={standards.regularText}>BMI</Text>
                          <QuestionModal2 isVisible={isQuestionModal2Visible} onClose={() => setQuestionModal2Visible(false)}/>
                          <TouchableOpacity 
                          style ={styles.logoContainer}
                          onPress={() => setQuestionModal2Visible(true)}>
                            <Image style={styles.logoContainer} source={{uri:'https://upload.wikimedia.org/wikipedia/commons/2/28/Question_mark_white.png'}}/>
                          </TouchableOpacity>
                        </View>
                        <View 
                          style = {styles.bodyCompContainers}>
                          <Text category='h7' style = {standards.regularText}>
                            - {lastBMI ? `${lastBMI}` : '___'}</Text>
                        </View>
                      </View>
 
                      <View>
                        <View style={{flexDirection:'row'}}>
                          <Text category='h6' style={standards.regularText}>BMR</Text>
                          <QuestionModal3 isVisible={isQuestionModal3Visible} onClose={() => setQuestionModal3Visible(false)}/>
                          <TouchableOpacity 
                          style ={styles.logoContainer}
                          onPress={() => setQuestionModal3Visible(true)}>
                            <Image style={styles.logo} source={{uri:'https://upload.wikimedia.org/wikipedia/commons/2/28/Question_mark_white.png'}}/>
                          </TouchableOpacity>
                        </View>
                        <BMRTouchable isVisible={isBMRTouchableVisible} onClose={() => setBMRTouchableVisible(false)}/>
                        <TouchableOpacity 
                          style = {styles.bodyCompContainers}
                          onPress={() => setBMRTouchableVisible(true)}>
                          <Text category='h7' style = {standards.regularText}>
                            - {lastBMR ? `${lastBMR}` : '___'}</Text>
                        </TouchableOpacity>
                      </View>
                </View>
            </View>
          </Layout>
        </Tab>
      </TabView>
    );
}

export default TopTab

const styles = StyleSheet.create({
  tabStyle: {
    backgroundColor: '#1a1b1c',
    margin:2
  },
  tabText: {
    color: '#e0e0e0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  indicator: {
    backgroundColor: '#6a5acd',
    height: 3,
  },
  tabContainer: {
    height: screenHeight,
    width: screenWidth,
    justifyContent:'flex-start',
    flexDirection:'column',
    alignItems: 'center',
    backgroundColor: '#1a1b1c',
    padding:10
  },
  bodyCompContainers: {
    alignSelf:'center',
    justifyContent:'center',
    width: screenWidth*0.15, 
    height: screenHeight*0.02
  },
  logoContainer: {
    width: screenWidth*0.05,
    height: screenHeight*0.025,
    marginLeft:3,
    marginRight:10,
  },
  logo: {
    width:'100%',
    height:'100%'
  },
});

const textStyles = StyleSheet.create({
  compText: {
    paddingLeft: 5, 
    color:'#e0e0e0', 
    position: 'absolute', 
    fontWeight: 'bold', 
    fontSize: 18
  },

  compTitlesText: {
    marginTop:30,
    paddingLeft:10,
    color:'#e0e0e0', 
    fontWeight:'600', 
    fontSize: 16
  },
  compBodyText: {
    marginTop:10, 
    paddingLeft:15,
    color:'#e0e0e0', 
    position:'absolute', 
    fontWeight:'normal',
    fontSize:16, 
  }
})

