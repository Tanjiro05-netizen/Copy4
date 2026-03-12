import React, { useState } from 'react';
import { Menu, Book, Globe, LogOut, FileText, BookOpen, BarChart, Sun, Moon,
    Newspaper, GraduationCap, HelpCircle, BookMarked, FlaskConical, LineChart,
    Users, Bot, Terminal, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from './context/AuthContext';
import hammerAndSickleImage from './assets/hammerandsickle.png';
import { useTheme } from './context/ThemeContext';
import { Analytics } from '@vercel/analytics/react';



const App = () => {
    const [activeSection, setActiveSection] = useState('home');
    const { user, logout } = useAuth();
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
            <Analytics />
            <div className="relative h-screen">
                <div className="absolute inset-0 bg-[radial-gradient(#ff000033_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <img 
                        src={hammerAndSickleImage}
                        alt="Background"
                        className="w-[800px] h-[800px] opacity-20 object-contain"
                        style={{
                            filter: 'brightness(0.7) contrast(1.2)',
                            mixBlendMode: 'soft-light'
                        }}
                    />
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

            {/* Coming Soon — Members-Only Features (guest view only) */}
            {!user && (
                <section className="py-20 bg-gradient-to-b from-black/20 to-black/50">
                    <div className="container mx-auto px-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-900/30 border border-red-800/40 text-red-400 text-sm font-medium mb-4">
                                    <Lock className="w-3.5 h-3.5" />
                                    Members Only
                                </div>
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                                    Coming Soon for Members
                                </h2>
                                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                                    Register to unlock the full platform. Here's what awaits inside.
                                </p>
                            </div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {[
                                    { icon: Newspaper, title: 'Politics', desc: 'A newspaper-style feed of political dispatches, analysis, and commentary on current events through a Marxist lens.' },
                                    { icon: GraduationCap, title: 'Study Center', desc: 'Structured learning paths, curated reading lists, and milestone tracking for systematic Marxist education.' },
                                    { icon: BookMarked, title: 'Revolutionary Theory', desc: 'Browse and read in-depth theory articles with advanced analysis tools and reading modes.' },
                                    { icon: HelpCircle, title: 'Knowledge Q&A', desc: 'Ask questions, get answers, and build a collaborative knowledge base on Marxist theory and practice.' },
                                    { icon: BookOpen, title: 'Glossary', desc: 'A self-contained wiki of Marxist concepts, terms, and definitions — all interconnected and searchable.' },
                                    { icon: FlaskConical, title: 'Science & Tech', desc: 'Courses and textbooks spanning natural sciences, mathematics, and technology — because communists should know everything.' },
                                    { icon: LineChart, title: 'Data & Visualizations', desc: 'Track global economic developments and class-struggle metrics through interactive data visualizations.' },
                                    { icon: Users, title: 'Member Directory', desc: 'Connect with fellow researchers, theorists, and activists building revolutionary understanding together.' },
                                    { icon: Terminal, title: 'World Sim', desc: 'An immersive historical-materialist simulation where you organize, strategize, and shape revolutionary history.' },
                                    { icon: Bot, title: 'MarxBot', desc: 'An AI assistant trained on Marxist theory to help with research, analysis, and theoretical questions.' },
                                ].map((feature, i) => {
                                    const Icon = feature.icon;
                                    return (
                                        <div
                                            key={i}
                                            className="group relative bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:bg-white/[0.06] hover:border-red-900/30 transition-all duration-300"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-red-900/20 flex items-center justify-center flex-shrink-0 group-hover:bg-red-900/30 transition-colors">
                                                    <Icon className="w-5 h-5 text-red-500/70 group-hover:text-red-400 transition-colors" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-white font-semibold text-sm">{feature.title}</h3>
                                                        <span className="text-[10px] uppercase tracking-wider text-gray-600 font-medium">Coming Soon</span>
                                                    </div>
                                                    <p className="text-gray-500 text-xs leading-relaxed">{feature.desc}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="text-center mt-10">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 bg-red-700 hover:bg-red-600 text-white px-8 py-3 rounded-full font-semibold transition-colors"
                                >
                                    Register to Unlock
                                    <Lock className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default App;