import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

const normalizeRoleToken = (value) => `${value || ''}`.trim().toLowerCase();
const LOGIN_TIMEOUT_MS = 15000;
const SESSION_TIMEOUT_MS = 8000;
const DEV_ADMIN_USER = { id: 'dev-admin', email: 'admin@localhost', role: 'authenticated' };
const DEV_ADMIN_PROFILE = { id: 'dev-admin', username: 'DevAdmin', role: 'admin', is_admin: true };
const DEV_ADMIN_PASSWORD = 'admin123';
const DEV_AUTH_STORAGE_KEY = 'marxist_dev_auth';

export const AUTH_TIMEOUT_MESSAGE = 'Supabase did not respond. Check your connection and try again.';

export const isLocalDevelopmentHost = (hostname) => {
    const currentHostname =
        hostname ?? (typeof window !== 'undefined' ? window.location.hostname : '');
    const normalizedHostname = `${currentHostname || ''}`.trim().toLowerCase();

    return (
        normalizedHostname === 'localhost' ||
        normalizedHostname === '127.0.0.1' ||
        normalizedHostname === '0.0.0.0' ||
        normalizedHostname === '::1' ||
        normalizedHostname === '[::1]' ||
        normalizedHostname.endsWith('.localhost')
    );
};

const hasLocalDevAuth = () =>
    isLocalDevelopmentHost() &&
    typeof localStorage !== 'undefined' &&
    localStorage.getItem(DEV_AUTH_STORAGE_KEY);

const withTimeout = async (promise, ms, timeoutMessage) => {
    let timeoutId;

    try {
        return await Promise.race([
            promise,
            new Promise((_, reject) => {
                timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), ms);
            }),
        ]);
    } finally {
        clearTimeout(timeoutId);
    }
};

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
        const getSession = async () => {
            // Check for dev auth bypass
            if (hasLocalDevAuth()) {
                setUser(DEV_ADMIN_USER);
                setProfile(DEV_ADMIN_PROFILE);
                setLoading(false);
                return;
            }

            try {
                const { data: { session } } = await withTimeout(
                    supabase.auth.getSession(),
                    SESSION_TIMEOUT_MS,
                    'Auth session check timed out.'
                );
                setUser(session?.user ?? null);
                if (session?.user) {
                    await withTimeout(fetchProfile(session.user.id), SESSION_TIMEOUT_MS, 'Profile loading timed out.');
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
            if (hasLocalDevAuth()) {
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
        if (hasLocalDevAuth()) {
            return true;
        }
        return isAdminProfile(profile);
    };

    const hasEditorialRole = (roleName) => {
        return hasEditorialRoleInProfile(profile, roleName);
    };

    const canManagePolitics = () => {
        if (hasLocalDevAuth()) {
            return true;
        }
        return canProfileManagePolitics(profile);
    };

    const canManageStudy = () => {
        if (hasLocalDevAuth()) {
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
            const credentials = {
                email: `${data.email || ''}`.trim().toLowerCase(),
                password: data.password || '',
            };

            if (
                isLocalDevelopmentHost() &&
                credentials.email === DEV_ADMIN_USER.email &&
                credentials.password === DEV_ADMIN_PASSWORD
            ) {
                localStorage.setItem(DEV_AUTH_STORAGE_KEY, 'true');
                setUser(DEV_ADMIN_USER);
                setProfile(DEV_ADMIN_PROFILE);
                return { error: null };
            }

            const result = await withTimeout(
                supabase.auth.signInWithPassword(credentials),
                LOGIN_TIMEOUT_MS,
                AUTH_TIMEOUT_MESSAGE
            );

            if (result.data?.user) {
                setUser(result.data.user);
                await withTimeout(fetchProfile(result.data.user.id), SESSION_TIMEOUT_MS, 'Profile loading timed out.')
                    .catch((error) => console.error('Error fetching profile after login:', error));
            }

            return result;
        },
        logout: async () => {
            if (isLocalDevelopmentHost()) {
                localStorage.removeItem(DEV_AUTH_STORAGE_KEY);
            }
            setUser(null);
            setProfile(null);
            return supabase.auth.signOut();
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
