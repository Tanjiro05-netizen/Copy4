import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
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

    const books = [
        {
            id: 1,
            title: "Capital, Volume I",
            author: "Karl Marx",
            year: 1867,
            language: "English",
            type: "Book",
            era: "19th Century",
            pages: 1152,
            downloads: 15234,
            coverImage: "/images/books/2018062917173050984.jpg",
            description: "A critical analysis of political economy...",
            relatedAnalyses: 45,
            tags: ["Political Economy", "Labor Theory", "Capitalism"]
        },
        // ... more books
    ];

    return (
        <div className="min-h-screen bg-[#12131A]">
            <Header />
            
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
                    {books.map(book => (
                        <div key={book.id} className={`
                            ${viewMode === 'grid' 
                                ? 'bg-black/30 rounded-lg p-4 border border-red-900/20 hover:border-red-900/40 transition-colors'
                                : 'flex items-start space-x-4 bg-black/30 rounded-lg p-4 border border-red-900/20'}
                        `}>
                            <div className={viewMode === 'grid' ? 'aspect-[3/4] mb-4' : 'w-32'}>
                                <img
                                    src={book.coverImage}
                                    alt={book.title}
                                    className="w-full h-full object-cover rounded"
                                />
                            </div>
                            
                            <div className="flex-1">
                                <h3 className="text-xl font-semibold text-white mb-2">{book.title}</h3>
                                <p className="text-gray-400 text-sm mb-2">{book.author} • {book.year}</p>
                                
                                {viewMode === 'list' && (
                                    <p className="text-gray-300 text-sm mb-4">{book.description}</p>
                                )}
                                
                                <div className="flex items-center space-x-4 text-sm text-gray-400">
                                    <span className="flex items-center">
                                        <FileText size={16} className="mr-1" />
                                        {book.pages} pages
                                    </span>
                                    <span className="flex items-center">
                                        <Download size={16} className="mr-1" />
                                        {book.downloads}
                                    </span>
                                    <Link 
                                        to={`/analysis?book=${book.id}`}
                                        className="text-red-400 hover:text-red-500"
                                    >
                                        {book.relatedAnalyses} Analyses
                                    </Link>
                                </div>
                                
                                <div className="flex items-center space-x-2 mt-4">
                                    <button className="p-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30">
                                        <Download size={16} />
                                    </button>
                                    <button className="p-2 bg-black/50 text-gray-400 rounded hover:text-white">
                                        <BookmarkPlus size={16} />
                                    </button>
                                                                  <Link 
                                        to={`/book/${book.id}`}
                                        className="flex-1 text-center bg-red-600 text-white py-2 rounded hover:bg-red-700"
                                    >
                                        Read Now
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DigitalLibraryPage;