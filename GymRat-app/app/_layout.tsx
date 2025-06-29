import { Stack, router } from 'expo-router';
import { Button } from 'react-native';

export default function Layout() {
  return (
    <Stack screenOptions={{headerShown: false}} initialRouteName="splash">
      <Stack.Screen name="index" />
      <Stack.Screen name="nutsplash" options={{ 
        title: 'Personal Details', 
        headerShown: true,
        headerTintColor: '#1a1b1c',
        headerStyle: { backgroundColor: '#02ed12' },
        headerLeft: () => (<Button title="Back" color={'#1a1b1c'} onPress={() => {router.replace('/')}} />), 
      }}/>
      <Stack.Screen name="splash" />
    </Stack>
  )
}