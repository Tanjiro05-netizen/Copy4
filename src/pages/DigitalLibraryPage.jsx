import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

import { 
    Search, Filter, BookOpen, Clock, Download, 
    BookmarkPlus, List, Grid, SortAsc, Calendar,
    Tag, User, Globe, FileText
} from 'lucide-react';

const DigitalLibraryPage = () => {
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        era: 'all',
        language: 'all',
        type: 'all'
    });
    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBooks = async () => {
            setIsLoading(true);
            setError(null);
            console.log("Fetching books from Supabase...");
            try {
                const { data, error } = await supabase.storage.from('library').list();

                console.log("Supabase storage response:", { data, error });

                if (error) {
                    console.error("Error fetching books from Supabase:", error);
                    throw error;
                }

                if (data) {
                    console.log("Books data received:", data);
                    const formattedBooks = data.map(file => ({
                        id: file.id,
                        name: file.name, // Keep original name for linking
                        title: file.name.replace(/\.pdf$/i, '').replace(/_/g, ' '),
                        author: 'Unknown',
                        year: 'N/A',
                        coverImage: '/images/books/default-cover.jpg', // A default cover
                        downloads: 0,
                        pages: 0,
                    }));
                    setBooks(formattedBooks);
                } else {
                    console.log("No book data received.");
                    setBooks([]);
                }
            } catch (error) {
                console.error("Caught an error during fetchBooks:", error);
                setError('Error fetching books: ' + error.message);
            } finally {
                setIsLoading(false);
                console.log("Finished book fetching process.");
            }
        };

        fetchBooks();
    }, []);

    return (
        <div className="min-h-screen bg-[#12131A]">
            
            {/* Hero Section */}
            <div className="relative bg-black/40 py-24">
                <div className="container mx-auto px-4">
                    <h1 className="text-5xl font-bold text-white mb-6">Digital Library</h1>
                    <p className="text-xl text-gray-300 max-w-2xl">
                        Access the complete archive of Marxist literature, from foundational texts to contemporary works.
                    </p>
                    
                    {/* Stats */}
                    <div className="flex space-x-8 mt-8">
                        <div className="text-gray-400">
                            <span className="text-2xl font-bold text-red-500">12,453</span>
                            <p className="text-sm">Documents</p>
                        </div>
                        <div className="text-gray-400">
                            <span className="text-2xl font-bold text-red-500">23</span>
                            <p className="text-sm">Languages</p>
                        </div>
                        <div className="text-gray-400">
                            <span className="text-2xl font-bold text-red-500">1.2M</span>
                            <p className="text-sm">Downloads</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                {/* Search and Filters */}
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
                        <select className="bg-black/30 border border-red-900/30 text-white rounded-lg px-4 py-2">
                            <option value="all">All Eras</option>
                            <option value="19th">19th Century</option>
                            <option value="20th">20th Century</option>
                            <option value="21st">21st Century</option>
                        </select>
                        
                        <select className="bg-black/30 border border-red-900/30 text-white rounded-lg px-4 py-2">
                            <option value="all">All Languages</option>
                            <option value="en">English</option>
                            <option value="de">German</option>
                            <option value="fr">French</option>
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

                {/* Book Grid */}
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                    {isLoading ? (
                        <div className="text-white col-span-full text-center p-8">Loading books...</div>
                    ) : error ? (
                        <div className="text-red-500 col-span-full text-center p-8">{error}</div>
                    ) : (
                        books.map(book => (
                            <div key={book.id} className={`
                                ${viewMode === 'grid' 
                                    ? 'bg-black/30 rounded-lg p-4 border border-red-900/20 hover:border-red-900/40 transition-colors flex flex-col'
                                    : 'flex items-start space-x-4 bg-black/30 rounded-lg p-4 border border-red-900/20'}
                            `}>
                                <div className={viewMode === 'grid' ? 'aspect-[3/4] mb-4' : 'w-32 flex-shrink-0'}>
                                    <img
                                        src={book.coverImage}
                                        alt={book.title}
                                        className="w-full h-full object-cover rounded"
                                    />
                                </div>
                                
                                <div className="flex-1 flex flex-col">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-2 hover:text-red-400 transition-colors">
                                            <Link to={`/book/${book.name}`}>{book.title}</Link>
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-2">{book.author} • {book.year}</p>
                                        
                                        {viewMode === 'list' && (
                                            <p className="text-gray-300 text-sm mb-4">Description placeholder for the book will go here.</p>
                                        )}
                                    </div>
                                    
                                    <div className="flex-grow"></div>

                                    <div className="flex items-center space-x-4 text-sm text-gray-400 mt-2">
                                        <span className="flex items-center">
                                            <FileText size={16} className="mr-1" />
                                            {book.pages} pages
                                        </span>
                                        <span className="flex items-center">
                                            <Download size={16} className="mr-1" />
                                            {book.downloads}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2 mt-4">
                                         <Link 
                                            to={`/book/${book.name}`}
                                            className="flex-1 text-center bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors text-sm font-bold"
                                        >
                                            Read Now
                                        </Link>
                                        <button className="p-2 bg-black/50 text-gray-400 rounded hover:text-white">
                                            <BookmarkPlus size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default DigitalLibraryPage;