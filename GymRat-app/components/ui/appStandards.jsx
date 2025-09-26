import React from 'react'
import { Dimensions } from 'react-native'

const { height: screenHeight } = Dimensions.get('window');
const { width: screenWidth } = Dimensions.get('window');

const standards = {

  background: {
    backgroundColor: '#1a1b1c',
    width: screenWidth,
    height: screenHeight
  },
  headerText: {
    fontSize:18,
    fontWeight:'900',
    color:'#e0e0e0'
    
  },
  regularText: {
    fontSize:16,
    fontWeight:'600',
    color:'#e0e0e0'
  },
  smallText: {
    fontSize:16,
    fontWeight:'normal',
    color:'#e0e0e0'
  }
}

export default standards