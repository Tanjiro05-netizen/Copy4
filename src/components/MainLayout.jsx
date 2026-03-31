// src/components/MainLayout.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot } from 'lucide-react';
import Header from './Header';
import * as s from './MainLayout.css.ts';
import { studyThemeClass } from '../styles/obsidianTheme.css.ts';

const MainLayout = ({ children }) => {
    const location = useLocation();
    const isMarxBotPage = location.pathname === '/marxbot';

    return (
        <div className={`${studyThemeClass} ${s.shell}`}>
            <Header />
            <main className={s.main}>
                {children}
            </main>

            {/* Floating MarxBot button — hidden on /marxbot page itself */}
            {!isMarxBotPage && (
                <Link to="/marxbot" className={s.fab} title="MarxBot — Public Preview">
                    <div className={s.fabCircle}>
                        <Bot size={18} />
                        <div className={s.fabPulse} />
                    </div>
                    <div className={s.fabTooltip}>
                        MarxBot<span className={s.fabAccent}>TM</span> Preview
                    </div>
                </Link>
            )}
        </div>
    );
};

export default MainLayout;
