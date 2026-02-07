import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

import { 
    Search, List, Grid, ExternalLink, FileText, Download,
    Database, BookOpen, Landmark, Users, Target, Plus
} from 'lucide-react';

const categoryIcons = {
    'Political Economy': Database,
    'Philosophy': BookOpen,
    'History': Landmark,
    'Sociology': Users,
    'Strategy & Tactics': Target,
    'default': Database
};

const BookCard = ({ book, viewMode }) => {
    // Get the public URL for the book's PDF file
    const { data: { publicUrl: externalViewerUrl } } = supabase
        .storage
        .from('library')
        .getPublicUrl(book.pdf_filename);
    
    // Get a proper public URL for cover image from Supabase storage
    const [coverUrl, setCoverUrl] = useState(book.cover_image_url);
    const [imageError, setImageError] = useState(false);
    
    useEffect(() => {
        // If the URL is already from Supabase storage, use it directly
        if (book.cover_image_url && book.cover_image_url.includes('supabase')) {
            setCoverUrl(book.cover_image_url);
            return;
        }
        
        // Otherwise try to get it from the covers bucket
        if (book.cover_image_url && book.cover_image_url.startsWith('/')) {
            const filename = book.cover_image_url.split('/').pop();
            const { data } = supabase.storage.from('covers').getPublicUrl(filename);
            if (data?.publicUrl) {
                setCoverUrl(data.publicUrl);
            }
        }
    }, [book.cover_image_url]);
    
    if (!externalViewerUrl) {
        // Handle case where URL could not be generated
        console.error('Could not generate PDF URL for:', book.title);
        return null; 
    }

    const handleImageError = () => {
        console.error('Image failed to load:', coverUrl);
        setImageError(true);
    };

    return (
        <div key={book.id} className={`
            ${viewMode === 'grid' 
                ? 'bg-black/30 rounded-lg p-4 border border-red-900/20 hover:border-red-900/40 transition-colors flex flex-col'
                : 'flex items-start space-x-4 bg-black/30 rounded-lg p-4 border border-red-900/20'}
        `}>
            <div className={viewMode === 'grid' ? 'aspect-[3/4] mb-4' : 'w-32 flex-shrink-0'}>
                {imageError ? (
                    <div className="w-full h-full bg-gray-800 rounded flex items-center justify-center">
                        <p className="text-gray-400 text-xs">{book.title}</p>
                    </div>
                ) : (
                    <img
                        src={coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover rounded"
                        onError={handleImageError}
                    />
                )}
            </div>
            
            <div className="flex-1 flex flex-col">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-2 hover:text-red-400 transition-colors">
                        <Link to={`/book/${book.id}`}>{book.title}</Link>
                    </h3>
                    <p className="text-gray-400 text-sm mb-2">{book.author} • {book.year}</p>
                    
                    {viewMode === 'list' && (
                        <p className="text-gray-300 text-sm mb-4">{book.description}</p>
                    )}
                </div>
                
                <div className="flex-grow"></div>

                <div className="flex items-center space-x-4 text-sm text-gray-400 mt-2">
                    <span className="flex items-center">
                        <FileText size={16} className="mr-1" />
                        {book.pages} pages
                    </span>
                </div>
                
                <div className="flex items-center space-x-2 mt-4">
                     <Link 
                        to={`/book/${book.id}`}
                        className="flex-1 text-center bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors text-sm font-bold"
                    >
                        Read Now
                    </Link>
                    <a 
                        href={externalViewerUrl} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-black/50 text-gray-400 rounded hover:text-white"
                        title="Open in external viewer"
                    >
                        <ExternalLink size={16} />
                    </a>
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
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 500); // 500ms delay
    const [activeCategory, setActiveCategory] = useState('all');
    const [activeEra, setActiveEra] = useState('all');
    const [activeLanguage, setActiveLanguage] = useState('all');
    const [books, setBooks] = useState([]);
    const [allBooks, setAllBooks] = useState([]); // Store all books for stats
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch all books and categories in parallel
                const [booksResponse, categoriesResponse] = await Promise.all([
                    supabase.from('digital_library_books').select('*'),
                    supabase.from('digital_library_books').select('category')
                ]);

                if (booksResponse.error) throw booksResponse.error;
                if (categoriesResponse.error) throw categoriesResponse.error;

                const allData = booksResponse.data || [];
                setAllBooks(allData);

                // Generate dynamic categories
                const distinctCategories = [...new Set(categoriesResponse.data.map(item => item.category).filter(Boolean))];
                const dynamicCategories = distinctCategories.map(name => ({
                    id: name,
                    name: name,
                    icon: categoryIcons[name] || categoryIcons.default
                }));
                setCategories([
                    { id: 'all', name: 'All Categories', icon: categoryIcons.default },
                    ...dynamicCategories
                ]);

                // Apply filters
                let filteredData = allData;
                if (debouncedSearchQuery) {
                    filteredData = filteredData.filter(book => 
                        book.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                        book.author.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
                    );
                }
                if (activeCategory !== 'all') {
                    filteredData = filteredData.filter(book => book.category === activeCategory);
                }
                if (activeEra !== 'all') {
                    filteredData = filteredData.filter(book => book.era === activeEra);
                }
                if (activeLanguage !== 'all') {
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
                        <h1 className="text-5xl font-bold text-white mb-6">Digital Library</h1>
                        {isAdmin && isAdmin() && (
                            <button
                                onClick={() => navigate('/admin/library/upload')}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-white font-medium"
                            >
                                <Plus size={18} />
                                Upload Book
                            </button>
                        )}
                    </div>
                    <p className="text-xl text-gray-300 max-w-2xl">
                        Access the complete archive of Marxist literature, from foundational texts to contemporary works.
                    </p>
                    <div className="flex space-x-8 mt-8">
                        <div className="text-gray-400">
                            <span className="text-2xl font-bold text-red-500">{libraryStats.documents}</span>
                            <p className="text-sm">Documents</p>
                        </div>
                        <div className="text-gray-400">
                            <span className="text-2xl font-bold text-red-500">{libraryStats.languages}</span>
                            <p className="text-sm">Languages</p>
                        </div>
                        <div className="text-gray-400">
                            <span className="text-2xl font-bold text-red-500">{libraryStats.downloads}</span>
                            <p className="text-sm">Downloads</p>
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
                            placeholder="Search the library..."
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
                            <option value="all">All Eras</option>
                            <option value="19th Century">19th Century</option>
                            <option value="20th Century">20th Century</option>
                            <option value="21st Century">21st Century</option>
                        </select>
                        
                        <select 
                            className="bg-black/30 border border-red-900/30 text-white rounded-lg px-4 py-2"
                            value={activeLanguage}
                            onChange={(e) => setActiveLanguage(e.target.value)}
                        >
                            <option value="all">All Languages</option>
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
                    <div className="text-white col-span-full text-center p-8">Loading books...</div>
                ) : error ? (
                    <div className="text-red-500 col-span-full text-center p-8">{error}</div>
                ) : books.length === 0 ? (
                    <div className="text-gray-400 col-span-full text-center p-8">No books found matching your criteria.</div>
                ) : activeCategory === 'all' && !searchQuery && activeEra === 'all' && activeLanguage === 'all' ? (
                    <div className="space-y-12">
                        {Object.entries(groupedBooks).map(([categoryName, booksInCategory]) => (
                            <section key={categoryName}>
                                <h2 className="text-3xl font-bold text-red-500 mb-6">
                                    {categoryName}
                                </h2>
                                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                                    {booksInCategory.map(book => (
                                        <BookCard key={book.id} book={book} viewMode={viewMode} />
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                        {books.map(book => (
                           <BookCard key={book.id} book={book} viewMode={viewMode} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DigitalLibraryPage;