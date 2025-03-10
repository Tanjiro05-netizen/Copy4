import React, { useState } from 'react';
import { Menu, Globe, LogOut, BarChart, BookOpen, FileText, Home } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { t, i18n } = useTranslation();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path) => {
        return location.pathname === path;
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'kr' : 'en';
        i18n.changeLanguage(newLang);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    const navItems = [
        { path: '/', label: t('nav.home', 'Home'), icon: Home },
        { path: '/theory', label: t('nav.theory', 'Theory'), icon: BookOpen },
        { path: '/analysis', label: t('nav.analysis', 'Analysis'), icon: FileText },
        { path: '/digital-library', label: t('nav.library', 'Library'), icon: BookOpen },
        { path: '/visualizations', label: t('nav.data', 'Data'), icon: BarChart }
    ];
    
    return (
        <header className="fixed top-0 w-full bg-black/50 backdrop-blur-sm text-white p-4 z-50 border-b border-gray-800">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold tracking-wider">
                    {t('MARXIST.THEORY', 'Marxist Theory')}
                </Link>
                
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-6">
                    <nav className="flex items-center space-x-6">
                        {navItems.map((item) => (
                            <Link 
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-1 text-sm font-medium hover:text-red-400 transition-colors ${
                                    isActive(item.path) ? 'text-red-500' : 'text-gray-300'
                                }`}
                            >
                                <item.icon className="w-4 h-4" />
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                    
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={toggleLanguage}
                            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                            title={t('nav.switchLanguage', 'Switch Language')}
                        >
                            <Globe className="w-5 h-5" />
                        </button>
                        
                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                            title={t('nav.logout', 'Logout')}
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                
                {/* Mobile Menu Button */}
                <button 
                    className="md:hidden p-2 hover:bg-gray-800 rounded-full transition-colors"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>
            
            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50 bg-black/95 pt-16">
                    <div className="container mx-auto px-4 py-8 flex flex-col">
                        <div className="flex justify-end mb-4">
                            <button 
                                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Menu className="w-6 h-6 text-white" />
                            </button>
                        </div>
                        <nav className="flex flex-col space-y-6">
                            {navItems.map((item) => (
                                <Link 
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center space-x-3 text-lg font-medium hover:text-red-400 transition-colors ${
                                        isActive(item.path) ? 'text-red-500' : 'text-white'
                                    }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </nav>
                        <div className="mt-8 flex justify-center space-x-6">
                            <button
                                onClick={() => {
                                    toggleLanguage();
                                    setMobileMenuOpen(false);
                                }}
                                className="flex items-center space-x-2 text-white hover:text-red-400 transition-colors"
                            >
                                <Globe className="w-5 h-5" />
                                <span>{i18n.language.toUpperCase()}</span>
                            </button>
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setMobileMenuOpen(false);
                                }}
                                className="flex items-center space-x-2 text-white hover:text-red-400 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>{t('nav.logout', 'Logout')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;