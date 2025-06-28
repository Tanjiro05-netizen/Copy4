import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();

    // While loading, you might want to show a spinner or nothing
    // For now, we'll just wait until the user object is determined.
    // The AuthProvider handles the loading state.

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;