import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { UploadIcon, Info, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import SubmissionGuidelines from "../components/SubmissionGuidelines";
import Select from 'react-select';

const SubmitPage = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [showGuidelinesModal, setShowGuidelinesModal] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [initializingTags, setInitializingTags] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [abstract, setAbstract] = useState('');

    const [category, setCategory] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');

    // Submission status
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Data for dropdowns
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);

    // Check if user is admin
    useEffect(() => {
        const checkAdmin = async () => {
            if (!user) return;
            
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                    
                if (error) throw error;
                setIsAdmin(data?.role === 'admin');
            } catch (err) {
                console.error("Error checking admin status:", err);
            }
        };
        
        checkAdmin();
    }, [user]);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch categories
                const { data: categoriesData, error: categoriesError } = await supabase
                    .from('theory_categories')
                    .select('id, name');
                if (categoriesError) throw categoriesError;
                setCategories(categoriesData);
                console.log('Categories loaded:', categoriesData);
                
                // Fetch tags with explicit logging
                console.log('Fetching tags...');
                const { data: tagsData, error: tagsError } = await supabase
                    .from('theory_tags')
                    .select('id, name');
                
                if (tagsError) {
                    console.error('Error fetching tags:', tagsError);
                    throw tagsError;
                }
                
                console.log('Tags data received:', tagsData);
                
                if (!tagsData || tagsData.length === 0) {
                    console.warn('No tags found in database. The tags table might be empty.');
                } else {
                    const formattedTags = tagsData.map(t => ({ value: t.id, label: t.name }));
                    console.log('Formatted tags:', formattedTags);
                    setTags(formattedTags);
                }
            } catch (err) {
                console.error('Error in fetchData:', err);
                setError(err.message);
            }
        };
        fetchData();
    }, []);

    // Function to initialize tags in the database
    const initializeTags = async () => {
        if (!isAdmin) return;
        
        setInitializingTags(true);
        setError(null);
        
        const initialTags = [
            "Marxism",
            "Socialism",
            "Communism",
            "Historical Materialism",
            "Class Struggle",
            "Dialectical Materialism",
            "Political Economy",
            "Imperialism",
            "Revolution",
            "Labor Theory",
            "Alienation",
            "State Theory",
            "Critical Theory"
        ];
        
        try {
            // First check if any tags already exist to prevent duplicates
            const { data: existingTags } = await supabase
                .from('theory_tags')
                .select('name');
            
            const existingTagNames = existingTags ? existingTags.map(tag => tag.name) : [];
            
            // Filter out tags that already exist
            const tagsToAdd = initialTags.filter(tag => !existingTagNames.includes(tag));
            
            if (tagsToAdd.length === 0) {
                setError('Tags already initialized');
                return;
            }
            
            // Format tags for insertion
            const tagsForInsert = tagsToAdd.map(name => ({
                name,
                created_at: new Date().toISOString()
            }));
            
            // Insert the tags
            const { error: insertError } = await supabase
                .from('theory_tags')
                .insert(tagsForInsert);
                
            if (insertError) throw insertError;
            
            // Refresh tags list after insertion
            const { data: refreshedTags, error: refreshError } = await supabase
                .from('theory_tags')
                .select('id, name');
                
            if (refreshError) throw refreshError;
            
            setTags(refreshedTags.map(t => ({ value: t.id, label: t.name })));
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000); // Clear success after 3 seconds
            
        } catch (err) {
            console.error('Error initializing tags:', err);
            setError(`Failed to initialize tags: ${err.message}`);
        } finally {
            setInitializingTags(false);
        }
    };
    
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(selectedFile.type)) {
                setError(t('error.invalidFileType', 'Invalid file type. Please upload a PDF or Word document.'));
                setFile(null);
                setFileName('');
                return;
            }
            if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
                setError(t('error.fileTooLarge', 'File is too large. Maximum size is 5MB.'));
                setFile(null);
                setFileName('');
                return;
            }
            setError(null);
            setFile(selectedFile);
            setFileName(selectedFile.name);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!user) {
            setError(t('error.notAuthenticated', 'You must be logged in to submit an article.'));
            return;
        }

        if (!file || !title || !abstract || !category || selectedTags.length === 0) {
            setError(t('error.allFieldsRequired', 'Please fill out all fields, select a category, choose at least one tag, and upload a manuscript.'));
            return;
        }

        setSubmitting(true);

        try {
            // 1. Upload file to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const newFileName = `${Date.now()}.${fileExt}`;
            const filePath = `${user.id}/${newFileName}`;

            const { error: uploadError } = await supabase.storage
                .from('manuscripts')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // 2. Insert submission data into the database
            const tagIds = selectedTags.map(t => t.value);

            const { error: insertError } = await supabase
                .from('article_submissions')
                .insert({
                    user_id: user.id,
                    title,
                    abstract,
                    category_id: category,
                    tag_ids: tagIds,
                    file_path: filePath,
                    // keywords column is no longer used, but you might want to keep it for old data or remove it
                });

            if (insertError) {
                // If DB insert fails, try to delete the orphaned file from storage
                await supabase.storage.from('manuscripts').remove([filePath]);
                throw insertError;
            }

            // 3. Handle success
            setSuccess(true);
            setTitle('');
            setAbstract('');

            setCategory('');
            setSelectedTags([]);
            setFile(null);
            setFileName('');

        } catch (error) {
            setError(error.message);
            console.error('Submission error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#12131A]">
            <header className="relative h-[50vh]">
                <div className="absolute inset-0 bg-[radial-gradient(#ff000033_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            background: `url('/images/gramsci-bg.jpg') no-repeat center center`,
                            backgroundSize: 'cover',
                            filter: 'brightness(0.7) contrast(1.2)',
                            mixBlendMode: 'soft-light'
                        }}
                    ></div>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <div className="text-center space-y-8 max-w-4xl px-4">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">{t('submit.title', 'Submit Your Work')}</h1>
                        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
                            {t('submit.quote', '"Every social class creates its own organic intellectuals."')}
                        </p>
                    </div>
                </div>
            </header>

            {/* Submission Form Section */}
            <section className="container mx-auto px-4 -mt-16 pb-16">
                <div className="max-w-3xl mx-auto bg-black/30 backdrop-blur-sm p-8 rounded-lg border border-red-900/20">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowGuidelinesModal(true)}
                                className="flex items-center space-x-2 text-red-500 hover:text-red-400 transition-colors"
                            >
                                <Info className="w-5 h-5" />
                                <span>{t('submit.viewGuidelines', 'View Submission Guidelines')}</span>
                            </button>
                            
                            {isAdmin && (
                                <button
                                    type="button"
                                    onClick={initializeTags}
                                    disabled={initializingTags}
                                    className="ml-4 flex items-center space-x-2 text-green-500 hover:text-green-400 transition-colors"
                                >
                                    {initializingTags ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Adding tags...</span>
                                        </>
                                    ) : (
                                        <span className="text-sm">Initialize Tags (Admin)</span>
                                    )}
                                </button>
                            )}
                        </div>
                        
                        {/* Category Selection */}
                        <div>
                            <label htmlFor="category" className="block text-white mb-2">{t('submit.categoryLabel', 'Category')}</label>
                            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 bg-[#2E2F38] border border-[#4D4E5C] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#C2A55A] transition-colors" required>
                                <option value="" disabled>{t('submit.selectCategory', 'Select a category...')}</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-white mb-2">{t('submit.titleLabel', 'Title')}</label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-3 bg-[#2E2F38] border border-[#4D4E5C] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#C2A55A] transition-colors"
                                placeholder={t('submit.titlePlaceholder', "Enter your work's title")}
                                required
                            />
                        </div>

                        {/* Abstract */}
                        <div>
                            <label htmlFor="abstract" className="block text-white mb-2">{t('submit.abstractLabel', 'Abstract')}</label>
                            <textarea
                                id="abstract"
                                rows="4"
                                value={abstract}
                                onChange={(e) => setAbstract(e.target.value)}
                                className="w-full p-3 bg-[#2E2F38] border border-[#4D4E5C] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#C2A55A] transition-colors h-32"
                                placeholder={t('submit.abstractPlaceholder', 'Provide a brief abstract of your work')}
                                required
                            ></textarea>
                        </div>

                        {/* Tags Selection */}
                        <div>
                            <label htmlFor="tags" className="block text-white mb-2">{t('submit.tagsLabel', 'Tags')}</label>
                            <Select
                                id="tags"
                                isMulti
                                options={tags}
                                value={selectedTags}
                                onChange={setSelectedTags}
                                className="text-white"
                                classNamePrefix="select"
                                placeholder={t('submit.selectTags', 'Select tags...')}
                                styles={{
                                    control: (base) => ({ ...base, backgroundColor: '#2E2F38', borderColor: '#4D4E5C', color: 'white' }),
                                    multiValue: (base) => ({ ...base, backgroundColor: '#C2A55A' }),
                                    multiValueLabel: (base) => ({ ...base, color: 'black' }),
                                    option: (base, { isFocused, isSelected }) => ({ ...base, backgroundColor: isSelected ? '#C2A55A' : isFocused ? '#4D4E5C' : '#2E2F38', color: isSelected ? 'black' : 'white' }),
                                    menu: (base) => ({ ...base, backgroundColor: '#2E2F38' }),
                                    input: (base) => ({...base, color: 'white'})
                                }}
                            />
                        </div>

                        {/* File Upload Section */}
                        <div>
                            <label className="block text-white mb-2">{t('submit.uploadLabel', 'Upload Manuscript')}</label>
                            <label htmlFor="manuscript-upload" className="relative cursor-pointer bg-[#2E2F38] border border-[#4D4E5C] rounded-lg text-white p-3 flex items-center justify-center hover:bg-[#3c3d47] transition-colors">
                                <UploadIcon className="mr-3" size={20} />
                                <span className="truncate">{fileName || t('submit.chooseFile', 'Choose a file...')}</span>
                            </label>
                            <input id="manuscript-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                            <p className="text-gray-400 text-sm text-center mt-2">
                                {t('submit.fileHint', 'PDF, DOC, DOCX. Max 5MB.')}
                            </p>
                        </div>

                        {/* Feedback Messages */}
                        {error && (
                            <div className="text-red-400 flex items-center p-3 bg-red-900/20 rounded-lg">
                                <AlertTriangle className="mr-3 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        {success && (
                            <div className="text-green-400 flex items-center p-3 bg-green-900/20 rounded-lg">
                                <CheckCircle className="mr-3 flex-shrink-0" />
                                <span>{t('submit.successMessage', 'Submission successful! Thank you for your contribution.')}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-center pt-6">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-[#C2A55A] text-black font-bold py-3 px-8 rounded-lg hover:bg-yellow-500 transition-colors duration-300 flex items-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        {t('submit.submittingButton', 'Submitting...')}
                                    </>
                                ) : (
                                    <>
                                        <UploadIcon size={20} />
                                        {t('submit.submitButton', 'Submit Work')}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            <SubmissionGuidelines isOpen={showGuidelinesModal} onClose={() => setShowGuidelinesModal(false)} />
        </div>
    );
}

export default SubmitPage;