import React, { useState } from 'react'
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { Platform } from 'react-native';
import { Image } from 'expo-image';
import googleLogo from '../assets/images/googlebutton.png';

// Lazy imports to avoid crashing Expo Go
//let GoogleSigninButton;
let useGoogleSignIn;

import * as Application from 'expo-application';

const isExpoGo = Application.applicationName === "Expo Go";
if (Platform.OS === "android" && !isExpoGo) {
  //GoogleSigninButton = require('@react-native-google-signin/google-signin').GoogleSigninButton;
  useGoogleSignIn = require('../app/gogsignIn.jsx').useGoogleSignIn;
}


// firebase auth
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebaseConfig.js';

export default function RegistrationScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const googleSignIn = useGoogleSignIn ? useGoogleSignIn().signIn : null;

    const isExpoGo = Application.applicationName === "Expo Go";

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create an Account</Text>

            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />

            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} />

            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} />

            <TouchableOpacity style={styles.button} onPress={async () => {
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    const user = userCredential.user;
                    await sendEmailVerification(user);
                    alert('Verification email sent! Please check your inbox.');
                    router.replace('/login'); // move to login
                    } catch (error) {
                    console.error(error);
                    alert(error.message);
                }
            }}>               
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>


            <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.linkText}>Already have an account? Login</Text>
            </TouchableOpacity>
            
            {/* {GoogleSigninButton && googleSignIn && (
              <View style={{ alignItems: "center", marginTop: 20 }}>
                <GoogleSigninButton
                  style={{ width: 192, height: 48 }}
                  size={GoogleSigninButton.Size.Wide}
                  color={GoogleSigninButton.Color.Dark}
                  onPress={googleSignIn}
                />
              </View>
            )} */}

            {googleSignIn && (
              <TouchableOpacity style={styles.googleCircle} onPress={googleSignIn}>
                <Image source={googleLogo} style={styles.googleIcon} />
              </TouchableOpacity>
            )}
            
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1b1c',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    label: {
        color: '#e0e0e0',
        marginBottom: 5,
    },
    input: {
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
    },
    button: {
      backgroundColor: "rgba(255,255,255,0.08)",
      borderColor: "#888",
      borderWidth: 2,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginTop: 10,
      alignItems: 'center'
    },
    buttonText: {
        color: '#e0e0e0',
        fontWeight: 'bold',
        fontSize: 16
    },
    linkText: {
        color: '#e0e0e0',
        textAlign: 'center',
        marginTop: 15,
    },
    title: {
      color: '#e0e0e0',
      fontSize: 35,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 80,
    },
    googleCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#e0e0e0',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginTop: 20,
      overflow: 'hidden',   
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 3,
      elevation: 4,         
    },
    googleIcon: {
      width: '65%',
      height: '65%',
      resizeMode: 'center', 
    },
});