// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from '../axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      }, []);

    const login = async (usuario, password) => {
        setLoading(true)
        setError(null)
        try {
            console.log('Intentando iniciar sesión con:', usuario, password);
            const response = await api.post('/api/Login', {
                usuario,
                password
            });
            console.log('Exitoso...', response.data)
            setLoading(false)
            setIsAuthenticated(true);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('authorization', JSON.stringify(response.data.authorization))
        } catch(error) {
            console.log('Error...', error)
            setError(error.message)
            setLoading(false)
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('authorization');
    };

    

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            login,
            logout,
            loading,
            setLoading,
            setIsAuthenticated,
            error,
            setError
        }}>
            {children}
        </AuthContext.Provider>
    );
};

