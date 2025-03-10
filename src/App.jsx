// src/App.jsx
import React, { useState } from 'react';
import { Menu, Book, Globe, LogOut, FileText, BookOpen, BarChart } from 'lucide-react';
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

    const handleNavClick = (section) => {
        setActiveSection(section);
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
                                onClick={() => handleNavClick('theory')}
                                className={`${activeSection === 'theory' ? 'text-red-500' : 'text-white'} hover:text-red-400 transition-colors text-sm tracking-wide`}
                            >
                                {t('nav.theory')}
                            </Link>
                            <Link
                                to="/analysis"
                                onClick={() => handleNavClick('analysis')}
                                className={`${activeSection === 'analysis' ? 'text-red-500' : 'text-white'} hover:text-red-400 transition-colors text-sm tracking-wide`}
                            >
                                {t('nav.analysis')}
                            </Link>
                            <Link
                                to="/digital-library"
                                onClick={() => handleNavClick('digital-library')}
                                className={`${activeSection === 'digital-library' ? 'text-red-500' : 'text-white'} hover:text-red-400 transition-colors text-sm tracking-wide`}
                            >
                                {t('nav.library')}
                            </Link>
                            <Link
                                to="/visualizations"
                                onClick={() => handleNavClick('visualizations')}
                                className={`${activeSection === 'visualizations' ? 'text-red-500' : 'text-white'} hover:text-red-400 transition-colors text-sm tracking-wide`}
                            >
                                <BarChart className="h-4 w-4 inline mr-1" />
                                {t('nav.data', 'Data')}
                            </Link>
                            <Link
                                to="/submit"
                                onClick={() => handleNavClick('submit')}
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

            {/* About Section */}
            <section className="py-20 bg-black/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <h2 className="text-3xl md:text-4xl font-bold text-white">
                                    {t('about.title', 'About Our Collective')}
                                </h2>
                                <p className="text-gray-300 text-lg leading-relaxed">
                                    {t('about.description', 'We are a collective of researchers, theorists, and activists dedicated to advancing Marxist theory and practice in the contemporary world. Our platform serves as a hub for critical analysis, theoretical development, and revolutionary scholarship.')}
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 rounded-lg bg-red-600/20 flex items-center justify-center flex-shrink-0">
                                            <Book className="w-6 h-6 text-red-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold mb-2">{t('about.research.title', 'Research Focus')}</h3>
                                            <p className="text-gray-400">{t('about.research.description', 'Conducting rigorous theoretical research and analysis of contemporary social, economic, and political phenomena through a Marxist lens.')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 rounded-lg bg-red-600/20 flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-6 h-6 text-red-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold mb-2">{t('about.publication.title', 'Publication Platform')}</h3>
                                            <p className="text-gray-400">{t('about.publication.description', 'Providing a platform for revolutionary scholars to publish and share their research, analyses, and theoretical contributions.')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="aspect-square rounded-lg overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-red-900/80 to-red-600/80">
                                        <div className="absolute inset-0 bg-[radial-gradient(#ff000033_1px,transparent_1px)] [background-size:8px_8px] opacity-20"></div>
                                    </div>
                                    <div className="relative z-10 h-full flex items-center justify-center p-8">
                                        <div className="text-center">
                                            <h3 className="text-white text-xl font-bold mb-4">{t('about.stats.title', 'Our Impact')}</h3>
                                            <div className="grid grid-cols-2 gap-8">
                                                <div>
                                                    <div className="text-3xl font-bold text-white mb-2">50+</div>
                                                    <div className="text-sm text-gray-300">{t('about.stats.researchers', 'Researchers')}</div>
                                                </div>
                                                <div>
                                                    <div className="text-3xl font-bold text-white mb-2">100+</div>
                                                    <div className="text-sm text-gray-300">{t('about.stats.publications', 'Publications')}</div>
                                                </div>
                                                <div>
                                                    <div className="text-3xl font-bold text-white mb-2">5K+</div>
                                                    <div className="text-sm text-gray-300">{t('about.stats.readers', 'Monthly Readers')}</div>
                                                </div>
                                                <div>
                                                    <div className="text-3xl font-bold text-white mb-2">20+</div>
                                                    <div className="text-sm text-gray-300">{t('about.stats.countries', 'Countries')}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Link to="/theory" className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-900/80 to-red-600/80 p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                            <div className="absolute inset-0 bg-[radial-gradient(#ff000033_1px,transparent_1px)] [background-size:8px_8px] opacity-20"></div>
                            <Book className="h-12 w-12 text-white mb-4 transform group-hover:scale-110 transition-transform duration-500" />
                            <h3 className="text-2xl font-bold text-white mb-3">Revolutionary Theory</h3>
                            <p className="text-gray-300">Explore foundational Marxist texts and contemporary theoretical developments</p>
                            <div className="absolute bottom-4 right-4 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500">
                                <span className="text-white">→</span>
                            </div>
                        </Link>

                        <Link to="/analysis" className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-900/80 to-red-600/80 p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                            <div className="absolute inset-0 bg-[radial-gradient(#ff000033_1px,transparent_1px)] [background-size:8px_8px] opacity-20"></div>
                            <FileText className="h-12 w-12 text-white mb-4 transform group-hover:scale-110 transition-transform duration-500" />
                            <h3 className="text-2xl font-bold text-white mb-3">Analysis</h3>
                            <p className="text-gray-300">Discover critical analyses of contemporary issues through a Marxist lens</p>
                            <div className="absolute bottom-4 right-4 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500">
                                <span className="text-white">→</span>
                            </div>
                        </Link>

                        <Link to="/digital-library" className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-red-900/80 to-red-600/80 p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                            <div className="absolute inset-0 bg-[radial-gradient(#ff000033_1px,transparent_1px)] [background-size:8px_8px] opacity-20"></div>
                            <BookOpen className="h-12 w-12 text-white mb-4 transform group-hover:scale-110 transition-transform duration-500" />
                            <h3 className="text-2xl font-bold text-white mb-3">Digital Library</h3>
                            <p className="text-gray-300">Access our comprehensive collection of revolutionary literature</p>
                            <div className="absolute bottom-4 right-4 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500">
                                <span className="text-white">→</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default App;