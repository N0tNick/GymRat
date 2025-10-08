import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Dimensions, TouchableOpacity, Image, View, Modal, Pressable, ScrollView, Button, TextInput, Text, FlatList } from 'react-native';
import rightArrow from '../../assets/images/right-arrow-black-circle.png'
import leftArrow from '../../assets/images/left-arrow-black-circle.png'
import standards from '../ui/appStandards'
import { router } from 'expo-router';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');



export const HomeModal = ({isVisible, onClose}) => {
    function goNext() {
        onClose();
        router.navigate('/workout');
    }
    return (
        <Modal 
            animationType="slide"  
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={{flex: 1, justifyContent:'center', alignItems:'center',backgroundColor:'translucent'}}>
                <TouchableOpacity style={homeModalStyles.closeIcon} onPress={onClose}>
                    <Image style={styles.logo} source={{uri:'https://img.icons8.com/p1em/200/FFFFFF/filled-cancel.png'}}/>
                </TouchableOpacity>
                <View style={homeModalStyles.textBox}>
                    <Text style={[standards.headerText,{padding:10,textAlign:'center'}]}>Welcome to GymRat!</Text>
                    <Text style={[standards.regularText,{padding:10,textAlign:'center'}]}>This is the home page. Here info is displayed at a glance, such as:</Text>
                    <FlatList
                        data={[
                            { key: 'Nutrition rundown and summary'},
                            { key: 'Daily tasks'},
                            { key: 'Weekly workout and nutrition logs'},

                        ]}
                        renderItem={({item}) => {
                            return(
                                <View style={{ marginBottom: 10 }}>
                                    <Text style={[standards.regularText,{textAlign:'left',padding:3,marginLeft:10}]}>{`\u2022 ${item.key}`}</Text>
                                </View>
                            )
                        }}
                    />
                </View>
                <View style={homeModalStyles.arrowContainer}>
                    <TouchableOpacity style={homeModalStyles.leftArrowBox} onPress={() => null}>
                        <Image style={homeModalStyles.arrowImage} source={leftArrow}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={homeModalStyles.rightArrowBox} 
                        onPress={() => goNext()}>
                        <Image style={homeModalStyles.arrowImage} source={rightArrow}/>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

export const WorkoutOnboardModal = ({isVisible, onClose}) => {
    function goBack() {
        onClose();
        router.navigate('/home');
    }
    function goNext() {
        onClose();
        router.navigate('/nutrition');
    }
    return (
        <Modal 
            animationType="slide"  
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={{flex: 1, justifyContent:'center', alignItems:'center',backgroundColor:'translucent'}}>
                <TouchableOpacity style={workoutModalStyles.closeIcon} onPress={onClose}>
                    <Image style={styles.logo} source={{uri:'https://img.icons8.com/p1em/200/FFFFFF/filled-cancel.png'}}/>
                </TouchableOpacity>
                <View style={workoutModalStyles.textBox}>
                    <Text style={[standards.regularText,{padding:10,textAlign:'center'}]}>This is the workout page. Here, you can:</Text>
                    <FlatList
                        data={[
                            { key: 'Create workout templates'},
                            { key: 'Track workouts while doing them'},
                            { key: 'Learn about exercises'},
                            { key: 'Create custom exercises'},
                        ]}
                        renderItem={({item}) => {
                            return(
                                <View style={{ marginBottom: 10 }}>
                                    <Text style={[standards.regularText,{textAlign:'left',padding:3,marginLeft:10}]}>{`\u2022 ${item.key}`}</Text>
                                </View>
                            )
                        }}
                    />
                </View>
                <View style={workoutModalStyles.arrowContainer}>
                    <TouchableOpacity style={workoutModalStyles.leftArrowBox} onPress={() => goBack()}>
                        <Image style={workoutModalStyles.arrowImage} source={leftArrow}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={workoutModalStyles.rightArrowBox} 
                        onPress={() => goNext()}>
                        <Image style={workoutModalStyles.arrowImage} source={rightArrow}/>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

export const NutOnboardModal = ({isVisible, onClose}) => {
    function goBack() {
        onClose();
        router.navigate('/workout');
    }
    function goNext() {
        onClose();
        router.navigate('/profile');
    }
    return (
        <Modal 
            animationType="slide"  
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={{flex: 1, justifyContent:'center', alignItems:'center',backgroundColor:'translucent'}}>
                <TouchableOpacity style={nutModalStyles.closeIcon} onPress={onClose}>
                    <Image style={styles.logo} source={{uri:'https://img.icons8.com/p1em/200/FFFFFF/filled-cancel.png'}}/>
                </TouchableOpacity>
                <View style={nutModalStyles.textBox}>
                    <Text style={[standards.regularText,{padding:10,textAlign:'center'}]}>This is the nutrition page. Here, you can see:</Text>
                    <FlatList
                        data={[
                            { key: 'A breakdown of your nutrition goals'},
                            { key: 'Advanced macro tracking'},
                            { key: 'A history of your saved foods'},
                            { key: 'And add custom food entries'},
                        ]}
                        renderItem={({item}) => {
                            return(
                                <View style={{ marginBottom: 10 }}>
                                    <Text style={[standards.regularText,{textAlign:'left',padding:3,marginLeft:10}]}>{`\u2022 ${item.key}`}</Text>
                                </View>
                            )
                        }}
                    />
                </View>
                <View style={nutModalStyles.arrowContainer}>
                    <TouchableOpacity style={nutModalStyles.leftArrowBox} onPress={() => goBack()}>
                        <Image style={nutModalStyles.arrowImage} source={leftArrow}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={nutModalStyles.rightArrowBox} 
                        onPress={() => goNext()}>
                        <Image style={nutModalStyles.arrowImage} source={rightArrow}/>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

export const ProfileOnboardModal = ({isVisible, onClose}) => {
    function goBack() {
        onClose();
        router.navigate('/nutrition');
    }
    function goNext() {
        onClose();
        router.navigate('/nutsplash');
    }
    return (
        <Modal 
            animationType="slide"  
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={{flex: 1, justifyContent:'center', alignItems:'center',backgroundColor:'translucent'}}>
                <TouchableOpacity style={profileModalStyles.closeIcon} onPress={onClose}>
                    <Image style={styles.logo} source={{uri:'https://img.icons8.com/p1em/200/FFFFFF/filled-cancel.png'}}/>
                </TouchableOpacity>
                <View style={profileModalStyles.textBox}>
                    <Text style={[standards.regularText,{padding:10,textAlign:'center'}]}>This is the profile page. Here you can:</Text>
                    <FlatList
                        data={[
                            { key: 'See a compelete history of nutritiona and workout logs'},
                            { key: 'A chart of your weights changes per week'},
                            { key: 'Overview of progress and composition'},
                            { key: 'General settings'},
                        ]}
                        renderItem={({item}) => {
                            return(
                                <View style={{ marginBottom: 10 }}>
                                    <Text style={[standards.regularText,{textAlign:'left',padding:3,marginLeft:10}]}>{`\u2022 ${item.key}`}</Text>
                                </View>
                            )
                        }}
                    />
                </View>
                <View style={profileModalStyles.arrowContainer}>
                    <TouchableOpacity style={profileModalStyles.leftArrowBox} onPress={() => goBack()}>
                        <Image style={profileModalStyles.arrowImage} source={leftArrow}/>
                    </TouchableOpacity>
                    <TouchableOpacity style={profileModalStyles.rightArrowBox} 
                        onPress={() => goNext()}>
                        <Image style={profileModalStyles.arrowImage} source={rightArrow}/>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

const homeModalStyles = StyleSheet.create ({
  textBox:{
    position:'absolute',
    flexDirection:'column',
    bottom:screenHeight*0.4,
    width:screenWidth*0.8,
    height:screenHeight*0.3,
    backgroundColor:'#2c2c2e',
    borderRadius:8,
    borderWidth:2,
    borderColor:'#e0e0e0'
  },
  closeIcon:{
    position:'absolute', 
    width:30,
    height:30,
    marginLeft:345,
    marginTop:5
  },
  arrowContainer: {
    position: 'absolute',
    bottom: 100,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  leftArrowBox: {
    backgroundColor: '#2c2c2e',
    alignItems:'center',
    borderRadius: 8,
    width:screenWidth*0.4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderColor:'#e0e0e0',
    borderWidth:2
  },
  rightArrowBox: {
    backgroundColor: '#2c2c2e',
    borderRadius: 8,
    alignItems:'center',
    width:screenWidth*0.4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderColor:'#e0e0e0',
    borderWidth:2
  },
  arrowImage: {
    width: 70,
    height: 70,
  },
});

const workoutModalStyles = StyleSheet.create ({
  textBox:{
    position:'absolute',
    flexDirection:'column',
    bottom:screenHeight*0.4,
    width:screenWidth*0.8,
    height:screenHeight*0.3,
    backgroundColor:'#2c2c2e',
    borderRadius:8,
    borderWidth:2,
    borderColor:'#375573'
  },
  closeIcon:{
    position:'absolute', 
    width:30,
    height:30,
    marginLeft:345,
    marginTop:5
  },
  arrowContainer: {
    position: 'absolute',
    bottom: 100,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  leftArrowBox: {
    backgroundColor: '#2c2c2e',
    alignItems:'center',
    borderRadius: 8,
    width:screenWidth*0.4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderColor:'#375573',
    borderWidth:2
  },
  rightArrowBox: {
    backgroundColor: '#2c2c2e',
    borderRadius: 8,
    alignItems:'center',
    width:screenWidth*0.4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderColor:'#375573',
    borderWidth:2
  },
  arrowImage: {
    width: 70,
    height: 70,
  },
});

const nutModalStyles = StyleSheet.create ({
  textBox:{
    position:'absolute',
    flexDirection:'column',
    bottom:screenHeight*0.4,
    width:screenWidth*0.8,
    height:screenHeight*0.3,
    backgroundColor:'#2c2c2e',
    borderRadius:8,
    borderWidth:2,
    borderColor:'#32a852'
  },
  closeIcon:{
    position:'absolute', 
    width:30,
    height:30,
    marginLeft:345,
    marginTop:5
  },
  arrowContainer: {
    position: 'absolute',
    bottom: 100,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  leftArrowBox: {
    backgroundColor: '#2c2c2e',
    alignItems:'center',
    borderRadius: 8,
    width:screenWidth*0.4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderColor:'#32a852',
    borderWidth:2
  },
  rightArrowBox: {
    backgroundColor: '#2c2c2e',
    borderRadius: 8,
    alignItems:'center',
    width:screenWidth*0.4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderColor:'#32a852',
    borderWidth:2
  },
  arrowImage: {
    width: 70,
    height: 70,
  },
});

const profileModalStyles = StyleSheet.create ({
  textBox:{
    position:'absolute',
    flexDirection:'column',
    bottom:screenHeight*0.4,
    width:screenWidth*0.8,
    height:screenHeight*0.3,
    backgroundColor:'#2c2c2e',
    borderRadius:8,
    borderWidth:2,
    borderColor:'#6a5acd'
  },
  closeIcon:{
    position:'absolute', 
    width:30,
    height:30,
    marginLeft:345,
    marginTop:5
  },
  arrowContainer: {
    position: 'absolute',
    bottom: 100,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  leftArrowBox: {
    backgroundColor: '#2c2c2e',
    alignItems:'center',
    borderRadius: 8,
    width:screenWidth*0.4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderColor:'#6a5acd',
    borderWidth:2
  },
  rightArrowBox: {
    backgroundColor: '#2c2c2e',
    borderRadius: 8,
    alignItems:'center',
    width:screenWidth*0.4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderColor:'#6a5acd',
    borderWidth:2
  },
  arrowImage: {
    width: 70,
    height: 70,
  },
});

const styles = StyleSheet.create({
    logo: {
        width:'100%',
        height:'100%',
    },
    bulletContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 5,
      },
      bullet: {
        fontSize: 16,
        marginRight: 5,
      },
      itemText: {
        fontSize: 16,
        flex: 1, // Allows text to wrap without overlapping bullet
      },
});