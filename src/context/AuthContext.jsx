import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSession = async () => {
            // Check for dev auth bypass
            if (window.location.hostname === 'localhost' && localStorage.getItem('marxist_dev_auth')) {
                setUser({ id: 'dev-admin', email: 'admin@localhost', role: 'authenticated' });
                setLoading(false);
                return;
            }

            try {
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null);
            } catch (error) {
                console.error('Error getting session:', error);
            } finally {
                setLoading(false);
            }
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            // Respect dev auth if present
            if (window.location.hostname === 'localhost' && localStorage.getItem('marxist_dev_auth')) {
                return;
            }
            setUser(session?.user ?? null);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const value = {
        signUp: (data) => supabase.auth.signUp(data),
        login: async (data) => {
    if (window.location.hostname === 'localhost' && data.email === 'admin@localhost' && data.password === 'admin123') {
        localStorage.setItem('marxist_dev_auth', 'true');
        setUser({ id: 'dev-admin', email: 'admin@localhost', role: 'authenticated' });
        return { error: null };
    }
    return supabase.auth.signInWithPassword(data);
}
,
        logout: async () => {
            if (window.location.hostname === 'localhost') {
                localStorage.removeItem('marxist_dev_auth');
            }
            return supabase.auth.signOut();
        },
        user,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};