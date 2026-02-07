import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, profile, loading, isAdmin } = useAuth();

    if (loading) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Admins always have access
    if (isAdmin()) {
        return children;
    }

    // Check invite access
    if (!profile?.has_invite_access) {
        return <Navigate to="/pending-access" replace />;
    }

    return children;
};

export default ProtectedRoute;