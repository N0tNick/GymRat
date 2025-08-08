import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Layout, Tab, TabView, Text } from '@ui-kitten/components'
import Calendar from './ProfileCalendar'


const { height: screenHeight } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');

const TopTab = () => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

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
  },
});
