import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/api';

export const useAuthStore = create((set) => ({
    user: null,
    token: null,
    isLoading: false,
    hasHydrated: false,
    isCheckingAuth: true,

    register: async (username, email, password) => {
        set({ isLoading: true });
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            await AsyncStorage.setItem('user', JSON.stringify(data.data.savedUser));
            await AsyncStorage.setItem('token', data.data.token);

            set({ user: data.data.savedUser, token: data.data.token, isLoading: false });
            return { success: true };
        } catch (error) {
            set({ isLoading: false });
            return { success: false, message: error.message };
        }
    },

    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            await AsyncStorage.setItem('user', JSON.stringify(data.data.savedUser));
            await AsyncStorage.setItem('token', data.data.accessToken);

            set({ user: data.data.savedUser, token: data.data.accessToken, isLoading: false });
            return { success: true };
        } catch (error) {
            set({ isLoading: false });
            return { success: false, message: error.message };
        }
    },

    checkAuth: async () => {
        try {
            const user = await AsyncStorage.getItem('user');
            const token = await AsyncStorage.getItem('token');

            const parsedUser = user ? JSON.parse(user) : null;
            set({ user: parsedUser, token, isLoading: false, hasHydrated: true });
        } catch (error) {
            console.error('Failed to load auth data', error);
            set({ isLoading: false, hasHydrated: true });// Ensure hasHydrated is set even on error
        } finally {
            set({ isCheckingAuth: false })
        }
    },

    logout: async () => {
        try {
            await AsyncStorage.removeItem("user")
            await AsyncStorage.removeItem("token")
            set({ user: null, token: null });
        } catch (error) {
            console.log("Error logging out", error)
        }
    }

}));