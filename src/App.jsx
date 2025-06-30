import React, { useState } from 'react';
import { Menu, Book, Globe, LogOut, FileText, BookOpen, BarChart, Sun, Moon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import hammerAndSickle from './assets/images/hammerandsickle.png';


const App = () => {
    const [activeSection, setActiveSection] = useState('home');
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNavClick = (section) => {
        setActiveSection(section);
    };

    return (
        <div className="min-h-screen bg-[#12131A]">
            <div className="relative h-screen">
                <div className="absolute inset-0 bg-[radial-gradient(#ff000033_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div
                        className="w-[800px] h-[800px] opacity-20"
                        style={{
                            background: `url(${hammerAndSickle}) no-repeat center center`,
                            backgroundSize: 'contain',
                            filter: 'brightness(0.7) contrast(1.2)',
                            mixBlendMode: 'soft-light'
                        }}
                    ></div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center space-y-8 max-w-4xl px-4">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                            Advancing Revolutionary Theory
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
                            A platform for the new generation of Marxist theorists and researchers.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link
                                to="/theory"
                                className="bg-red-600 text-white px-8 py-3 rounded-full hover:bg-red-700 transition-colors inline-block"
                            >
                                Explore Theory
                            </Link>
                            <Link
                                to="/submit"
                                className="border border-white px-8 py-3 rounded-full hover:bg-white hover:text-red-900 transition-all"
                            >
                                Submit Work
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Section */}
            <section className="py-20 bg-black/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-bold text-white">
                                About Our Collective
                            </h2>
                            <p className="text-gray-300 text-lg leading-relaxed">
                                We are a collective of researchers, theorists, and activists dedicated to advancing Marxist theory and practice in the contemporary world. Our platform serves as a hub for critical analysis, theoretical development, and revolutionary scholarship.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-8 pt-6 text-left">
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 rounded-lg bg-red-600/20 flex items-center justify-center flex-shrink-0">
                                        <Book className="w-6 h-6 text-red-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold mb-2">Research Focus</h3>
                                        <p className="text-gray-400">Conducting rigorous theoretical research and analysis of contemporary social, economic, and political phenomena through a Marxist lens.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 rounded-lg bg-red-600/20 flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-6 h-6 text-red-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold mb-2">Publication Platform</h3>
                                        <p className="text-gray-400">Providing a platform for revolutionary scholars to publish and share their research, analyses, and theoretical contributions.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default App;