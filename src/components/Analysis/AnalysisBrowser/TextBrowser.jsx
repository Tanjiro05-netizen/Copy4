import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import { 
    Search, Filter, Grid, List, Plus, Loader2, BookOpen, 
    Calendar, User, Globe, Tag, Clock, ChevronDown 
} from 'lucide-react';
import TextCard from './TextCard';

const TextBrowser = () => {
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const [texts, setTexts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedLanguage, setSelectedLanguage] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);

    const categories = useMemo(() => {
        const cats = new Set(texts.map(t => t.category).filter(Boolean));
        return ['all', ...Array.from(cats)];
    }, [texts]);

    const languages = useMemo(() => {
        const langs = new Set(texts.flatMap(t => t.available_languages || []));
        return ['all', ...Array.from(langs)];
    }, [texts]);

    useEffect(() => {
        fetchTexts();
    }, [user]);

    const handleDeleteText = async (textId) => {
        if (!window.confirm('Are you sure you want to delete this text? This action cannot be undone.')) {
            return;
        }
        try {
            const { error: deleteError } = await supabase
                .from('analysis_texts')
                .delete()
                .eq('id', textId);
            
            if (deleteError) throw deleteError;
            setTexts(prev => prev.filter(t => t.id !== textId));
        } catch (err) {
            console.error('Error deleting text:', err);
            alert('Failed to delete text: ' + err.message);
        }
    };

    const fetchTexts = async () => {
        setLoading(true);
        setError(null);
        try {
            // Admins see all published texts; regular users see only their saved texts
            if (isAdmin && isAdmin()) {
                const { data, error: fetchError } = await supabase
                    .from('analysis_texts')
                    .select(`
                        id,
                        slug,
                        primary_language,
                        available_languages,
                        metadata,
                        category,
                        tags,
                        is_published,
                        created_at,
                        uploaded_by,
                        profiles:uploaded_by(username)
                    `)
                    .eq('is_published', true)
                    .order('created_at', { ascending: false });

                if (fetchError) throw fetchError;
                setTexts(data || []);
            } else if (user && user.id !== 'dev-admin') {
                // Get user's saved text IDs
                const { data: savedData, error: savedError } = await supabase
                    .from('user_analysis_library')
                    .select('text_id')
                    .eq('user_id', user.id);

                if (savedError) throw savedError;
                const savedIds = savedData?.map(s => s.text_id) || [];

                if (savedIds.length === 0) {
                    setTexts([]);
                } else {
                    const { data, error: fetchError } = await supabase
                        .from('analysis_texts')
                        .select(`
                            id,
                            slug,
                            primary_language,
                            available_languages,
                            metadata,
                            category,
                            tags,
                            is_published,
                            created_at,
                            uploaded_by,
                            profiles:uploaded_by(username)
                        `)
                        .in('id', savedIds)
                        .eq('is_published', true)
                        .order('created_at', { ascending: false });

                    if (fetchError) throw fetchError;
                    setTexts(data || []);
                }
            } else {
                setTexts([]);
            }
        } catch (err) {
            console.error('Error fetching texts:', err);
            setError('Failed to load texts');
        } finally {
            setLoading(false);
        }
    };

    const filteredTexts = useMemo(() => {
        let result = [...texts];

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(text => {
                const metadata = text.metadata?.[text.primary_language] || text.metadata?.en || {};
                const title = metadata.title?.toLowerCase() || '';
                const authors = (metadata.authors || []).join(' ').toLowerCase();
                const tags = (text.tags || []).join(' ').toLowerCase();
                return title.includes(query) || authors.includes(query) || tags.includes(query);
            });
        }

        // Category filter
        if (selectedCategory !== 'all') {
            result = result.filter(text => text.category === selectedCategory);
        }

        // Language filter
        if (selectedLanguage !== 'all') {
            result = result.filter(text => 
                text.available_languages?.includes(selectedLanguage)
            );
        }

        // Sort
        result.sort((a, b) => {
            const metaA = a.metadata?.[a.primary_language] || a.metadata?.en || {};
            const metaB = b.metadata?.[b.primary_language] || b.metadata?.en || {};

            switch (sortBy) {
                case 'newest':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'oldest':
                    return new Date(a.created_at) - new Date(b.created_at);
                case 'title':
                    return (metaA.title || '').localeCompare(metaB.title || '');
                case 'year':
                    return (metaB.year || 0) - (metaA.year || 0);
                default:
                    return 0;
            }
        });

        return result;
    }, [texts, searchQuery, selectedCategory, selectedLanguage, sortBy]);

    const LanguageNames = {
        en: 'English',
        de: 'Deutsch',
        fr: 'Français',
        es: 'Español',
        ru: 'Русский',
        zh: '中文',
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
                            <BookOpen className="text-red-500" />
                            Text Analysis
                        </h1>
                        <p className="text-gray-400 mt-2">
                            Your personal library of saved texts for deep analysis
                        </p>
                    </div>
                    
                    
                </div>

                {/* Search & Filters */}
                <div className="bg-gray-900/50 rounded-xl p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by title, author, or tag..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                            />
                        </div>

                        {/* Filter Toggle (Mobile) */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg"
                        >
                            <Filter size={18} />
                            Filters
                            <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>

                        {/* View Mode & Sort (Desktop) */}
                        <div className="hidden md:flex items-center gap-2">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white cursor-pointer"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="title">Title A-Z</option>
                                <option value="year">Year</option>
                            </select>

                            <div className="flex border border-gray-700 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2.5 ${viewMode === 'grid' ? 'bg-red-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                                >
                                    <Grid size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2.5 ${viewMode === 'list' ? 'bg-red-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                                >
                                    <List size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filter Row */}
                    <div className={`mt-4 flex flex-wrap gap-3 ${showFilters ? 'block' : 'hidden md:flex'}`}>
                        {/* Category Filter */}
                        <div className="flex items-center gap-2">
                            <Globe size={16} className="text-gray-400" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white cursor-pointer"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat === 'all' ? 'All Categories' : cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Language Filter */}
                        <div className="flex items-center gap-2">
                            <Tag size={16} className="text-gray-400" />
                            <select
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white cursor-pointer"
                            >
                                {languages.map(lang => (
                                    <option key={lang} value={lang}>
                                        {lang === 'all' ? 'All Languages' : LanguageNames[lang] || lang}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Mobile Sort */}
                        <div className="md:hidden flex items-center gap-2">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white cursor-pointer"
                            >
                                <option value="newest">Newest</option>
                                <option value="oldest">Oldest</option>
                                <option value="title">Title</option>
                                <option value="year">Year</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="text-sm text-gray-400 mb-4">
                    {filteredTexts.length} {filteredTexts.length === 1 ? 'text' : 'texts'} found
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button onClick={fetchTexts} className="text-red-500 hover:underline">
                            Try again
                        </button>
                    </div>
                ) : filteredTexts.length === 0 ? (
                    <div className="text-center py-20">
                        <BookOpen className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400 text-lg">No saved texts yet</p>
                        <p className="text-gray-500 text-sm mt-2">Save texts from the Revolutionary Theory page to start analyzing</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTexts.map(text => (
                            <TextCard 
                                key={text.id} 
                                text={text} 
                                isAdmin={isAdmin && isAdmin()}
                                onDelete={handleDeleteText}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTexts.map(text => (
                            <TextCard 
                                key={text.id} 
                                text={text} 
                                variant="list" 
                                isAdmin={isAdmin && isAdmin()}
                                onDelete={handleDeleteText}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TextBrowser;
