import { React, useState } from 'react';
import { StyleSheet, Dimensions, TouchableOpacity, Image, View, Modal, Pressable } from 'react-native';
import { Text } from '@ui-kitten/components';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export const QuestionModal1 = ({ isVisible, onClose }) => {
    return (
        <Modal 
            animationType="slide"  
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <Pressable style={modalStyles.centeredView} onPress={onClose}> 
                <Pressable onPress={(e) => e.stopPropagation()}>
                    <View style={modalStyles.modalView}>
                        <Text style={modalStyles.modalText}>Weight</Text>
                    </View>
                </Pressable>
            </Pressable>
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
            <Pressable style={modalStyles.centeredView} onPress={onClose}> 
                <Pressable onPress={(e) => e.stopPropagation()}>
                    <View style={modalStyles.modalView}>
                        <Text style={modalStyles.modalText}>Body Fat Percentage</Text>
                    </View>
                </Pressable>
            </Pressable>
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
            <Pressable style={modalStyles.centeredView} onPress={onClose}> 
                <Pressable onPress={(e) => e.stopPropagation()}>
                    <View style={modalStyles.modalView}>
                        <Text style={modalStyles.modalText}>BMI</Text>
                    </View>
                </Pressable>
            </Pressable>
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
    borderRadius: 30,
    height: screenHeight*0.3,
    width: screenWidth*0.93,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 10,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    fontSize:20,
    fontWeight:'bold',
    color:'white',
    position:'absolute',
    left:20,
    marginTop:8,
    marginBottom: 15,
  },
});