import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseClient';
import { Download } from 'lucide-react';

const BookReaderPage = () => {
    const { bookId } = useParams();
    console.log('Book ID from URL params:', bookId);
    const { theme } = useTheme();
    const [pdfUrl, setPdfUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!bookId) {
            setIsLoading(false);
            setError("No book specified.");
            return;
        };

        setIsLoading(true);
        try {
            const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
            if (!supabaseUrl) {
                throw new Error("Supabase URL is not configured. Please check your .env file.");
            }

            // Manually construct the public URL, ensuring bookId is encoded
            const publicUrl = `${supabaseUrl}/storage/v1/object/public/library/${encodeURIComponent(bookId)}`;

            console.log('Manually constructed PDF URL:', publicUrl);
            setPdfUrl(publicUrl);
            setError(null);
        } catch (error) {
            console.error('Error constructing PDF URL:', error);
            setError(`Failed to load book: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [bookId]);

    return (
        <div className={`h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="flex justify-between items-center p-4 bg-gray-800 text-white shadow-md">
                <h1 className="text-xl font-bold truncate">{bookId}</h1>
                {pdfUrl && (
                    <a
                        href={pdfUrl}
                        download={bookId}
                        className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                    >
                        <Download className="w-5 h-5 mr-2" />
                        <span>Download</span>
                    </a>
                )}
            </div>
            <div className="flex-grow">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full bg-[#12131A]">
                        <Loader className="animate-spin h-8 w-8 text-red-500" />
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center h-full bg-[#12131A]">
                        <div className="flex items-center space-x-2 bg-red-900/20 text-red-400 p-4 rounded-lg">
                            <AlertCircle />
                            <span>{error}</span>
                        </div>
                    </div>
                ) : pdfUrl ? (
                    <iframe src={pdfUrl} className="w-full h-full" title={`Book ${bookId}`}></iframe>
                ) : (
                    <div className="flex-grow flex items-center justify-center bg-[#12131A]">
                        <div className="flex items-center space-x-2 bg-yellow-900/20 text-yellow-400 p-4 rounded-lg">
                            <AlertCircle />
                            <span>No PDF found for this book.</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookReaderPage;