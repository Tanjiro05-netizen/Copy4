'use client';

import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Zap, Leaf } from 'lucide-react';

const PerformanceToggle = () => {
    const { mode, toggleMode } = useTheme();
    const { t } = useTranslation();
    const isLite = mode === 'lite';

    return (
        <button
            onClick={toggleMode}
            role="switch"
            aria-checked={isLite}
            aria-label={isLite ? t('aesthetic.lite', 'Lite') : t('aesthetic.full', 'Full')}
            title={isLite ? t('aesthetic.lite', 'Lite') : t('aesthetic.full', 'Full')}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px 4px 6px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 150ms ease',
            }}
        >
            <span
                style={{
                    position: 'relative',
                    display: 'inline-flex',
                    alignItems: 'center',
                    width: '28px',
                    height: '16px',
                    borderRadius: '999px',
                    background: isLite ? 'rgba(185,28,28,0.3)' : 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'background 180ms ease',
                    flexShrink: 0,
                }}
            >
                <span
                    style={{
                        position: 'absolute',
                        left: isLite ? '12px' : '1px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: isLite ? '#b91c1c' : 'rgba(255,255,255,0.5)',
                        transition: 'left 180ms ease, background 180ms ease',
                    }}
                >
                    {isLite ? <Leaf size={9} color="#fff" /> : <Zap size={9} color="#fff" />}
                </span>
            </span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em' }}>
                {isLite ? t('aesthetic.lite', 'Lite') : t('aesthetic.full', 'Full')}
            </span>
        </button>
    );
};

export default PerformanceToggle;
