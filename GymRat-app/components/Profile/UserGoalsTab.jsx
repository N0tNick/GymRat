import React, { useState, useRef } from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import {Animated, Text, StyleSheet, Pressable, View, Modal, TouchableWithoutFeedback, Dimensions, TextInput, TouchableOpacity} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';


const { width: screenWidth } = Dimensions.get('window');
const SIDEBAR_WIDTH = screenWidth * 0.7; //Exactly half the screen

const UserGoalsTab = () => {
    const more = true
    const router = useRouter();
    const [nutGoal, setNutGoal] = useState('')
    const [goalWeight, setGoalWeight] = useState('')
    const [gainSpeed, setGainSpeed] = useState('')

    const [lose, setLose] = React.useState(false);
    const [maintain, setMaintain] = React.useState(false);
    const [gain, setGain] = React.useState(false);

    const handlePress = (goal) => {
        if (goal === 'lose') {
            setLose(true);
            setMaintain(false);
            setGain(false);
        } else if (goal === 'maintain') {
            setLose(false);
            setMaintain(true);
            setGain(false);
        } else if (goal === 'gain') {
            setLose(false);
            setMaintain(false);
            setGain(true);
        }
    }

    const [isTabVisible, setIsTabVisible] = useState(false);
    const sidebarTranslateX = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;


    const renderMore = () => {
        if(more) {
            return(
                <View> 
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
                        backgroundColor:'white',
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
                            width:'85%',
                            justifyContent:'center',
                            margin:25
                        }} >   
                            <View style = {{ 
                                flexDirection:'row',
                                width: '40%',
                                marginRight:200,
                                marginBottom:20,
                                gap:8
                            }} >
                            <TouchableOpacity style={[styles.button, {backgroundColor: lose ? '#5f0a9cff' : '#1a1b1c'}]} onPress={() => handlePress('lose')}>
                                <Text style={[styles.text, {fontSize: 15}]}>Lose Weight</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, {backgroundColor: maintain ? '#5f0a9cff' : '#1a1b1c'}]} onPress={() => handlePress('maintain')}>
                                <Text style={[styles.text, {fontSize: 15}]}>Maintain Weight</Text>
                            </TouchableOpacity> 
                            <TouchableOpacity style={[styles.button, {backgroundColor: gain ? '#5f0a9cff' : '#1a1b1c'}]} onPress={() => handlePress('gain')}>
                                <Text style={[styles.text, {fontSize: 15}]}>Gain Weight</Text>
                            </TouchableOpacity>  
                            </View>
                            <View style={styles.inputRow}>
                                <Text style={styles.inputLabel}>Goal Weight:</Text>
                                <TextInput
                                style={styles.inputFieldTest}
                                value={goalWeight}
                                onChangeText={setGoalWeight}
                                placeholder="%"
                                maxLength={3}
                                placeholderTextColor="white"
                                keyboardType="decimal-pad"
                                />
                            </View>

                            <View style={styles.inputRow}>
                                <Text style={styles.inputLabel}>Gain Speed:</Text>
                                <TextInput
                                style={styles.inputFieldTest}
                                value={gainSpeed}
                                onChangeText={setGainSpeed}
                                placeholder="%"
                                maxLength={2}
                                placeholderTextColor="white"
                                keyboardType="decimal-pad"
                                />
                            </View>     
                        </View>
                        

                    </Animated.View>
                </Modal> 
            )
    }

    return (
        <View style = {{
        }} >
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
        backgroundColor: 'black',
        padding: 25,
        borderRadius: 10
    },
    button: {
        backgroundColor: '#5e17a0ff',
        padding: 8,
        borderRadius: 5,
        alignItems: 'center',
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
        backgroundColor: '#232f30',
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
        fontSize: 18,
        fontWeight: 'bold',
        width: '45%'
    },
});


export default UserGoalsTab