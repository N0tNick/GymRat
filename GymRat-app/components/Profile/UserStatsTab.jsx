import React, { useState, useRef } from 'react'
import {Animated, Text, StyleSheet, Pressable, View, Modal, TextInput, Dimensions, TouchableWithoutFeedback} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';


const { width: screenWidth } = Dimensions.get('window');
const SIDEBAR_WIDTH = screenWidth * 0.65; //Exactly half the screen

const UserStatsTab = () => {
    const more = true
    const router = useRouter();
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [age, setAge] = useState('');
    const [bmi, setBmi] = useState('');
    const [bodyFat, setBodyFat] = useState('');
    
    const [isTabVisible, setIsTabVisible] = useState(false);
    const sidebarTranslateX = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;


    const renderMore = () => {
        if(more) {
            return(
                <View style = {styles.container}> 
                    <Pressable onPress={openSidebar} style = {({pressed}) => [styles.btn, pressed && styles.pressed]}>
                        <Text style = {{ color: '#ffffff' }}>Stats</Text>
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

                        <View style={styles.container}>
                            <View style={styles.inputRow}>
                                <Text style={styles.inputLabel}>Height:</Text>
                                <TextInput
                                style={styles.inputFieldTest}
                                value={height}
                                onChangeText={setHeight}
                                placeholder="ft"
                                maxLength={3}
                                placeholderTextColor="white"
                                keyboardType="numeric"
                                />
                            </View>

                            <View style={styles.inputRow}>
                                <Text style={styles.inputLabel}>Weight:</Text>
                                <TextInput
                                style={styles.inputFieldTest}
                                value={weight}
                                onChangeText={setWeight}
                                placeholder="lbs"
                                maxLength={3}
                                placeholderTextColor="white"
                                keyboardType="numeric"
                                />
                            </View>

                            <View style={styles.inputRow}>
                                <Text style={styles.inputLabel}>Age:</Text>
                                <TextInput
                                style={styles.inputFieldTest}
                                value={age}
                                onChangeText={setAge}
                                placeholder="years"
                                maxLength={3}
                                placeholderTextColor="white"
                                keyboardType="numeric"
                                />
                            </View>

                            <View style={styles.inputRow}>
                                <Text style={styles.inputLabel}>BMI:</Text>
                                <TextInput
                                style={styles.inputFieldTest}
                                value={bmi}
                                onChangeText={setBmi}
                                placeholder="kg/m²"
                                maxLength={2}
                                placeholderTextColor="white"
                                keyboardType="decimal-pad"
                                />
                            </View>

                            <View style={styles.inputRow}>
                                <Text style={styles.inputLabel}>Body Fat:</Text>
                                <TextInput
                                style={styles.inputFieldTest}
                                value={bodyFat}
                                onChangeText={setBodyFat}
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
        justifyContent: 'center'
    },

    btn: {
        backgroundColor: 'black',
        padding: 40,
        borderRadius: 5
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

    inputFieldTest: {
        height: 30,
        borderColor: 'black',
        borderWidth: 2,
    },

    logo: {
        width: 180,
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
    },
});


export default UserStatsTab