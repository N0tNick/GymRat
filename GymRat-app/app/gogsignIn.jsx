// import statusCodes along with GoogleSignin

// remove comments below this line when in dev mode
//import React from 'react';
//import {
//  GoogleSignin,
//  isErrorWithCode,
//  statusCodes,
//} from '@react-native-google-signin/google-signin';
//
//// Somewhere in your code
//export const signIn = async () => {
//  try {
//    await GoogleSignin.hasPlayServices();
//    const response = await GoogleSignin.signIn();
//    if (isSuccessResponse(response)) {
//      setState({ userInfo: response.data });
//    } else {
//      console.log("sign in was cancelled");
//    }
//  } catch (error) {
//    if (isErrorWithCode(error)) {
//      switch (error.code) {
//        case statusCodes.IN_PROGRESS:
//          console.log("something went wrong");
//          break;
//        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
//          console.log("something went wrong");
//          break;
//        default:
//        console.log("something went wrong");
//      }
//    } else {
//      console.log("something went wrong not related to google");
//    }
//  }
//};
//
