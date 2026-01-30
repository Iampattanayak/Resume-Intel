import { useState, useEffect } from 'react';

// Basic "encryption" (Obfuscation) for client-side persistence
// NOTE: This prevents casual snooping but is not cryptographically secure against determined attackers.
const SALT = "RESUME_INTEL_SALT_v1";

const encrypt = (text: string): string => {
    if (!text) return '';
    try {
        return btoa(`${SALT}:${text}`);
    } catch (e) {
        console.error("Encryption failed", e);
        return '';
    }
};

const decrypt = (encrypted: string): string => {
    if (!encrypted) return '';
    try {
        const decoded = atob(encrypted);
        if (decoded.startsWith(`${SALT}:`)) {
            return decoded.slice(SALT.length + 1);
        }
        return '';
    } catch (e) {
        // If decryption fails (e.g. old data or plain text), return empty
        return '';
    }
};

export function useEncryptedStorage(key: string, initialValue: string = '') {
    // Initialize state function to avoid reading localStorage on every render
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? decrypt(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Helper to read current value from storage
    const readFromStorage = () => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? decrypt(item) : initialValue;
        } catch (error) {
            return initialValue;
        }
    };

    // Listen for changes
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent | CustomEvent) => {
            // Handle native StorageEvent
            if (e instanceof StorageEvent) {
                if (e.key === key) {
                    setStoredValue(readFromStorage());
                }
            }
            // Handle custom event for same-window updates
            else if (e instanceof CustomEvent) {
                if (e.detail?.key === key) {
                    setStoredValue(readFromStorage());
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('local-storage-update', handleStorageChange as EventListener);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('local-storage-update', handleStorageChange as EventListener);
        };
    }, [key, initialValue]);

    // Return a wrapped version of useState's setter function that persists the new value to localStorage.
    const setValue = (value: string | ((val: string) => string)) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;

            // Save state
            setStoredValue(valueToStore);

            // Save to local storage
            if (valueToStore) {
                window.localStorage.setItem(key, encrypt(valueToStore));
            } else {
                window.localStorage.removeItem(key);
            }

            // Dispatch custom event for same-window synchronization
            window.dispatchEvent(new CustomEvent('local-storage-update', {
                detail: { key }
            }));

        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue] as const;
}
