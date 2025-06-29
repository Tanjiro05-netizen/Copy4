import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import ArticleComments from '../components/ArticleComments';
import PrivateNotes from '../components/PrivateNotes';
import ArticleAnalysis from '../components/ArticleAnalysis';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { BookText, Loader, Search, List, Grid, BookOpen } from 'lucide-react';

const AnalysisPage = () => {
    const { user } = useAuth();
    const [userRole, setUserRole] = useState(null);
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [activeTab, setActiveTab] = useState('Content');
    const TABS = ['Content', 'Comments', 'Notes', 'Analysis'];

    useEffect(() => {
        const fetchUserRole = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                if (error && error.code !== 'PGRST116') throw error;
                setUserRole(data?.role || 'user');
            } catch (err) {
                console.error('Error fetching user role:', err);
                setError('Could not verify user role.');
            }
        };
        fetchUserRole();
    }, [user]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const categoriesResult = await supabase.from('theory_categories').select('id, name');
                if (categoriesResult.error) throw new Error(`Categories fetch failed: ${categoriesResult.error.message}`);
                
                const articlesResult = await supabase.from('theory_articles').select('id, title, slug, category_id, description');
                if (articlesResult.error) throw new Error(`Articles fetch failed: ${articlesResult.error.message}`);

                const categoriesData = categoriesResult.data || [];
                const articlesData = articlesResult.data || [];

                const articlesWithCategories = articlesData.map(article => {
                    const category = categoriesData.find(cat => cat.id === article.category_id);
                    return {
                        ...article,
                        theory_categories: category ? { id: category.id, name: category.name } : null,
                    };
                });
                
                setArticles(articlesWithCategories);
                setCategories(categoriesData);
                setError(null);
            } catch (err) {
                console.error('Error fetching analysis data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (userRole) {
            fetchData();
        }
    }, [userRole, user]);

    const filteredArticles = useMemo(() => {
        let filtered = [...articles];
        
        if (selectedCategory && selectedCategory !== 'all') {
            filtered = filtered.filter(article => 
                article.theory_categories?.name === selectedCategory
            );
        }
        
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(article => 
                article.title.toLowerCase().includes(query) ||
                (article.description && article.description.toLowerCase().includes(query))
            );
        }
        
        return filtered;
    }, [articles, selectedCategory, searchQuery]);


    const handleSelectArticle = async (article) => {
        setSelectedArticle({ ...article, loadingContent: true });
        setError(null);
        try {
            const { data, error } = await supabase
                .from('theory_articles')
                .select('content')
                .eq('id', article.id)
                .single();

            if (error) throw error;

            setSelectedArticle({ ...article, content: data.content, loadingContent: false });
            setActiveTab('Content');
        } catch (err) {
            console.error('Error fetching article content:', err);
            setError('Failed to load article content.');
            setSelectedArticle(null);
        } 
    };

    const renderArticleCard = (article) => (
        <div key={article.id} className={
            viewMode === 'grid'
                ? 'bg-black/30 rounded-lg border border-red-900/20 hover:border-red-900/40 transition-colors flex flex-col'
                : 'flex bg-black/30 rounded-lg border border-red-900/20 hover:border-red-900/40 transition-colors'
        }>
            <div className={viewMode === 'grid' ? 'p-4 flex-1 flex flex-col' : 'p-4 flex-1'}>
                <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                        <div className="text-sm text-red-400 mb-1">
                            {article.theory_categories?.name || 'Uncategorized'}
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{article.title}</h3>
                    {article.description && (
                        <p className="text-gray-300 text-sm mb-3 line-clamp-3">{article.description}</p>
                    )}
                </div>
            </div>
            <div className="p-4 border-t border-gray-800/50 mt-auto">
                <button
                    onClick={() => handleSelectArticle(article)}
                    disabled={selectedArticle?.loadingContent && selectedArticle?.id === article.id}
                    className="w-full text-center bg-red-600/20 hover:bg-red-600/40 text-red-300 font-semibold py-2 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {selectedArticle?.loadingContent && selectedArticle?.id === article.id ? (
                        <><Loader size={16} className="animate-spin mr-2" /> Loading...</>
                    ) : (
                        <><BookOpen size={16} className="mr-2" /> Analyze</>
                    )}
                </button>
            </div>
        </div>
    );

    if (loading && !articles.length) {
        return <div className="min-h-screen bg-[#12131A] flex items-center justify-center text-white"><Loader className="animate-spin mr-2"/>Loading Analysis Page...</div>;
    }

    return (
        <div className="min-h-screen bg-[#12131A]">
            <Header />
            <main className="container mx-auto px-4 py-24">
                {selectedArticle && !selectedArticle.loadingContent ? (
                    <div>
                        <button
                            onClick={() => setSelectedArticle(null)}
                            className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                        >
                            &larr; Back to Laboratory
                        </button>
                        <div className="bg-black/30 rounded-lg border border-red-900/20 p-6">
                            <h1 className="text-3xl font-bold text-white mb-2">{selectedArticle.title}</h1>
                            <p className="text-red-400 mb-6">{selectedArticle.theory_categories?.name || 'Uncategorized'}</p>

                            <div className="border-b border-gray-700 mb-6">
                                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                    {TABS.map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`
                                                ${activeTab === tab
                                                    ? 'border-red-500 text-red-400'
                                                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            <div>
                                {activeTab === 'Content' && (
                                    <div className="prose prose-invert max-w-none text-gray-300 bg-black/20 p-4 rounded-lg" dangerouslySetInnerHTML={{ __html: selectedArticle.content || '<p>Content not available.</p>' }}></div>
                                )}
                                {activeTab === 'Comments' && <ArticleComments articleId={selectedArticle.id} userRole={userRole} />}
                                {activeTab === 'Notes' && <PrivateNotes articleId={selectedArticle.id} />}
                                {activeTab === 'Analysis' && <ArticleAnalysis articleId={selectedArticle.id} />}
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h1 className="text-4xl font-bold text-white flex items-center">
                                    <BookText size={36} className="mr-3 text-red-500"/> 
                                    Analysis Laboratory
                                </h1>
                                <div className="text-gray-400">
                                    {filteredArticles.length} papers available
                                </div>
                            </div>
                        </div>

                        <div className="mb-8 space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search articles and analyses..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-black/30 border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:outline-none"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="bg-black/30 border border-gray-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                                    >
                                        <option value="all">All Categories</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.name}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                        className="bg-black/30 border border-gray-800 rounded-lg px-4 py-3 text-white hover:bg-black/50 transition-colors"
                                    >
                                        {viewMode === 'grid' ? <List size={20} /> : <Grid size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedCategory('all')}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                        selectedCategory === 'all'
                                            ? 'bg-red-600 text-white'
                                            : 'bg-black/30 text-gray-300 hover:bg-black/50'
                                    }`}
                                >
                                    All
                                </button>
                                {categories.map(category => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.name)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                            selectedCategory === category.name
                                                ? 'bg-red-600 text-white'
                                                : 'bg-black/30 text-gray-300 hover:bg-black/50'
                                        }`}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && <p className="text-red-500 bg-red-900/20 p-3 rounded-lg mb-6">{error}</p>}

                        <div className={
                            viewMode === 'grid' 
                                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                                : 'space-y-6'
                        }>
                            {filteredArticles.map(article => renderArticleCard(article))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default AnalysisPage;