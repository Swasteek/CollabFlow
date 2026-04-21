/* eslint-disable react/prop-types */
import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authAPI } from '../services/api';

export const AuthContext = createContext(null);



export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check if user is authenticated on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                const response = await authAPI.getProfile();
                const userData = response.data.user || response.data.data?.user || response.data.data || response.data;
                setUser(userData);
            } catch (error) {
                setUser(null);
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = useCallback(async (credentials) => {
        try {
            // Real API call
            const response = await authAPI.login(credentials);
            // Backend returns { token, user } or { data: { token, user } }
            const responseData = response.data.data || response.data;
            const responseUser = responseData.user;
            setUser(responseUser);

            return { success: true, user: responseUser };
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Login failed';
            throw new Error(errorMessage);
        }
    }, []);

    const signup = useCallback(async (userData) => {
        try {
            // Real API call
            const response = await authAPI.signup(userData);
            // Backend returns { token, user } or { data: { token, user } }
            const responseData = response.data.data || response.data;
            const responseUser = responseData.user;
            setUser(responseUser);

            return { success: true, user: responseUser };
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Signup failed';
            throw new Error(errorMessage);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            // Ignore logout errors so local state still clears
        }
        setUser(null);
    }, []);

    const updateUser = useCallback((updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
    }, [user]);

    const value = useMemo(() => ({
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateUser
    }), [user, isLoading, login, signup, logout, updateUser]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
