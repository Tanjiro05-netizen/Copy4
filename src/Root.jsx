import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/Login';

const Root = () => {
    const { user } = useAuth();

    if (user) {
        return <Navigate to="/home" replace />;
    }

    return <LoginPage />;
};

export default Root;
