// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

const AuthContext = createContext(null);

const API_URL = 'http://localhost:8000/api';

// Configure axios instance
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Add a request interceptor to include the CSRF token
api.interceptors.request.use((config) => {
    const csrftoken = Cookies.get('csrftoken');
    if (csrftoken) {
        config.headers['X-CSRFToken'] = csrftoken;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});



export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);


    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get(`/user/`);
                setUser(response.data.user);
            } catch (error) {
                console.error("Failed to fetch user:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const login = async (identifier, password) => {
        try {
            const response = await api.post(`/login/`, { identifier, password });
            setUser(response.data.user);
            return { success: true };
        } catch (error) {
            console.error("Login error:", error.response?.data || error.message);
            return { success: false, error: error.response?.data?.error || "Login failed" };
        }
    };

    const register = async (data) => {
        try {
            const response = await api.post('/register/', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return { success: true, message: response.data.message };
        } catch (error) {
            console.error("Registration error:", error.response?.data || error.message);
            return { success: false, error: error.response?.data?.error || "Registration failed" };
        }
    };

    const logout = async () => {
        try {
            await api.post(`/logout/`, {});
            setUser(null);
            return { success: true };
        } catch (error) {
            console.error("Logout error:", error.response?.data || error.message);
            return { success: false, error: error.response?.data?.error || "Logout failed" };
        }
    };

    // Call when delete user.
    const handleContextSetUser = () => {
        setUser(null);
        logout();
        navigate('/register'); 
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, register, logout, api, handleContextSetUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);