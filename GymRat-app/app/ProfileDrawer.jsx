import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { useState } from 'react'
import { Text, Modal, Button, View, Image, TouchableOpacity, StyleSheet } from 'react-native'
import 'react-native-gesture-handler';


const Drawer = createDrawerNavigator();
const EmptyScreen = () => <View />;

const CustomDrawerContent = (props) => {
    const [modalVisible, setModalVisible] = useState(false);
    
    return (
        <DrawerContentScrollView {...props}>
            <TouchableOpacity style = {styles.drawerHeader} onPress={() => setModalVisible(true)} >
                <Image
                    style={styles.drawerIcon}
                    source={{
                        uri: 'https://cdn-icons-png.flaticon.com/512/15/15185.png',
                    }}
                />
            </TouchableOpacity>

            <DrawerItemList {...props} />
            <Modal
                animationType="slide"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text>Modal Content Here</Text>
                    <Button title="Close" onPress={() => setModalVisible(false)} />
                </View>
            </Modal>
            <View style={{alignItems: 'center', marginBottom: 20}}>
                <DrawerItem
                    label="Settings"
                    onPress={() => setModalVisible(true)}
                />
            </View>
        </DrawerContentScrollView>
    );
};

export default function ProfileDrawer() {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                drawerStyle: {
                    backgroundColor: '#fff',
                    width: 240,
                },
            }}
        >
            <Drawer.Screen 
                name="Empty" 
                component={EmptyScreen} 
                options={{ headerShown: false }}
            />
        </Drawer.Navigator>
    );
}

const styles = StyleSheet.create({
    drawerHeader: {
        height: 150,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    drawerIcon: {
        width: 80,
        height: 80,
    },
});