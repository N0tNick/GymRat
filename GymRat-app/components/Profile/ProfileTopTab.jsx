import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Layout, Tab, TabView, Text } from '@ui-kitten/components'

const { height: screenHeight } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');

const TopTab = () => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  return (
      <TabView 
      selectedIndex={selectedIndex} 
      onSelect={index => setSelectedIndex(index)} 
      indicatorStyle={styles.indicator}
      >
        <Tab 
          title={evaProps => <Text {...evaProps} style={styles.tabText}>Overview</Text>}
          style={styles.tabStyle}
        >          
          <Layout style={styles.tabContainer}>
            <Text category='h5' style={styles.tabText}>OVERVIEW</Text>
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
    backgroundColor: 'white'
  },
  tabText: {
    color: '#6a5acd',
    fontSize: 16,
    fontWeight: 'bold',
  },
  indicator: {
    backgroundColor: '#6a5acd',
    height: 6,
  },
  tabContainer: {
    height: screenHeight,
    width: screenWidth,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2aff'
  },
});
