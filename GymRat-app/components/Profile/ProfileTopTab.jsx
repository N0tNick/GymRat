import { React, useState, useEffect, useCallback } from 'react';
import { StyleSheet, Dimensions, TouchableOpacity, Image, View, Modal, Pressable, Text } from 'react-native';
import { Layout, Tab, TabView } from '@ui-kitten/components'
import { useFocusEffect, useRouter } from 'expo-router';
import Calendar from './ProfileCalendar'
import { QuestionModal1, QuestionModal2, QuestionModal3, WeightTouchable ,GoalWeightTouchable, BodyFatTouchable, BMRTouchable } from './bodyTabModals'
import { useSQLiteContext } from 'expo-sqlite';
import LineChart from './weightHistoryChart'
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
      indicatorStyle={{height:0}}
      style={{backgroundColor: '#2c2c2e', borderTopWidth:2,borderColor:'#6a5acd'}}
      tabBarStyle={styles.tabBarStyle}
      >
        <Tab 
          title={evaProps => <Text {...evaProps} style={[standards.headerText]}>Overview</Text>}
          style={[styles.tabBase, selectedIndex === 0 && styles.activeTab]} 
        >         
          <Layout style={styles.tabContainer}>
              <Calendar/>
              <TouchableOpacity style = {{margin:20, width: screenWidth*0.95,height:120,backgroundColor:'#2c2c2e',borderRadius:10,padding:10}}
              onPress={() => router.push('/ExerciseGoals')}
              >
                <Text style = {standards.regularTextPurple}>Exercise Goals</Text>
                <Image style={{width:50, height:50, position:'absolute',right:20,marginTop: 25,borderWidth:2,borderRadius:25, borderColor:'gray', backgroundColor:'white'}} 
                  source={{
                    uri: 'https://www.freeiconspng.com/thumbs/plus-icon/plus-icon-black-2.png',
                  }}
                />
              </TouchableOpacity>
          </Layout>
        </Tab>
        
        <Tab 
          title={evaProps => <Text {...evaProps} style={[standards.headerText]}>Body</Text>}
          style={[styles.tabBase, selectedIndex === 1 && styles.activeTab]}
        >         
          <Layout style={styles.tabContainer}>
            <View style={{backgroundColor:'#2c2c2e', width:screenWidth*0.95,borderRadius:10, padding:5, marginBottom:20}}>
              <LineChart/>
            </View>
            <View style={{width:screenWidth*0.95,height:screenHeight*0.11, padding:5, marginBottom:20,borderRadius:10,backgroundColor:'#2c2c2e'}}>
              <Text style={[standards.headerText, { paddingLeft:8,paddingTop:3,paddingBottom:5}]}>Progress</Text>
              <View style = {{ flexDirection:'row',justifyContent:'space-between',padding:5,paddingRight:10}}>
                <View style={{paddingLeft:10}}>
                  <WeightTouchable isVisible={isWeightTouchableVisible} onClose={() => setWeightTouchableVisible(false)}/>
                  <View style={{paddingBottom:3}}>
                    <Text style={standards.regularText}>Weight</Text>
                  </View>
                  <Pressable 
                    style = {({ pressed }) => [styles.bodyCompContainers]}
                    onPress={() => setWeightTouchableVisible(true)}> 
                    {({ pressed }) => (
                    <Text style = {[standards.smallText,{color: pressed ? '#6a5acd' : '#e0e0e0'}]}>
                      {lastWeight ? `${lastWeight}` : '__'} lbs
                    </Text> )}
                  </Pressable>
                </View>  

                <View>
                  <GoalWeightTouchable isVisible={isGoalWeightTouchableVisible} onClose={() => setGoalWeightTouchableVisible(false)}/>
                  <View style={{paddingBottom:3}}>
                    <Text category='h6' style={standards.regularText}>Goal Weight</Text>
                  </View>
                  <Pressable 
                    style = {({ pressed }) => [styles.bodyCompContainers]}
                    onPress={() => setGoalWeightTouchableVisible(true)}> 
                    {({ pressed }) => (
                    <Text style = {[standards.smallText,{color: pressed ? '#6a5acd' : '#e0e0e0'}]}>
                      {lastGoalWeight ? `${lastGoalWeight}` : '__'} lbs
                    </Text> )}
                  </Pressable>
                </View>  

              </View>
            </View>

            <View style={{width:screenWidth*0.95,height:screenHeight*0.11, padding:5, marginBottom:20,borderRadius:10,backgroundColor:'#2c2c2e'}}>
              <Text style={[standards.headerText, {paddingLeft:8,paddingTop:3}]}>Composition</Text>
              <View style = {{ flexDirection:'row',justifyContent:'space-between',padding:10}}>
                   
                <View style={{flexDirection:'row'}}>
                <View style={{flexDirection:'column',paddingRight:5}}>
                  <QuestionModal1 isVisible={isQuestionModal1Visible} onClose={() => setQuestionModal1Visible(false)}/>
                  <Text style={standards.regularText}>Body Fat %</Text>
                  <BodyFatTouchable isVisible={isBodyFatTouchableVisible} onClose={() => setBodyFatTouchableVisible(false)}/>
                  <Pressable 
                    style = {({ pressed }) => [styles.bodyCompContainers]}
                    onPress={() => setBodyFatTouchableVisible(true)}> 
                    {({ pressed }) => (
                    <Text style = {[standards.smallText,{textAlign:'center'},{color: pressed ? '#6a5acd' : '#e0e0e0'}]}>
                      {lastBodyFat ? `${lastBodyFat}` : '__'}%
                    </Text> )}
                  </Pressable>
               </View>
                <TouchableOpacity 
                  style ={styles.logoContainer}
                  onPress={() => setQuestionModal1Visible(true)} >
                  <Image style={styles.logo} source={{uri:'https://upload.wikimedia.org/wikipedia/commons/2/28/Question_mark_white.png'}}/>
                </TouchableOpacity>
              </View> 

              <View style ={{flexDirection:'row'}}>
              <View style={{alignItems:'column',paddingRight:5}}>
                <QuestionModal2 isVisible={isQuestionModal2Visible} onClose={() => setQuestionModal2Visible(false)}/>
                <Text style={standards.regularText}>BMI</Text>
                <View style = {styles.bodyCompContainers}>
                  <Text style = {[standards.smallText,{textAlign:'center'}]}>
                    {lastBMI ? `${lastBMI}` : '__'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style ={styles.logoContainer}
                onPress={() => setQuestionModal2Visible(true)}>
                <Image style={styles.logo} source={{uri:'https://upload.wikimedia.org/wikipedia/commons/2/28/Question_mark_white.png'}}/>
              </TouchableOpacity>
              </View>
 
              <View style={{flexDirection:'row'}}>
                <View style={{alignItems:'column', paddingRight:5}}>
                  <QuestionModal3 isVisible={isQuestionModal3Visible} onClose={() => setQuestionModal3Visible(false)}/>
                  <Text style={standards.regularText}>BMR</Text>
                <BMRTouchable isVisible={isBMRTouchableVisible} onClose={() => setBMRTouchableVisible(false)}/>
                  <Pressable 
                    style = {({ pressed }) => [styles.bodyCompContainers]}
                    onPress={() => setBMRTouchableVisible(true)}> 
                    {({ pressed }) => (
                    <Text style = {[standards.smallText,{textAlign:'left'},{color: pressed ? '#6a5acd' : '#e0e0e0'}]}>
                      {lastBMR ? `${lastBMR}` : '__'}
                    </Text> )}
                  </Pressable>
                  </View>
                  <TouchableOpacity 
                      style ={styles.logoContainer}
                      onPress={() => setQuestionModal3Visible(true)}>
                    <Image style={styles.logo} source={{uri:'https://upload.wikimedia.org/wikipedia/commons/2/28/Question_mark_white.png'}}/>
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
  tabBarStyle: {
    backgroundColor: '#2c2c2e',
    padding:0,
    margin:0,
    height:screenHeight*0.04
  },
  tabStyle: {
    backgroundColor: 'transparent',
  },
  tabBase: {
    flex:1,
    margin:-4,
    backgroundColor:'transparent',
  },
  activeTab: {
    backgroundColor: '#6a5acd',
  },
  tabText: {
    color: '#e0e0e0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabContainer: {
    height: screenHeight,
    width: screenWidth,
    alignSelf:'center',
    justifyContent:'flex-start',
    flexDirection:'column',
    alignItems: 'center',
    backgroundColor: '#1a1b1c',
    padding:15
  },
  bodyCompContainers: {
    alignSelf:'center',
    height: screenHeight*0.03,
  },
  logoContainer: {
    width: screenWidth*0.05,
    height: screenHeight*0.025,
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

