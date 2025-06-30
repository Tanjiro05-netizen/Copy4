// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import './styles/theme.css';
import AppRouter from './AppRouter';

// Add error logging to help debug initialization issues
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Wrap the root render in a try-catch to catch any initialization errors
try {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
        <React.StrictMode>
            <AppRouter />
        </React.StrictMode>
    );
} catch (error) {
    console.error('Failed to render app:', error);
}