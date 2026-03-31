import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';

const Root = () => {
    const { user, loading } = useAuth();

    // Wait for auth to resolve before deciding
    if (loading) {
        return (
            <div className="min-h-screen bg-[#12131A] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-400 text-sm">Loading...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return <LandingPage />;
    }

    return <Navigate to="/home" replace />;
};

export default Root;
