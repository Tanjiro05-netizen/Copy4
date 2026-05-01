// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/theme.css';
import './i18n';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import AppRouter from './AppRouter';

const DEVELOPMENT_CACHE_NAMES = ['api-cache', 'google-fonts', 'images'];

const isDevelopmentAppCache = (cacheName) =>
    DEVELOPMENT_CACHE_NAMES.includes(cacheName) ||
    cacheName.startsWith('workbox-precache') ||
    cacheName.includes('precache');

const clearDevelopmentServiceWorkersAndCaches = () => {
    if (process.env.NODE_ENV === 'production') return;

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .getRegistrations()
            .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
            .catch((error) => {
                console.warn('Failed to unregister development service workers:', error);
            });
    }

    if ('caches' in window) {
        caches
            .keys()
            .then((cacheNames) =>
                Promise.all(
                    cacheNames
                        .filter(isDevelopmentAppCache)
                        .map((cacheName) => caches.delete(cacheName))
                )
            )
            .catch((error) => {
                console.warn('Failed to clear development caches:', error);
            });
    }
};

if (process.env.NODE_ENV === 'production') {
    console.log(
        '%cStop!',
        'color: #991b1b; font-size: 48px; font-weight: bold; -webkit-text-stroke: 2px black;'
    );
    console.log(
        '%cThis is a browser feature intended for developers. If someone told you to copy-paste something here, it is a scam.\n\nThis site\'s source code is proprietary and protected. Unauthorised reproduction is prohibited.',
        'color: #fff; font-size: 14px; background: #111; padding: 8px 12px; border-left: 4px solid #991b1b;'
    );
}

// Add error logging to help debug initialization issues
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

clearDevelopmentServiceWorkersAndCaches();

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

if (process.env.NODE_ENV === 'production') {
    serviceWorkerRegistration.register();
}
