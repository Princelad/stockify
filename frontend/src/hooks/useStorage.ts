import { useState, useCallback } from 'react';
import { storage } from '@/lib/utils/storage';

type StorageType = 'local' | 'session';

/**
 * Hook for managing localStorage or sessionStorage
 */
export const useStorage = <T>(
  key: string,
  initialValue: T,
  storageType: StorageType = 'local'
) => {
  const storageObject = storageType === 'local' ? storage.local : storage.session;

  // Get initial value from storage or use provided initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = storageObject.get<T>(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(`Error reading ${key} from ${storageType}Storage:`, error);
      return initialValue;
    }
  });

  // Set value to storage and state
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save to state
      setStoredValue(valueToStore);
      
      // Save to storage
      storageObject.set(key, valueToStore);
    } catch (error) {
      console.error(`Error setting ${key} to ${storageType}Storage:`, error);
    }
  }, [key, storedValue, storageObject, storageType]);

  // Remove value from storage and reset to initial value
  const removeValue = useCallback(() => {
    try {
      storageObject.remove(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing ${key} from ${storageType}Storage:`, error);
    }
  }, [key, initialValue, storageObject, storageType]);

  return [storedValue, setValue, removeValue] as const;
};

/**
 * Hook specifically for localStorage
 */
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  return useStorage(key, initialValue, 'local');
};

/**
 * Hook specifically for sessionStorage
 */
export const useSessionStorage = <T>(key: string, initialValue: T) => {
  return useStorage(key, initialValue, 'session');
};
