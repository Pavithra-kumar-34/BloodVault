import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in (could verify token with backend here)
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (role, email, password) => {
        try {
            const endpoint = role === 'donor' ? '/auth/donor/login' : '/auth/hospital/login';
            const response = await api.post(endpoint, { email, password });

            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return { success: true };
        } catch (error) {
            console.error("Login attempt failed:", error);
            if (!error.response) {
                return { success: false, error: 'Server is offline. Please start the backend server.' };
            }
            return { success: false, error: error.response?.data?.error || 'Login failed' };
        }
    };

    const logout = () => {
        const role = user?.role;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        return role;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
