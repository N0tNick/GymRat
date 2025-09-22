import { React, useState } from 'react';
import { StyleSheet, Dimensions, TouchableOpacity, Image, View, Modal, Pressable, Text } from 'react-native';
import { Layout, Tab, TabView } from '@ui-kitten/components'
import { useRouter } from 'expo-router';
import Calendar from './ProfileCalendar'
import { QuestionModal1, QuestionModal2, QuestionModal3, WeightTouchable ,GoalWeightTouchable, BodyFatTouchable, BMRTouchable } from './bodyTabModals'


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
      
  return (
      <TabView 
      selectedIndex={selectedIndex} 
      onSelect={index => setSelectedIndex(index)} 
      indicatorStyle={styles.indicator}
      style={{backgroundColor: '#1a1b1c', borderTopWidth:3, borderRadius:1, borderColor:'#6a5acd'}}
      >
        <Tab 
          title={evaProps => <Text {...evaProps} style={styles.tabText}>Overview</Text>}
          style={styles.tabStyle}
        >         
          <Layout style={styles.tabContainer}>
              <Calendar />
              <TouchableOpacity style = {{margin: 20, width: screenWidth*0.95,height: 120, borderWidth:3, borderRadius: 10, borderColor: '#6a5acd'}}
              onPress={() => router.push('/ExerciseGoals')}
              >
                <Text style = {{color:'white', position: 'absolute', fontWeight: 'bold', marginLeft:8,fontSize:16 }}>Exercise Goals</Text>
                <Image style={{width: 50, height: 50, position:'absolute', right:20, marginTop: 25, borderWidth: 2, borderRadius:25, borderColor:'gray', backgroundColor:'white'}} 
                  source={{
                    uri: 'https://www.freeiconspng.com/thumbs/plus-icon/plus-icon-black-2.png',
                  }}
                />
              </TouchableOpacity>
          </Layout>
        </Tab>

        <Tab 
          title={evaProps => <Text {...evaProps} style={styles.tabText}>Body</Text>}
          style={styles.tabStyle}
        >         
          <Layout style={styles.tabContainer}>

            <View style={{width:screenWidth*0.95, height:100, marginBottom:20,borderWidth:3, borderRadius:8, borderColor:'#6a5acd'}}>
              <Text category='h6' style={textStyles.compText}>Progress</Text>
              <View style = {{ flexDirection:'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                <View>
                  <View style={{flexDirection:'row', marginRight:180}}>
                    <Text category='h6' style={textStyles.compTitlesText}>Weight</Text>
                  </View>
                  <WeightTouchable isVisible={isWeightTouchableVisible} onClose={() => setWeightTouchableVisible(false)}/>
                  <TouchableOpacity 
                    style = {styles.bodyCompContainers}
                    onPress={() => setWeightTouchableVisible(true)}>
                    <Text category='h7' style = {textStyles.compBodyText}>- </Text>
                  </TouchableOpacity>
                </View>  

                <View>
                  <View style={{flexDirection:'row'}}>
                    <Text category='h6' style={textStyles.compTitlesText}>Goal Weight</Text>
                  </View>
                  <GoalWeightTouchable isVisible={isGoalWeightTouchableVisible} onClose={() => setGoalWeightTouchableVisible(false)}/>
                  <TouchableOpacity 
                    style = {styles.bodyCompContainers}
                    onPress={() => setGoalWeightTouchableVisible(true)}>
                    <Text category='h7' style = {textStyles.compBodyText}>- </Text>
                  </TouchableOpacity>
                </View>  

              </View>
            </View>

            <View style={{width:screenWidth*0.95, height:100, borderWidth:3, borderRadius:8, borderColor:'#6a5acd', marginBottom:10}}>
              <Text category='h6' style={textStyles.compText}>Composition</Text>
                <View style = {{ flexDirection:'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                      <View>
                        <View style={{flexDirection:'row'}}>
                          <Text category='h6' style={textStyles.compTitlesText}>Body Fat %</Text>
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
                          <Text category='h7' style = {textStyles.compBodyText}>- </Text>
                        </TouchableOpacity>
                      </View>
 
                      <View>
                        <View style={{flexDirection:'row'}}>
                          <Text category='h6' style={textStyles.compTitlesText}>BMI</Text>
                          <QuestionModal2 isVisible={isQuestionModal2Visible} onClose={() => setQuestionModal2Visible(false)}/>
                          <TouchableOpacity 
                          style ={styles.logoContainer}
                          onPress={() => setQuestionModal2Visible(true)}>
                            <Image style={styles.logo} source={{uri:'https://upload.wikimedia.org/wikipedia/commons/2/28/Question_mark_white.png'}}/>
                          </TouchableOpacity>
                        </View>
                        <View 
                          style = {styles.bodyCompContainers}>
                          <Text category='h7' style = {textStyles.compBodyText}>-</Text>
                        </View>
                      </View>
 
                      <View>
                        <View style={{flexDirection:'row'}}>
                          <Text category='h6' style={textStyles.compTitlesText}>BMR</Text>
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
                          <Text category='h7' style = {textStyles.compBodyText}>-</Text>
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
    padding:2, 
    backgroundColor: '#1a1b1c',
    margin:2
  },
  tabText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  indicator: {
    backgroundColor: '#6a5acd',
    height: 4,
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
    marginTop:0, 
    marginLeft:5, 
    width: screenWidth*0.3, 
    height: 70
  },
  logoContainer: {
    width: 20,
    height: 20,
    marginTop: 30,
    marginLeft:5,
  },
  logo: {
    width:'100%',
    height:'100%'
  },
});

const textStyles = StyleSheet.create({
  compText: {
    paddingLeft: 5, 
    color:'white', 
    position: 'absolute', 
    fontWeight: 'bold', 
    fontSize: 16
  },

  compTitlesText: {
    marginTop:30,
    paddingLeft:10,
    color:'white', 
    fontWeight: 'bold', 
    fontSize: 16
  },
  compBodyText: {
    marginTop:10, 
    paddingLeft:15,
    color:'white', 
    position:'absolute', 
    fontWeight:'bold',
    fontSize:15, 
  }
})

