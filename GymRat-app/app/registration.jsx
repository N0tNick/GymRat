import React, { useState } from 'react'
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { Platform } from 'react-native';
import { GoogleSignin, GoogleSigninButton, statusCodes, } from '@react-native-google-signin/google-signin'
import { useGoogleSignIn } from '../app/gogsignIn.jsx';

import * as Application from 'expo-application';

// firebase auth
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebaseConfig.js';

export default function RegistrationScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { signIn: googleSignIn } = useGoogleSignIn();

    const isExpoGo = Application.applicationName === "Expo Go";

    return (
        <View style={styles.container}>
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
            
            {Platform.OS === "android" && !isExpoGo && (
                <View style={{alignItems: "center", marginTop: 20}} >
                <GoogleSigninButton style={{ width: 192, height: 48 }} size={GoogleSigninButton.Size.Wide} color={GoogleSigninButton.Color.Dark} onPress={googleSignIn} />
            </View>
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
        color: '#fff',
        marginBottom: 5,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    linkText: {
        color: '#ccc',
        textAlign: 'center',
        marginTop: 15,
    },
});