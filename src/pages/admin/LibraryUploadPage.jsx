import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { 
    Upload, FileText, Image, Check, AlertTriangle, 
    ArrowLeft, Save, X, Loader2
} from 'lucide-react';

const CATEGORIES = [
    'Political Economy',
    'Philosophy',
    'History',
    'Sociology',
    'Strategy & Tactics',
    'Other',
];

const ERAS = [
    '19th Century',
    '20th Century',
    '21st Century',
];

const LANGUAGES = [
    'English',
    'German',
    'French',
    'Russian',
    'Spanish',
    'Chinese',
];

const LibraryUploadPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        year: '',
        description: '',
        category: '',
        era: '',
        language: 'English',
        pages: '',
        is_official: true,
    });
    
    const [pdfFile, setPdfFile] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [pdfPreview, setPdfPreview] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePdfUpload = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file');
            return;
        }
        
        setPdfFile(file);
        setPdfPreview(file.name);
        setError(null);
    }, []);

    const handleCoverUpload = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }
        
        setCoverFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
            setCoverPreview(event.target?.result);
        };
        reader.readAsDataURL(file);
        setError(null);
    }, []);

    const removePdf = () => {
        setPdfFile(null);
        setPdfPreview(null);
    };

    const removeCover = () => {
        setCoverFile(null);
        setCoverPreview(null);
    };

    const generateFilename = (file, prefix) => {
        const timestamp = Date.now();
        const sanitizedTitle = formData.title
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .substring(0, 50);
        const extension = file.name.split('.').pop();
        return `${prefix}-${sanitizedTitle}-${timestamp}.${extension}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.title.trim()) {
            setError('Title is required');
            return;
        }
        
        if (!pdfFile) {
            setError('PDF file is required');
            return;
        }

        setSaving(true);
        setError(null);

        try {
            // Upload PDF to library bucket
            const pdfFilename = generateFilename(pdfFile, 'book');
            const { error: pdfError } = await supabase.storage
                .from('library')
                .upload(pdfFilename, pdfFile, {
                    cacheControl: '3600',
                    upsert: false,
                });
            
            if (pdfError) throw new Error(`PDF upload failed: ${pdfError.message}`);

            // Upload cover image if provided
            let coverImageUrl = null;
            if (coverFile) {
                const coverFilename = generateFilename(coverFile, 'cover');
                const { error: coverError } = await supabase.storage
                    .from('covers')
                    .upload(coverFilename, coverFile, {
                        cacheControl: '3600',
                        upsert: false,
                    });
                
                if (coverError) throw new Error(`Cover upload failed: ${coverError.message}`);
                
                // Get public URL for cover
                const { data: urlData } = supabase.storage
                    .from('covers')
                    .getPublicUrl(coverFilename);
                coverImageUrl = urlData?.publicUrl;
            }

            // Insert book record into database
            const { error: dbError } = await supabase
                .from('digital_library_books')
                .insert({
                    title: formData.title.trim(),
                    author: formData.author.trim() || null,
                    year: formData.year ? parseInt(formData.year) : null,
                    description: formData.description.trim() || null,
                    category: formData.category || null,
                    era: formData.era || null,
                    language: formData.language || null,
                    pages: formData.pages ? parseInt(formData.pages) : null,
                    pdf_filename: pdfFilename,
                    cover_image_url: coverImageUrl,
                    is_official: formData.is_official,
                });

            if (dbError) throw new Error(`Database insert failed: ${dbError.message}`);

            setSuccess(true);
            setTimeout(() => {
                navigate('/digital-library');
            }, 1500);

        } catch (err) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to upload book');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/digital-library')}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Upload to Digital Library</h1>
                        <p className="text-gray-400 text-sm">Add a new PDF book to the library</p>
                    </div>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="mb-6 p-4 bg-green-900/50 border border-green-500/50 rounded-xl flex items-center gap-3">
                        <Check className="text-green-400" />
                        <span className="text-green-300">Book uploaded successfully! Redirecting...</span>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 rounded-xl flex items-center gap-3">
                        <AlertTriangle className="text-red-400" />
                        <span className="text-red-300">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* File Uploads */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* PDF Upload */}
                        <div className="bg-gray-900/50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <FileText className="text-red-500" size={20} />
                                PDF File *
                            </h3>
                            
                            {pdfPreview ? (
                                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <FileText size={18} className="text-red-400 flex-shrink-0" />
                                        <span className="text-sm text-gray-300 truncate">{pdfPreview}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removePdf}
                                        className="p-1 text-gray-400 hover:text-red-400"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-red-500/50 transition-colors">
                                    <input
                                        type="file"
                                        accept=".pdf,application/pdf"
                                        onChange={handlePdfUpload}
                                        className="hidden"
                                        id="pdf-upload"
                                    />
                                    <label htmlFor="pdf-upload" className="cursor-pointer">
                                        <Upload className="w-10 h-10 mx-auto text-gray-500 mb-2" />
                                        <p className="text-gray-400 text-sm">Click to upload PDF</p>
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Cover Image Upload */}
                        <div className="bg-gray-900/50 rounded-xl p-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Image className="text-red-500" size={20} />
                                Cover Image
                            </h3>
                            
                            {coverPreview ? (
                                <div className="relative">
                                    <img 
                                        src={coverPreview} 
                                        alt="Cover preview" 
                                        className="w-full h-48 object-contain bg-gray-800 rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeCover}
                                        className="absolute top-2 right-2 p-1 bg-gray-900/80 rounded-full text-gray-400 hover:text-red-400"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-red-500/50 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCoverUpload}
                                        className="hidden"
                                        id="cover-upload"
                                    />
                                    <label htmlFor="cover-upload" className="cursor-pointer">
                                        <Upload className="w-10 h-10 mx-auto text-gray-500 mb-2" />
                                        <p className="text-gray-400 text-sm">Click to upload cover</p>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Metadata Form */}
                    <div className="bg-gray-900/50 rounded-xl p-6 space-y-4">
                        <h3 className="text-lg font-semibold">Book Information</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm text-gray-400 mb-1">Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                                    placeholder="e.g., Capital Volume I"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Author</label>
                                <input
                                    type="text"
                                    name="author"
                                    value={formData.author}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                                    placeholder="e.g., Karl Marx"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Year</label>
                                <input
                                    type="number"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleInputChange}
                                    min="1400"
                                    max="2100"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                                    placeholder="e.g., 1867"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                                >
                                    <option value="">Select category</option>
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Era</label>
                                <select
                                    name="era"
                                    value={formData.era}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                                >
                                    <option value="">Select era</option>
                                    {ERAS.map(era => (
                                        <option key={era} value={era}>{era}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Language</label>
                                <select
                                    name="language"
                                    value={formData.language}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                                >
                                    {LANGUAGES.map(lang => (
                                        <option key={lang} value={lang}>{lang}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Pages</label>
                                <input
                                    type="number"
                                    name="pages"
                                    value={formData.pages}
                                    onChange={handleInputChange}
                                    min="1"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                                    placeholder="e.g., 500"
                                />
                            </div>
                            
                            <div className="md:col-span-2 flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_official"
                                        checked={formData.is_official}
                                        onChange={(e) => setFormData(prev => ({ ...prev, is_official: e.target.checked }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-gray-700 peer-focus:ring-2 peer-focus:ring-red-500 rounded-full peer peer-checked:bg-red-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                                </label>
                                <span className="text-sm text-gray-300">Official Library Book</span>
                                <span className="text-xs text-gray-500">(uncheck for community uploads)</span>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm text-gray-400 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-y"
                                    placeholder="Brief description of the book..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={saving || !formData.title || !pdfFile}
                        className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Upload Book
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LibraryUploadPage;
