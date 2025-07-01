import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import Mark from 'mark.js';
import remarkGfm from 'remark-gfm';
import remarkSlug from 'remark-slug';
import rehypeRaw from 'rehype-raw';
import ArticleComments from '../components/ArticleComments';
import HighlightHandler from '../components/HighlightHandler';
import TableOfContents from '../components/TableOfContents';
import HighlightsSidebar from '../components/HighlightsSidebar';
import NerRenderer from '../components/NerRenderer';
import { Loader, Bookmark, MessageSquare, List, Check, Share2, Search, X, ChevronUp, ChevronDown, Quote, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ArticleReaderPage = () => {
    const { slug } = useParams();
    const { user } = useAuth();
    
    const [article, setArticle] = useState(null);
    const [entities, setEntities] = useState({ people: [], places: [], organizations: [] });
    const [highlights, setHighlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const contentRef = useRef(null);
    const progressToSave = useRef(0);

    // UI State
    const [isTocOpen, setIsTocOpen] = useState(true);
    const [isHighlightsOpen, setIsHighlightsOpen] = useState(true);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [currentResultIndex, setCurrentResultIndex] = useState(-1);
    const [showCopied, setShowCopied] = useState(false);
    const markInstance = useRef(null);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    // Quote state
    const [showQuotePopup, setShowQuotePopup] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
    const [selectedText, setSelectedText] = useState('');

    const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const windowHeight = scrollHeight - clientHeight;
        const currentProgress = windowHeight > 0 ? (scrollTop / windowHeight) * 100 : 0;
        setScrollProgress(currentProgress);
        progressToSave.current = Math.round(currentProgress);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchArticleAndHighlights = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const { data: articleData, error: articleError } = await supabase
                .from('theory_articles')
                .select('*')
                .eq('slug', slug)
                .single();

            if (articleError) throw articleError;
            if (!articleData) throw new Error('Article not found.');

            setArticle(articleData);

            if (articleData.content) {
                supabase.functions.invoke('ner', {
                    body: { text: articleData.content },
                }).then(({ data, error }) => {
                    if (error) console.error('Error invoking NER function:', error);
                    else setEntities(data);
                });
            }

            if (user && articleData) {
                const { data: highlightsData, error: highlightsError } = await supabase
                    .from('user_article_highlights')
                    .select('*').eq('user_id', user.id).eq('article_id', articleData.id)
                    .order('created_at', { ascending: true });

                if (highlightsError) throw highlightsError;
                setHighlights(highlightsData || []);

                const { data: bookmarkData, error: bookmarkError } = await supabase
                    .from('user_article_bookmarks').select('*')
                    .eq('user_id', user.id).eq('article_id', articleData.id)
                    .maybeSingle();
                
                if (bookmarkError) throw bookmarkError;
                setIsBookmarked(!!bookmarkData);

                const { data: progressData } = await supabase
                    .from('user_article_progress').select('progress_percentage')
                    .eq('user_id', user.id).eq('article_id', articleData.id)
                    .single();
                if (progressData) {
                    const initialScroll = (document.documentElement.scrollHeight - document.documentElement.clientHeight) * (progressData.progress_percentage / 100);
                    window.scrollTo(0, initialScroll);
                }
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, [slug, user]);

    useEffect(() => {
        fetchArticleAndHighlights();
    }, [fetchArticleAndHighlights]);

    useEffect(() => {
        if (contentRef.current) {
            markInstance.current = new Mark(contentRef.current);
        }
    }, [article]);

    const performSearch = useCallback(() => {
        if (!markInstance.current) return;
        if (!searchQuery || searchQuery.length < 2) {
            markInstance.current.unmark();
            setSearchResults([]);
            setCurrentResultIndex(-1);
            return;
        }

        markInstance.current.unmark({
            done: () => {
                markInstance.current.mark(searchQuery, {
                    className: 'search-highlight',
                    acrossElements: true,
                    done: (count) => {
                        const highlightedElements = contentRef.current.querySelectorAll('.search-highlight');
                        setSearchResults(Array.from(highlightedElements));
                        setCurrentResultIndex(count > 0 ? 0 : -1);
                    }
                });
            }
        });
    }, [searchQuery]);

    useEffect(() => {
        const handler = setTimeout(() => performSearch(), 300);
        return () => clearTimeout(handler);
    }, [searchQuery, performSearch]);

    useEffect(() => {
        searchResults.forEach((el, index) => {
            el.classList.remove('current-search-highlight');
            if (index === currentResultIndex) {
                el.classList.add('current-search-highlight');
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }, [currentResultIndex, searchResults]);

    const handleNextResult = () => {
        if (searchResults.length > 0) {
            setCurrentResultIndex((prev) => (prev + 1) % searchResults.length);
        }
    };

    const handlePrevResult = () => {
        if (searchResults.length > 0) {
            setCurrentResultIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
        }
    };

    useEffect(() => {
        return () => {
            if (user && article && progressToSave.current > 0) {
                supabase.from('user_article_progress').upsert({
                    user_id: user.id,
                    article_id: article.id,
                    progress_percentage: Math.min(100, progressToSave.current)
                }, { onConflict: 'user_id, article_id' }).then();
            }
        };
    }, [user, article]);

    const handleToggleBookmark = async () => {
        if (!user || !article) return;
        console.log('Toggling bookmark. Current state:', isBookmarked);
        try {
            if (isBookmarked) {
                const { error } = await supabase.from('user_article_bookmarks')
                    .delete().eq('user_id', user.id).eq('article_id', article.id);
                if (error) throw error;
                setIsBookmarked(false);
                console.log('Bookmark removed.');
            } else {
                const { error } = await supabase.from('user_article_bookmarks')
                    .insert({ user_id: user.id, article_id: article.id });
                if (error) throw error;
                setIsBookmarked(true);
                console.log('Bookmark added.');
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
        }
    };

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({ title: article.title, text: article.excerpt || '', url: window.location.href });
            } else {
                throw new Error('Web Share API not supported');
            }
        } catch (err) {
            navigator.clipboard.writeText(window.location.href).then(() => {
                setShowCopied(true);
                setTimeout(() => setShowCopied(false), 2000);
            });
        }
    };

    const handleDownloadPdf = async () => {
        if (!contentRef.current || isGeneratingPdf) return;
        setIsGeneratingPdf(true);
        try {
            const canvas = await html2canvas(contentRef.current, {
                scale: 2, backgroundColor: '#12131A', useCORS: true,
                onclone: (doc) => { doc.querySelectorAll('.no-pdf').forEach(el => el.style.display = 'none'); }
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdf.internal.pageSize.getHeight();
            }
            pdf.save(`${article.slug}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    const handleAddHighlight = async (newHighlight) => {
        if (!user || !article) return;
        try {
            const { data, error } = await supabase.from('user_article_highlights')
                .insert({ ...newHighlight, user_id: user.id, article_id: article.id })
                .select().single();
            if (error) throw error;
            setHighlights(prev => [...prev, data]);
        } catch (err) {
            console.error('Error saving highlight:', err);
        }
    };

    const handleMouseUp = () => {
        if (!contentRef.current) return;
        const selection = window.getSelection();
        const text = selection.toString().trim();
        if (text.length > 0 && contentRef.current.contains(selection.anchorNode)) {
            setSelectedText(text);
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setPopupPosition({ top: rect.top + window.scrollY - 40, left: rect.left + window.scrollX + (rect.width / 2) - 30 });
            setShowQuotePopup(true);
        } else {
            setShowQuotePopup(false);
        }
    };

    const handleSaveQuote = async () => {
        if (!user || !article || !selectedText) return;
        try {
            const { error } = await supabase.from('user_quotes')
                .insert({ user_id: user.id, article_id: article.id, quote_text: selectedText });
            if (error) throw error;
            setShowQuotePopup(false);
        } catch (error) {
            console.error('Error saving quote:', error);
        }
    };

    const handleDeleteHighlight = async (highlightId) => {
        try {
            const { error } = await supabase.from('user_article_highlights').delete().eq('id', highlightId);
            if (error) throw error;
            setHighlights(prev => prev.filter(h => h.id !== highlightId));
        } catch (err) {
            console.error('Error deleting highlight:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <Loader size={48} className="animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <p>Error: {error}</p>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <p>Article not found.</p>
            </div>
        );
    }

    return (
        <>
            <Header />
            <div className="fixed top-0 left-0 w-full h-1 z-50 bg-black/30">
                <div 
                    className="h-full bg-red-600 transition-all duration-150 ease-linear"
                    style={{ width: `${scrollProgress}%` }}
                ></div>
            </div>
            
            <main className="container mx-auto px-4 py-24" onMouseUp={handleMouseUp}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    
                    <div className={`lg:col-span-2 transition-all duration-300 ${isTocOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                        {isTocOpen && article && <TableOfContents contentRef={contentRef} />}
                    </div>

                    <div className="lg:col-span-8">
                        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700 no-pdf">
                            <div className="flex items-center space-x-2">
                                <button onClick={() => setIsTocOpen(!isTocOpen)} className="p-2 rounded-full hover:bg-gray-700 transition-colors" title="Table of Contents">
                                    <List size={20} />
                                </button>
                                <button onClick={handleToggleBookmark} className="p-2 rounded-full hover:bg-gray-700 transition-colors" title="Bookmark">
                                    <Bookmark size={20} className={isBookmarked ? 'text-red-500 fill-current' : ''} />
                                </button>
                                <button onClick={() => setIsSearchVisible(!isSearchVisible)} className="p-2 rounded-full hover:bg-gray-700 transition-colors" title="Search">
                                    <Search size={20} />
                                </button>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => setIsHighlightsOpen(!isHighlightsOpen)} className="p-2 rounded-full hover:bg-gray-700 transition-colors" title="Highlights & Comments">
                                    <MessageSquare size={20} />
                                </button>
                                <button onClick={handleShare} className="p-2 rounded-full hover:bg-gray-700 transition-colors" title="Share">
                                    <Share2 size={20} />
                                </button>
                                <button onClick={handleDownloadPdf} className="p-2 rounded-full hover:bg-gray-700 transition-colors" title="Download PDF">
                                    {isGeneratingPdf ? <Loader size={20} className="animate-spin" /> : <Download size={20} />}
                                </button>
                            </div>
                        </div>
                        {isSearchVisible && (
                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-2 flex items-center space-x-2 mb-4 no-pdf">
                                <input
                                    type="text"
                                    placeholder="Search in text..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent w-full focus:outline-none"
                                />
                                {searchResults.length > 0 && (
                                    <span className="text-sm text-gray-400">{currentResultIndex + 1} / {searchResults.length}</span>
                                )}
                                <button onClick={handlePrevResult} disabled={searchResults.length === 0} className="p-1 rounded-full hover:bg-gray-700 disabled:opacity-50"><ChevronUp size={16} /></button>
                                <button onClick={handleNextResult} disabled={searchResults.length === 0} className="p-1 rounded-full hover:bg-gray-700 disabled:opacity-50"><ChevronDown size={16} /></button>
                                <button onClick={() => setIsSearchVisible(false)} className="p-1 rounded-full hover:bg-gray-700"><X size={16} /></button>
                            </div>
                        )}
                        <h1 className="text-4xl font-bold mb-2">{article.title}</h1>
                        <p className="text-lg text-gray-400 mb-6">{article.author}</p>
                        
                        <div ref={contentRef} className="prose prose-invert max-w-none prose-p:leading-relaxed prose-a:text-red-400 hover:prose-a:text-red-500">
                            <HighlightHandler
                                articleId={article.id}
                                highlights={highlights}
                                onAddHighlight={handleAddHighlight}
                            >
                                <NerRenderer entities={entities}>
                                    <ReactMarkdown
                                        children={article.content}
                                        remarkPlugins={[remarkGfm, remarkSlug]}
                                        rehypePlugins={[rehypeRaw]}
                                    />
                                </NerRenderer>
                            </HighlightHandler>
                        </div>
                        <ArticleComments articleId={article.id} />
                    </div>

                    <div className={`lg:col-span-2 transition-all duration-300 ${isHighlightsOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>
                        {isHighlightsOpen && user && (
                            <HighlightsSidebar
                                highlights={highlights}
                                onDeleteHighlight={handleDeleteHighlight}
                            />
                        )}
                    </div>
                </div>
            </main>

            {showQuotePopup && (
                <div
                    style={{ top: `${popupPosition.top}px`, left: `${popupPosition.left}px` }}
                    className="absolute z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-lg no-pdf"
                >
                    <button 
                        onClick={handleSaveQuote}
                        className="flex items-center space-x-2 px-3 py-1 text-white hover:bg-red-600/50 rounded-lg"
                    >
                        <Quote size={16} />
                        <span>Save Quote</span>
                    </button>
                </div>
            )}

            {showCopied && (
                <div className="fixed bottom-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
                    <Check size={20} />
                    <span>Link copied to clipboard!</span>
                </div>
            )}
        </>
    );
};

export default ArticleReaderPage;