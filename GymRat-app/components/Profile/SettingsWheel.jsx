import React, { useState, useRef } from 'react'
import {Animated, TouchableOpacity, View, StyleSheet, TouchableWithoutFeedback, Modal, Image, Dimensions, Text} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import UserSettingsTab from './SettingsTabs/UserSettingsTab'
import UserStatsTab from './SettingsTabs/UserStatsTab'
import UserGoalsTab from './SettingsTabs/UserGoalsTab'
import { useSQLiteContext } from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@/UserContext';
const { width: screenWidth } = Dimensions.get('window');
const SIDEBAR_WIDTH = screenWidth * 0.30; //Exactly half the screen

const SettingsWheel = () => {
    const db = useSQLiteContext();
    const { setUserId, setFirestoreUserId} = useUser();

    //delete account & userData
    const resetAccountData = async () => {
        await db.getAllAsync('DROP TABLE IF EXISTS users;');
        await db.getAllAsync('DROP TABLE IF EXISTS workoutTemplates;')
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
                <Animated.View style = {{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    height: '100%',
                    backgroundColor:'#1a1b1c',
                    shadowColor: '#000',
                    shadowOffset: { width: -2, height: 0 },
                    shadowOpacity: 0.3,
                    shadowRadius: 5,
                    elevation: 10,
                    paddingTop: 50, 
                    paddingHorizontal: 0,
                    paddingBottom: 50,
                    width: SIDEBAR_WIDTH, 
                    transform:[{ translateX: sidebarTranslateX }]
                }}>
                    <View style = {{
                        flexDirection:'column',
                        alignItems:'center',
                        height:'100%',
                        width:'100%',
                        justifyContent:'center',
                    }} >
                        <TouchableOpacity onPress={closeSidebar}
                            style={{position: 'absolute', top:0, right:0, padding:10}}>
                                <Image
                                style={styles.logo}
                                source={{
                                    uri: 'https://cdn-icons-png.flaticon.com/512/15/15185.png',
                                }}
                                />
                        </TouchableOpacity>
                        
                        <View style={{gap:10, alignItems:'center'}}>
                            <UserSettingsTab/>  
                            <UserStatsTab/>
                            <UserGoalsTab/>
                        </View>

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
                    

                </Animated.View>
            </Modal>                      
        )
    }
    
    return (
        <View>
            {renderMore()}
            {renderSidebar()}
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
        position: 'absolute', 
        justifyContent:'center',
        bottom: 50, 
        backgroundColor: '#a83232',
        paddingVertical: 8, 
        width:100,
        borderRadius: 8, 
        alignItems: 'center' 
    },
    logoutButton: { 
        position: 'absolute', 
        bottom: 0, 
        backgroundColor: '#a83232', 
        paddingVertical: 8, 
        paddingHorizontal: 12, 
        borderRadius: 8, 
        alignItems: 'center' 
    },
    logoutButtonText: { 
        color: '#fff', 
        fontSize: 18, 
        textAlign:'center'
    },
    deleteAccountButton: { 
        position: 'absolute', 
        justifyContent:'center',
        bottom: 120, 
        backgroundColor: '#a83232',
        paddingVertical: 8, 
        width:100,
        borderRadius: 8, 
        alignItems: 'center' 
    },
});

export default SettingsWheel
