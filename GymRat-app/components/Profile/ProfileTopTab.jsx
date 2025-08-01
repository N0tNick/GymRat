import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Layout, Tab, TabView, Text } from '@ui-kitten/components'

const { height: screenHeight } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');

const TopTab = () => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  return (
      <TabView selectedIndex={selectedIndex} onSelect={index => setSelectedIndex(index)} >
        <Tab title='Overview'>
          <Layout style={styles.tabContainer}>
            <Text category='h5'>
            </Text>
          </Layout>
        </Tab>
        <Tab title='Body'>
          <Layout style={styles.tabContainer}>
            <Text category='h5'>
            </Text>
          </Layout>
        </Tab>
        <Tab title='Goals'>
          <Layout style={styles.tabContainer}>
            <Text category='h5'>
            </Text>
          </Layout>
        </Tab>
      </TabView>
    );
  /*
    <View style = {{ flexDirection:'row' }}>
        <Tab.Navigator initialRoute = {Overview} style = {{ width: Dimensions.get('window').width }} >
        <Tab.Screen name="OverView" component={Overview} />
        <Tab.Screen name="Body" component={Profile} />
        <Tab.Screen name="Goals" component={Goals} />
        </Tab.Navigator>

    </View>
  );
  */
}

export default TopTab


const ScreenStyles = StyleSheet.create ({
    default: {
        tabBarLabelStyle: { fontSize: 12 },
        tabBarItemStyle: { width: 80 },
        tabBarStyle: { backgroundColor: 'purple' },
    }
})

const styles = StyleSheet.create({
  tabContainer: {
    height: screenHeight,
    //width: screenWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
