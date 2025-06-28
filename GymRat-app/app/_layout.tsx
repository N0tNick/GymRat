import { Stack, router } from 'expo-router';
import { Button } from 'react-native';

export default function Layout() {
  return (
    <Stack screenOptions={{headerShown: false}} initialRouteName="splash">
      <Stack.Screen name="index" />
      <Stack.Screen name="nutsplash" options={{ 
        title: 'Personal Details', 
        headerShown: true,
        headerLeft: () => (<Button title="Back" onPress={() => {router.replace('/')}} />), 
        }}/>
      <Stack.Screen name="splash" />
    </Stack>
  )
}