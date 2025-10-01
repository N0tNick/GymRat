import React, { useState, useRef } from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import {Animated, Text, StyleSheet, Pressable, View, Modal, TouchableWithoutFeedback, Dimensions, TextInput} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';


const { width: screenWidth } = Dimensions.get('window');
const SIDEBAR_WIDTH = screenWidth * 0.7; //Exactly half the screen

const UserSettingsTab = () => {
    const more = true
    const router = useRouter();
    const [username, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [dob, setDob] = useState('');
    const [theme, setTheme] = useState('');
    const [reminders, setReminders] = useState('');

    const [isTabVisible, setIsTabVisible] = useState(false);
    const sidebarTranslateX = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;
    

    const renderMore = () => {
        if(more) {
            return(
                <View> 
                    <Pressable onPress={openSidebar} style = {({pressed}) => [styles.btn, pressed && styles.pressed]}>
                        <Text style = {{ color: '#ffffff' }}>Settings</Text>
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
                <Modal visible={isTabVisible} transparent animationType='none' >
                    <TouchableWithoutFeedback onPress={closeSidebar}>
                        <View style={{flex:1}}/>
                    </TouchableWithoutFeedback>
                    <Animated.View style = {{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        height: '100%',
                        backgroundColor:'#2c2c2e',
                        shadowColor: '#000',
                        shadowOffset: { width: -2, height: 0 },
                        shadowOpacity: 0.3,
                        shadowRadius: 5,
                        elevation: 10,
                        paddingTop: 50, 
                        paddingHorizontal: 20,
                        paddingBottom: 20,
                        width: SIDEBAR_WIDTH, 
                        transform:[{ translateX: sidebarTranslateX }]
                    }}>
                        <View style = {{
                            flex:1,
                            flexDirection:'column',
                            alignItems:'center',
                            width:'80%',
                            justifyContent:'center',
                            margin:45
                        }} >                         
                        
                            <View style={styles.container}>
                                <View style={styles.inputRow}>
                                    <Text style={styles.inputLabel}>Username:</Text>
                                    <TextInput
                                        style={styles.inputFieldTest}
                                        value={username}
                                        onChangeText={setUserName}
                                        placeholder="ft"
                                        maxLength={3}
                                        placeholderTextColor="white"
                                        keyboardType="numeric"
                                        />
                                </View>
                        
                                <View style={styles.inputRow}>
                                    <Text style={styles.inputLabel}>Email:</Text>
                                    <TextInput
                                        style={styles.inputFieldTest}
                                        value={email}
                                        onChangeText={setEmail}
                                        placeholder="lbs"
                                        maxLength={3}
                                        placeholderTextColor="white"
                                        keyboardType="numeric"
                                    />
                                </View>
                        
                                <View style={styles.inputRow}>
                                    <Text style={styles.inputLabel}>Date of Birth:</Text>
                                    <TextInput
                                        style={styles.inputFieldTest}
                                        value={dob}
                                        onChangeText={setDob}
                                        placeholder="years"
                                        maxLength={3}
                                        placeholderTextColor="white"
                                        keyboardType="numeric"
                                    />
                                </View>
                        
                                <View style={styles.inputRow}>
                                    <Text style={styles.inputLabel}>Reminders:</Text>
                                    <TextInput
                                        style={styles.inputFieldTest}
                                        value={reminders}
                                        onChangeText={setReminders}
                                        placeholder="kg/m²"
                                        maxLength={2}
                                        placeholderTextColor="white"
                                        keyboardType="decimal-pad"
                                    />
                                 </View>
                        
                                <View style={styles.inputRow}>
                                    <Text style={styles.inputLabel}>Theme:</Text>
                                    <TextInput
                                        style={styles.inputFieldTest}
                                        value={theme}
                                        onChangeText={setTheme}
                                        placeholder="%"
                                        maxLength={2}
                                        placeholderTextColor="white"
                                        keyboardType="decimal-pad"
                                    />
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                </Modal>                      
            )
    }

    return (
        <View>
            {renderMore()}  
            {renderSidebar()}
        </View>
    )
}

const styles = StyleSheet.create ({
    container: {
        flex:1,
        justifyContent: 'center'
    },

    btn: {
        backgroundColor: '#2c2c2e',
        padding: 25,
        borderRadius: 10
    },

    pressed: {
        opacity: 0.8
    },

    text: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    homeButton: {
        marginTop: 20,
        backgroundColor: '#2c2c2e',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
    },
    homeButtonText: {
        color: '#fff',
        fontSize: 18,
    },
    logo: {
        width: 180,
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputFieldTest: {
        height: 50,
        borderColor: 'black',
        borderWidth: 3,
        width: '100%', 
        backgroundColor: '#fff',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width:'80%',
        margin:5
    },
    inputLabel: {
        color: 'black',
        fontSize: 17,
        fontWeight: 'bold',
        width: '65%'
    },
});


export default UserSettingsTab