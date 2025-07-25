import React, { useState, useRef } from 'react'
import {Animated, TouchableOpacity, View, StyleSheet, TouchableWithoutFeedback, Modal, Image, Dimensions} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import UserSettingsTab from '../components/Profile/UserSettingsTab'
import UserStatsTab from '../components/Profile/UserStatsTab'
import UserGoalsTab from '../components/Profile/UserGoalsTab'

const { width: screenWidth } = Dimensions.get('window');
const SIDEBAR_WIDTH = screenWidth * 0.35; //Exactly half the screen

const SettingsWheel = () => {
    const more = true
    const router = useRouter();
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const sidebarTranslateX = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;

    const renderMore = () => {
        if(more) {
            return(
                <TouchableOpacity
                style = {styles.logo}
                onPress={() => openSidebar()}
                >
                    <Image
                    style={styles.logo}
                    source={{
                        uri: 'https://cdn-icons-png.flaticon.com/512/15/15185.png',
                    }}
                    />
                </TouchableOpacity>
            )
        }
    }

    const openSidebar = () => {
        setIsSidebarVisible(true);
        Animated.timing(sidebarTranslateX, {
            toValue:0,
            duration:100,
            useNativeDriver:false,
        }).start();
    }
    
     const closeSidebar = () => {
        Animated.timing(sidebarTranslateX, {    
            toValue: SIDEBAR_WIDTH,
            duration:150,
            useNativeDriver:false,
        }).start(() => setIsSidebarVisible(false));
    }

    const renderSidebar = () => {
        return(
            <Modal visible={isSidebarVisible} transparent animationType='none' >
                <TouchableWithoutFeedback onPress={closeSidebar}>
                    <View style={{flex:1}}/>
                </TouchableWithoutFeedback>

                <Animated.View style = {{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    height: '100%',
                    backgroundColor:'white',
                    shadowColor: '#000',
                    shadowOffset: { width: -2, height: 0 },
                    shadowOpacity: 0.3,
                    shadowRadius: 5,
                    elevation: 10,
                    paddingTop: 50, 
                    paddingHorizontal: 0,
                    paddingBottom: 20,
                    width: SIDEBAR_WIDTH, 
                    transform:[{ translateX: sidebarTranslateX }]
                }}>
                    <View style = {{
                        flexDirection:'column',
                        alignItems:'center',
                        height:'100%',
                        width:'100%',
                    }} >
                        <TouchableOpacity onPress={closeSidebar}
                            style={{alignSelf:'flex-end', marginBottom: 20}}>
                                <Image
                                style={styles.logo}
                                source={{
                                    uri: 'https://cdn-icons-png.flaticon.com/512/15/15185.png',
                                }}
                                />
                        </TouchableOpacity>
                        
                        <View style={{flexDirection: 'column', flex: 0.2}}>
                            <UserSettingsTab/>  
                            <UserStatsTab/>
                            <UserGoalsTab/>
                        </View>
                        
                        
                    </View>
                    

                </Animated.View>
            </Modal>                      
        )
    }
    
    return (
        <View style = {{
            flexDirection:'row',
            alignItems:'center',
            flex: 1,
            height:'100%',
            width:'100%',
        }} >
            {renderMore()}
            {renderSidebar()}
            
        </View>
    );
}
 
const styles = StyleSheet.create ({
    logo: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },

});

export default SettingsWheel
