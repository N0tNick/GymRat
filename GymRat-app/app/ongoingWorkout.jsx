import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

// A generic hook to persist any state variable
const usePersistedState = (key, initialValue) => {
  const [value, setValue] = useState(initialValue);

  // Load the value from AsyncStorage on component mount
  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(key);
        if (storedValue !== null) {
          setValue(JSON.parse(storedValue));
        }
      } catch (e) {
        console.error(`Failed to load value for ${key}`, e);
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
        console.error(`Failed to save value for ${key}`, e);
      }
    };
    saveValue();
  }, [value, key]);

  return [value, setValue];
};

// Backwards-compatible boolean hook
export const usePersistedBoolean = (key, initialValue) => {
  return usePersistedState(key, initialValue);
};

// New hook for workout data
export const usePersistedWorkout = (key = 'selectedTemplate', initialValue = {}) => {
  return usePersistedState(key, initialValue);
};

export default usePersistedState;