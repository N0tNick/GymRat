import React, { useState, useRef } from 'react'
import {Animated, TouchableOpacity, View, StyleSheet, TouchableWithoutFeedback, Modal, Image, Dimensions, Text} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useSQLiteContext } from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@/UserContext';
import standards from '../ui/appStandards';
import wheelIcon from '../../assets/images/wheelIcon.png'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const SIDEBAR_WIDTH = screenWidth * 0.90; //Exactly half the screen

const SettingsWheel = () => {
    const db = useSQLiteContext();
    const {setUserId, setFirestoreUserId} = useUser();
    const [isAccountModal, setAccountModal] = useState(false);


    //delete account & userData
    const resetAccountData = async () => {
        await db.getAllAsync('DROP TABLE IF EXISTS users;');
        await db.getAllAsync('DROP TABLE IF EXISTS userSettings;')
        await db.getAllAsync('DROP TABLE IF EXISTS userStats;')
        await db.getAllAsync('DROP TABLE IF EXISTS dailyNutLog;')
        await db.getAllAsync('DROP TABLE IF EXISTS historyLog;')
        await db.getAllAsync('DROP TABLE IF EXISTS workoutTemplates;')
        await db.getAllAsync('DROP TABLE IF EXISTS exampleWorkoutTemplates;')
        await db.getAllAsync('DROP TABLE IF EXISTS customExercises;')
        await db.getAllAsync('DROP TABLE IF EXISTS workoutLog;')
        await db.getAllAsync('DROP TABLE IF EXISTS weightHistory;')

        console.log(`Account data reset.`);
    };

    const more = true
    const router = useRouter();
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const sidebarTranslateX = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;

    const handleSignOut = async () => {
      try {
        // sign out from Firebase
        await signOut(auth);
    
        // clear async storage
        await AsyncStorage.removeItem('firestoreUserId');
    
        // clear context values
        setUserId(null);
        setFirestoreUserId(null);
    
        // clear SQLite session cache if needed
        //await db.runAsync('DELETE FROM users');
    
        console.log('User signed out and local data cleared');
        router.replace('/login');
      } catch (err) {
        console.error('Error signing out:', err);
      }
    };

    const renderMore = () => {
        if(more) {
            return(
                <TouchableOpacity
                style = {styles.logo}
                onPress={() => openSidebar()}
                >
                    <Image
                    style={styles.logo}
                    source={wheelIcon}
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

    // Replace the Modal with an overlay view
    const accountModal = () => {
        return (
            <View style={{position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 2,
                    elevation: 20,}}>
                <TouchableOpacity
                    style={styles.overlayBackdrop}
                    activeOpacity={1}
                    onPress={() => setAccountModal(false)}
                />
                <View style={{backgroundColor:'#1a1b1c',
                            shadowColor: '#000',
                            justifyContent:'space-evenly',
                            shadowOffset: { width: -2, height: 0 },
                            shadowOpacity: 0.3,
                            shadowRadius: 5,
                            elevation: 10,
                            borderRadius:10,
                            borderWidth:2,
                            borderColor:'#6a5acd',
                            width: screenWidth * 0.55, 
                            height: screenHeight * 0.25,}}>
                    <View style={{ flexDirection:'column', alignItems:'center',}} >
                        <TouchableOpacity 
                            onPress={() => setAccountModal(false)}
                            style={{position:'absolute', right:10, top:0}}>
                            <Image style={styles.logo} source={wheelIcon} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.deleteAccountButton} onPress={() => { resetAccountData(1); handleSignOut(); }}>
                            <Text style={styles.logoutButtonText}>Delete Account</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.onboardingButton} onPress={() => {router.push('/nutsplash') }}>
                            <Text style={styles.logoutButtonText}>Re-do Onboarding</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
                            <Text style={styles.logoutButtonText}>Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }

    const renderSidebar = () => {
        return(
            <Modal visible={isSidebarVisible} transparent animationType='none'>
                <Animated.View style ={{
                    backgroundColor:'#1a1b1c',
                    alignSelf:'center',
                    shadowColor: '#000',
                    shadowOffset: { width: -2, height: 0 },
                    shadowOpacity: 0.3,
                    shadowRadius: 5,
                    elevation: 10,
                    borderRadius:10,
                    borderWidth:2,
                    borderColor:'#6a5acd',
                    width: screenWidth * 0.95, 
                    height: screenHeight * 0.7,
                    margin:screenHeight * 0.06,
                    transform:[{ translateX: sidebarTranslateX }]
                }}>
                    <View style ={{
                        flexDirection:'column',
                        alignItems:'center',
                        height: screenHeight * 0.7,
                        width: screenWidth * 0.95, 
                    }} >
                        <Text style = {[standards.headerText, {position:'absolute', fontSize:28, marginTop:15}]}>Settings</Text>
                        <TouchableOpacity onPress={closeSidebar}
                            style={{position:'absolute', right:10, marginTop:18}}>
                            <Image
                                style={styles.logo}
                                source= {wheelIcon}
                            />
                        </TouchableOpacity>

                        <View style={{backgroundColor:'#2c2c2e', borderRadius:10, width:screenWidth*0.85, height:screenHeight*0.15, marginTop:65}}>

                        </View>

                        <View style={{backgroundColor:'#2c2c2e', borderRadius:10, width:screenWidth*0.85, height:screenHeight*0.15, marginTop:15}}>

                        </View>

                        <View style={{backgroundColor:'#2c2c2e', borderRadius:10, width:screenWidth*0.85, height:screenHeight*0.15, marginTop:15}}>

                        </View>

                        <TouchableOpacity 
                            onPress={() => {
                                setAccountModal(true)
                            }}
                            style={{backgroundColor:'#a83232', borderRadius:10, width:screenWidth*0.4, height:screenHeight*0.06, marginTop:10, justifyContent:'center'}}>
                            <Text style = {{textAlign:'center',fontSize:22, fontWeight:'700', color:'#e0e0e0', letterSpacing:0.3}}>Account</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Overlay rendered inside the sidebar modal */}
                    {isAccountModal && accountModal()}
                </Animated.View>
            </Modal>  
        )
    }
    
    return (
        <View>
            {renderMore()}
            {renderSidebar()}
            {/* Removed the separate account modal call */}
        </View>
    );
}
 
const styles = StyleSheet.create ({
    container: {
        position: 'absolute',
        right: 20,
        top: 20,
    },
    sidebar: {
        position: 'absolute',
        right: 0,
        top: 0,
        height: '100%',
        backgroundColor: '#2c2c2e',
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 10,
        width: SIDEBAR_WIDTH,
    },
    modalContent: {
        flex: 1,
        width: '100%',
    },
    logo: {
        width: 30,
        height: 30,
    },
    closeButton: {
        alignSelf: 'flex-end',
        padding: 10,
        marginRight: 10,
        marginTop: 10,
    },
    tabsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        gap: 20,
    },
    onboardingButton: { 
        justifyContent:'center',
        backgroundColor: '#a83232',
        width:180,
        margin:5,
        padding:10,
        borderRadius: 8, 
        alignItems: 'center' 
    },
    logoutButton: { 
        backgroundColor: '#a83232', 
        padding:10,
        borderRadius: 8, 
        margin:5,
        alignItems: 'center' 
    },
    logoutButtonText: { 
        color: '#fff', 
        fontSize: 18, 
        textAlign:'center'
    },
    deleteAccountButton: { 
        justifyContent:'center',
        backgroundColor: '#a83232',
        padding:10,
        width:150,
        borderRadius: 8, 
        margin:5,
        marginTop:45,
        alignItems: 'center' 
    },
    overlayBackdrop: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
});

export default SettingsWheel
