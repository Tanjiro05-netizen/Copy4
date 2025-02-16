// src/App.jsx
import React, { useState } from 'react';
import { Menu, Book, Globe, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './context/AuthContext';

const App = () => {
    const [activeSection, setActiveSection] = useState('home');
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
        <div className="min-h-screen bg-[#12131A]">
            <header className="relative h-screen">
                <div className="absolute inset-0 bg-[radial-gradient(#ff000033_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div
                        className="w-[800px] h-[800px] opacity-20"
                        style={{
                            background: `url('/images/hammerandsickle.png') no-repeat center center`,
                            backgroundSize: 'contain',
                            filter: 'brightness(0.7) contrast(1.2)',
                            mixBlendMode: 'soft-light'
                        }}
                    ></div>
                </div>

                <nav className="absolute top-0 w-full bg-transparent text-white p-4 z-50">
                    <div className="container mx-auto flex justify-between items-center">
                        <div className="text-2xl font-bold tracking-wider">{t('nav.brand')}</div>
                        <div className="hidden md:flex space-x-8">
                            <Link
                                to="/theory"
                                className={`${activeSection === 'theory' ? 'text-red-500' : 'text-white'} hover:text-red-400 transition-colors text-sm tracking-wide`}
                            >
                                {t('nav.theory')}
                            </Link>
                            <Link
                                to="/analysis"
                                className={`${activeSection === 'analysis' ? 'text-red-500' : 'text-white'} hover:text-red-400 transition-colors text-sm tracking-wide`}
                            >
                                {t('nav.analysis')}
                            </Link>
                            <Link
                                to="/digital-library"
                                className={`${activeSection === 'digital-library' ? 'text-red-500' : 'text-white'} hover:text-red-400 transition-colors text-sm tracking-wide`}
                            >
                                {t('nav.library')}
                            </Link>
                            <Link
                                to="/submit"
                                className={`${activeSection === 'submit' ? 'text-red-500' : 'text-white'} hover:text-red-400 transition-colors text-sm tracking-wide`}
                            >
                                {t('nav.submit')}
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={toggleLanguage}
                                className="flex items-center space-x-2 hover:text-red-400 transition-colors"
                            >
                                <Globe className="h-5 w-5" />
                                <span className="text-sm">{i18n.language.toUpperCase()}</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 hover:text-red-400 transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                                <span className="text-sm">Logout</span>
                            </button>
                            <Menu className="h-6 w-6 md:hidden" />
                        </div>
                    </div>
                </nav>

                <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center space-y-8 max-w-4xl px-4">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                            {t('hero.title')}
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
                            {t('hero.subtitle')}
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link
                                to="/theory"
                                className="bg-red-600 text-white px-8 py-3 rounded-full hover:bg-red-700 transition-colors inline-block"
                            >
                                {t('hero.buttons.explore')}
                            </Link>
                            <button className="border border-white px-8 py-3 rounded-full hover:bg-white hover:text-red-900 transition-all">
                                {t('hero.buttons.submit')}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <section className="py-20 bg-black/50 backdrop-blur-sm">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl text-white mb-12 font-bold">{t('featured.title')}</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeaturedCard
                            title={t('featured.cards.dialectics.title')}
                            excerpt={t('featured.cards.dialectics.excerpt')}
                            category={t('featured.cards.dialectics.category')}
                        />
                        <FeaturedCard
                            title={t('featured.cards.labor.title')}
                            excerpt={t('featured.cards.labor.excerpt')}
                            category={t('featured.cards.labor.category')}
                        />
                        <FeaturedCard
                            title={t('featured.cards.ai.title')}
                            excerpt={t('featured.cards.ai.excerpt')}
                            category={t('featured.cards.ai.category')}
                        />
                    </div>
                </div>
            </section>

            <section className="py-20">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl text-white mb-12 font-bold">{t('library.title')}</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="bg-black/30 backdrop-blur-sm p-6 rounded-lg text-white hover:bg-black/40 transition-colors"
                            >
                                <Book className="w-8 h-8 mb-4 text-red-500" />
                                <h3 className="text-xl font-semibold mb-2">{t('library.classicalTexts.title')}</h3>
                                <p className="text-gray-400">{t('library.classicalTexts.description')}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

const FeaturedCard = ({ title, excerpt, category }) => {
    const { t } = useTranslation();

    return (
        <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg text-white hover:bg-black/40 transition-colors border border-red-900/30">
            <div className="text-red-500 text-sm mb-4">{category}</div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-400 mb-4">{excerpt}</p>
            <button className="text-red-500 hover:text-red-400 transition-colors text-sm">
                {t('common.readMore')}
            </button>
        </div>
    );
};

export default App;