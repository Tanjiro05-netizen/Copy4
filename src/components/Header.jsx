import React from 'react';
import { Menu, Globe, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { t, i18n } = useTranslation();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'kr' : 'en';
        i18n.changeLanguage(newLang);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="text-white font-medium">
                        {t('MARXIST.THEORY')}
                    </Link>

                    <div className="flex items-center space-x-4">
                        <Link
                            to="/theory"
                            className="text-white hover:text-red-400 transition-colors text-sm tracking-wide"
                        >
                            {t('nav.theory')}
                        </Link>
                        <Link
                            to="/analysis"
                            className="text-white hover:text-red-400 transition-colors text-sm tracking-wide"
                        >
                            {t('nav.analysis')}
                        </Link>
                        <Link
                            to="/digital-library"
                            className="text-white hover:text-red-400 transition-colors text-sm tracking-wide"
                        >
                            {t('nav.library')}
                        </Link>
                        <Link
                            to="/directory"
                            className="text-white hover:text-red-400 transition-colors text-sm tracking-wide"
                        >
                            {t('nav.directory')}
                        </Link>
                        <Link
                            to="/submit"
                            className="text-white hover:text-red-400 transition-colors text-sm tracking-wide"
                        >
                            {t('nav.submit')}
                        </Link>
                        <Link
                            to="/visualizations"
                            className="px-4 py-1 text-sm text-gray-400 hover:bg-neutral-800 rounded"
                        >
                            Data Analysis
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;