import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

import { 
    Search, List, Grid, ExternalLink, FileText,
    Database, BookOpen, Landmark, Users, Target, BookmarkPlus,
    Trash2, Headphones, Pencil
} from 'lucide-react';
import ReadingListPanel from '../components/Library/ReadingListPanel';
import AddToListButton from '../components/Library/AddToListButton';
import { useAudioPlayer } from '../context/AudioPlayerContext';

const categoryIcons = {
    'Political Economy': Database,
    'Philosophy': BookOpen,
    'History': Landmark,
    'Sociology': Users,
    'Strategy & Tactics': Target,
    'Audiobooks': Headphones,
    'default': Database
};

const BookCard = ({ book, viewMode, isAdminUser, onDelete, onPlay }) => {
    const router = useRouter();
    const isAudiobook = book.isAudiobook;
    
    // Get the public URL for the book's PDF file (if not audiobook)
    const externalViewerUrl = !isAudiobook && book.pdf_filename ? supabase
        .storage
        .from('library')
        .getPublicUrl(book.pdf_filename)?.data?.publicUrl : null;
    
    // Get a proper public URL for cover image from Supabase storage
    const initialCover = isAudiobook ? book.cover_url : book.cover_image_url;
    const [coverUrl, setCoverUrl] = useState(initialCover);
    const [imageError, setImageError] = useState(false);
    
    useEffect(() => {
        const cover = isAudiobook ? book.cover_url : book.cover_image_url;
        if (!cover) {
            setCoverUrl(null);
            return;
        }
        // Reset error state whenever cover source changes
        setImageError(false);
        // If the URL is already from Supabase storage or an external URL
        if (cover.includes('supabase') || cover.startsWith('http')) {
            setCoverUrl(cover);
            return;
        }
        
        // Otherwise try to get it from the covers bucket
        if (cover.startsWith('/')) {
            const filename = cover.split('/').pop();
            const { data } = supabase.storage.from('covers').getPublicUrl(filename);
            if (data?.publicUrl) {
                setCoverUrl(data.publicUrl);
            }
        }
    }, [book.cover_image_url, book.cover_url, isAudiobook]);
    
    const handleImageError = () => {
        console.error('Image failed to load:', coverUrl);
        setImageError(true);
    };

    return (
        <div key={book.id} className={`
            ${viewMode === 'grid' 
                ? 'bg-black/30 rounded-lg p-4 border border-red-900/20 hover:border-red-900/40 transition-colors flex flex-col relative group'
                : 'flex items-start space-x-4 bg-black/30 rounded-lg p-4 border border-red-900/20 relative group'}
        `} data-testid={isAudiobook ? 'audiobook-card' : 'ebook-card'}>
            {isAdminUser && (
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            router.push(`/admin/library/upload?edit=${isAudiobook ? 'audiobook' : 'book'}&id=${book.id}`);
                        }}
                        className="p-2 bg-black/60 text-gray-400 hover:text-blue-400 rounded-full"
                        title={isAudiobook ? 'Edit audiobook' : 'Edit book'}
                    >
                        <Pencil size={16} />
                    </button>
                    <button 
                        onClick={(e) => { e.preventDefault(); onDelete(book.id, isAudiobook); }}
                        className="p-2 bg-black/60 text-gray-400 hover:text-red-500 rounded-full"
                        title="Delete book"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )}
            <div className={viewMode === 'grid' ? 'aspect-[3/4] mb-4 relative' : 'w-32 flex-shrink-0 relative'}>
                {imageError || !coverUrl ? (
                    <div className="w-full h-full bg-gray-800 rounded flex items-center justify-center">
                        <p className="text-gray-400 text-xs text-center px-2">{book.title}</p>
                    </div>
                ) : (
                    <img
                        src={coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover rounded"
                        onError={handleImageError}
                    />
                )}
                {isAudiobook && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded pointer-events-none">
                        <Headphones size={32} className="text-white/80 drop-shadow-md" />
                    </div>
                )}
            </div>
            
            <div className="flex-1 flex flex-col">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-2 hover:text-red-400 transition-colors">
                        {isAudiobook ? (
                            <button onClick={() => onPlay(book)} className="text-left bg-transparent border-none p-0 font-semibold cursor-pointer text-inherit hover:text-red-400">{book.title}</button>
                        ) : (
                            <Link href={`/book/${book.id}`}>{book.title}</Link>
                        )}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2">{book.author || 'Unknown'} {book.year ? `• ${book.year}` : ''}</p>
                    
                    {viewMode === 'list' && book.description && (
                        <p className="text-gray-300 text-sm mb-4">{book.description}</p>
                    )}
                </div>
                
                <div className="flex-grow"></div>

                <div className="flex items-center space-x-4 text-sm text-gray-400 mt-2">
                    {!isAudiobook && book.pages && (
                        <span className="flex items-center">
                            <FileText size={16} className="mr-1" />
                            {book.pages} pages
                        </span>
                    )}
                </div>
                
                <div className="flex items-center space-x-2 mt-4">
                     {isAudiobook ? (
                         <button 
                             onClick={() => onPlay(book)}
                             className="flex-1 text-center bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 cursor-pointer border-none"
                         >
                             <Headphones size={16} /> Listen Now
                         </button>
                     ) : (
                         <Link href={`/book/${book.id}`}
                            data-testid="ebook-read-link"
                            className="flex-1 text-center bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors text-sm font-bold"
                        >
                            Read Now
                        </Link>
                     )}
                    {!isAudiobook && externalViewerUrl && (
                        <a 
                            href={externalViewerUrl} 
                            target="_blank"
                            rel="noopener noreferrer"
                            data-testid="ebook-external-pdf-link"
                            className="p-2 bg-black/50 text-gray-400 rounded hover:text-white"
                            title="Open in external viewer"
                        >
                            <ExternalLink size={16} />
                        </a>
                    )}
                    {!isAudiobook && <AddToListButton bookId={book.id} />}
                </div>
            </div>
        </div>
    );
};

// A custom hook for debouncing input
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

const DigitalLibraryPage = () => {
    const router = useRouter();
    const { isAdmin } = useAuth();
    const isAdminUser = isAdmin && isAdmin();
    const { t } = useTranslation();
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms delay
    const [activeCategory, setActiveCategory] = useState('all');
    const [activeEra, setActiveEra] = useState('all');
    const [activeLanguage, setActiveLanguage] = useState('all');
    const [books, setBooks] = useState([]);
    const [allBooks, setAllBooks] = useState([]); // Store all books for stats
    const { playAudiobook } = useAudioPlayer();
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showReadingLists, setShowReadingLists] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch all books, categories and audiobooks in parallel
                const [booksResponse, categoriesResponse, audiobooksResponse] = await Promise.all([
                    supabase.from('digital_library_books').select('*'),
                    supabase.from('digital_library_books').select('category'),
                    supabase.from('audiobooks').select('*')
                ]);

                if (booksResponse.error) throw booksResponse.error;
                if (categoriesResponse.error) throw categoriesResponse.error;
                if (audiobooksResponse.error) throw audiobooksResponse.error;

                const allData = booksResponse.data || [];
                setAllBooks(allData);
                
                const allAudiobooks = (audiobooksResponse.data || []).map(ab => ({...ab, isAudiobook: true, category: 'Audiobooks'}));

                // Generate dynamic categories
                const distinctCategories = [...new Set(categoriesResponse.data.map(item => item.category).filter(Boolean))];
                const dynamicCategories = distinctCategories.map(name => ({
                    id: name,
                    name: name,
                    icon: categoryIcons[name] || categoryIcons.default
                }));
                setCategories([
                    { id: 'all', name: 'All Categories', icon: categoryIcons.default },
                    ...dynamicCategories,
                    { id: 'Audiobooks', name: 'Audiobooks', icon: categoryIcons.Audiobooks }
                ]);

                // Apply filters
                let filteredData = allData;
                if (activeCategory === 'Audiobooks') {
                    filteredData = allAudiobooks;
                }
                
                if (debouncedSearchQuery) {
                    filteredData = filteredData.filter(book => 
                        (book.title && book.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())) ||
                        (book.author && book.author.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
                    );
                }
                if (activeCategory !== 'all' && activeCategory !== 'Audiobooks') {
                    filteredData = filteredData.filter(book => book.category === activeCategory);
                }
                if (activeEra !== 'all' && activeCategory !== 'Audiobooks') {
                    filteredData = filteredData.filter(book => book.era === activeEra);
                }
                if (activeLanguage !== 'all' && activeCategory !== 'Audiobooks') {
                    filteredData = filteredData.filter(book => book.language === activeLanguage);
                }

                setBooks(filteredData);
            } catch (error) {
                setError('Error fetching data: ' + error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [debouncedSearchQuery, activeCategory, activeEra, activeLanguage]);

    const handleDeleteBook = async (id, isAudiobook) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        
        try {
            const table = isAudiobook ? 'audiobooks' : 'digital_library_books';
            const { error } = await supabase.from(table).delete().eq('id', id);
            
            if (error) throw error;
            
            if (isAudiobook) {
                if (activeCategory === 'Audiobooks') {
                    setBooks(prev => prev.filter(b => b.id !== id));
                }
            } else {
                setAllBooks(prev => prev.filter(b => b.id !== id));
                setBooks(prev => prev.filter(b => b.id !== id));
            }
        } catch (err) {
            console.error("Error deleting book:", err);
            alert("Failed to delete: " + err.message);
        }
    };

    const groupedBooks = useMemo(() => {
        return books.reduce((acc, book) => {
            const category = book.category || 'Uncategorized';
            (acc[category] = acc[category] || []).push(book);
            return acc;
        }, {});
    }, [books]);

    const libraryStats = useMemo(() => {
        const languages = new Set(allBooks.map(b => b.language));
        const totalDownloads = allBooks.reduce((sum, b) => sum + (b.downloads || 0), 0);
        return {
            documents: allBooks.length,
            languages: languages.size,
            downloads: totalDownloads > 1000000 ? `${(totalDownloads / 1000000).toFixed(1)}M` : totalDownloads > 1000 ? `${(totalDownloads / 1000).toFixed(1)}K` : totalDownloads,
        };
    }, [allBooks]);

    return (
        <div className="min-h-screen bg-[#12131A]">
            
            <div className="relative bg-black/40 py-24">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <h1 className="text-5xl font-bold text-white mb-6">{t('library.title')}</h1>
                        <button
                            onClick={() => setShowReadingLists(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-black/30 border border-red-900/20 hover:border-red-900/40 rounded-lg transition-colors text-gray-300 font-medium"
                        >
                            <BookmarkPlus size={18} />
                            {t('library.myLists')}
                        </button>
                    </div>
                    <p className="text-xl text-gray-300 max-w-2xl">
                        {t('library.subtitle')}
                    </p>
                    <div className="flex space-x-8 mt-8">
                        <div className="text-gray-400">
                            <span className="text-2xl font-bold text-red-500">{libraryStats.documents}</span>
                            <p className="text-sm">{t('library.documents')}</p>
                        </div>
                        <div className="text-gray-400">
                            <span className="text-2xl font-bold text-red-500">{libraryStats.languages}</span>
                            <p className="text-sm">{t('library.languages')}</p>
                        </div>
                        <div className="text-gray-400">
                            <span className="text-2xl font-bold text-red-500">{libraryStats.downloads}</span>
                            <p className="text-sm">{t('library.downloads')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                
                <div className="flex flex-col lg:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('library.searchPlaceholder')}
                            className="w-full bg-black/30 border border-red-900/30 text-white rounded-lg pl-10 pr-4 py-2"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex space-x-4">
                        <select 
                            className="bg-black/30 border border-red-900/30 text-white rounded-lg px-4 py-2"
                            value={activeEra}
                            onChange={(e) => setActiveEra(e.target.value)}
                        >
                            <option value="all">{t('library.allEras')}</option>
                            <option value="19th Century">19th Century</option>
                            <option value="20th Century">20th Century</option>
                            <option value="21st Century">21st Century</option>
                        </select>
                        
                        <select 
                            className="bg-black/30 border border-red-900/30 text-white rounded-lg px-4 py-2"
                            value={activeLanguage}
                            onChange={(e) => setActiveLanguage(e.target.value)}
                        >
                            <option value="all">{t('library.allLanguages')}</option>
                            <option value="English">English</option>
                            <option value="German">German</option>
                            <option value="French">French</option>
                        </select>

                        <div className="flex space-x-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'bg-black/30 text-gray-400'}`}
                            >
                                <Grid size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded ${viewMode === 'list' ? 'bg-red-600 text-white' : 'bg-black/30 text-gray-400'}`}
                            >
                                <List size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-b border-red-900/30 mb-8">
                    <div className="flex overflow-x-auto py-4 gap-4 no-scrollbar">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setActiveCategory(category.id)}
                                className={`px-4 py-2 ${activeCategory === category.id ? 'bg-red-600 text-white' : 'bg-black/30 text-gray-400 hover:bg-black/50'} rounded-lg transition-colors whitespace-nowrap flex items-center gap-2`}
                            >
                                <span>{category.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-white col-span-full text-center p-8">{t('common.loading')}</div>
                ) : error ? (
                    <div className="text-red-500 col-span-full text-center p-8">{error}</div>
                ) : books.length === 0 ? (
                    <div className="text-gray-400 col-span-full text-center p-8">{t('library.noBooks')}</div>
                ) : activeCategory === 'all' && !searchQuery && activeEra === 'all' && activeLanguage === 'all' ? (
                    <div className="space-y-12">
                        {Object.entries(groupedBooks).map(([categoryName, booksInCategory]) => (
                            <section key={categoryName}>
                                <h2 className="text-3xl font-bold text-red-500 mb-6">
                                    {categoryName}
                                </h2>
                                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                                    {booksInCategory.map(book => (
                                        <BookCard key={book.id} book={book} viewMode={viewMode} isAdminUser={isAdminUser} onDelete={handleDeleteBook} onPlay={playAudiobook} />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                        {books.map(book => (
                           <BookCard key={book.id} book={book} viewMode={viewMode} isAdminUser={isAdminUser} onDelete={handleDeleteBook} onPlay={playAudiobook} />
                        ))}
                    </div>
                )}
            </div>

            {/* Reading List Panel */}
            {showReadingLists && (
                <>
                    <div
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999 }}
                        onClick={() => setShowReadingLists(false)}
                    />
                    <ReadingListPanel
                        onClose={() => setShowReadingLists(false)}
                        onNavigateToBook={(bookId) => {
                            setShowReadingLists(false);
                            router.push(`/book/${bookId}`);
                        }}
                    />
                </>
            )}
        </div>
    );
};

export default DigitalLibraryPage;
