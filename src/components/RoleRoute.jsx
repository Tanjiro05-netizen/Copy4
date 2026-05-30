import React, { useState, useEffect } from 'react';
import RedirectTo from './RedirectTo.jsx';
import { useAuth } from '../context/AuthContext';

const RoleRoute = ({ children, allowedEditorialRoles = [], allowAdmin = true }) => {
    const { user, loading, isAdmin, hasEditorialRole } = useAuth();
    const [timedOut, setTimedOut] = useState(false);

    useEffect(() => {
        if (!loading) return;
        const id = setTimeout(() => setTimedOut(true), 3000);
        return () => clearTimeout(id);
    }, [loading]);

    if (loading && !timedOut) {
        return (
            <div className="min-h-screen bg-[#12131A] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-400 text-sm">Checking permissions...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return <RedirectTo href="/login" replace />;
    }

    const isAllowedByAdmin = allowAdmin && isAdmin();
    const isAllowedByRole =
        Array.isArray(allowedEditorialRoles) &&
        allowedEditorialRoles.some((roleName) => hasEditorialRole(roleName));

    if (!isAllowedByAdmin && !isAllowedByRole) {
        return <RedirectTo href="/coming-soon" replace />;
    }

    return children;
};

export default RoleRoute;
