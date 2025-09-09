import { React, useState } from 'react';
import { StyleSheet, Dimensions, TouchableOpacity, Image, View, Modal, Pressable } from 'react-native';
import { Layout, Tab, TabView, Text } from '@ui-kitten/components'
import { useRouter } from 'expo-router';
import Calendar from './ProfileCalendar'
import { QuestionModal1, QuestionModal2, QuestionModal3 } from './bodyTabModals'


const { height: screenHeight } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');

const TopTab = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isQuestionModal1Visible, setQuestionModal1Visible] = useState(false);
  const [isQuestionModal2Visible, setQuestionModal2Visible] = useState(false);
  const [isQuestionModal3Visible, setQuestionModal3Visible] = useState(false);
  const router = useRouter();

  return (
      <TabView 
      selectedIndex={selectedIndex} 
      onSelect={index => setSelectedIndex(index)} 
      indicatorStyle={styles.indicator}
      style={{backgroundColor: '#2a2a2aff', borderTopWidth:3, borderRadius:1, borderColor:'#6a5acd'}}
      >
        <Tab 
          title={evaProps => <Text {...evaProps} style={styles.tabText}>Overview</Text>}
          style={styles.tabStyle}
        >         
          <Layout style={styles.tabContainer}>
              <Calendar />
              <TouchableOpacity style = {{margin: 20, width: screenWidth*0.95, height: 120, borderWidth:3, borderRadius: 10, borderColor: '#6a5acd'}}
              onPress={() => router.push('/ExerciseGoals')}
              >
                <Text category='h6' style = {{color:'white', position: 'absolute', fontWeight: 'bold', marginLeft:8 }}>Exercise Goals</Text>
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
                        <TouchableOpacity style = {styles.bodyCompContainers}>
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
                        <TouchableOpacity style = {styles.bodyCompContainers}>
                          <Text category='h7' style = {textStyles.compBodyText}>-</Text>
                        </TouchableOpacity>
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
                        <TouchableOpacity style = {styles.bodyCompContainers}>
                          <Text category='h7' style = {textStyles.compBodyText}>-</Text>
                        </TouchableOpacity>
                      </View>
                </View>
            </View>

            <View style={{width:screenWidth*0.95, height:100, borderWidth:3, borderRadius:8, borderColor:'#6a5acd'}}>
              <Text category='h6' style={textStyles.compText}>Goals</Text>
              <View style = {{ flexDirection:'row', alignItems: 'center', justifyContent: 'flex-start' }}>

                <View>
                  <View style={{flexDirection:'row'}}>
                    <Text category='h6' style={textStyles.compTitlesText}>Goal Weight</Text>
                  </View>
                  <TouchableOpacity style = {styles.bodyCompContainers}>
                    <Text category='h7' style = {textStyles.compBodyText}>- </Text>
                  </TouchableOpacity>
                </View>  

                <View>
                  <View style={{flexDirection:'row'}}>
                    <Text category='h6' style={textStyles.compTitlesText}>Gain Speed</Text>
                  </View>
                  <TouchableOpacity style = {styles.bodyCompContainers}>
                    <Text category='h7' style = {textStyles.compBodyText}>- </Text>
                  </TouchableOpacity>
                </View>    

                <View>
                  <View style={{flexDirection:'row'}}>
                    <Text category='h6' style={textStyles.compTitlesText}>Activity Level</Text>
                  </View>
                  <TouchableOpacity style = {styles.bodyCompContainers}>
                    <Text category='h7' style = {textStyles.compBodyText}>- </Text>
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
    backgroundColor: '#2a2a2aff',
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
    backgroundColor: '#2a2a2aff',
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
    marginLeft:4,
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
    fontSize: 15
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

