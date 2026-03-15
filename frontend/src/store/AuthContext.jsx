import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // On mount (or token change), restore user from localStorage directly
    // We do NOT try to jwtDecode here so dummy tokens also work
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedEmail = localStorage.getItem('user_email');
        const storedName = localStorage.getItem('user_name');
        const storedId = localStorage.getItem('user_id');
        const storedRole = localStorage.getItem('role');

        if (storedToken && storedEmail && storedRole) {
            setUser({ 
                id: storedId ? parseInt(storedId) : null, 
                email: storedEmail, 
                role: storedRole, 
                name: storedName || 'User' 
            });
            setToken(storedToken);
        }
    }, []);

    const login = (newToken, role, email, name, id) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('role', role);
        localStorage.setItem('user_email', email);
        localStorage.setItem('user_name', name || 'User');
        localStorage.setItem('user_id', id);
        setToken(newToken);
        setUser({ id, email, role, name: name || 'User' });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_id');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
