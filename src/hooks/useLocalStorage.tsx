import { useState, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Initialize state from localStorage
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Always read the absolute latest value from localStorage to prevent race conditions
      let currentValue: T;
      try {
        const item = window.localStorage.getItem(key);
        currentValue = item ? JSON.parse(item) : initialValue;
      } catch {
        currentValue = initialValue;
      }

      // Calculate the new value
      const valueToStore = value instanceof Function ? value(currentValue) : value;
      
      // Save to localStorage immediately (synchronously)
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      
      // Update React state
      setStoredValue(valueToStore);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue] as const;
}
