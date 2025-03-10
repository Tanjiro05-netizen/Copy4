import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { Clock, BookOpen, Quote, MessageSquare, Share2, Download, ChevronLeft, ChevronRight, Bookmark, Search } from 'lucide-react';

const BookReaderPage = () => {
    const { bookId } = useParams();
    const [book, setBook] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [fontSize, setFontSize] = useState('medium');
    const [theme, setTheme] = useState('dark');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('scroll');

    const cleanContent = (text) => {
        return text
            .replace(/\.{2,}/g, '') // Remove dot lines
            .replace(/\n{2,}/g, '\n\n') // Normalize line breaks
            .replace(/\f/g, '') // Remove form feeds
            .replace(/\d+$/gm, '') // Remove page numbers at end of lines
            .replace(/^\s*\d+\s*$/, '') // Remove standalone page numbers
            .trim();
    };

    useEffect(() => {
        const loadBook = async () => {
            try {
                setIsLoading(true);
                // Fix the path to point directly to the JSON file
                const response = await fetch('/data/books/1/content.json');
                if (!response.ok) {
                    throw new Error('Failed to load book');
                }
                const bookData = await response.json();
                setBook(bookData);
                setError(null);
            } catch (error) {
                setError('Error loading book: ' + error.message);
            } finally {
                setIsLoading(false);
            }
        };

        loadBook();
    }, [bookId]);

    const fontSizes = {
        small: 'text-sm',
        medium: 'text-base',
        large: 'text-lg',
        xlarge: 'text-xl'
    };

    const themes = {
        dark: 'bg-[#12131A] text-gray-300',
        sepia: 'bg-[#f4ecd8] text-gray-900',
        light: 'bg-white text-gray-900'
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#12131A] flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#12131A] flex items-center justify-center">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="min-h-screen bg-[#12131A] flex items-center justify-center">
                <div className="text-white">Book not found</div>
            </div>
        );
    }

    // Remove this duplicate declaration (around line 85):
    // const [viewMode, setViewMode] = useState('scroll'); // Add this state

    return (
        <div className="min-h-screen bg-[#12131A]">
            <Header />
            
            <main className="container mx-auto px-4 py-8">
                {/* Fixed Header Section */}
                <div className="sticky top-0 pt-4 pb-2 bg-[#12131A] z-10">
                    {/* Book Header */}
                    <div className="max-w-3xl mx-auto mb-4">
                        {/* Add cover image */}
                        {book?.coverImage && (
                            <div className="mb-4 w-48 mx-auto">
                                <img 
                                    src={book.coverImage} 
                                    alt={`Cover of ${book.title}`}
                                    className="w-full h-auto rounded-lg shadow-lg"
                                />
                            </div>
                        )}
                        <div className="text-red-500 text-sm mb-2">{book?.metadata?.language}</div>
                        <h1 className="text-3xl font-bold text-white mb-3">{book?.title}</h1>
                        
                        {/* Reading Controls Bar */}
                        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between">
                            {/* Left side controls */}
                            <div className="flex items-center divide-x divide-gray-700">
                                {/* Font controls */}
                                <div className="flex items-center space-x-2 px-4">
                                    <button 
                                        onClick={() => setFontSize('small')}
                                        className={`p-1.5 rounded ${fontSize === 'small' ? 'bg-red-600/20 text-red-400' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        A-
                                    </button>
                                    <button 
                                        onClick={() => setFontSize('large')}
                                        className={`p-1.5 rounded ${fontSize === 'large' ? 'bg-red-600/20 text-red-400' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        A+
                                    </button>
                                </div>
                                
                                {/* Theme toggle */}
                                <div className="flex items-center space-x-2 px-4">
                                    <button 
                                        onClick={() => setTheme('light')}
                                        className={`p-1.5 rounded-full ${theme === 'light' ? 'bg-white' : 'bg-gray-300'} w-4 h-4`}
                                    />
                                    <button 
                                        onClick={() => setTheme('sepia')}
                                        className={`p-1.5 rounded-full ${theme === 'sepia' ? 'ring-2 ring-yellow-500' : ''} bg-[#f4ecd8] w-4 h-4`}
                                    />
                                    <button 
                                        onClick={() => setTheme('dark')}
                                        className={`p-1.5 rounded-full ${theme === 'dark' ? 'ring-2 ring-red-500' : ''} bg-gray-900 w-4 h-4`}
                                    />
                                </div>
                                
                                {/* View mode toggle */}
                                <div className="flex items-center space-x-2 px-4">
                                    <button 
                                        onClick={() => setViewMode('scroll')}
                                        className={`p-1.5 rounded ${viewMode === 'scroll' ? 'bg-red-600/20 text-red-400' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        ⫽
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('sections')}
                                        className={`p-1.5 rounded ${viewMode === 'sections' ? 'bg-red-600/20 text-red-400' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        ⫻
                                    </button>
                                </div>
                            </div>
                        
                            {/* Right side controls */}
                            <div className="flex items-center space-x-4">
                                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                                    <Search className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                                    <MessageSquare className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                                    <Bookmark className="w-4 h-4" />
                                </button>
                                <div className="text-sm text-gray-400">
                                    {Math.round((currentPage / book.content.length) * 100)}% read
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="max-w-6xl mx-auto flex gap-6 mt-6">
                    {/* Table of Contents */}
                    <div className="w-64 hidden lg:block">
                        <div className="sticky top-32">
                            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-4">
                                <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contents</h3>
                                <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-red-900/20 scrollbar-track-transparent">
                                    {book?.content.map((section, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                setCurrentPage(index + 1);
                                                setViewMode('sections');
                                            }}
                                            className={`text-sm text-left w-full px-3 py-2 rounded-md transition-colors ${
                                                currentPage === index + 1 && viewMode === 'sections'
                                                    ? 'bg-red-600/20 text-red-400'
                                                    : 'text-gray-400 hover:text-white hover:bg-black/30'
                                            }`}
                                        >
                                            {section.title}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 max-w-3xl">
                        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-8">
                            <div className={`prose prose-invert max-w-none ${fontSizes[fontSize]}`}>
                                {viewMode === 'scroll' ? (
                                    // Continuous scroll mode
                                    book?.content.map((section, index) => (
                                        <div key={index} className="mb-12">
                                            <h2 className="text-2xl font-bold text-white mb-6">
                                                {section.title}
                                            </h2>
                                            <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                                {section.content}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    // Section mode
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-6">
                                            {book?.content[currentPage - 1]?.title}
                                        </h2>
                                        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                            {book?.content[currentPage - 1]?.content}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Controls */}
                {viewMode === 'sections' && (
                    <div className="fixed bottom-8 right-8 flex space-x-4">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className="p-3 bg-black/50 text-white rounded-full hover:bg-red-600/20 hover:text-red-400 transition-colors disabled:opacity-50 disabled:hover:bg-black/50 disabled:hover:text-white"
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(Math.min(book.content.length, currentPage + 1))}
                            className="p-3 bg-black/50 text-white rounded-full hover:bg-red-600/20 hover:text-red-400 transition-colors disabled:opacity-50 disabled:hover:bg-black/50 disabled:hover:text-white"
                            disabled={currentPage === book.content.length}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default BookReaderPage;