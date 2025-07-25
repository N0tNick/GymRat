import React, { useState, useRef } from 'react'
import {Animated, Text, StyleSheet, Pressable, View, Modal, TouchableWithoutFeedback, Dimensions} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';


const { width: screenWidth } = Dimensions.get('window');
const SIDEBAR_WIDTH = screenWidth * 0.65; //Exactly half the screen

const UserGoalsTab = () => {
    const more = true
    const router = useRouter();
    const [isTabVisible, setIsTabVisible] = useState(false);
    const sidebarTranslateX = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;


    const renderMore = () => {
        if(more) {
            return(
                <View style = {styles.container}> 
                    <Pressable onPress={openSidebar} style = {({pressed}) => [styles.btn, pressed && styles.pressed]}>
                        <Text style = {{ color: '#ffffff' }}>Goals</Text>
                    </Pressable>          
                </View> 
            )
        }
    }

    const openSidebar = () => {
        setIsTabVisible(true)
        Animated.timing(sidebarTranslateX, {
            toValue:0,
            duration:200,
            useNativeDriver:true,
        }).start();
    }
        
    const closeSidebar = () => {
        Animated.timing(sidebarTranslateX, {
            toValue:SIDEBAR_WIDTH,
            duration:200,
            useNativeDriver:true,
        }).start(() => setIsTabVisible(false));
    }

    const renderSidebar = () => {
            return(
                <Modal visible={isTabVisible} transparent onExplicitClose animationType='none' >
                    <TouchableWithoutFeedback onPress={closeSidebar}>
                        <View style={{flex:1}}/>
                    </TouchableWithoutFeedback>
                    <Animated.View style = {{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        backgroundColor:'black',
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
                            justifyContent:'flex-start',
                            alignItems:'center',
                            height:'100%',
                            width:'100%',
                        }} >
                                                    
                        </View>
                        

                    </Animated.View>
                </Modal>                      
            )
    }

    return (
        <View style = {{
            flexDirection:'row',
            justifyContent:'space-between',
            alignItems:'center',
            height:'100%',
            width:'100%',
        }} >
            {renderMore()}  
            {renderSidebar()}
        </View>
    )
}

const styles = StyleSheet.create ({
    container: {
        flex:1,
    },

    btn: {
        backgroundColor: 'black',
        padding: 40,
        borderRadius: 5
    },

    pressed: {
        opacity: 0.8
    }
});


export default UserGoalsTab