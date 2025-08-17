// src/utils/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_URL } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // This effect runs ONCE on app load to check for an existing token
    useEffect(() => {
        const verifyUser = async () => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                setIsLoading(false);
                return;
            }
            try {
                const response = await fetch(`${API_URL}/student/profile`, {
                    headers: { 'Authorization': `MonaEdu ${token}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setUser(data.data);
                } else {
                    setUser(null);
                    localStorage.removeItem('token');
                    sessionStorage.removeItem('token');
                }
            } catch (error) {
                console.error("Auth verification failed:", error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        verifyUser();
    }, []);

    // --- NEW: A function to handle the entire login process ---
    const login = async (token, rememberMe) => {
        // 1. Save the new token
        if (rememberMe) {
            localStorage.setItem('token', token);
        } else {
            sessionStorage.setItem('token', token);
        }

        // 2. Verify the new token and get user data
        try {
            const response = await fetch(`${API_URL}/student/profile`, {
                headers: { 'Authorization': `MonaEdu ${token}` },
            });
            if (!response.ok) {
                throw new Error("Failed to verify new login session.");
            }
            const data = await response.json();
            
            // 3. Update the global state with the new user data
            setUser(data.data);
            
            // 4. Return the user data so the login page knows where to redirect
            return data.data;

        } catch (error) {
            // If verification fails, clear the bad token and user state
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            setUser(null);
            throw error; // Re-throw the error so the login page can display it
        }
    };
    
    // --- NEW: A simple logout function ---
    const logout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setUser(null);
    };

    const value = { user, setUser, isLoading, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};