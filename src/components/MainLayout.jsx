// src/components/MainLayout.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot } from 'lucide-react';
import Header from './Header';

const MainLayout = ({ children }) => {
    const location = useLocation();
    const isMarxBotPage = location.pathname === '/marxbot';

    return (
        <div className="min-h-screen bg-[#12131A] text-white">
            <Header />
            <main className="pt-16">
                {children}
            </main>

            {/* Floating MarxBot button — hidden on /marxbot page itself */}
            {!isMarxBotPage && (
                <Link
                    to="/marxbot"
                    className="fixed bottom-6 right-6 z-50 group"
                    title="MarxBot — Coming Soon"
                >
                    <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gray-900 border border-red-900/40 hover:border-red-700/60 transition-all duration-300 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                        <Bot className="w-5 h-5 text-red-500/70 group-hover:text-red-400 transition-colors" />
                        {/* Pulse ring */}
                        <div className="absolute inset-0 rounded-full border border-red-500/20 animate-ping" style={{ animationDuration: '2s' }} />
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-black/90 border border-red-900/30 rounded text-[10px] font-mono text-gray-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        MarxBot<span className="text-red-500">TM</span>
                    </div>
                </Link>
            )}
        </div>
    );
};

export default MainLayout;
