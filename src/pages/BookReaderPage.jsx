import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader, AlertCircle, Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabaseClient';

const BookReaderPage = () => {
    const { bookId } = useParams();
    const { theme } = useTheme();
    const [pdfUrl, setPdfUrl] = useState(null);
    const [bookTitle, setBookTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBook = async () => {
            if (!bookId) {
                setError("No book ID provided.");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                // 1. Fetch book details from the database
                const { data: bookData, error: dbError } = await supabase
                    .from('digital_library_books')
                    .select('title, pdf_filename')
                    .eq('id', bookId)
                    .single();

                if (dbError) {
                    throw new Error(dbError.message || "Book not found in the database.");
                }
                if (!bookData) {
                    throw new Error("Book not found in the database.");
                }

                setBookTitle(bookData.title);

                // 2. Get the public URL for the PDF file
                const { data: urlData } = supabase
                    .storage
                    .from('library')
                    .getPublicUrl(bookData.pdf_filename);

                if (!urlData || !urlData.publicUrl) {
                    throw new Error("Could not retrieve PDF URL.");
                }
                
                setPdfUrl(urlData.publicUrl);
                setError(null);

            } catch (err) {
                console.error("Error fetching book:", err);
                setError(err.message);
                setPdfUrl(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBook();
    }, [bookId]);

    return (
        <div className={`h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="flex justify-between items-center p-4 bg-gray-800 text-white shadow-md">
                <h1 className="text-xl font-bold truncate">{bookTitle || 'Loading...'}</h1>
                {pdfUrl && (
                    <a
                        href={pdfUrl}
                        download={bookTitle ? `${bookTitle}.pdf` : 'download.pdf'}
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
                    <iframe src={pdfUrl} className="w-full h-full" title={bookTitle || 'Book'}></iframe>
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