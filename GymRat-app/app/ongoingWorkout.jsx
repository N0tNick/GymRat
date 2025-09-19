import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

// A custom hook to persist a boolean state variable
const usePersistedBoolean = (key, initialValue) => {
  const [value, setValue] = useState(initialValue);

  // Load the value from AsyncStorage on component mount
  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(key);
        if (storedValue !== null) {
          // Convert the stored string "true" or "false" back to a boolean
          setValue(JSON.parse(storedValue));
        }
      } catch (e) {
        console.error('Failed to load value from storage', e);
      }
    };
    loadStoredValue();
  }, [key]);

  // Save the value to AsyncStorage whenever it changes
  useEffect(() => {
    const saveValue = async () => {
      try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error('Failed to save value to storage', e);
      }
    };
    saveValue();
  }, [value, key]);

  return [value, setValue];
};

export default usePersistedBoolean;