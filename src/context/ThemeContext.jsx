import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const AESTHETIC_STORAGE_KEY = 'marxist-aesthetic-mode';
const FONT_LINK_ID = 'marxist-google-fonts';
const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Hanken+Grotesk:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap';

const ThemeContext = createContext();

const getInitialMode = () => {
    if (typeof window === 'undefined') return 'full';
    try {
        const stored = localStorage.getItem(AESTHETIC_STORAGE_KEY);
        return stored === 'lite' ? 'lite' : 'full';
    } catch {
        return 'full';
    }
};

const ensureFontLink = (shouldLoad) => {
    if (typeof document === 'undefined') return;
    const existing = document.getElementById(FONT_LINK_ID);
    if (shouldLoad && !existing) {
        const link = document.createElement('link');
        link.id = FONT_LINK_ID;
        link.rel = 'stylesheet';
        link.href = FONT_HREF;
        document.head.appendChild(link);
    } else if (!shouldLoad && existing) {
        existing.remove();
    }
};

export const ThemeProvider = ({ children }) => {
    const theme = 'dark';
    const [mode, setModeState] = useState(getInitialMode);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute('data-aesthetic', mode);
        ensureFontLink(mode === 'full');
    }, [mode]);

    const setMode = useCallback((next) => {
        setModeState(next);
        try {
            localStorage.setItem(AESTHETIC_STORAGE_KEY, next);
        } catch {
            // ignore storage errors
        }
    }, []);

    const toggleMode = useCallback(() => {
        setModeState((prev) => {
            const next = prev === 'full' ? 'lite' : 'full';
            try {
                localStorage.setItem(AESTHETIC_STORAGE_KEY, next);
            } catch {
                // ignore storage errors
            }
            return next;
        });
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, mode, setMode, toggleMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Custom hook to use the theme context
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};