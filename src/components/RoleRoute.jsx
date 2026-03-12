import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ children, allowedEditorialRoles = [], allowAdmin = true }) => {
    const { user, loading, isAdmin, hasEditorialRole } = useAuth();

    if (loading) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Checking permissions...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const isAllowedByAdmin = allowAdmin && isAdmin();
    const isAllowedByRole =
        Array.isArray(allowedEditorialRoles) &&
        allowedEditorialRoles.some((roleName) => hasEditorialRole(roleName));

    if (!isAllowedByAdmin && !isAllowedByRole) {
        return <Navigate to="/coming-soon" replace />;
    }

    return children;
};

export default RoleRoute;
