import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';

const Root = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
    }

    if (user) {
        return <Navigate to="/home" replace />;
    }

    return <LandingPage />;
};

export default Root;
