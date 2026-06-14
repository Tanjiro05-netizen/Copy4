import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
    canProfileManagePolitics,
    canProfileManageStudy,
    DEV_ADMIN_PASSWORD,
    DEV_ADMIN_PROFILE,
    DEV_ADMIN_USER,
    DEV_AUTH_COOKIE_KEY,
    DEV_AUTH_STORAGE_KEY,
    hasEditorialRoleInProfile,
    isAdminProfile,
    isAdminUser,
    isLocalDevelopmentHost,
} from '../lib/auth.js';

export {
    canProfileManagePolitics,
    canProfileManageStudy,
    hasEditorialRoleInProfile,
    isAdminProfile,
    isAdminUser,
    isLocalDevelopmentHost,
} from '../lib/auth.js';

const AuthContext = createContext();
const LOGIN_TIMEOUT_MS = 30000;
const SESSION_TIMEOUT_MS = 20000;
const SESSION_RETRY_DELAY_MS = 1200;

export const AUTH_TIMEOUT_MESSAGE = 'Connection is slow — Supabase may be waking up. Please try again in a few seconds.';

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

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchRoleFallbackProfile = async (userId) => {
    if (!userId) return null;

    try {
        const { data: role, error } = await supabase.rpc('get_user_role');
        if (error || !role) return null;
        return { id: userId, role };
    } catch (error) {
        console.warn('Profile role fallback failed:', error);
        return null;
    }
};

const getSessionWithRetry = async () => {
    const getSessionOnce = () =>
        withTimeout(
            supabase.auth.getSession(),
            SESSION_TIMEOUT_MS,
            'Auth session check timed out.'
        );

    try {
        return await getSessionOnce();
    } catch (firstError) {
        await delay(SESSION_RETRY_DELAY_MS);
        try {
            return await getSessionOnce();
        } catch (finalError) {
            finalError.cause = firstError;
            throw finalError;
        }
    }
};

export const AuthProvider = ({ children, initialUser = null, initialProfile = null, initialAuthResolved = false }) => {
    const [user, setUser] = useState(initialUser);
    const [profile, setProfile] = useState(initialProfile);
    const [loading, setLoading] = useState(!initialAuthResolved);

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
                .maybeSingle();
            
            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error);
            }
            setProfile(data || await fetchRoleFallbackProfile(userId));
        } catch (error) {
            console.error('Error fetching profile:', error);
            setProfile(await fetchRoleFallbackProfile(userId));
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
                const { data: { session } } = await getSessionWithRetry();
                setUser(session?.user ?? null);
                if (session?.user) {
                    await withTimeout(fetchProfile(session.user.id), SESSION_TIMEOUT_MS, 'Profile loading timed out.');
                }
            } catch (error) {
                console.warn('Auth session unavailable; continuing without a saved session.', error);
                setUser(null);
                setProfile(null);
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
        return isAdminProfile(profile) || isAdminUser(user);
    };

    const hasEditorialRole = (roleName) => {
        return hasEditorialRoleInProfile(profile, roleName);
    };

    const canManagePolitics = () => {
        if (hasLocalDevAuth()) {
            return true;
        }
        return canProfileManagePolitics(profile) || isAdminUser(user);
    };

    const canManageStudy = () => {
        if (hasLocalDevAuth()) {
            return true;
        }
        return canProfileManageStudy(profile) || isAdminUser(user);
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
                document.cookie = `${DEV_AUTH_COOKIE_KEY}=true; path=/; SameSite=Lax`;
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
                document.cookie = `${DEV_AUTH_COOKIE_KEY}=; path=/; Max-Age=0; SameSite=Lax`;
            }
            setUser(null);
            setProfile(null);
            // Clear service-worker api-cache to prevent stale session data
            if ('caches' in window) {
                caches.delete('api-cache').catch(() => {});
            }
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
