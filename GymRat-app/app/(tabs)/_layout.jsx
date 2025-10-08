
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Image } from 'expo-image';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createMaterialTopTabNavigator();

function TabBarIcon({ focused, selected, unselected }) {
  return (
    <Image
      style={{ width: 25, height: 25, opacity: focused ? 1 : 0.7 }}
      source={focused ? selected : unselected}
    />
  );
}

import { useRef, useState } from 'react';
import FoodModal from '../../components/FoodModal.jsx';

function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const [scanExpanded, setScanExpanded] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;
  const [foodModalVisible, setFoodModalVisible] = useState(false);

  const toggleScan = () => {
    setScanExpanded((prev) => !prev);
    Animated.spring(anim, {
      toValue: scanExpanded ? 0 : 1,
      useNativeDriver: true,
    }).start();
  };

  const leftTranslate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -60],
  });
  const rightTranslate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 60],
  });
  const upTranslate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -80],
  });

  // Helper to render normal tab
  const renderTab = (route, index, iconProps, focused, onPress) => (
    <TouchableOpacity
      key={route.key}
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      accessibilityLabel={descriptors[route.key].options.tabBarAccessibilityLabel}
      testID={descriptors[route.key].options.tabBarTestID}
      onPress={onPress}
      style={styles.tabButton}
      activeOpacity={0.7}
    >
      <TabBarIcon focused={focused} {...iconProps} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.tabBar, { bottom: 16 + (insets.bottom || 0) }]}> 
      {state.routes.map((route, index) => {
        // Icon logic
        let iconProps = {};
        switch (route.name) {
          case 'home':
            iconProps = {
              selected: require('../../assets/images/home(selected).png'),
              unselected: require('../../assets/images/home3.png'),
            };
            break;
          case 'workout':
            iconProps = {
              selected: require('../../assets/images/arm(selected).png'),
              unselected: require('../../assets/images/arm2.png'),
            };
            break;
          case 'barcodeScanner':
            // Special scan tab
            return (
              <View key={route.key} style={styles.scanWrapper}>
                <TouchableOpacity
                  style={[styles.tabButton, scanExpanded && styles.closeButton]}
                  onPress={toggleScan}
                  activeOpacity={0.7}
                >
                  <Image
                    style={{ width: 25, height: 25, tintColor: '#fff' }}
                    source={
                      scanExpanded
                        ? require('../../assets/images/close.png')
                        : require('../../assets/images/barcode-scan2.png')
                    }
                  />
                </TouchableOpacity>

                {/* Left option: Barcode */}
                {scanExpanded && (
                  <Animated.View
                    style={[
                      styles.option,
                      {
                        transform: [
                          { translateX: leftTranslate },
                          { translateY: upTranslate },
                        ],
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.optionBtn}
                      onPress={() => {
                        toggleScan();
                        navigation.navigate('barcodeScanner');
                      }}
                    >
                      <Image
                        style={{ width: 25, height: 25, tintColor: '#fff' }}
                        source={require('../../assets/images/barcode-scan2.png')}
                      />
                    </TouchableOpacity>
                  </Animated.View>
                )}

                {/* Right option: Add Food */}
                {scanExpanded && (
                  <Animated.View
                    style={[
                      styles.option,
                      {
                        transform: [
                          { translateX: rightTranslate },
                          { translateY: upTranslate },
                        ],
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.optionBtn}
                      onPress={() => {
                        toggleScan();
                        setFoodModalVisible(true)
                      }}
                    >
                      <Image
                        style={{ width: 25, height: 25, tintColor: '#fff' }}
                        source={require('../../assets/images/apple2.png')}
                      />
                    </TouchableOpacity>
                  </Animated.View>
                )}
                <FoodModal
                  visible={foodModalVisible}
                  onClose={() => setFoodModalVisible(false)}
                />
              </View>
            );
          case 'nutrition':
            iconProps = {
              selected: require('../../assets/images/apple(selected).png'),
              unselected: require('../../assets/images/apple2.png'),
            };
            break;
          case 'profile':
            iconProps = {
              selected: require('../../assets/images/user(selected).png'),
              unselected: require('../../assets/images/user2.png'),
            };
            break;
          default:
            break;
        }
        const focused = state.index === index;
        const onPress = () => {
          if (!focused) {
            navigation.navigate(route.name);
          }
        };
        return renderTab(route, index, iconProps, focused, onPress);
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    left: 18,
    right: 18,
    borderRadius: 24,
    backgroundColor: '#2c2c2e',
    borderWidth: 0,
    borderTopWidth: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    height: 60,
    zIndex: 100,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  scanWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    backgroundColor: '',
  },
  option: {
    position: 'absolute',
  },
  optionBtn: {
    backgroundColor: '#444',
    padding: 18,
    borderRadius: 35,
  },
});


export default function TabLayout() {
  return (
    <Tab.Navigator
      initialRouteName="home"
      tabBarPosition="bottom"
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        swipeEnabled: true,
      }}
    >
      <Tab.Screen
        name="home"
        component={require('./home.jsx').default}
      />
      <Tab.Screen
        name="workout"
        component={require('./workout.jsx').default}
      />
      <Tab.Screen
        name="barcodeScanner"
        component={require('./barcodeScanner.jsx').default}
      />
      <Tab.Screen
        name="nutrition"
        component={require('./nutrition.jsx').default}
      />
      <Tab.Screen
        name="profile"
        component={require('./profile.jsx').default}
      />
    </Tab.Navigator>
  );
}
