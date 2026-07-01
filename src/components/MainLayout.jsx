// src/components/MainLayout.jsx
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot } from 'lucide-react';
import Header from './Header';
import * as s from './MainLayout.css.ts';
import { studyThemeClass, liteThemeClass } from '../styles/obsidianTheme.css.ts';
import { useTheme } from '../context/ThemeContext';

const MainLayout = ({ children, hideHeader = false, hideFab = false }) => {
    const pathname = usePathname();
    const isMarxBotPage = pathname === '/marxbot';
    const { mode } = useTheme();
    const themeClass = mode === 'lite' ? liteThemeClass : studyThemeClass;

    return (
        <div className={`${themeClass} ${s.shell}`}>
            {!hideHeader && <Header />}
            <main className={hideHeader ? s.mainFullBleed : s.main}>
                {children}
            </main>

            {/* Floating MarxBot button — hidden on /marxbot page itself */}
            {!hideFab && !isMarxBotPage && (
                <Link href="/marxbot" className={s.fab} title="MarxBot — Public Preview">
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
