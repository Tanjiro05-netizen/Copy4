import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import { supabase } from '../supabaseClient';

const ArticleCollectionPage = () => {
    const { collectionType } = useParams(); // 'classics', 'contemporary', or 'featured'
    const { t } = useTranslation();
    
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [title, setTitle] = useState('');

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            setError(null);

            let query = supabase.from('theory_articles').select(`
                id, slug, title, excerpt, estimated_time_min,
                category: theory_categories (name)
            `);

            // Determine the filter and title based on the URL parameter
            if (collectionType === 'classics') {
                query = query.eq('is_classic', true);
                setTitle(t('Marxist Classics'));
            } else if (collectionType === 'contemporary') {
                query = query.eq('is_contemporary', true);
                setTitle(t('Contemporary Theory'));
            } else if (collectionType === 'featured') {
                query = query.eq('is_featured', true);
                setTitle(t('Featured Materials'));
            } else {
                setError('Invalid collection type.');
                setLoading(false);
                return;
            }

            try {
                const { data, error: queryError } = await query;
                if (queryError) throw queryError;

                let fetchedArticles = data || [];
                if (collectionType === 'classics') {
                    const manifestoArticle = {
                        id: 'local-communist-manifesto',
                        slug: 'communist-manifesto',
                        title: 'The Communist Manifesto',
                        excerpt: 'The foundational text of Marxism, outlining the principles of communism.',
                        estimated_time_min: 45,
                        category: { name: 'Manifesto' }
                    };
                    fetchedArticles = [manifestoArticle, ...fetchedArticles.filter(a => a.slug !== 'communist-manifesto')];
                }

                setArticles(fetchedArticles);
            } catch (err) {
                setError(err.message);
                console.error(`Error fetching ${collectionType} articles:`, err);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [collectionType, t]);

    return (
        <div className="min-h-screen bg-[#12131A] text-white">
            <Header />
            <main className="pt-24 pb-16 max-w-7xl mx-auto px-4">
                <h1 className="text-4xl font-bold mb-8">{title}</h1>

                {loading ? (
                    <p>Loading articles...</p>
                ) : error ? (
                    <p className="text-red-500">Error: {error}</p>
                ) : articles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map(article => (
                            <Link 
                                to={`/theory/article/${article.slug}`} 
                                key={article.id} 
                                className="bg-black/30 rounded-lg p-6 block hover:bg-black/50 transition-colors"
                            >
                                <div className="mb-2">
                                    <span className="text-xs text-red-400 uppercase">
                                        {article.category?.name || 'Uncategorized'}
                                    </span>
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{article.title}</h3>
                                <p className="text-gray-400 text-sm mb-4">{article.excerpt}</p>
                                <span className="text-xs text-gray-400">{article.estimated_time_min} min read</span>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p>No articles found in this collection.</p>
                )}
            </main>
        </div>
    );
};

export default ArticleCollectionPage;
