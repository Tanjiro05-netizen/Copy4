import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, Search, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';

import Header from '../components/Header';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const TheoryPage = () => {

    const { user } = useAuth();

    // State for data, loading, and errors
    const [categories, setCategories] = useState([]);
    const [articles, setArticles] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingArticles, setLoadingArticles] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch categories once on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const { data, error } = await supabase
                    .from('theory_categories')
                    .select('id, name')
                    .order('name', { ascending: true });

                if (error) throw error;

                setCategories(data);
                // Set the first category as active by default
                if (data.length > 0) {
                    setActiveCategory(data[0].id);
                }
            } catch (err) {
                setError(err.message);
                console.error("Error fetching categories:", err);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []);

    // Fetch articles when the active category changes
    useEffect(() => {
        if (!activeCategory) return;

        const fetchArticles = async () => {
            setLoadingArticles(true);
            setError(null);
            try {
                // Fetch articles for the active category
                const { data: articlesData, error: articlesError } = await supabase
                    .from('theory_articles')
                    .select('id, title, slug, excerpt, estimated_time_min, collection, is_featured, category_id')
                    .eq('category_id', activeCategory);

                if (articlesError) throw articlesError;

                // Fetch user progress for these articles
                if (user && articlesData.length > 0) {
                    const articleIds = articlesData.map(a => a.id);

                    // Fetch progress
                    const { data: progressData, error: progressError } = await supabase
                        .from('user_article_progress')
                        .select('article_id, progress_percentage')
                        .eq('user_id', user.id)
                        .in('article_id', articleIds);
                    if (progressError) console.error('Error fetching progress:', progressError);

                    // Fetch bookmarks
                    const { data: bookmarksData, error: bookmarksError } = await supabase
                        .from('user_article_bookmarks')
                        .select('article_id')
                        .eq('user_id', user.id)
                        .in('article_id', articleIds);
                    if (bookmarksError) console.error('Error fetching bookmarks:', bookmarksError);

                    const progressMap = new Map(progressData?.map(p => [p.article_id, p.progress_percentage]) || []);
                    const bookmarkedSet = new Set(bookmarksData?.map(b => b.article_id) || []);

                    const articlesWithExtras = articlesData.map(article => ({
                        ...article,
                        progress: progressMap.get(article.id) || 0,
                        isBookmarked: bookmarkedSet.has(article.id),
                    }));
                    setArticles(articlesWithExtras);
                } else {
                    setArticles(articlesData.map(a => ({ ...a, progress: 0, isBookmarked: false })));
                }
            } catch (err) {
                setError(err.message);
                console.error("Error fetching articles:", err);
            } finally {
                setLoadingArticles(false);
            }
        };

        fetchArticles();
    }, [activeCategory, user]);

    // Memoize collections to avoid re-computation on every render
    const filteredArticles = useMemo(() => {
        if (!searchQuery) return articles;
        return articles.filter(article => 
            article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [articles, searchQuery]);

    const collections = useMemo(() => {
        const allCollections = filteredArticles.reduce((acc, article) => {
            if (article.collection) {
                if (!acc[article.collection]) {
                    acc[article.collection] = [];
                }
                acc[article.collection].push(article);
            }
            return acc;
        }, {});
        return Object.entries(allCollections);
    }, [articles]);

    const featuredArticles = useMemo(() => filteredArticles.filter(a => a.is_featured), [filteredArticles]);

    const handleBookmarkToggle = async (articleId, isBookmarked) => {
        if (!user) return;

        try {
            if (isBookmarked) {
                // Delete bookmark
                const { error } = await supabase
                    .from('user_article_bookmarks')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('article_id', articleId);
                if (error) throw error;
            } else {
                // Add bookmark
                const { error } = await supabase
                    .from('user_article_bookmarks')
                    .insert({ user_id: user.id, article_id: articleId });
                if (error) throw error;
            }

            // Update UI
            setArticles(articles.map(a => 
                a.id === articleId ? { ...a, isBookmarked: !isBookmarked } : a
            ));
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            alert('Failed to update bookmark.');
        }
    };

    const renderArticleCard = (article) => (
        <div key={article.id} className="bg-black/40 rounded-lg p-4 flex flex-col hover:bg-black/60 transition-colors duration-200">
            <Link to={`/theory/article/${article.slug}`} className="flex-grow">
                <h3 className="text-lg font-semibold mb-2 text-white">{article.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{article.excerpt}</p>
            </Link>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800/50">
                <span className="text-xs text-gray-400">{article.estimated_time_min} min read</span>
                <div className="flex items-center space-x-4">
                    <div className="relative w-24 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="absolute top-0 left-0 h-full bg-red-500 rounded-full"
                            style={{ width: `${article.progress || 0}%` }}
                        ></div>
                    </div>
                    {user && (
                        <button onClick={(e) => { e.stopPropagation(); handleBookmarkToggle(article.id, article.isBookmarked); }} className="text-gray-400 hover:text-red-500">
                            <Bookmark className={`w-5 h-5 ${article.isBookmarked ? 'fill-current text-red-500' : ''}`} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#12131A] text-white">
            <Header />
            <main className="pt-24 pb-16 max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold">Revolutionary Theory</h1>
                    <div className="relative w-full max-w-xs">
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder='Search articles...'
                            className="w-full bg-black/30 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar for Categories */}
                    <aside className="lg:col-span-1">
                        <div className="bg-black/30 rounded-lg p-4 sticky top-24">
                            <h2 className="text-xl font-semibold mb-4">Categories</h2>
                            {loadingCategories ? (
                                <p>Loading categories...</p>
                            ) : (
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
                                                <span className="text-sm font-medium">{category.name}</span>
                                                {activeCategory === category.id && <ChevronRight className="w-4 h-4 text-red-400" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <section className="lg:col-span-3 space-y-8">
                        {loadingArticles ? (
                            <p>Loading articles...</p>
                        ) : error ? (
                            <p className="text-red-500">Error: {error}</p>
                        ) : (
                            <>
                                {featuredArticles.length > 0 && (
                                    <div className="bg-gradient-to-r from-red-900/30 to-black/30 rounded-lg p-6">
                                        <h2 className="text-2xl font-bold mb-4">Featured Materials</h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {featuredArticles.map(renderArticleCard)}
                                        </div>
                                    </div>
                                )}

                                {collections.map(([collectionName, collectionArticles]) => (
                                    <div key={collectionName} className="bg-black/30 rounded-lg p-6">
                                        <h3 className="text-xl font-semibold mb-4">{collectionName}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {collectionArticles.map(renderArticleCard)}
                                        </div>
                                    </div>
                                ))}

                                {articles.length === 0 && !loadingArticles && (
                                    <div className="text-center py-12 bg-black/30 rounded-lg">
                                        <h3 className="text-xl font-semibold">No Articles Found</h3>
                                        <p className="text-gray-400 mt-2">There are no articles in this category yet.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default TheoryPage;