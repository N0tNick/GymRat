// import statusCodes along with GoogleSignin

// remove comments below this line when in dev mode
import React from 'react';
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';

//// Somewhere in your code
export const signIn = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (isSuccessResponse(response)) {
      setState({ userInfo: response.data });
    } else {
      console.log("sign in was cancelled");
    }
  } catch (error) {
    if (isErrorWithCode(error)) {
      switch (error.code) {
        case statusCodes.IN_PROGRESS:
          console.warn("Sign-in already in progress");
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          console.warn("Google Play Services not available or outdated");
          break;
        default:
        console.error("Google Sign-In error code:", error.code);
      }
    } else {
      console.error("Non-Google Sign-In error:", error);
    }
  }
};
