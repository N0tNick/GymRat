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
                <SafeAreaView style={modalStyles.modalHeight}>
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
                            style = {{alignSelf:'center',width:screenWidth*0.85, height:screenHeight*0.255,borderWidth:5,borderRadius:8,borderColor:'#6a5acd'}}>
                                <Image style={styles.logo} resizeMode='contain' source={{uri:'https://cdn.shopify.com/s/files/1/0045/7398/6889/files/BodyFatChart.jpg?v=1588081088'}}/>
                            </Lightbox>
                            <Text style={modalStyles.modalBodyText}>
                                The above image is a chart of body fat percetanges based on age. 
                                Keep in mind this may differ based on activity and lifter level, but is applicable for most average or new lifters.                                    </Text>
                            <Text style={modalStyles.modalBodyText}>
                                The forumlas used to get body fat percentage are shown below.
                            </Text>
                            <View style={{marginLeft:12, width:screenWidth*0.83, height:screenHeight*0.15, borderWidth:3, borderRadius:8, borderColor:'#6a5acd'}}>
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
                <SafeAreaView style={modalStyles.modalHeight}>
                    <ScrollView style={modalStyles.modalView}>
                        <TouchableOpacity style={modalStyles.closeIcon} onPress={onClose}>
                            <Image style={styles.logo} source={{uri:'https://img.icons8.com/p1em/200/FFFFFF/filled-cancel.png'}}/>
                        </TouchableOpacity>
                        <Text style={modalStyles.modalHeaderText}>What is BMI?</Text>
                        <View style={modalStyles.modalRectangle}>
                            <Text style={modalStyles.modalBodyText}>
                                BMI is a health measure gotten by comparing a person's weight relative to their height.    
                            </Text>
                                <Lightbox style={{marginLeft:20,marginTop:8,width:screenWidth*0.8, height:screenHeight*0.168, borderWidth:4,borderRadius:8,borderColor:'#6a5acd',overflow:'hidden'}}>
                                    <Image style={styles.logo} resizeMode='contain' source={{uri:'https://www.ifafitness.com/book/images/BMI-chart.jpg'}}/>
                                </Lightbox>  
                                <Text style={modalStyles.modalBodyTextSmall}>
                                    The above picture is a chart by the IFA that shows the distritbution of BMI classification for adults.
                                </Text> 
                                <Text style={modalStyles.modalBodyTextSmall}>
                                    Find your weight at the top, and your age to the left, the intersection of the two will be your BMI. Below is what every color classification means.
                                </Text>
                                <View style={{alignSelf:'center',marginLeft:30}}>
                                    <View style={{flexDirection:'row',marginTop:5}}>
                                        <View style={{marginBottom:5,width:25,height:25,backgroundColor:'#3ac8f3'}}/>
                                        <Text style={modalStyles.modalBodyTextSmall}>Underweight (BMI less than 18.5)</Text>
                                    </View>

                                    <View style={{flexDirection:'row'}}>
                                        <View style={{marginBottom:5,width:25,height:25,backgroundColor:'#39f539'}}/>
                                        <Text style={modalStyles.modalBodyTextSmall}>Healthy weight (BMI 18.5 to 24.9)</Text>
                                    </View>

                                    <View style={{flexDirection:'row'}}>
                                    <View style={{marginBottom:5,width:25,height:25,backgroundColor:'#f9fa0e'}}/>
                                        <Text style={modalStyles.modalBodyTextSmall}>Overweight (BMI 25 to 29.9)</Text>
                                    </View>

                                    <View style={{flexDirection:'row'}}>
                                    <View style={{marginBottom:5,width:25,height:25,backgroundColor:'#ff8800'}}/>
                                        <Text style={modalStyles.modalBodyTextSmall}>Obese (BMI 30 to 39.9)</Text>
                                    </View>

                                    <View style={{flexDirection:'row'}}>
                                    <View style={{marginBottom:5,width:25,height:25,backgroundColor:'#fe3233'}}/>
                                        <Text style={modalStyles.modalBodyTextSmall}>Extremely obese (BMI 40 and above)</Text>
                                    </View>
                                </View>

                            <Text style={modalStyles.modalBodyText}>
                                Be aware that BMI might not be an accurate indicator of your weight classification and other figures should be taken into consideration with BMI, such as muscle mass, body fat storage, race, gender, etc. 
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
                <SafeAreaView style={modalStyles.modalHeight}>
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
  modalHeight: {
    height:screenHeight*0.5,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor:'#2a2a2aff',
    borderWidth:3,
    borderRadius: 10,
    borderColor:'#6a5acd',
    width: screenWidth*0.98,
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
    marginTop:40, 
    width:screenWidth*0.93,
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
    marginLeft:345,
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
    marginLeft:5,
    marginRight:5,
    marginTop:4,
    marginBottom:8,
    textAlign:'center'

  },
  modalBodyTextSmall: {
    fontSize:12, 
    fontWeight:'bold',
    color:'white',
    marginLeft:8,
    marginRight:8,
    marginTop:4,
    marginBottom: 6,
    textAlign:'center'
  }

});

const styles = StyleSheet.create({
    logo: {
        width:'100%',
        height:'100%',
    },
})