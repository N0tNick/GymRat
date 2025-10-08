import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Dimensions, TouchableOpacity, Image, View, Modal, Pressable, ScrollView, Button, TextInput  } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@ui-kitten/components';
import Lightbox from 'react-native-lightbox-v2';
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { SetGoalSpeed } from '../../app/goal'
import { useFocusEffect, router } from 'expo-router'
import { useSQLiteContext } from 'expo-sqlite';

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
                            style = {{alignSelf:'center',width:screenWidth*0.85, height:screenHeight*0.255,overflow:'hidden',borderWidth:2,borderRadius:10,borderColor:'#6a5acd'}}>
                                <Image style={styles.logo} resizeMode='contain' source={{uri:'https://cdn.shopify.com/s/files/1/0045/7398/6889/files/BodyFatChart.jpg?v=1588081088'}}/>
                            </Lightbox>
                            <Text style={modalStyles.modalBodyText}>
                                The above image is a chart of body fat percetanges based on age. 
                                Keep in mind this may differ based on activity and lifter level, but is applicable for most average or new lifters.                                    </Text>
                            <Text style={modalStyles.modalBodyText}>
                                The forumlas used to get body fat percentage are shown below.
                            </Text>
                            <View style={{marginLeft:12, width:screenWidth*0.83, height:screenHeight*0.15, borderWidth:2, borderRadius:10, borderColor:'#6a5acd'}}>
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
                                BMI is a health measure gotten by comparing a person's weight relative to their height. This value automatically changes with fluctuations in height and weight and doesn't need to be logged   
                            </Text>
                                <Lightbox style={{marginLeft:24,marginTop:8,width:screenWidth*0.8, height:screenHeight*0.168, borderWidth:2,overflow:'hidden',borderRadius:10,borderColor:'#6a5acd',overflow:'hidden'}}>
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
                                Base metabolic rate (BMR) is the amount of caloric energy your body needs to maintain homeostasis at a base level and accounts for the majority of your total energy consumption. (50-80%)
                            </Text>
                            <Text style={modalStyles.modalBodyText}>
                                In simpler terms, this measures how many calories per day your body needs for its systems to function correctly.
                            </Text>
                            <Text style={modalStyles.modalBodyText}>
                                BMR is largely determined by your total lean mass, especially muscle mass, with more mass increasing your BMR and less decreasing it. Your activity level is also considered when determining BMR.
                            </Text>
                            <View style={{width:screenWidth*0.85, height:screenHeight*0.54, borderWidth:2, borderRadius:10, borderColor:'#6a5acd', alignSelf:'center'}}>
                                <Text style={modalStyles.modalBodyText}>
                                    Factors that affect BMR
                                </Text>
                                <View style={{flexDirection:'column'}}>
                                    <Text style={modalStyles.BMRText}>Body Size:</Text>
                                    <Text style={modalStyles.BMRTextSmall}>-Larger bodies usually have a higher BMR.</Text>
                                </View>
                                <View style={{flexDirection:'column'}}>
                                    <Text style={modalStyles.BMRText}>Lean Muscle amount:</Text>
                                    <Text style={modalStyles.BMRTextSmall}>-Muscles use more kilojoules of energy than regular tissue.</Text>

                                </View>
                                <View style={{flexDirection:'column'}}>
                                    <Text style={modalStyles.BMRText}>Bad dieting, starving or fasting: </Text>
                                    <Text style={modalStyles.BMRTextSmall}>-Routinely eating too few calories changes your metabolism, and in turn dropping your BMR by up to 15%.</Text>
                                </View>
                                <View style={{flexDirection:'column'}}>
                                    <Text style={modalStyles.BMRText}>Age: </Text>
                                    <Text style={modalStyles.BMRTextSmall}>-Metabolism and BMR slow down with age, because of hormonal changes and the loss of muscle tissue.</Text>
                                </View>
                                <View style={{flexDirection:'column'}}>
                                    <Text style={modalStyles.BMRText}>Activity Level: </Text>
                                    <Text style={modalStyles.BMRTextSmall}>-Regular exercise increases muscle mass and teaches the body to burn energy at a faster rate, even at rest. </Text>
                                </View>
                                <View style={{flexDirection:'column'}}> 
                                    <Text style={modalStyles.BMRText}>Drugs: </Text>
                                    <Text style={modalStyles.BMRTextSmall}>-like caffiene or nicotine, can increase BMR</Text>
                                </View>
                                <View style={{flexDirection:'column'}}> 
                                    <Text style={modalStyles.BMRText}>Dietary Deficiencies: </Text>
                                    <Text style={modalStyles.BMRTextSmall}>-for example, a diet low in iodine reduces thyroid function and slows the metabolism</Text>
                                </View>
                            </View>
                            <Text style={modalStyles.modalBodyText}>For the equations used, we decided to use the Oxford method, listed below</Text>
                            <View style={{flexDirection:'column', alignSelf:'center', marginBottom:10}}>
                                <View style={modalStyles.BMRBox}>
                                    <Text style={modalStyles.modalBodyText}>Males:</Text>
                                    <Text style={modalStyles.BMRTextSmall}>Age            Formula                                                           </Text>
                                    <Text style={modalStyles.BMRTextSmall}>3-10           61.0 x Weight [kg] - 33.7                 </Text> 
                                    <Text style={modalStyles.BMRTextSmall}>3-10           23.3 x Weight [kg] + 514                 </Text>
                                    <Text style={modalStyles.BMRTextSmall}>10-18         18.4 x Weight [kg] + 581                 </Text>
                                    <Text style={modalStyles.BMRTextSmall}>18-30         16.0 x Weight [kg] + 545                 </Text>
                                    <Text style={modalStyles.BMRTextSmall}>30-60        14.2 x Weight [kg] + 593                 </Text>
                                    <Text style={modalStyles.BMRTextSmall}>60+             13.5 x Weight [kg] + 514                 </Text>


                                </View>
                                <View style={modalStyles.BMRBox}>
                                    <Text style={modalStyles.modalBodyText}>Women:</Text>
                                    <Text style={modalStyles.BMRTextSmall}>Age            Formula                                                           </Text>
                                    <Text style={modalStyles.BMRTextSmall}>3-10           58.9 x Weight [kg] - 23.1                </Text> 
                                    <Text style={modalStyles.BMRTextSmall}>3-10           20.1 x Weight [kg] + 507                 </Text>
                                    <Text style={modalStyles.BMRTextSmall}>10-18         11.1 x Weight [kg] + 761                 </Text>
                                    <Text style={modalStyles.BMRTextSmall}>18-30         13.1 x Weight [kg] + 558                 </Text>
                                    <Text style={modalStyles.BMRTextSmall}>30-60        9.74 x Weight [kg] + 694                 </Text>
                                    <Text style={modalStyles.BMRTextSmall}>60+             10.1 x Weight [kg] + 569                 </Text>
                                </View>
                            </View>
                            
                            <Text style={modalStyles.BMRTextSmall}>
                                This information was provided by the Better Health's Channel page on Metabolism.
                            </Text>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

export const WeightTouchable = ({ isVisible, onClose })  => {
    const [date, setDate] = useState(new Date())
    const [open, setOpen] = useState(false)
    const [weight, setWeight] = useState('')
    const [lastWeight, setLastWeight] = useState(null) 

    const db = useSQLiteContext()

    useEffect(() => {
        if (isVisible && db) {
            fetchLastWeight();
        }
    }, [isVisible, db]);

    const fetchLastWeight = async () => {
        try {
            const result = await db.getFirstAsync('SELECT weight FROM userStats')
            setLastWeight(result.weight)
        } catch (error) {
            console.error('Error fetching last weight:', error)
        }
    };

    const saveWeight = async () => {
        const weightValue = parseFloat(weight);
        if (isNaN(weightValue) || weightValue <= 0) {
            console.log('Error', 'Please enter a valid weight value');
            return;
        }

        try {
            const user_id = 1;

            await db.runAsync(
                'UPDATE userStats SET weight = ? WHERE user_id = ?',
                [weight.trim(), user_id]
            );

            const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;


            await db.runAsync(
                'REPLACE INTO weightHistory (date, weight) VALUES (?, ?) ',
                [localDate, weight.trim()]
            )
            
            console.log('Success', 'Weight and WeightHistory saved successfully');
            
            onClose();
            
        } catch (error) {
            console.log('Error saving to weightHistory:', error);
            console.log('Error', 'Failed to save weightHistory. Please try again.');
        }
    };

    return (
        <Modal 
            animationType="slide"  
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={modalStyles.centeredView}>
                <SafeAreaView style={modalStyles.touchableHeight}>
                    <View style={modalStyles.modalView}>
                        <TouchableOpacity style={modalStyles.confirmIcon} onPress={saveWeight}>
                            <Image style={styles.logo} source={{uri:'https://uxwing.com/wp-content/themes/uxwing/download/checkmark-cross/checkmark-white-round-icon.png'}}/>
                        </TouchableOpacity>
                        <TouchableOpacity style={modalStyles.closeIcon} onPress={onClose}>
                            <Image style={styles.logo} source={{uri:'https://img.icons8.com/p1em/200/FFFFFF/filled-cancel.png'}}/>
                        </TouchableOpacity>
                        <Text style={modalStyles.inputHeaderText}>Log New Weight</Text>

                        <View
                        style={{flexDirection:'row',alignSelf:'center',alignItems:'center',marginTop:45,marginBottom:7,width:screenWidth*0.93,height:screenHeight*0.06,borderWidth:2,borderRadius:6,borderColor:'#6a5acd',backgroundColor:'#2c2c2e'}}
                        >
                            <Text style={modalStyles.modalInputText}>Weight:</Text>
                            <View style={{left:240}}>
                                <TextInput 
                                style={modalStyles.modalInputText}
                                value={weight}
                                onChangeText={setWeight}
                                placeholder={lastWeight ? `${lastWeight}` : '___'}
                                keyboardType='numeric'
                                />
                            </View>
                        </View>


                        <TouchableOpacity 
                        style={{flexDirection:'row',alignSelf:'center',alignItems:'center',marginBottom:15,width:screenWidth*0.93,height:screenHeight*0.06,borderWidth:2,borderRadius:6,borderColor:'#6a5acd',backgroundColor:'#2c2c2e'}}
                        onPress = {() => setOpen(true)}>
                            <Text style={modalStyles.modalInputText}>Date:</Text>
                            <View style={{left:150}}>
                                <Button title={date.toDateString('en-US')} onPress={() => setOpen(true)} /> 
                                <DateTimePickerModal 
                                    isVisible={open}
                                    mode="date"
                                    date={date}
                                    onConfirm={(d) => {
                                        setOpen(false)
                                        setDate(d)
                                    }}
                                    onCancel={() => setOpen(false)}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    )
}

export const GoalWeightTouchable = ({ isVisible, onClose })  => {
    const [goalWeight, setGoalWeight] = useState('')
    const [lastGoalWeight, setLastGoalWeight] = useState(null) 

    const db = useSQLiteContext()

    useEffect(() => {
        if (isVisible && db) {
            fetchLastGoalWeight();
        }
    }, [isVisible, db]);

    const fetchLastGoalWeight = async () => {
        try {
            const result = await db.getFirstAsync('SELECT goal_weight FROM userStats')
            setLastGoalWeight(result.goal_weight)
        } catch (error) {
            console.error('Error fetching last goal_weight:', error)
        }
    };

    const saveGoalWeight = async () => {
        const goalValue = parseFloat(goalWeight);
        if (isNaN(goalValue) || goalValue <= 0) {
            console.log('Error', 'Please enter a valid weight value');
            return;
        }

        try {
            const user_id = 1;
            const result = await db.runAsync(
                'UPDATE userStats SET goal_weight = ? WHERE user_id = ?',
                [goalWeight.trim(), user_id]
            );

            // If no rows were updated, insert a new row
            if (result.changes === 0) {
                await db.runAsync(
                    'INSERT INTO userStats (user_id, goal_weight) VALUES (?, ?)',
                    [user_id, goalWeight.trim()]
                );
            }
            
            console.log('Success', 'Goal weight saved successfully');
            
            onClose();
            
        } catch (error) {
            console.log('Error saving goal weight:', error);
            console.log('Error', 'Failed to save goal weight. Please try again.');
        }
    };   
    return (
        <Modal 
            animationType="slide"  
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={modalStyles.centeredView}>
                <SafeAreaView style={modalStyles.touchableHeight}>
                    <View style={modalStyles.modalView}>
                        <TouchableOpacity style={modalStyles.confirmIcon} onPress={saveGoalWeight}>
                            <Image style={styles.logo} source={{uri:'https://uxwing.com/wp-content/themes/uxwing/download/checkmark-cross/checkmark-white-round-icon.png'}}/>
                        </TouchableOpacity>
                        <TouchableOpacity style={modalStyles.closeIcon} onPress={onClose}>
                            <Image style={styles.logo} source={{uri:'https://img.icons8.com/p1em/200/FFFFFF/filled-cancel.png'}}/>
                        </TouchableOpacity>
                        <Text style={modalStyles.inputHeaderText}>Log New Goal</Text>

                        <View
                        style={{flexDirection:'row',alignItems:'center',marginTop:45,margin:6,marginBottom:1,width:screenWidth*0.93,height:screenHeight*0.06,borderWidth:2,borderRadius:6,borderColor:'#6a5acd',backgroundColor:'#2c2c2e'}}
                        onPress={() => null}>
                            <Text style={modalStyles.modalInputText}>Goal Weight:</Text>
                            <View style={{left:200}}>
                                <TextInput 
                                style={modalStyles.modalInputText}
                                value={goalWeight}
                                onChangeText={setGoalWeight}
                                placeholder={lastGoalWeight ? `${lastGoalWeight}` : '___'}
                                keyboardType='numeric'
                                />
                            </View>
                        </View>

                        <TouchableOpacity 
                        style={{flexDirection:'row',alignSelf:'center',alignItems:'center',justifyContent:'center',margin:6,marginBottom:15,width:screenWidth*0.6,height:screenHeight*0.05,borderWidth:2,borderRadius:6,borderColor:'#6a5acd',backgroundColor:'#2c2c2e'}}
                        onPress={() => { onClose(); router.push('/goal') }}>
                            <Text style={modalStyles.modalInputText}>Change Goal</Text>
                        </TouchableOpacity>
                    
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    )
}

export const BodyFatTouchable = ({ isVisible, onClose })  => {
    const [body_fat, setBodyFat] = useState('')
    const [lastBodyFat, setLastBodyFat] = useState(null) 

    const db = useSQLiteContext()

    useEffect(() => {
        if (isVisible && db) {
            fetchLastBodyFat();
        }
    }, [isVisible, db]);

    const fetchLastBodyFat = async () => {
        try {
            const result = await db.getFirstAsync('SELECT body_fat FROM userStats')
            setLastBodyFat(result.body_fat)
        } catch (error) {
            console.error('Error fetching last body_fat:', error)
        }
    };

    const saveBodyFat = async () => {
        const bfVal = parseFloat(body_fat);
        if (isNaN(bfVal) || bfVal <= 0) {
            console.log('Error', 'Please enter a valid weight value');
            return;
        }
        try {
            const user_id = 1;
            const result = await db.runAsync(
                'UPDATE userStats SET body_fat = ? WHERE user_id = ?',
                [body_fat.trim(), user_id]
            );
            if (result.changes === 0) {
                await db.runAsync(
                    'INSERT INTO userStats (user_id, body_fat) VALUES (?, ?)',
                    [user_id, body_fat.trim()]
                );
            }    
            console.log('Success', 'Body_fat saved successfully');      
            onClose();         
        } catch (error) {
            console.log('Error saving Body_fat:', error);
            console.log('Error', 'Failed to save Body_fat. Please try again.');
        }
    }; 

    return (
        <Modal 
            animationType="slide"  
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={modalStyles.centeredView}>
                <SafeAreaView style={modalStyles.touchableHeight}>
                    <View style={modalStyles.modalView}>
                        <TouchableOpacity style={modalStyles.confirmIcon} onPress={saveBodyFat}>
                            <Image style={styles.logo} source={{uri:'https://uxwing.com/wp-content/themes/uxwing/download/checkmark-cross/checkmark-white-round-icon.png'}}/>
                        </TouchableOpacity>
                        <TouchableOpacity style={modalStyles.closeIcon} onPress={onClose}>
                            <Image style={styles.logo} source={{uri:'https://img.icons8.com/p1em/200/FFFFFF/filled-cancel.png'}}/>
                        </TouchableOpacity>
                        <Text style={modalStyles.inputHeaderText}>Log Body Fat %</Text>

                        <View
                        style={{flexDirection:'row',alignItems:'center',marginTop:45,margin:6,marginBottom:1,width:screenWidth*0.93,height:screenHeight*0.06,borderWidth:2,borderRadius:6,borderColor:'#6a5acd',backgroundColor:'#2c2c2e'}}
                        onPress={() => null}>
                            <Text style={modalStyles.modalInputText}>Body Fat %:</Text>
                            <View style={{left:200}}>
                                <TextInput 
                                style={modalStyles.modalInputText}
                                value={body_fat}
                                onChangeText={setBodyFat}
                                placeholder={lastBodyFat ? `${lastBodyFat}%` : '___'}
                                keyboardType='numeric'
                                />
                            </View>
                        </View>

                        <TouchableOpacity   
                            onPress={() => {}} 
                            style={{alignSelf:'center', alignItems:'center',justifyContent:'center',padding:10,marginBottom:15,margin:6,width:screenWidth*0.6,height:screenHeight*0.05,borderWidth:2,borderRadius:6,borderColor:'#6a5acd',backgroundColor:'#2c2c2e'}}>
                            <Text style={modalStyles.modalInputText}>Calculate Body Fat %</Text>
                        </TouchableOpacity>
                    
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    )
}

export const BMRTouchable = ({ isVisible, onClose })  => {
    const [BMR, setBMR] = useState('')
    const [lastBMR, setLastBMR] = useState(null) 

    const db = useSQLiteContext()

    useEffect(() => {
        if (isVisible && db) {
            fetchBMR();
        }
    }, [isVisible, db]);

    const fetchBMR = async () => {
        try {
            const result = await db.getFirstAsync('SELECT BMR FROM userStats')
            setLastBMR(result.BMR)
        } catch (error) {
            console.error('Error fetching last BMR:', error)
        }
    };

    const saveBMR = async () => {
        const BMRVal = parseFloat(BMR);
        if (isNaN(BMRVal) || BMRVal <= 0) {
            console.log('Error', 'Please enter a valid weight value');
            return;
        }
        try {
            const user_id = 1;
            const result = await db.runAsync(
                'UPDATE userStats SET BMR = ? WHERE user_id = ?',
                [BMR.trim(), user_id]
            );
            if (result.changes === 0) {
                await db.runAsync(
                    'INSERT INTO userStats (user_id, BMR) VALUES (?, ?)',
                    [user_id, BMR.trim()]
                );
            }    
            console.log('Success', 'Body_fat saved successfully');      
            onClose();         
        } catch (error) {
            console.log('Error saving Body_fat:', error);
            console.log('Error', 'Failed to save Body_fat. Please try again.');
        }
    };  
    return (
        <Modal 
            animationType="slide"  
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={modalStyles.centeredView}>
                <SafeAreaView style={modalStyles.touchableHeight}>
                    <View style={modalStyles.modalView}>
                        <TouchableOpacity style={modalStyles.confirmIcon} onPress={saveBMR}>
                            <Image style={styles.logo} source={{uri:'https://uxwing.com/wp-content/themes/uxwing/download/checkmark-cross/checkmark-white-round-icon.png'}}/>
                        </TouchableOpacity>
                        <TouchableOpacity style={modalStyles.closeIcon} onPress={onClose}>
                            <Image style={styles.logo} source={{uri:'https://img.icons8.com/p1em/200/FFFFFF/filled-cancel.png'}}/>
                        </TouchableOpacity>
                        <Text style={modalStyles.inputHeaderText}>Log Custom BMR</Text>

                        <View style={{flexDirection:'column',alignSelf:'center',height:screenHeight*0.12,width:screenWidth*0.93,marginTop:45,marginBottom:7,borderWidth:2,borderRadius:6,borderColor:'#6a5acd',backgroundColor:'#2c2c2e'}}>
                            <Text style={{fontSize:16, fontWeight:'bold',color:'white',marginLeft:5,marginRight:5,marginTop:4,textAlign:'center',letterSpacing:0.3}}>DISCLAIMER:</Text>
                            <Text style={{fontSize:14,fontWeight:'bold',color:'white',marginLeft:8,marginRight:8,marginBottom:6,textAlign:'center'}}>Unless you've used a machine method to get BMR (such as a KORR machine), or your activity level is changing long term we don't recommend changing it.</Text>
                         </View>

                        <View 
                        style={{flexDirection:'row',alignSelf:'center',alignItems:'center',width:screenWidth*0.93,height:screenHeight*0.06,borderWidth:2,borderRadius:6,borderColor:'#6a5acd',backgroundColor:'#2c2c2e'}}
                        onPress={() => null}>
                            <Text style={modalStyles.modalInputText}>BMR:</Text>
                            <View style={{left:270}}>
                                <TextInput 
                                style={modalStyles.modalInputText}
                                value={BMR}
                                onChangeText={setBMR}
                                placeholder={lastBMR ? `${lastBMR}` : '___'}
                                keyboardType='numeric'
                                />
                            </View>
                        </View>

                        <TouchableOpacity 
                        style={{flexDirection:'row',alignSelf:'center',alignItems:'center',justifyContent:'center',margin:6,marginBottom:15,width:screenWidth*0.6,height:screenHeight*0.05,borderWidth:2,borderRadius:6,borderColor:'#6a5acd',backgroundColor:'#2c2c2e'}}
                        onPress={() => {}}>
                            <Text style={modalStyles.modalInputText}>Re-calculate BMR</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    )
}


const modalStyles = StyleSheet.create ({
  modalHeight: {
    height:screenHeight*0.5,
  },
  touchableHeight: {
    height:screenHeight*0.25,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor:'#2c2c2e',
    borderWidth:2,
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
    marginBottom:20,
    width:screenWidth*0.93,
    borderRadius:8, 
    borderColor:'#6a5acd',
    justifyContent: 'flex-start',
    backgroundColor:'#2c2c2e'
  },
  confirmIcon:{
    position:'absolute', 
    width:30,
    height:30,
    marginLeft:10,
    marginTop:5
  },
  closeIcon:{
    position:'absolute', 
    width:30,
    height:30,
    marginLeft:345,
    marginTop:5
  },
  BMRBox:{
    flexDirection:'column',
    alignItems:'center',
    marginTop:10,
    width:screenWidth*0.7,
    height:screenHeight*0.25,
    borderWidth:2,
    borderRadius:10,
    borderColor:'#6a5acd'
  },
  textStyle: {
    color: '#e0e0e0',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalHeaderText: {
    fontSize:18,
    fontWeight:'bold',
    color:'#e0e0e0',
    position:'absolute',
    left:10,
    marginTop:8,
    marginBottom: 15,
  },
  inputHeaderText: {
    fontSize:18,
    fontWeight:'bold',
    color:'#e0e0e0',
    position:'absolute',
    alignSelf:'center',
    marginTop:8,
    marginBottom: 15,
  },
  modalBodyText: {
    fontSize:14, 
    fontWeight:'bold',
    color:'#e0e0e0',
    marginLeft:5,
    marginRight:5,
    marginTop:4,
    marginBottom:8,
    textAlign:'center',
    letterSpacing:0.3
  },
  modalBodyTextSmall: {
    fontSize:12, 
    fontWeight:'bold',
    color:'#e0e0e0',
    marginLeft:8,
    marginRight:8,
    marginTop:4,
    marginBottom: 6,
    textAlign:'center'
  },
  modalBodySources: {
    fontSize:10, 
    fontWeight:'bold',
    color:'#e0e0e0',
    marginLeft:10,
    marginRight:8,
    marginTop:4,
    marginBottom:0,
    letterSpacing:0.3,
  },
  BMRText: {
    fontSize:13, 
    fontWeight:'bold',
    color:'#e0e0e0',
    marginLeft:5,
    marginRight:0,
    marginTop:0,
    marginBottom:2,
    textAlign:'auto',
    letterSpacing:0.3
  },
  BMRTextSmall: {
    fontSize:12, 
    fontWeight:'bold',
    color:'#e0e0e0',
    marginLeft:15,
    marginRight:1,
    marginBottom:10,
    textAlign:'auto',
    letterSpacing:0.3
  },
  modalInputText: {
    fontSize:16, 
    fontWeight:'bold',
    color:'#e0e0e0',
    marginLeft:5,
    marginRight:5,
    letterSpacing:0.3,
  },

});

const styles = StyleSheet.create({
    logo: {
        width:'100%',
        height:'100%',
    },
})  