import React, { useState, useRef } from 'react'
import {Animated, TouchableOpacity, View, StyleSheet, Modal, Image, Dimensions, Text, TextInput, Platform, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider, GoogleAuthProvider, updatePassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { useSQLiteContext } from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@/UserContext';
import standards from '../ui/appStandards';
import wheelIcon from '../../assets/images/wheelIcon.png'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const SIDEBAR_WIDTH = screenWidth * 0.90; //Exactly half the screen
import { doc, deleteDoc } from 'firebase/firestore';
import { fbdb } from '../../firebaseConfig';
import * as Application from 'expo-application';
const isExpoGo = Application.applicationName === "Expo Go";
let GoogleSignin, isErrorWithCode, statusCodes;
if (Platform.OS === 'android' && !isExpoGo) {
  const googleModule = require('@react-native-google-signin/google-signin');
  GoogleSignin = googleModule.GoogleSignin;
  isErrorWithCode = googleModule.isErrorWithCode;
  statusCodes = googleModule.statusCodes;
}

const SettingsWheel = () => {
    const db = useSQLiteContext();
    const {userId, setUserId, setFirestoreUserId} = useUser();
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [deletePending, setDeletePending] = useState(false);
    const [isPassModal, setPassModal] = useState(false);
    const [isAccountModal, setAccountModal] = useState(false);
    const [currentPass, setCurrentPass] = useState('');
    const [pass, setPass] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');


    //delete account & userData
    const resetAccountData = async () => {
      const tables = [
        'userSettings', 'userStats', 'dailyNutLog',
        'historyLog', 'workoutTemplates',
        'customExercises', 'workoutLog', 'weightHistory'
      ];

    for (const table of tables) {
        try {
            await db.runAsync(`DELETE FROM ${table} WHERE user_id = ?;`, [userId]);
        } catch (err) {
            console.warn(`Table ${table} might not exist yet:`, err.message);
        }
    }

        try {
            await db.runAsync(`DELETE FROM users WHERE id = ?;`, [userId]);
        } catch (err) {
            console.warn('Could not delete from users table:', err.message);
        }
    console.log('Account data reset.');
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

    const handleDeleteAccount = async () => {
      try {
        const user = auth.currentUser;
        const firestoreUserId = await AsyncStorage.getItem('firestoreUserId');

        if (!user) {
          alert('No user logged in.');
          return;
        }

        const providerId = user.providerData[0]?.providerId;
        console.log('User provider:', providerId);

        // EMAIL USERS
        if (providerId === 'password') {
          setPasswordModalVisible(true);
          return;
        }

        // GOOGLE USERS
        if (providerId === 'google.com') {
          if (!GoogleSignin || isExpoGo) {
            Alert.alert(
              'Unsupported in Expo Go',
              'Google reauthentication and account deletion are only supported in a standalone build.'
            );
            return;
          }

          try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            await GoogleSignin.signOut();
            const googleUser = await GoogleSignin.signIn();
            const idToken = googleUser?.data?.idToken || googleUser?.idToken;

            if (!idToken) throw new Error('No ID token returned from Google reauthentication.');

            const credential = GoogleAuthProvider.credential(idToken);
            await reauthenticateWithCredential(user, credential);
            console.log('Reauthenticated via native Google Sign-In.');

            await proceedWithDeletion(firestoreUserId, user);
          } catch (error) {
            if (isErrorWithCode?.(error)) {
              switch (error.code) {
                case statusCodes.SIGN_IN_CANCELLED:
                  alert('Google reauthentication cancelled.');
                  break;
                case statusCodes.IN_PROGRESS:
                  alert('Google reauthentication already in progress.');
                  break;
                case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                  alert('Play Services not available.');
                  break;
                default:
                  console.error('Google reauth error:', error);
                  alert('Google reauthentication failed.');
              }
            } else {
              console.error('Reauth failed:', error);
              alert('Google reauthentication error.');
            }
          }
          return;
        }

        alert('Unsupported sign-in provider.');
      } catch (err) {
        console.error('Error deleting account:', err);
        alert('Account deletion failed. Please try again.');
      }
    };


    const proceedWithDeletion = async (firestoreUserId, user) => {
      try {
        // Delete Firestore user doc
        if (firestoreUserId) {
          await deleteDoc(doc(fbdb, 'users', firestoreUserId));
          console.log('Firestore user document deleted.');
        }

        // Delete local SQLite data
        await resetAccountData();

        // Delete Firebase Auth account
        await deleteUser(user);
        console.log('Firebase Auth account deleted.');

        // Clear storage and context
        await AsyncStorage.removeItem('firestoreUserId');
        setUserId(null);
        setFirestoreUserId(null);
        router.replace('/login');
      } catch (err) {
        console.error('Final deletion step failed:', err);
        alert('Error during account cleanup.');
      }
    };

    const renderMore = () => {
        if(more) {
            return(
                <TouchableOpacity
                style = {styles.logo}
                onPress={() => {
                  loadUser()
                  openSidebar()
                }}
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

    const passResetModal = () => {
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
                    onPress={() => setPassModal(false)}
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
                            width: screenWidth * 0.65, 
                            height: screenHeight * 0.28,}}>
                    <View style={{ flexDirection:'column', alignItems:'center', paddingHorizontal: 12 }} >
                        <Text style={[standards.headerText, { fontSize:20, marginTop: 0 }]}>
                            Update Password
                        </Text>

                        {/* Current password input */}
                        <TextInput
                            secureTextEntry
                            placeholder="Current password"
                            placeholderTextColor="#999"
                            value={currentPass}
                            onChangeText={setCurrentPass}
                            style={{
                                backgroundColor: '#2a2a2a',
                                color: '#fff',
                                borderRadius: 8,
                                width: '100%',
                                paddingHorizontal: 10,
                                paddingVertical: 8,
                                marginTop: 12,
                                fontSize:16,
                                fontWeight:'600'
                            }}
                        />

                        {/* New password input */}
                        <TextInput
                            secureTextEntry
                            placeholder="New password"
                            placeholderTextColor="#999"
                            value={pass}
                            onChangeText={setPass}
                            style={{
                                backgroundColor: '#2a2a2a',
                                color: '#fff',
                                borderRadius: 8,
                                width: '100%',
                                paddingHorizontal: 10,
                                paddingVertical: 8,
                                marginTop: 10,
                                marginBottom: 8,
                                fontSize:16,
                                fontWeight:'600'
                            }}
                        />

                        <View style = {{flexDirection:'row', justifyContent:'space-around', alignItems:'center'}}>
                            <TouchableOpacity style={{backgroundColor:'#0b8908ea', padding:10, borderRadius:10, marginRight:40}} 
                                onPress={() => {}}>
                                <Text style={[standards.regularText, {fontSize:20}]}>Save</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.logoutButton} onPress={() => { setPass(''); setCurrentPass(''); setPassModal(false); }}>
                                <Text style={[standards.regularText, {fontSize:20}]}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        )
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

                        <TouchableOpacity style={styles.deleteAccountButton} onPress={handleDeleteAccount}>
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

    const loadUser = async () => {
      const results = await db.getFirstAsync('SELECT * from users WHERE id = ?',
        [userId]
      )
      console.log(results)
      setName(results.username)
      setEmail(results.email)
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

                        <View style={{backgroundColor:'#2c2c2e', flexDirection:'column', justifyContent: 'space-between', borderRadius:10, 				width:screenWidth*0.85, height:screenHeight*0.15, marginTop:65, padding:10}}>
                            <View style={{flexDirection:'row'}}>
                              <Text style ={[standards.regularText, {margin:5}]}>Name:</Text>
                              <Text style = {[standards.regularText, {margin:5}]}>{name ? `${name}` : '____'}</Text>
                            </View>
                            <View style={{flexDirection:'row'}}>
                              <Text style ={[standards.regularText, {margin:5}]}>Email:</Text>
                              <Text style = {[standards.regularText, {margin:5}]}>{email ? `${email}` : '____'}</Text>
                            </View>                            
                            <View style={{flexDirection:'row', justifyContent:'space-between'}}>
                                <Text style ={[standards.regularText, {margin:5}]}>Password: ******</Text>
                                <TouchableOpacity 
                                  style={{backgroundColor:'#a83232', padding:8, borderRadius:8 }}
                                  onPress={() => setPassModal(true)}>
                                    <Text style={[standards.regularText, {fontSize:14}]}>Reset Password</Text>
                                </TouchableOpacity>
                            </View>
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
                    {isPassModal && passResetModal()}
                </Animated.View>
            </Modal>  
        )
    }
    
    return (
        <View>
            {renderMore()}
            {renderSidebar()}
            <Modal visible={passwordModalVisible} transparent animationType="fade">
              <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.6)',
              }}>
                <View style={{
                  backgroundColor: '#222',
                  padding: 20,
                  borderRadius: 10,
                  width: '80%',
                  alignItems: 'center'
                }}>
                  <Text style={{ color: 'white', fontSize: 16, marginBottom: 10 }}>
                    Enter your password to confirm deletion
                  </Text>
                  <TextInput
                    secureTextEntry
                    placeholder="Password"
                    placeholderTextColor="#999"
                    style={{
                      backgroundColor: '#333',
                      color: 'white',
                      borderRadius: 8,
                      width: '100%',
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      marginBottom: 10
                    }}
                    value={passwordInput}
                    onChangeText={setPasswordInput}
                  />
                  <TouchableOpacity
                    style={{ backgroundColor: '#a83232', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8 }}
                    onPress={async () => {
                      try {
                        setDeletePending(true);
                        const user = auth.currentUser;
                        const firestoreUserId = await AsyncStorage.getItem('firestoreUserId');
                        const credential = EmailAuthProvider.credential(user.email, passwordInput);
                        await reauthenticateWithCredential(user, credential);
                        console.log('Reauthenticated via password modal.');
                        setPasswordModalVisible(false);
                        await proceedWithDeletion(firestoreUserId, user);
                      } catch (err) {
                        console.error('Reauth failed:', err);
                        alert('Invalid password or reauth failed.');
                      } finally {
                        setDeletePending(false);
                        setPasswordInput('');
                      }
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                      {deletePending ? 'Deleting...' : 'Confirm Delete'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setPasswordModalVisible(false);
                      setPasswordInput('');
                    }}
                    style={{ marginTop: 10 }}
                  >
                    <Text style={{ color: '#aaa' }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
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