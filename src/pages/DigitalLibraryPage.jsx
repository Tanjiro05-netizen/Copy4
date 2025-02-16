import React, { useState } from 'react';
import { Menu, Globe, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';

const DigitalLibraryPage = () => {
    const [activeSection, setActiveSection] = useState('digital-library');
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

    const writers = [
        { name: 'Karl Marx', image: '/images/marx.jpg' },
        { name: 'Vladimir Lenin', image: '/images/lenin-speech.jpg' },
        { name: 'Mao Zedong', image: '/images/mao.jpg' },
        { name: 'Antonio Gramsci', image: '/images/gramsci.jpg' }
    ];

    const featuredWorks = [
        {
            title: 'Capital Vol. I',
            description: 'Analysis of the capitalist mode of production...',
            progress: 30
        },
        {
            title: 'State and Revolution',
            description: 'Analysis of the capitalist mode of production...',
            progress: 30
        }
    ];

    return (
        <div className="min-h-screen bg-[#12131A]">
            <header className="relative h-screen">
                <div className="absolute inset-0 bg-[radial-gradient(#ff000033_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            background: `url('/images/lenin-bg.jpg') no-repeat center center`,
                            backgroundSize: 'cover',
                            filter: 'brightness(0.7) contrast(1.2)',
                            mixBlendMode: 'soft-light'
                        }}
                    ></div>
                </div>

                <Header />

                <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center space-y-8 max-w-4xl px-4">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">Digital Library</h1>
                        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
                            "You can become a Communist only when you enrich your mind with a knowledge of all the treasures created by mankind."
                        </p>
                    </div>
                </div>
            </header>

            {/* Scrollable content sections */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Writers Section */}
                    <div>
                        <h2 className="text-3xl text-white font-bold mb-6">Writers</h2>
                        <div className="h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                                {writers.map((writer, index) => (
                                    <div
                                        key={index}
                                        className="bg-black/30 rounded-lg overflow-hidden"
                                    >
                                        <div className="aspect-square relative">
                                            <img
                                                src={writer.image}
                                                alt={writer.name}
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-white text-lg font-semibold">{writer.name}</h3>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Featured Works Section */}
                    <div>
                        <h2 className="text-3xl text-white font-bold mb-6">Featured</h2>
                        <div className="h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="space-y-4">
                                {featuredWorks.map((work, index) => (
                                    <div
                                        key={index}
                                        className="bg-black/80 p-6 rounded-lg text-white"
                                    >
                                        <h3 className="text-xl font-semibold mb-2">{work.title}</h3>
                                        <p className="text-gray-400 mb-4">{work.description}</p>
                                        <div className="relative h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                            <div
                                                className="absolute top-0 left-0 h-full bg-red-600"
                                                style={{ width: `${work.progress}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-sm text-gray-400 mt-2">{work.progress}% Complete</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 0, 0, 0.3);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 0, 0, 0.4);
                }
            `}</style>
        </div>
    );
};

export default DigitalLibraryPage;