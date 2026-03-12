import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, CalendarDays, ChevronLeft, ChevronRight, Newspaper, Tag } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const formatDate = (value) => {
    if (!value) return 'Undated';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Undated';
    return parsed.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

const isValidEditionDate = (value) => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime())) return false;
    return parsed.toISOString().slice(0, 10) === value;
};

const rankRelatedDispatches = (items, baseArticle) => {
    if (!Array.isArray(items)) return [];

    const baseEdition = `${baseArticle?.edition_date || ''}`;
    const baseCategory = `${baseArticle?.category || ''}`.toLowerCase();

    return [...items].sort((left, right) => {
        const leftEditionScore = `${left?.edition_date || ''}` === baseEdition ? 1 : 0;
        const rightEditionScore = `${right?.edition_date || ''}` === baseEdition ? 1 : 0;
        if (leftEditionScore !== rightEditionScore) return rightEditionScore - leftEditionScore;

        const leftCategoryScore = `${left?.category || ''}`.toLowerCase() === baseCategory ? 1 : 0;
        const rightCategoryScore = `${right?.category || ''}`.toLowerCase() === baseCategory ? 1 : 0;
        if (leftCategoryScore !== rightCategoryScore) return rightCategoryScore - leftCategoryScore;

        const leftTime = new Date(left?.published_at || left?.created_at || 0).getTime();
        const rightTime = new Date(right?.published_at || right?.created_at || 0).getTime();
        return rightTime - leftTime;
    });
};

const PoliticsArticleReader = () => {
    const { slug } = useParams();
    const { canManagePolitics } = useAuth();
    const canEditPolitics = canManagePolitics();

    const editionParam = useMemo(() => {
        if (typeof window === 'undefined') return '';
        return new URLSearchParams(window.location.search).get('edition') || '';
    }, []);

    const backToFeedHref =
        isValidEditionDate(editionParam)
            ? `/politics?edition=${editionParam}`
            : '/politics';

    const [article, setArticle] = useState(null);
    const [relatedDispatches, setRelatedDispatches] = useState([]);
    const [adjacentDispatches, setAdjacentDispatches] = useState({ previous: null, next: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArticle = async () => {
            if (!slug) {
                setError('No article slug provided.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                let query = supabase
                    .from('politics_articles')
                    .select('*')
                    .eq('slug', slug);

                if (!canEditPolitics) {
                    query = query.eq('status', 'published');
                }

                const { data, error: fetchError } = await query.maybeSingle();
                if (fetchError) throw fetchError;

                if (!data) {
                    throw new Error('Dispatch not found for this edition.');
                }

                setArticle(data);

                const [relatedResponse, editionResponse] = await Promise.all([
                    (async () => {
                        let relatedQuery = supabase
                            .from('politics_articles')
                            .select('id, slug, title, category, source, edition_date, published_at, created_at, status')
                            .neq('slug', slug)
                            .order('published_at', { ascending: false, nullsFirst: false })
                            .order('created_at', { ascending: false })
                            .limit(20);

                        if (!canEditPolitics) {
                            relatedQuery = relatedQuery.eq('status', 'published');
                        }

                        return relatedQuery;
                    })(),
                    (async () => {
                        if (!data?.edition_date) {
                            return { data: [], error: null };
                        }

                        let editionQuery = supabase
                            .from('politics_articles')
                            .select('id, slug, title, edition_date, published_at, created_at, status')
                            .eq('edition_date', data.edition_date)
                            .order('published_at', { ascending: false, nullsFirst: false })
                            .order('created_at', { ascending: false })
                            .limit(120);

                        if (!canEditPolitics) {
                            editionQuery = editionQuery.eq('status', 'published');
                        }

                        return editionQuery;
                    })(),
                ]);

                if (relatedResponse.error) throw relatedResponse.error;
                if (editionResponse.error) throw editionResponse.error;

                const rankedRelated = rankRelatedDispatches(relatedResponse.data || [], data)
                    .filter((item) => item.slug !== slug)
                    .slice(0, 4);
                setRelatedDispatches(rankedRelated);

                const editionStories = (editionResponse.data || []).filter((item) => item.slug);
                const currentIndex = editionStories.findIndex((item) => item.slug === slug);

                if (currentIndex >= 0) {
                    setAdjacentDispatches({
                        previous: editionStories[currentIndex - 1] || null,
                        next: editionStories[currentIndex + 1] || null,
                    });
                } else {
                    setAdjacentDispatches({ previous: null, next: null });
                }
            } catch (err) {
                console.error('Error fetching politics article:', err);
                setError(err.message || 'Failed to load dispatch.');
                setArticle(null);
                setRelatedDispatches([]);
                setAdjacentDispatches({ previous: null, next: null });
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [slug, canEditPolitics]);

    const renderedContent = useMemo(() => {
        if (!article?.content) return null;
        return (
            <div className="prose prose-invert prose-red max-w-none leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {article.content}
                </ReactMarkdown>
            </div>
        );
    }, [article?.content]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#12131A] text-white px-4 py-10">
                <div className="max-w-4xl mx-auto">
                    <p className="text-gray-400">Loading dispatch...</p>
                </div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen bg-[#12131A] text-white px-4 py-10">
                <div className="max-w-4xl mx-auto bg-[#181A23] border border-gray-800 rounded-2xl p-8">
                    <h1 className="text-2xl font-semibold mb-3">Dispatch unavailable</h1>
                    <p className="text-gray-400 mb-6">{error || 'This dispatch is unavailable right now.'}</p>
                    <Link
                        to={backToFeedHref}
                        className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
                    >
                        <ArrowLeft size={18} /> Back to politics front page
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#12131A] text-white px-4 py-10">
            <article className="max-w-4xl mx-auto">
                <Link
                    to={backToFeedHref}
                    className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-red-400 transition-colors mb-6"
                >
                    <ArrowLeft size={16} /> Back to front page
                </Link>

                <header className="bg-[#181A23] border border-gray-800 rounded-2xl p-6 md:p-8 mb-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-600/20 text-red-300 text-xs uppercase tracking-wide">
                            <Tag size={12} /> {article.category || 'analysis'}
                        </span>
                        {article.status && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-700/60 text-gray-200 text-xs uppercase tracking-wide">
                                <Newspaper size={12} /> {article.status}
                            </span>
                        )}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                        {article.title || 'Untitled dispatch'}
                    </h1>

                    {article.excerpt && (
                        <p className="text-gray-300 text-lg leading-relaxed mb-5">
                            {article.excerpt}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                        <span className="inline-flex items-center gap-2">
                            <CalendarDays size={15} />
                            {formatDate(article.published_at || article.created_at)}
                        </span>
                        <span>By {article.source || 'Editorial Desk'}</span>
                    </div>
                </header>

                {article.image_url && (
                    <div className="mb-8 overflow-hidden rounded-2xl border border-gray-800 bg-[#181A23]">
                        <img
                            src={article.image_url}
                            alt={article.title || 'Politics dispatch image'}
                            className="w-full max-h-[520px] object-cover"
                        />
                    </div>
                )}

                <section className="bg-[#181A23] border border-gray-800 rounded-2xl p-6 md:p-8">
                    {renderedContent || (
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                            {article.content || 'No article body available for this dispatch yet.'}
                        </p>
                    )}
                </section>

                {(adjacentDispatches.previous || adjacentDispatches.next) && (
                    <section className="mt-6 bg-[#181A23] border border-gray-800 rounded-2xl p-5">
                        <h2 className="text-lg font-semibold mb-3">Navigate this edition</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {adjacentDispatches.previous ? (
                                <Link
                                    to={`/politics/${adjacentDispatches.previous.slug}?edition=${article.edition_date || editionParam}`}
                                    className="p-3 rounded-xl border border-gray-700 hover:border-gray-500 transition-colors"
                                >
                                    <p className="text-xs text-gray-400 inline-flex items-center gap-1">
                                        <ChevronLeft size={13} /> Previous in edition
                                    </p>
                                    <p className="text-sm text-white mt-1">{adjacentDispatches.previous.title}</p>
                                </Link>
                            ) : (
                                <div className="p-3 rounded-xl border border-gray-800 text-xs text-gray-500">No previous dispatch</div>
                            )}

                            {adjacentDispatches.next ? (
                                <Link
                                    to={`/politics/${adjacentDispatches.next.slug}?edition=${article.edition_date || editionParam}`}
                                    className="p-3 rounded-xl border border-gray-700 hover:border-gray-500 transition-colors"
                                >
                                    <p className="text-xs text-gray-400 inline-flex items-center gap-1">
                                        Next in edition <ChevronRight size={13} />
                                    </p>
                                    <p className="text-sm text-white mt-1">{adjacentDispatches.next.title}</p>
                                </Link>
                            ) : (
                                <div className="p-3 rounded-xl border border-gray-800 text-xs text-gray-500">No next dispatch</div>
                            )}
                        </div>
                    </section>
                )}

                {relatedDispatches.length > 0 && (
                    <section className="mt-6 bg-[#181A23] border border-gray-800 rounded-2xl p-5">
                        <h2 className="text-lg font-semibold mb-3">Related dispatches</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {relatedDispatches.map((related) => (
                                <Link
                                    key={related.id || related.slug}
                                    to={`/politics/${related.slug}?edition=${related.edition_date || article.edition_date || editionParam}`}
                                    className="p-3 rounded-xl border border-gray-700 hover:border-gray-500 transition-colors"
                                >
                                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                                        {related.category || 'analysis'} • {formatDate(related.published_at || related.created_at)}
                                    </p>
                                    <p className="text-sm text-white mt-1">{related.title}</p>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </article>
        </div>
    );
};

export default PoliticsArticleReader;
