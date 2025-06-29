import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

const AdminRoute = ({ children }) => {
    const { user } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const checkAdminStatus = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                if (data && data.role === 'admin') {
                    setIsAdmin(true);
                }
            } catch (error) {
                console.error('Error checking admin status:', error);
            } finally {
                setLoading(false);
            }
        };

        checkAdminStatus();
    }, [user]);

    if (loading) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Checking permissions...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    if (!isAdmin) {
        return <Navigate to="/coming-soon" replace />;
    }

    return children;
};

export default AdminRoute;
