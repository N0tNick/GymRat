import { React, useState } from 'react';
import { StyleSheet, Dimensions, TouchableOpacity, Image, View, Modal, Pressable, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@ui-kitten/components';
import Lightbox from 'react-native-lightbox-v2';


const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export const QuestionModal1 = ({ isVisible, onClose }) => {
    return (
        <Modal 
            animationType="slide"  
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={modalStyles.centeredView}>
                <SafeAreaView style={{height: screenHeight*0.5}}>
                    <ScrollView style={modalStyles.modalView}>
                        <TouchableOpacity style={modalStyles.closeIcon} onPress={onClose}>
                            <Image style={styles.logo} source={{uri:'https://img.icons8.com/p1em/200/FFFFFF/filled-cancel.png'}}/>
                        </TouchableOpacity>
                        <Text style={modalStyles.modalHeaderText}>How is Body Fat found?</Text>
                        <View style={modalStyles.modalRectangle}>
                            <Text style={modalStyles.modalBodyText}>
                                Body Fat percentage is the ratio of fat in the body relative to overall body weight. 
                            </Text>
                            <Lightbox 
                            style = {{marginLeft:9,width:screenWidth*0.85, height:screenHeight*0.255,borderWidth:5,borderRadius:5,borderColor:'#6a5acd'}}
                            resizeMode=''>
                                <Image style={styles.logo} resizeMode='contain' source={{uri:'https://cdn.shopify.com/s/files/1/0045/7398/6889/files/BodyFatChart.jpg?v=1588081088'}}/>
                            </Lightbox>
                            <Text style={modalStyles.modalBodyText}>
                                The above image is a chart of body fat percetanges based on age. 
                                Keep in mind this may differ based on activity and lifter level, but is applicable for most average or new lifters.                                    </Text>
                            <Text style={modalStyles.modalBodyText}>
                                The forumlas used to get body fat percentage are shown below
                            </Text>
                            <View style={{marginLeft:10, width:screenWidth*0.83, height:screenHeight*0.18, borderWidth:4, borderRadius:8, borderColor:'#6a5acd'}}>
                                <Text style={modalStyles.modalBodyText}>
                                    For Men: %BF = 495 / (1.0324 − 0.19077 × log10(waist − neck) + 0.15456 × log10(height)) − 450
                                </Text>
                                <Text style={modalStyles.modalBodyText}>
                                    For Women: %BF = 495 / (1.29579 − 0.35004 × log10(waist + hip − neck) + 0.22100 × log10(height)) − 450
                                </Text>
                            </View>
                            <Text style={modalStyles.modalBodyText}>
                                To find your own body fat percentage all you need is a tape measure! Look up more detailed instruction on the navy body fat percentage method online.
                            </Text>
                         </View>
                    </ScrollView>
                </SafeAreaView>
            </View>
        </Modal> 
    );
};

export const QuestionModal2 = ({ isVisible, onClose }) => {
    return (
        <Modal 
            animationType="slide"  
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={modalStyles.centeredView}>
                <SafeAreaView style={{height: screenHeight*0.6}}>
                    <ScrollView style={modalStyles.modalView}>
                        <TouchableOpacity style={modalStyles.closeIcon} onPress={onClose}>
                            <Image style={styles.logo} source={{uri:'https://img.icons8.com/p1em/200/FFFFFF/filled-cancel.png'}}/>
                        </TouchableOpacity>
                        <Text style={modalStyles.modalHeaderText}>What is BMI?</Text>
                        <View style={modalStyles.modalRectangle}>
                            <Text style={modalStyles.modalBodyText}>
                                BMI is a health measure gotten by comparing a person's weight relative to their height.    
                            </Text>
                            <Lightbox style = {{marginLeft:4, width:screenWidth*0.87, height:screenHeight*0.18, borderWidth:5, borderRadius:8, borderColor:'#6a5acd'}}>
                                <Image style={styles.logo} resizeMode='contain' source={{uri:'https://www.ifafitness.com/book/images/BMI-chart.jpg'}}/>
                            </Lightbox>  
                            <Text style={modalStyles.modalBodyText}>
                                The above picture is a chart by the IFA that shows the distritbution of BMI classification for adults. 
                                Find you weight at the top and then your age to the left and your BMI is the intersection of the two.
                            </Text>  
                            <View>

                            </View>
                            <Text style={modalStyles.modalBodyText}>
                                Other figures should be taken into consideration with BMI, such as fitness level, blood pressure, etc. 
                            </Text>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

export const QuestionModal3 = ({ isVisible, onClose }) => {
    return (
        <Modal 
            animationType="slide"  
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={modalStyles.centeredView}>
                <SafeAreaView style={{height: screenHeight*0.6}}>
                    <ScrollView style={modalStyles.modalView}>
                        <TouchableOpacity style={modalStyles.closeIcon} onPress={onClose}>
                            <Image style={styles.logo} source={{uri:'https://img.icons8.com/p1em/200/FFFFFF/filled-cancel.png'}}/>
                        </TouchableOpacity>
                        <Text style={modalStyles.modalHeaderText}>What is BMR?</Text>
                        <View style={modalStyles.modalRectangle}>
                            <Text style={modalStyles.modalBodyText}>
                            </Text>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const modalStyles = StyleSheet.create ({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor:'#2a2a2aff',
    borderWidth:3,
    borderRadius: 10,
    borderColor:'#6a5acd',
    width: screenWidth*0.95,
    shadowColor: '#000',
    shadowOffset: {
      width: 10,        
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  modalRectangle: {
    marginLeft:6,
    marginTop:screenHeight*0.04, 
    width:screenWidth*0.9,
    height:screenHeight,
    borderWidth:2, 
    borderRadius:8, 
    borderColor:'#6a5acd',
    justifyContent: 'flex-start'
  },
  closeIcon:{
    position:'absolute', 
    width:30,
    height:30,
    marginLeft:335,
    marginTop:5
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalHeaderText: {
    fontSize:18,
    fontWeight:'bold',
    color:'white',
    position:'absolute',
    left:10,
    marginTop:8,
    marginBottom: 15,
  },
  modalBodyText: {
    fontSize:14, 
    fontWeight:'bold',
    color:'white',
    left:5,
    marginTop:8,
    marginBottom: 15,
  }

});

const styles = StyleSheet.create({
    logo: {
        width:'100%',
        height:'100%'
    },
})