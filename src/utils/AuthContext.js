// src/utils/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

// Create the context
const AuthContext = createContext(null);

// Create the Provider component
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // This effect runs ONLY ONCE when the app first loads.
    // Its job is to check for an existing token and validate it.
    useEffect(() => {
        const verifyExistingToken = async () => {
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
                    setUser(data.data); // Set the user if the token is valid
                } else {
                    // If token is invalid, clear it
                    localStorage.removeItem('token');
                    sessionStorage.removeItem('token');
                    setUser(null);
                }
            } catch (error) {
                console.error("Initial auth verification failed:", error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        verifyExistingToken();
    }, []);

    // --- NEW: A central function to handle a NEW login ---
    // This will be called by the Login and AdminLogin components.
    const login = async (token, rememberMe) => {
        if (rememberMe) {
            localStorage.setItem('token', token);
        } else {
            sessionStorage.setItem('token', token);
        }
        
        try {
            // After saving the new token, immediately fetch the user profile
            const response = await fetch(`${API_URL}/student/profile`, {
                headers: { 'Authorization': `MonaEdu ${token}` },
            });

            if (!response.ok) {
                throw new Error("The provided token was invalid.");
            }
            
            const data = await response.json();
            
            // --- CRITICAL: Update the global state with the new user ---
            setUser(data.data);
            
            // Return the user data so the calling component knows who logged in
            return data.data;
        } catch (error) {
            // If verification fails, clear the bad token immediately
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            setUser(null);
            throw error; // Re-throw error for the login form to display
        }
    };
    
    // --- NEW: A central function to handle logout ---
    const logout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setUser(null); // Clear the user from the global state
    };

    // The value provided to all children components
    const value = { user, isLoading, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

// Custom hook to easily consume the context in any component
export const useAuth = () => {
    return useContext(AuthContext);
};