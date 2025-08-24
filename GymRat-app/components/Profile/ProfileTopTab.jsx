import React from 'react';
import { StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
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
      style={{borderTopWidth:4, borderRadius:10, borderColor:'#6a5acd'}}
      >
        <Tab 
          title={evaProps => <Text {...evaProps} style={styles.tabText}>Overview</Text>}
          style={styles.tabStyle}
        >         
          <Layout style={styles.tabContainer}>
            <Text category='h5' style={styles.tabText}>OVERVIEW</Text>
            <Calendar/>
            <TouchableOpacity style = {{margin: 20, width: screenWidth*0.9, height: 120, borderWidth:6, borderRadius: 10, borderColor: '#6a5acd'}}
            onPress={() => router.push('/ExerciseGoals')}
            >
              <Text category='h6' style = {{color:'#6a5acd', position: 'absolute', fontWeight: 'bold' }}>Exercise Goals</Text>
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
            <Text category='h5' style={styles.tabText} >BODY</Text>
          </Layout>
        </Tab>

        <Tab 
          title={evaProps => <Text {...evaProps} style={styles.tabText}>Goals</Text>}
          style={styles.tabStyle}
        >         
          <Layout style={styles.tabContainer}>
            <Text category='h5' style={styles.tabText} >GOALS</Text>
          </Layout>
        </Tab>

      </TabView>
    );
}

export default TopTab

const styles = StyleSheet.create({
  tabStyle: {
    padding:5, 
    backgroundColor: 'white',
    margin:2
  },
  tabText: {
    color: '#6a5acd',
    fontSize: 16,
    fontWeight: 'bold',
  },
  indicator: {
    backgroundColor: '#6a5acd',
    height: 10,
  },
  tabContainer: {
    height: screenHeight,
    width: screenWidth,
    alignItems: 'center',
    backgroundColor: '#2a2a2aff',
    padding:10
  },
});
