import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

const normalizeRoleToken = (value) => `${value || ''}`.trim().toLowerCase();

export const isAdminProfile = (profile) =>
    profile?.is_admin === true || normalizeRoleToken(profile?.role) === 'admin';

export const hasEditorialRoleInProfile = (profile, roleName) => {
    const normalizedTarget = normalizeRoleToken(roleName);
    if (!normalizedTarget) return false;

    const editorialRoles = Array.isArray(profile?.editorial_roles) ? profile.editorial_roles : [];

    const matchesEditorialArray = editorialRoles.some(
        (role) => normalizeRoleToken(role) === normalizedTarget
    );

    const matchesLegacyRole = normalizeRoleToken(profile?.role) === normalizedTarget;

    return matchesEditorialArray || matchesLegacyRole;
};

export const canProfileManagePolitics = (profile) =>
    isAdminProfile(profile) || hasEditorialRoleInProfile(profile, 'News');

export const canProfileManageStudy = (profile) =>
    isAdminProfile(profile) || hasEditorialRoleInProfile(profile, 'Teacher');

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
        const withTimeout = (promise, ms) =>
            Promise.race([
                promise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
            ]);

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
                const { data: { session } } = await withTimeout(supabase.auth.getSession(), 8000);
                setUser(session?.user ?? null);
                if (session?.user) {
                    await withTimeout(fetchProfile(session.user.id), 8000);
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
        return isAdminProfile(profile);
    };

    const hasEditorialRole = (roleName) => {
        return hasEditorialRoleInProfile(profile, roleName);
    };

    const canManagePolitics = () => {
        if (window.location.hostname === 'localhost' && localStorage.getItem('marxist_dev_auth')) {
            return true;
        }
        return canProfileManagePolitics(profile);
    };

    const canManageStudy = () => {
        if (window.location.hostname === 'localhost' && localStorage.getItem('marxist_dev_auth')) {
            return true;
        }
        return canProfileManageStudy(profile);
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
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Login timed out — server not responding.')), 10000)
            );
            return Promise.race([supabase.auth.signInWithPassword(data), timeout]);
        },
        logout: () => {
            if (window.location.hostname === 'localhost') {
                localStorage.removeItem('marxist_dev_auth');
            }
            setUser(null);
            setProfile(null);
            supabase.auth.signOut().catch(e => console.error('signOut error:', e));
        },
        user,
        profile,
        loading,
        isAdmin,
        hasEditorialRole,
        canManagePolitics,
        canManageStudy,
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