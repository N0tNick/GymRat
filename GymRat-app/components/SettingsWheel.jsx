import React, { useState, useRef } from 'react'
import {Animated, TouchableOpacity, View, StyleSheet, TouchableWithoutFeedback, Modal, Image} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';



const SettingsWheel = () => {
    more = true
    const router = useRouter();
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const sidebarTranslateX = useRef(new Animated.Value(300)).current;

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

    const renderSidebar = () => {
        return(
            <Modal visible={isSidebarVisible} transparent animationType='none' >
                <TouchableWithoutFeedback onPress={closeSidebar}>
                    <View style={{flex:1}}/>
                </TouchableWithoutFeedback>

                <Animated.View style = {{
                    position:'absolute',
                    right:0,
                    width:'80%',
                    height:'100%',  
                    backgroundColor: 'white',
                    transform:[{translateX: sidebarTranslateX}],
                    padding:20,
                    shadowColor:'#000',
                    shadowOffset:{width:0, height:2},
                    shadowOpacity:0.8,
                    shadowRadius:2,
                    elevation:5,
                }}>
                    <TouchableOpacity onPress={closeSidebar}
                        style={{alignSelf:'flex-end'}}>
                            <Image
                            style={styles.logo}
                            source={{
                                uri: 'https://cdn-icons-png.flaticon.com/512/15/15185.png',
                            }}
                            />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={null}
                        syle={{}}>
                        {/*Settings Bar Component */}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={null}
                        syle={{}}>
                        {/*User Data Bar Component */}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={null}
                        syle={{}}>
                        {/*Etc Bar Component */}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={null}
                        syle={{}}>
                        {/*Etc Bar Component */}
                    </TouchableOpacity>

                </Animated.View>
            </Modal>                      
        )
    }
    
    return (
        <View style = {{
            flexDirection:'row',
            justifyContent:'space-between',
            alignItems:'Center',
            height:'100%',
            width:'100%',
            flex:1,
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
