import React from 'react';
import { StyleSheet, Dimensions, TouchableOpacity, Image, View } from 'react-native';
import { Layout, Tab, TabView, Text } from '@ui-kitten/components'
import { useRouter } from 'expo-router';
import Calendar from './ProfileCalendar'


const { height: screenHeight } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');

const TopTab = () => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
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
              <Calendar/>
              <TouchableOpacity style = {{margin: 20, width: screenWidth*0.9, height: 120, borderWidth:6, borderRadius: 10, borderColor: '#6a5acd'}}
              onPress={() => router.push('/ExerciseGoals')}
              >
                <Text category='h6' style = {{color:'white', position: 'absolute', fontWeight: 'bold' }}>Exercise Goals</Text>
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
            <View style={{width:screenWidth*0.95, height:100, borderWidth:3, borderRadius:8, borderColor:'#6a5acd'}}>
              <Text category='h6' style={textStyles.compText}>Composition</Text>
                <View style = {{ flexDirection:'row',justifyContent: 'center' }}>
                      <View>
                        <Text category='h6' style={textStyles.bodyText}>Weight</Text>
                        <TouchableOpacity style = {styles.bodyCompContainers}>
                          <Text category='h7' style = {{position:'absolute', marginTop:20, color:'white', fontSize:'14', fontWeight:'bold'}}>-</Text>
                        </TouchableOpacity>
                      </View>
                      <View>
                        <Text category='h6' style={textStyles.bodyText}>Body Fat %</Text>
                        <TouchableOpacity style = {styles.bodyCompContainers}>
                          <Text category='h7' style = {{position:'absolute', marginTop:20, color:'white', fontSize:'14', fontWeight:'bold'}}>-</Text>
                        </TouchableOpacity>
                      </View>
                      <View>
                        <Text category='h6' style={textStyles.bodyText}>BMI</Text>
                        <TouchableOpacity style = {styles.bodyCompContainers}>
                          <Text category='h7' style = {{position:'absolute', marginTop:20, color:'white', fontSize:'14', fontWeight:'bold'}}>-</Text>
                        </TouchableOpacity>
                      </View>
                </View>
            </View>
          </Layout>
        </Tab>

        <Tab 
          title={evaProps => <Text {...evaProps} style={styles.tabText}>Goals</Text>}
          style={styles.tabStyle}
        >         
          <Layout style={styles.tabContainer}>
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
    alignItems: 'center',
    backgroundColor: '#2a2a2aff',
    padding:10
  },
  bodyCompContainers: {
    marginTop: 30, 
    marginLeft:5, 
    width: screenWidth*0.3, 
    height: 80
  },
});

const textStyles = StyleSheet.create({
  compText: {
    paddingLeft: 5, 
    color:'white', 
    position: 'absolute', 
    fontWeight: 'bold', 
    fontSize: '16'
  },

  bodyText: {
    marginTop:30,
    paddingLeft:5,
    color:'white', 
    position: 'absolute', 
    fontWeight: 'bold', 
    fontSize: '14'
  }
})



