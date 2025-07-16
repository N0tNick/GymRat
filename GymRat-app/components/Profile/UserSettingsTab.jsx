import React, { useState, useRef } from 'react'
import {Animated, TouchableOpacity, View, StyleSheet, TouchableWithoutFeedback, Modal, Image} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const UserSettingsTab = () => {
    more = true
    const router = useRouter();
    const [isTabVisible, setIsTabVisible] = useState(false);
    const sidebarTranslateX = useRef(new Animated.Value(300)).current;

    const renderMore = () => {
        if(more) {
            return(
                <TouchableOpacity
                    style = {styles.logo}
                    onPress={() => openSidebar()}
                >
                        
                </TouchableOpacity>
            )
        }
    }

    const openSidebar = () => {
        setIsSidebarVisible(true);
        Animated.timing(sidebarTranslateX, {
            toValue:0,
            duration:150,
            useNativeDriver:true,
        }).start();
    }
        
    const closeSidebar = () => {
        Animated.timing(sidebarTranslateX, {
            toValue:300,
            duration:150,
            useNativeDriver:true,
        }).start(() => setIsSidebarVisible(false));
    }

}


export default UserSettingsTab