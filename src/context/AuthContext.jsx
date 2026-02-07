import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId) => {
        if (!userId) {
            setProfile(null);
            return;
        }
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error);
            }
            setProfile(data || null);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setProfile(null);
        }
    };

    useEffect(() => {
        const getSession = async () => {
            // Check for dev auth bypass
            if (window.location.hostname === 'localhost' && localStorage.getItem('marxist_dev_auth')) {
                const devUser = { id: 'dev-admin', email: 'admin@localhost', role: 'authenticated' };
                setUser(devUser);
                setProfile({ id: 'dev-admin', username: 'DevAdmin', role: 'admin', is_admin: true });
                setLoading(false);
                return;
            }

            try {
                const { data: { session } } = await supabase.auth.getSession();
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchProfile(session.user.id);
                }
            } catch (error) {
                console.error('Error getting session:', error);
            } finally {
                setLoading(false);
            }
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            // Respect dev auth if present
            if (window.location.hostname === 'localhost' && localStorage.getItem('marxist_dev_auth')) {
                return;
            }
            setUser(session?.user ?? null);
            if (session?.user) {
                await fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const isAdmin = () => {
        if (window.location.hostname === 'localhost' && localStorage.getItem('marxist_dev_auth')) {
            return true;
        }
        return profile?.is_admin === true || profile?.role === 'admin';
    };

    const value = {
        signUp: ({ email, password, username, inviteCode, betaReason }) => supabase.auth.signUp({
            email,
            password,
            options: { data: { user_name: username, invite_code: inviteCode, beta_reason: betaReason } }
        }),
        login: async (data) => {
            if (window.location.hostname === 'localhost' && data.email === 'admin@localhost' && data.password === 'admin123') {
                localStorage.setItem('marxist_dev_auth', 'true');
                setUser({ id: 'dev-admin', email: 'admin@localhost', role: 'authenticated' });
                setProfile({ id: 'dev-admin', username: 'DevAdmin', role: 'admin', is_admin: true });
                return { error: null };
            }
            return supabase.auth.signInWithPassword(data);
        },
        logout: async () => {
            if (window.location.hostname === 'localhost') {
                localStorage.removeItem('marxist_dev_auth');
            }
            setProfile(null);
            return supabase.auth.signOut();
        },
        user,
        profile,
        loading,
        isAdmin,
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