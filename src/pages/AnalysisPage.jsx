import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { Search, Clock, Share2, BookmarkPlus, Download, BookOpen, Quote, FileText, MessageSquare, Tags, Filter, Network, X, Check } from 'lucide-react';

const AnalysisPage = () => {
    const { t } = useTranslation();
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('latest');
    const [activeFilters, setActiveFilters] = useState({
        peerReviewed: false,
        withCitations: false,
        withMethodology: false
    });
    const [showFilters, setShowFilters] = useState(false);

    const categories = [
        { id: 'all', name: 'All' },
        { id: 'economic', name: 'Economic Analysis' },
        { id: 'labor', name: 'Labor Theory' },
        { id: 'political', name: 'Political Economy' },
        { id: 'dialectical', name: 'Dialectical Analysis' },
        { id: 'historical', name: 'Historical Materialism' }
    ];

    // Import article data
    const [analyses, setAnalyses] = useState([]);

    useEffect(() => {
        // Function to load article data
        const loadArticles = async () => {
            try {
                const articles = [
                    await import('../data/articles/contemporary-crisis.json'),
                    await import('../data/articles/digital-labor.json'),
                    await import('../data/articles/modern-imperialism.json'),
                    await import('../data/articles/class-consciousness.json')
                ];
                setAnalyses(articles.map(article => article.default));
            } catch (error) {
                console.error('Error loading articles:', error);
            }
        };

        loadArticles();
    }, []);

    return (
        <div className="min-h-screen bg-[#12131A] overflow-y-auto">
            <div className="relative bg-[#12131A] min-h-[40vh] mb-8">
                <div className="absolute inset-0 bg-[radial-gradient(#ff000033_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                <div className="absolute inset-0">
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            background: `url('/images/marx-bg.jpg') no-repeat center center`,
                            backgroundSize: 'cover',
                            filter: 'brightness(0.7) contrast(1.2)',
                            mixBlendMode: 'soft-light'
                        }}
                    ></div>
                </div>
            
                <Header />
            
                <div className="relative pt-20 pb-12 px-4">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
                            <div className="text-center md:text-left mb-4 md:mb-0">
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Analysis Archive</h1>
                                <p className="text-base text-gray-300 max-w-2xl">
                                    {analyses.length} Papers Available
                                </p>
                            </div>
                            
                            <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                Submit Analysis
                            </button>
                        </div>
                        
                        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                            <div className="w-full md:w-2/3 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search analyses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-black/50 border border-red-900/30 text-white rounded-lg pl-10 pr-4 py-3 focus:border-red-500 transition-colors"
                                />
                            </div>
                            <div className="flex items-center space-x-4 w-full md:w-1/3">
                                <select 
                                    className="flex-1 bg-black/50 border border-red-900/30 text-white rounded-lg px-4 py-3 focus:border-red-500 transition-colors"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="latest">Latest</option>
                                    <option value="popular">Most Read</option>
                                    <option value="trending">Trending</option>
                                </select>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`p-3 rounded-lg border transition-colors ${showFilters ? 'bg-red-600 border-red-500 text-white' : 'bg-black/50 border-red-900/30 text-gray-400 hover:border-red-500'}`}
                                >
                                    <Filter className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-12">
                {/* Category Filters */}
                <div className="flex flex-wrap gap-4 mb-8 sticky top-16 z-10 bg-[#12131A] py-4">
                    {categories.map(category => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                activeCategory === category.id
                                    ? 'bg-red-600 text-white'
                                    : 'bg-black/30 text-gray-400 hover:bg-black/50'
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg mb-8 border border-red-900/20">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-semibold">Advanced Filters</h3>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => setActiveFilters(prev => ({...prev, peerReviewed: !prev.peerReviewed}))}
                                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                                    activeFilters.peerReviewed 
                                        ? 'bg-red-600 text-white' 
                                        : 'bg-black/50 text-gray-400 hover:bg-black/40'
                                }`}
                            >
                                <span>Peer Reviewed</span>
                                {activeFilters.peerReviewed && <Check className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={() => setActiveFilters(prev => ({...prev, withCitations: !prev.withCitations}))}
                                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                                    activeFilters.withCitations 
                                        ? 'bg-red-600 text-white' 
                                        : 'bg-black/50 text-gray-400 hover:bg-black/40'
                                }`}
                            >
                                <span>With Citations</span>
                                {activeFilters.withCitations && <Check className="w-5 h-5" />}
                            </button>
                            <button
                                onClick={() => setActiveFilters(prev => ({...prev, withMethodology: !prev.withMethodology}))}
                                className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                                    activeFilters.withMethodology 
                                        ? 'bg-red-600 text-white' 
                                        : 'bg-black/50 text-gray-400 hover:bg-black/40'
                                }`}
                            >
                                <span>With Methodology</span>
                                {activeFilters.withMethodology && <Check className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                )}

                {/* Analysis Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {analyses.map((analysis, index) => (
                        <div key={index} className="bg-black/30 backdrop-blur-sm p-5 rounded-lg border border-red-900/20 hover:border-red-900/40 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <div className="text-red-500 text-sm">{analysis.category}</div>
                                <button className="text-gray-400 hover:text-red-500 transition-colors">
                                    <BookmarkPlus className="w-5 h-5" />
                                </button>
                            </div>
                            <Link to={`/article/${analysis.title.toLowerCase().replace(/ /g, '-')}`} className="block hover:opacity-80 transition-opacity">
                                    <h3 className="text-white text-lg font-semibold mb-2">{analysis.title}</h3>
                                </Link>
                            <p className="text-gray-400 text-sm mb-3">{analysis.excerpt}</p>
                            
                            <div className="flex items-center space-x-3 mb-3 text-xs text-gray-400">
                                <div className="flex items-center">
                                    <Quote className="w-3 h-3 mr-1" />
                                    <span>{analysis.citations}</span>
                                </div>
                                <div className="flex items-center">
                                    <FileText className="w-3 h-3 mr-1" />
                                    <span>{analysis.references}</span>
                                </div>
                                <div className="flex items-center">
                                    <MessageSquare className="w-3 h-3 mr-1" />
                                    <span>{analysis.comments}</span>
                                </div>
                            </div>
                            
                            <div className="mb-3">
                                <div className="flex flex-wrap gap-2">
                                    {analysis.keywords && analysis.keywords.map((keyword, idx) => (
                                        <span key={idx} className="text-xs bg-red-900/20 text-red-400 px-2 py-1 rounded">
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            {analysis.methodology && (
                                <div className="text-xs text-gray-400 mb-3">
                                    <span className="text-red-500">Methodology:</span> {analysis.methodology}
                                </div>
                            )}
                            
                            <div className="flex justify-between items-center pt-2 border-t border-red-900/10">
                                <div className="flex items-center space-x-2">
                                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center text-gray-500 text-xs">
                                    <Clock className="w-4 h-4 mr-1" />
                                    <span>15 min read</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AnalysisPage;