import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Check if theme preference exists in localStorage, otherwise default to dark
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || 'dark';
    });

    // Update theme in localStorage when it changes
    useEffect(() => {
        localStorage.setItem('theme', theme);
        // Apply theme to the document element
        document.documentElement.setAttribute('data-theme', theme);
        // Update body class for global styling
        if (theme === 'light') {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        } else {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        }
    }, [theme]);

    // Toggle between dark and light themes
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
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