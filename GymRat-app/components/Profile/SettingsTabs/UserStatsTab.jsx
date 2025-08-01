import React, { useState, useRef } from 'react'
import { LinearGradient } from 'expo-linear-gradient';
import {Animated, Text, StyleSheet, Pressable, View, Modal, TextInput, Dimensions, TouchableWithoutFeedback, Alert} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';


const { width: screenWidth } = Dimensions.get('window');
const SIDEBAR_WIDTH = screenWidth * 0.7; //Exactly half the screen

const UserStatsTab = () => {
    const more = true

    const [form, setForm] = useState({
        sex:'',
        height:'',
        weight:'',
        age:'',
        bmi:'',
        bodyfat:'',
    })

    const db = useSQLiteContext();

    const handleSubmit = async () => {
        try {

        await db.runAsync(
            'INSERT INTO userStats (sex, height, weight, age, bmi, bodyfat) VALUE (?,?,?,?,?,?)',
            [form.sex, form. height, form.weight, form.age, form.bmi, form.bodyfat]
        )

        Alert.alert("Success, User added succesfully")
        setform({

        })

        } catch (error) {
            console.error(error);
            Alert.alert('error', error.message || 'An error occured while adding user stats')
        }
    }
    
    const [isTabVisible, setIsTabVisible] = useState(false);
    const sidebarTranslateX = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;


    const renderMore = () => {
        if(more) {
            return(
                <View> 
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
                <Modal visible={isTabVisible} transparent animationType='none' onRequestClose={ handleSubmit } >
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
                            margin:40
                        }} >                         

                        <View style={styles.container}>
                            <View style={styles.inputRow}>
                                <Text style={styles.inputLabel}>Sex:</Text>
                                <TextInput
                                style={styles.inputFieldTest}
                                value={form.sex}
                                onChangeText={ (text) => setForm({ ...form, sex: text})}
                                placeholder= "Male"
                                placeholderTextColor="white"
                                keyboardType="default"
                                />
                            </View>

                            <View style={styles.inputRow}>
                                <Text style={styles.inputLabel}>Height:</Text>
                                <TextInput
                                style={styles.inputFieldTest}
                                value={form.height}
                                onChangeText={(text) => setForm({ ...form, height: text})}
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
                                value={form.weight}
                                onChangeText={(text) => setForm({ ...form, weight: text})}
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
                                value={form.age}
                                onChangeText={(text) => setForm({ ...form, age: text})}
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
                                value={form.bmi}
                                onChangeText={(text) => setForm({ ...form, bmi: text})}
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
                                value={form.bodyFat}
                                onChangeText={(text) => setForm({ ...form, bodyfat: text})}
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
        backgroundColor: 'black',
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


export default UserStatsTab