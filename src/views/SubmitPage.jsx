import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { UploadIcon, Info, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import SubmissionGuidelines from "../components/SubmissionGuidelines";
import Select from 'react-select';
import * as s from './SubmitPage.css.ts';

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
                setError(t('submit.invalidFileType'));
                setFile(null);
                setFileName('');
                return;
            }
            if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
                setError(t('submit.fileTooLarge'));
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
            setError(t('submit.loginRequired'));
            return;
        }

        if (!file || !title || !abstract || !category || selectedTags.length === 0) {
            setError(t('submit.missingFields'));
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
        <div className={s.page}>
            <header className={s.hero}>
                <div className={s.heroGrid} />
                <div className={s.heroContent}>
                    <div className={s.heroCopy}>
                        <p className={s.heroKicker}>{t('submit.kicker')}</p>
                        <h1 className={s.heroTitle}>{t('submit.title')}</h1>
                        <div className={s.heroRule} aria-hidden="true" />
                        <p className={s.heroQuote}>
                            {t('submit.quote')}
                        </p>
                    </div>
                </div>
            </header>

            <section className={s.formSection}>
                <div className={s.formCard}>
                    <form onSubmit={handleSubmit} className={s.form}>
                        <div className={s.topActions}>
                            <button type="button" onClick={() => setShowGuidelinesModal(true)} className={s.guidelineBtn}>
                                <Info size={18} />
                                <span>{t('submit.viewGuidelines')}</span>
                            </button>
                            {isAdmin && (
                                <button type="button" onClick={initializeTags} disabled={initializingTags} className={s.adminBtn}>
                                    {initializingTags ? (<><Loader2 size={14} /> Adding tags...</>) : (<span>Initialize Tags (Admin)</span>)}
                                </button>
                            )}
                        </div>

                        <div className={s.fieldBlock}>
                            <label htmlFor="category" className={s.fieldLabel}>{t('submit.category')}</label>
                            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={s.selectInput} required>
                                <option value="" disabled>{t('submit.selectCategory')}</option>
                                {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                            </select>
                        </div>

                        <div className={s.fieldBlock}>
                            <label htmlFor="title" className={s.fieldLabel}>{t('submit.workTitle')}</label>
                            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className={s.textInput} placeholder={t('submit.titlePlaceholder')} required />
                        </div>

                        <div className={s.fieldBlock}>
                            <label htmlFor="abstract" className={s.fieldLabel}>{t('submit.abstract')}</label>
                            <textarea id="abstract" rows="4" value={abstract} onChange={(e) => setAbstract(e.target.value)} className={s.textArea} placeholder={t('submit.abstractPlaceholder')} required />
                        </div>

                        <div className={s.fieldBlock}>
                            <label htmlFor="tags" className={s.fieldLabel}>{t('submit.tags')}</label>
                            <Select
                                id="tags"
                                isMulti
                                options={tags}
                                value={selectedTags}
                                onChange={setSelectedTags}
                                classNamePrefix="select"
                                placeholder={t('submit.selectTags')}
                                styles={{
                                    control: (base) => ({ ...base, backgroundColor: '#1a1f2b', borderColor: 'rgba(255,255,255,0.06)', color: 'white' }),
                                    multiValue: (base) => ({ ...base, backgroundColor: '#b3122e' }),
                                    multiValueLabel: (base) => ({ ...base, color: 'white' }),
                                    option: (base, { isFocused, isSelected }) => ({ ...base, backgroundColor: isSelected ? '#b3122e' : isFocused ? '#151924' : '#10131b', color: 'white' }),
                                    menu: (base) => ({ ...base, backgroundColor: '#10131b', border: '1px solid rgba(255,255,255,0.06)' }),
                                    input: (base) => ({ ...base, color: 'white' }),
                                    singleValue: (base) => ({ ...base, color: 'white' }),
                                }}
                            />
                        </div>

                        <div className={s.fieldBlock}>
                            <label className={s.fieldLabel}>{t('submit.uploadManuscript')}</label>
                            <label htmlFor="manuscript-upload" className={s.uploadLabel}>
                                <UploadIcon size={18} style={{ marginRight: 12 }} />
                                <span>{fileName || t('submit.chooseFile')}</span>
                            </label>
                            <input id="manuscript-upload" type="file" style={{ display: 'none' }} onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                            <p className={s.uploadHint}>{t('submit.fileHint')}</p>
                        </div>

                        {error && (
                            <div className={s.errorBox}>
                                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                                <span>{error}</span>
                            </div>
                        )}
                        {success && (
                            <div className={s.successBox}>
                                <CheckCircle size={18} style={{ flexShrink: 0 }} />
                                <span>{t('submit.success')}</span>
                            </div>
                        )}

                        <div className={s.submitRow}>
                            <button type="submit" disabled={submitting} className={s.submitBtn}>
                                {submitting ? (<><Loader2 size={18} /> {t('submit.submitting')}</>) : (<><UploadIcon size={18} /> {t('submit.submitWork')}</>)}
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
