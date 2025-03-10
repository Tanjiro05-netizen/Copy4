import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';

const TheoryPage = () => {
    const [activeCategory, setActiveCategory] = useState('philosophy');
    const { t } = useTranslation();

    const categories = [
        { id: 'dialectics', name: t('辯證法'), enName: t('Dialectics') },
        { id: 'economics', name: t('經濟學'), enName: t('Economics') },
        { id: 'philosophy', name: t('哲學'), enName: t('Philosophy') },
        { id: 'praxis', name: t('實踐'), enName: t('Praxis') }
    ];

    const articles = [
        {
            id: 1,
            title: t('Dialectical Materialism'),
            excerpt: t('Understanding the fundamental principles of materialist dialectics...'),
            readTime: t('15 min'),
            category: 'dialectics',
            progress: 65
        },
        {
            id: 2,
            title: t('Capital Vol. I'),
            excerpt: t('Analysis of the capitalist mode of production...'),
            readTime: t('25 min'),
            category: 'economics',
            progress: 30
        }
    ];

    return (
        <div className="min-h-screen bg-[#12131A] text-white">
            <Header />

            <main className="pt-24 pb-16 max-w-7xl mx-auto px-4">
                <h1 className="text-4xl font-bold mb-8">{t('Revolutionary Theory')}</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-black/30 rounded-lg p-4 sticky top-24">
                            <h2 className="text-xl font-semibold mb-4">{t('Categories')}</h2>
                            <div className="space-y-2">
                                {categories.map(category => (
                                    <button
                                        key={category.id}
                                        onClick={() => setActiveCategory(category.id)}
                                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                            activeCategory === category.id
                                                ? 'bg-red-600/20 text-white'
                                                : 'text-gray-400 hover:bg-black/50'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="text-sm font-medium">{category.enName}</div>
                                                <div className="text-xs opacity-70">{category.name}</div>
                                            </div>
                                            {activeCategory === category.id && (
                                                <ChevronRight className="w-4 h-4 text-red-400" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Featured Section */}
                        <div className="bg-gradient-to-r from-red-900/30 to-black/30 rounded-lg overflow-hidden">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                                    <h2 className="text-2xl font-bold">{t('Featured Materials')}</h2>
                                    <Link to="/digital-library" className="text-red-400 text-sm hover:underline mt-2 md:mt-0">
                                        {t('View All')}
                                    </Link>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {articles.map(article => (
                                        <div key={article.id} className="bg-black/40 rounded-lg p-4">
                                            <div className="mb-2">
                                                <span className="text-xs text-red-400 uppercase">
                                                    {categories.find(c => c.id === article.category)?.enName}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
                                            <p className="text-gray-400 text-sm mb-4">{article.excerpt}</p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-400">{article.readTime}</span>
                                                <div className="relative w-24 h-1 bg-gray-700 rounded-full overflow-hidden">
                                                    <div 
                                                        className="absolute top-0 left-0 h-full bg-red-500 rounded-full"
                                                        style={{ width: `${article.progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        {/* Additional Theory Sections */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-black/30 rounded-lg p-6">
                                <h3 className="text-xl font-semibold mb-4">{t('Marxist Classics')}</h3>
                                <p className="text-gray-400">
                                    {t('Essential readings from Marx, Engels, Lenin, and other foundational theorists.')}
                                </p>
                                <Link to="/digital-library?category=classics" className="mt-4 inline-block text-red-400 hover:underline">
                                    {t('Explore Classics')}
                                </Link>
                            </div>
                            
                            <div className="bg-black/30 rounded-lg p-6">
                                <h3 className="text-xl font-semibold mb-4">{t('Contemporary Theory')}</h3>
                                <p className="text-gray-400">
                                    {t('Modern applications and developments of Marxist analysis in the 21st century.')}
                                </p>
                                <Link to="/digital-library?category=contemporary" className="mt-4 inline-block text-red-400 hover:underline">
                                    {t('Explore Contemporary Works')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TheoryPage;