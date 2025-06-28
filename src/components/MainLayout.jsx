// src/components/MainLayout.jsx
import React from 'react';
import Header from './Header';

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-[#12131A] text-white">
            <Header />
            <main className="pt-16">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
