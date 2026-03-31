import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertTriangle,
    ArrowLeft,
    BookOpen,
    Check,
    FileText,
    GitBranch,
    Globe,
    Headphones,
    Link,
    Loader2,
    Pencil,
    Plus,
    Save,
    Trash2,
    Upload,
    Users,
    Video,
    X,
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';

const RESOURCE_TYPES = ['text', 'video', 'audio', 'lecture'];

const ICON_OPTIONS = ['BookOpen', 'GitBranch', 'Users', 'FileText', 'Video', 'Headphones'];

const ICON_MAP = {
    BookOpen,
    GitBranch,
    Users,
    FileText,
    Video,
    Headphones,
};

const emptyResource = {
    id: null,
    title: '',
    type: 'text',
    excerpt: '',
    content_url: '',
    cover_image_url: '',
    author: '',
    category: '',
    sort_order: 0,
    is_featured: false,
    digital_library_book_id: '',
};

const emptyConcept = {
    id: null,
    term: '',
    chinese_term: '',
    icon_name: 'BookOpen',
    explanation: '',
    category: '',
    sort_order: 0,
};

const emptyMilestone = {
    id: null,
    title: '',
    chinese_title: '',
    description: '',
    sort_order: 0,
    resource_id: '',
};

const emptyAudiobook = {
    id: null,
    title: '',
    author: '',
    narrator: '',
    description: '',
    audio_url: '',
    cover_url: '',
    duration_seconds: '',
    chapters: [],
    category: '',
    is_featured: false,
    sort_order: 0,
};

const emptyChapter = { title: '', start_seconds: '' };

const StudyAdminPage = () => {
    const navigate = useNavigate();
    const { canManageStudy } = useAuth();
    const canEdit = canManageStudy();

    const [activeTab, setActiveTab] = useState('resources');

    const [resources, setResources] = useState([]);
    const [concepts, setConcepts] = useState([]);
    const [milestones, setMilestones] = useState([]);
    const [libraryBooks, setLibraryBooks] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [resourceForm, setResourceForm] = useState(emptyResource);
    const [conceptForm, setConceptForm] = useState(emptyConcept);
    const [milestoneForm, setMilestoneForm] = useState(emptyMilestone);
    const [audiobookForm, setAudiobookForm] = useState(emptyAudiobook);
    const [audiobooks, setAudiobooks] = useState([]);
    const [uploadingAudio, setUploadingAudio] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [audioSourceMode, setAudioSourceMode] = useState('upload'); // 'upload' | 'archive'
    const [archiveUrl, setArchiveUrl] = useState('');

    useEffect(() => {
        if (!canEdit) {
            navigate('/coming-soon', { replace: true });
        }
    }, [canEdit, navigate]);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [resData, conData, milData, libData, abData] = await Promise.all([
                    supabase.from('study_resources').select('*').order('sort_order'),
                    supabase.from('study_concepts').select('*').order('sort_order'),
                    supabase.from('study_milestones').select('*').order('sort_order'),
                    supabase.from('digital_library_books').select('id, title').order('title'),
                    supabase.from('audiobooks').select('*').order('sort_order'),
                ]);

                if (resData.error) throw resData.error;
                if (conData.error) throw conData.error;
                if (milData.error) throw milData.error;

                setResources(resData.data || []);
                setConcepts(conData.data || []);
                setMilestones(milData.data || []);
                setLibraryBooks(libData.data || []);
                setAudiobooks(abData.data || []);
            } catch (err) {
                console.error('Error loading study admin data:', err);
                setError(err.message || 'Failed to load study data.');
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    const refreshResources = async () => {
        const { data } = await supabase.from('study_resources').select('*').order('sort_order');
        setResources(data || []);
    };

    const refreshConcepts = async () => {
        const { data } = await supabase.from('study_concepts').select('*').order('sort_order');
        setConcepts(data || []);
    };

    const refreshMilestones = async () => {
        const { data } = await supabase.from('study_milestones').select('*').order('sort_order');
        setMilestones(data || []);
    };

    const refreshAudiobooks = async () => {
        const { data } = await supabase.from('audiobooks').select('*').order('sort_order');
        setAudiobooks(data || []);
    };

    const compressImage = (file, maxDim = 800, quality = 0.85) => new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            URL.revokeObjectURL(url);
            let { width, height } = img;
            if (width <= maxDim && height <= maxDim && file.size < 500_000) {
                resolve(file);
                return;
            }
            const scale = Math.min(maxDim / width, maxDim / height, 1);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);
            canvas.toBlob(
                (blob) => (blob ? resolve(new File([blob], file.name, { type: 'image/jpeg' })) : reject(new Error('Compression failed'))),
                'image/jpeg',
                quality,
            );
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to read image')); };
        img.src = url;
    });

    const uploadFile = async (file, folder) => {
        const ext = file.name.split('.').pop();
        const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error: uploadError } = await supabase.storage
            .from('audiobooks')
            .upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('audiobooks').getPublicUrl(path);
        return urlData.publicUrl;
    };

    const parseArchiveOrgUrl = (url) => {
        try {
            const u = new URL(url.trim());
            if (u.hostname !== 'archive.org' && u.hostname !== 'www.archive.org') return null;
            const match = u.pathname.match(/^\/(details|download)\/([^/]+)/);
            if (!match) return null;
            const identifier = match[2];
            // If it's already a full /download/{id}/{file} link, use as-is
            if (match[1] === 'download' && u.pathname.split('/').filter(Boolean).length > 2) {
                return url.trim();
            }
            return `https://archive.org/download/${identifier}/${identifier}.mp3`;
        } catch {
            return null;
        }
    };

    const handleArchiveUrl = () => {
        const directUrl = parseArchiveOrgUrl(archiveUrl);
        if (!directUrl) {
            setError('Invalid Internet Archive URL. Please paste a link like: https://archive.org/details/...');
            return;
        }
        setError('');
        setAudiobookForm((p) => ({ ...p, audio_url: directUrl }));
        setSuccess('Internet Archive link added.');
    };

    const handleAudioFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 50 * 1024 * 1024) {
            setError(`Audio file must be under 50 MB (yours is ${(file.size / 1024 / 1024).toFixed(1)} MB). Please compress it first — e.g. convert to 128kbps MP3.`);
            return;
        }
        setUploadingAudio(true);
        setError('');
        try {
            const url = await uploadFile(file, 'audio');
            setAudiobookForm((p) => ({ ...p, audio_url: url }));
            setSuccess('Audio file uploaded.');
        } catch (err) {
            console.error('Audio upload error:', err);
            setError(err.message || 'Failed to upload audio file.');
        } finally {
            setUploadingAudio(false);
        }
    };

    const handleCoverFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            setError('Cover image must be under 10 MB.');
            return;
        }
        setUploadingCover(true);
        setError('');
        try {
            const compressed = await compressImage(file);
            const url = await uploadFile(compressed, 'covers');
            setAudiobookForm((p) => ({ ...p, cover_url: url }));
            setSuccess('Cover image uploaded.');
        } catch (err) {
            console.error('Cover upload error:', err);
            setError(err.message || 'Failed to upload cover image.');
        } finally {
            setUploadingCover(false);
        }
    };

    const handleSaveAudiobook = async (e) => {
        e.preventDefault();
        if (!audiobookForm.title.trim()) {
            setError('Audiobook title is required.');
            return;
        }
        if (!audiobookForm.audio_url.trim()) {
            setError('Audio file is required.');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                title: audiobookForm.title.trim(),
                author: audiobookForm.author.trim() || null,
                narrator: audiobookForm.narrator.trim() || null,
                description: audiobookForm.description.trim() || null,
                audio_url: audiobookForm.audio_url.trim(),
                cover_url: audiobookForm.cover_url.trim() || null,
                duration_seconds: parseInt(audiobookForm.duration_seconds, 10) || null,
                chapters: (audiobookForm.chapters || []).filter((ch) => ch.title.trim()).map((ch) => ({
                    title: ch.title.trim(),
                    start_seconds: parseInt(ch.start_seconds, 10) || 0,
                })),
                category: audiobookForm.category.trim() || null,
                is_featured: audiobookForm.is_featured === true,
                sort_order: parseInt(audiobookForm.sort_order, 10) || 0,
            };

            if (audiobookForm.id) {
                const { error: updateError } = await supabase
                    .from('audiobooks')
                    .update(payload)
                    .eq('id', audiobookForm.id);
                if (updateError) throw updateError;
                setSuccess('Audiobook updated.');
            } else {
                const { error: insertError } = await supabase
                    .from('audiobooks')
                    .insert(payload);
                if (insertError) throw insertError;
                setSuccess('Audiobook created.');
            }

            await refreshAudiobooks();
            setAudiobookForm(emptyAudiobook);
            setArchiveUrl('');
            setAudioSourceMode('upload');
        } catch (err) {
            console.error('Error saving audiobook:', err);
            setError(err.message || 'Failed to save audiobook.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAudiobook = async (id) => {
        if (!window.confirm('Delete this audiobook permanently?')) return;
        setDeleting(true);
        try {
            const { error: deleteError } = await supabase.from('audiobooks').delete().eq('id', id);
            if (deleteError) throw deleteError;
            await refreshAudiobooks();
            if (audiobookForm.id === id) {
                setAudiobookForm(emptyAudiobook);
                setArchiveUrl('');
                setAudioSourceMode('upload');
            }
            setSuccess('Audiobook deleted.');
        } catch (err) {
            setError(err.message || 'Failed to delete audiobook.');
        } finally {
            setDeleting(false);
        }
    };

    const addChapter = () => {
        setAudiobookForm((p) => ({ ...p, chapters: [...(p.chapters || []), { ...emptyChapter }] }));
    };

    const removeChapter = (index) => {
        setAudiobookForm((p) => ({ ...p, chapters: p.chapters.filter((_, i) => i !== index) }));
    };

    const updateChapter = (index, field, value) => {
        setAudiobookForm((p) => ({
            ...p,
            chapters: p.chapters.map((ch, i) => (i === index ? { ...ch, [field]: value } : ch)),
        }));
    };

    const handleSaveResource = async (e) => {
        e.preventDefault();
        if (!resourceForm.title.trim()) {
            setError('Resource title is required.');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                title: resourceForm.title.trim(),
                type: resourceForm.type,
                excerpt: resourceForm.excerpt.trim() || null,
                content_url: resourceForm.content_url.trim() || null,
                cover_image_url: resourceForm.cover_image_url.trim() || null,
                author: resourceForm.author.trim() || null,
                category: resourceForm.category.trim() || null,
                sort_order: parseInt(resourceForm.sort_order, 10) || 0,
                is_featured: resourceForm.is_featured === true,
                digital_library_book_id: resourceForm.digital_library_book_id || null,
            };

            if (resourceForm.id) {
                const { error: updateError } = await supabase
                    .from('study_resources')
                    .update(payload)
                    .eq('id', resourceForm.id);
                if (updateError) throw updateError;
                setSuccess('Resource updated.');
            } else {
                const { error: insertError } = await supabase
                    .from('study_resources')
                    .insert(payload);
                if (insertError) throw insertError;
                setSuccess('Resource created.');
            }

            await refreshResources();
            setResourceForm(emptyResource);
        } catch (err) {
            console.error('Error saving resource:', err);
            setError(err.message || 'Failed to save resource.');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveConcept = async (e) => {
        e.preventDefault();
        if (!conceptForm.term.trim()) {
            setError('Concept term is required.');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                term: conceptForm.term.trim(),
                chinese_term: conceptForm.chinese_term.trim() || null,
                icon_name: conceptForm.icon_name || 'BookOpen',
                explanation: conceptForm.explanation.trim(),
                category: conceptForm.category.trim() || null,
                sort_order: parseInt(conceptForm.sort_order, 10) || 0,
            };

            if (conceptForm.id) {
                const { error: updateError } = await supabase
                    .from('study_concepts')
                    .update(payload)
                    .eq('id', conceptForm.id);
                if (updateError) throw updateError;
                setSuccess('Concept updated.');
            } else {
                const { error: insertError } = await supabase
                    .from('study_concepts')
                    .insert(payload);
                if (insertError) throw insertError;
                setSuccess('Concept created.');
            }

            await refreshConcepts();
            setConceptForm(emptyConcept);
        } catch (err) {
            console.error('Error saving concept:', err);
            setError(err.message || 'Failed to save concept.');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveMilestone = async (e) => {
        e.preventDefault();
        if (!milestoneForm.title.trim()) {
            setError('Milestone title is required.');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                title: milestoneForm.title.trim(),
                chinese_title: milestoneForm.chinese_title.trim() || null,
                description: milestoneForm.description.trim() || null,
                sort_order: parseInt(milestoneForm.sort_order, 10) || 0,
                resource_id: milestoneForm.resource_id || null,
            };

            if (milestoneForm.id) {
                const { error: updateError } = await supabase
                    .from('study_milestones')
                    .update(payload)
                    .eq('id', milestoneForm.id);
                if (updateError) throw updateError;
                setSuccess('Milestone updated.');
            } else {
                const { error: insertError } = await supabase
                    .from('study_milestones')
                    .insert(payload);
                if (insertError) throw insertError;
                setSuccess('Milestone created.');
            }

            await refreshMilestones();
            setMilestoneForm(emptyMilestone);
        } catch (err) {
            console.error('Error saving milestone:', err);
            setError(err.message || 'Failed to save milestone.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteResource = async (id) => {
        if (!window.confirm('Delete this resource permanently?')) return;
        setDeleting(true);
        try {
            const { error: deleteError } = await supabase.from('study_resources').delete().eq('id', id);
            if (deleteError) throw deleteError;
            await refreshResources();
            if (resourceForm.id === id) setResourceForm(emptyResource);
            setSuccess('Resource deleted.');
        } catch (err) {
            setError(err.message || 'Failed to delete resource.');
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteConcept = async (id) => {
        if (!window.confirm('Delete this concept permanently?')) return;
        setDeleting(true);
        try {
            const { error: deleteError } = await supabase.from('study_concepts').delete().eq('id', id);
            if (deleteError) throw deleteError;
            await refreshConcepts();
            if (conceptForm.id === id) setConceptForm(emptyConcept);
            setSuccess('Concept deleted.');
        } catch (err) {
            setError(err.message || 'Failed to delete concept.');
        } finally {
            setDeleting(false);
        }
    };

    const handleDeleteMilestone = async (id) => {
        if (!window.confirm('Delete this milestone permanently?')) return;
        setDeleting(true);
        try {
            const { error: deleteError } = await supabase.from('study_milestones').delete().eq('id', id);
            if (deleteError) throw deleteError;
            await refreshMilestones();
            if (milestoneForm.id === id) setMilestoneForm(emptyMilestone);
            setSuccess('Milestone deleted.');
        } catch (err) {
            setError(err.message || 'Failed to delete milestone.');
        } finally {
            setDeleting(false);
        }
    };

    const inputClass = 'w-full bg-[#0F1118] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm';
    const labelClass = 'block text-sm text-gray-400 mb-1';

    return (
        <div className="min-h-screen bg-[#12131A] text-white px-4 py-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => navigate('/study')}
                        className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                        aria-label="Back to study page"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Study Center Admin</h1>
                        <p className="text-gray-400 text-sm">Manage resources, concepts, and milestones for the Marxist theory study page.</p>
                    </div>
                </div>

                {success && (
                    <div className="mb-4 p-3 bg-emerald-900/40 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-emerald-300 text-sm">
                        <Check size={16} /> {success}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-900/40 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-300 text-sm">
                        <AlertTriangle size={16} /> {error}
                    </div>
                )}

                <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
                    {['resources', 'concepts', 'milestones', 'audiobooks'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setError(''); setSuccess(''); }}
                            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                                activeTab === tab
                                    ? 'bg-red-600/20 text-red-400 border-b-2 border-red-500'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="bg-[#181A23] border border-gray-800 rounded-2xl p-8 text-gray-400 flex items-center gap-2">
                        <Loader2 size={18} className="animate-spin" /> Loading study data...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <section className="lg:col-span-3 bg-[#181A23] border border-gray-800 rounded-2xl p-6">
                            {activeTab === 'resources' && (
                                <form onSubmit={handleSaveResource} className="space-y-4">
                                    <h2 className="text-lg font-semibold mb-2">{resourceForm.id ? 'Edit Resource' : 'New Resource'}</h2>

                                    <div>
                                        <label className={labelClass}>Title *</label>
                                        <input type="text" value={resourceForm.title} onChange={(e) => setResourceForm((p) => ({ ...p, title: e.target.value }))} className={inputClass} required />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Type</label>
                                            <select value={resourceForm.type} onChange={(e) => setResourceForm((p) => ({ ...p, type: e.target.value }))} className={inputClass}>
                                                {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Category</label>
                                            <input type="text" value={resourceForm.category} onChange={(e) => setResourceForm((p) => ({ ...p, category: e.target.value }))} className={inputClass} placeholder="e.g. Political Economy" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Excerpt</label>
                                        <textarea value={resourceForm.excerpt} onChange={(e) => setResourceForm((p) => ({ ...p, excerpt: e.target.value }))} rows={3} className={inputClass} />
                                    </div>

                                    <div>
                                        <label className={labelClass}>Author</label>
                                        <input type="text" value={resourceForm.author} onChange={(e) => setResourceForm((p) => ({ ...p, author: e.target.value }))} className={inputClass} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Content URL</label>
                                            <input type="url" value={resourceForm.content_url} onChange={(e) => setResourceForm((p) => ({ ...p, content_url: e.target.value }))} className={inputClass} placeholder="https://..." />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Cover Image URL</label>
                                            <input type="url" value={resourceForm.cover_image_url} onChange={(e) => setResourceForm((p) => ({ ...p, cover_image_url: e.target.value }))} className={inputClass} placeholder="https://..." />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Sort Order</label>
                                            <input type="number" value={resourceForm.sort_order} onChange={(e) => setResourceForm((p) => ({ ...p, sort_order: e.target.value }))} className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Digital Library Link</label>
                                            <select value={resourceForm.digital_library_book_id} onChange={(e) => setResourceForm((p) => ({ ...p, digital_library_book_id: e.target.value }))} className={inputClass}>
                                                <option value="">None</option>
                                                {libraryBooks.map((book) => (
                                                    <option key={book.id} value={book.id}>{book.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <label className="inline-flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                        <input type="checkbox" checked={resourceForm.is_featured} onChange={(e) => setResourceForm((p) => ({ ...p, is_featured: e.target.checked }))} className="rounded border-gray-600 bg-[#0F1118]" />
                                        Featured resource
                                    </label>

                                    <div className="flex gap-3 pt-2">
                                        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 rounded-lg text-sm font-medium transition-colors">
                                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                            {resourceForm.id ? 'Update' : 'Create'}
                                        </button>
                                        {resourceForm.id && (
                                            <button type="button" onClick={() => setResourceForm(emptyResource)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">Cancel</button>
                                        )}
                                    </div>
                                </form>
                            )}

                            {activeTab === 'concepts' && (
                                <form onSubmit={handleSaveConcept} className="space-y-4">
                                    <h2 className="text-lg font-semibold mb-2">{conceptForm.id ? 'Edit Concept' : 'New Concept'}</h2>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Term *</label>
                                            <input type="text" value={conceptForm.term} onChange={(e) => setConceptForm((p) => ({ ...p, term: e.target.value }))} className={inputClass} required />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Chinese Term</label>
                                            <input type="text" value={conceptForm.chinese_term} onChange={(e) => setConceptForm((p) => ({ ...p, chinese_term: e.target.value }))} className={inputClass} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Explanation *</label>
                                        <textarea value={conceptForm.explanation} onChange={(e) => setConceptForm((p) => ({ ...p, explanation: e.target.value }))} rows={4} className={inputClass} required />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className={labelClass}>Icon</label>
                                            <select value={conceptForm.icon_name} onChange={(e) => setConceptForm((p) => ({ ...p, icon_name: e.target.value }))} className={inputClass}>
                                                {ICON_OPTIONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Category</label>
                                            <input type="text" value={conceptForm.category} onChange={(e) => setConceptForm((p) => ({ ...p, category: e.target.value }))} className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Sort Order</label>
                                            <input type="number" value={conceptForm.sort_order} onChange={(e) => setConceptForm((p) => ({ ...p, sort_order: e.target.value }))} className={inputClass} />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 rounded-lg text-sm font-medium transition-colors">
                                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                            {conceptForm.id ? 'Update' : 'Create'}
                                        </button>
                                        {conceptForm.id && (
                                            <button type="button" onClick={() => setConceptForm(emptyConcept)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">Cancel</button>
                                        )}
                                    </div>
                                </form>
                            )}

                            {activeTab === 'milestones' && (
                                <form onSubmit={handleSaveMilestone} className="space-y-4">
                                    <h2 className="text-lg font-semibold mb-2">{milestoneForm.id ? 'Edit Milestone' : 'New Milestone'}</h2>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Title *</label>
                                            <input type="text" value={milestoneForm.title} onChange={(e) => setMilestoneForm((p) => ({ ...p, title: e.target.value }))} className={inputClass} required />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Chinese Title</label>
                                            <input type="text" value={milestoneForm.chinese_title} onChange={(e) => setMilestoneForm((p) => ({ ...p, chinese_title: e.target.value }))} className={inputClass} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Description</label>
                                        <textarea value={milestoneForm.description} onChange={(e) => setMilestoneForm((p) => ({ ...p, description: e.target.value }))} rows={3} className={inputClass} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Linked Resource</label>
                                            <select value={milestoneForm.resource_id} onChange={(e) => setMilestoneForm((p) => ({ ...p, resource_id: e.target.value }))} className={inputClass}>
                                                <option value="">None</option>
                                                {resources.map((res) => (
                                                    <option key={res.id} value={res.id}>{res.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Sort Order</label>
                                            <input type="number" value={milestoneForm.sort_order} onChange={(e) => setMilestoneForm((p) => ({ ...p, sort_order: e.target.value }))} className={inputClass} />
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 rounded-lg text-sm font-medium transition-colors">
                                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                            {milestoneForm.id ? 'Update' : 'Create'}
                                        </button>
                                        {milestoneForm.id && (
                                            <button type="button" onClick={() => setMilestoneForm(emptyMilestone)} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">Cancel</button>
                                        )}
                                    </div>
                                </form>
                            )}

                            {activeTab === 'audiobooks' && (
                                <form onSubmit={handleSaveAudiobook} className="space-y-4">
                                    <h2 className="text-lg font-semibold mb-2">{audiobookForm.id ? 'Edit Audiobook' : 'New Audiobook'}</h2>

                                    <div>
                                        <label className={labelClass}>Title *</label>
                                        <input type="text" value={audiobookForm.title} onChange={(e) => setAudiobookForm((p) => ({ ...p, title: e.target.value }))} className={inputClass} required />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Author</label>
                                            <input type="text" value={audiobookForm.author} onChange={(e) => setAudiobookForm((p) => ({ ...p, author: e.target.value }))} className={inputClass} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Narrator</label>
                                            <input type="text" value={audiobookForm.narrator} onChange={(e) => setAudiobookForm((p) => ({ ...p, narrator: e.target.value }))} className={inputClass} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={labelClass}>Description</label>
                                        <textarea value={audiobookForm.description} onChange={(e) => setAudiobookForm((p) => ({ ...p, description: e.target.value }))} rows={3} className={inputClass} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Category</label>
                                            <input type="text" value={audiobookForm.category} onChange={(e) => setAudiobookForm((p) => ({ ...p, category: e.target.value }))} className={inputClass} placeholder="e.g. Political Economy" />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Duration (seconds)</label>
                                            <input type="number" value={audiobookForm.duration_seconds} onChange={(e) => setAudiobookForm((p) => ({ ...p, duration_seconds: e.target.value }))} className={inputClass} placeholder="e.g. 3600" />
                                        </div>
                                    </div>

                                    {/* Audio source */}
                                    <div>
                                        <label className={labelClass}>Audio Source *</label>
                                        {audiobookForm.audio_url ? (
                                            <div className="flex items-center gap-2 text-sm">
                                                {audiobookForm.audio_url.includes('archive.org/download/') ? (
                                                    <>
                                                        <Globe size={14} className="text-blue-400 flex-shrink-0" />
                                                        <span className="text-gray-300 truncate flex-1" title={audiobookForm.audio_url}>
                                                            Internet Archive: {audiobookForm.audio_url.match(/\/download\/([^/]+)/)?.[1] || audiobookForm.audio_url}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Headphones size={14} className="text-purple-400 flex-shrink-0" />
                                                        <span className="text-gray-300 truncate flex-1">{audiobookForm.audio_url.split('/').pop()}</span>
                                                    </>
                                                )}
                                                <button type="button" onClick={() => { setAudiobookForm((p) => ({ ...p, audio_url: '' })); setArchiveUrl(''); }} className="text-xs text-red-400 hover:text-red-300 flex-shrink-0">Remove</button>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Toggle: Upload MP3 / Internet Archive Link */}
                                                <div className="flex gap-1 mb-3 bg-[#0F1118] rounded-lg p-1 border border-gray-700/50">
                                                    <button
                                                        type="button"
                                                        onClick={() => setAudioSourceMode('upload')}
                                                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${audioSourceMode === 'upload' ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'text-gray-500 hover:text-gray-300'}`}
                                                    >
                                                        <Upload size={12} /> Upload MP3
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setAudioSourceMode('archive')}
                                                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${audioSourceMode === 'archive' ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' : 'text-gray-500 hover:text-gray-300'}`}
                                                    >
                                                        <Globe size={12} /> Internet Archive
                                                    </button>
                                                </div>

                                                {audioSourceMode === 'upload' ? (
                                                    <label className={`flex items-center gap-2 px-3 py-2 border border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-purple-500/50 transition-colors ${uploadingAudio ? 'opacity-60 pointer-events-none' : ''}`}>
                                                        {uploadingAudio ? <Loader2 size={16} className="animate-spin text-purple-400" /> : <Upload size={16} className="text-gray-400" />}
                                                        <span className="text-sm text-gray-400">{uploadingAudio ? 'Uploading...' : 'Choose audio file (max 50 MB)'}</span>
                                                        <input type="file" accept="audio/*" onChange={handleAudioFileChange} className="hidden" />
                                                    </label>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="url"
                                                                value={archiveUrl}
                                                                onChange={(e) => setArchiveUrl(e.target.value)}
                                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleArchiveUrl(); } }}
                                                                placeholder="https://archive.org/details/..."
                                                                className={`${inputClass} flex-1`}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={handleArchiveUrl}
                                                                disabled={!archiveUrl.trim()}
                                                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 flex-shrink-0"
                                                            >
                                                                <Link size={14} /> Use Link
                                                            </button>
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            Paste an <code className="text-gray-400">archive.org/details/</code> or <code className="text-gray-400">archive.org/download/</code> link
                                                        </p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* Cover image upload */}
                                    <div>
                                        <label className={labelClass}>Cover Image</label>
                                        {audiobookForm.cover_url ? (
                                            <div className="flex items-center gap-3">
                                                <img src={audiobookForm.cover_url} alt="Cover preview" className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                                                <button type="button" onClick={() => setAudiobookForm((p) => ({ ...p, cover_url: '' }))} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                                            </div>
                                        ) : (
                                            <label className={`flex items-center gap-2 px-3 py-2 border border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-purple-500/50 transition-colors ${uploadingCover ? 'opacity-60 pointer-events-none' : ''}`}>
                                                {uploadingCover ? <Loader2 size={16} className="animate-spin text-purple-400" /> : <Upload size={16} className="text-gray-400" />}
                                                <span className="text-sm text-gray-400">{uploadingCover ? 'Uploading...' : 'Choose cover image'}</span>
                                                <input type="file" accept="image/*" onChange={handleCoverFileChange} className="hidden" />
                                            </label>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Sort Order</label>
                                            <input type="number" value={audiobookForm.sort_order} onChange={(e) => setAudiobookForm((p) => ({ ...p, sort_order: e.target.value }))} className={inputClass} />
                                        </div>
                                        <div className="flex items-end pb-1">
                                            <label className="inline-flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                                <input type="checkbox" checked={audiobookForm.is_featured} onChange={(e) => setAudiobookForm((p) => ({ ...p, is_featured: e.target.checked }))} className="rounded border-gray-600 bg-[#0F1118]" />
                                                Featured audiobook
                                            </label>
                                        </div>
                                    </div>

                                    {/* Chapters editor */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className={labelClass}>Chapters</label>
                                            <button type="button" onClick={addChapter} className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300">
                                                <Plus size={12} /> Add Chapter
                                            </button>
                                        </div>
                                        {(audiobookForm.chapters || []).length === 0 ? (
                                            <p className="text-xs text-gray-500">No chapters added yet.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {audiobookForm.chapters.map((ch, i) => (
                                                    <div key={i} className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500 w-5 flex-shrink-0">{i + 1}.</span>
                                                        <input
                                                            type="text"
                                                            value={ch.title}
                                                            onChange={(e) => updateChapter(i, 'title', e.target.value)}
                                                            placeholder="Chapter title"
                                                            className="bg-[#0F1118] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm flex-1 min-w-0"
                                                        />
                                                        <input
                                                            type="number"
                                                            value={ch.start_seconds}
                                                            onChange={(e) => updateChapter(i, 'start_seconds', e.target.value)}
                                                            placeholder="Start (s)"
                                                            className="bg-[#0F1118] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm w-24 flex-shrink-0"
                                                        />
                                                        <button type="button" onClick={() => removeChapter(i)} className="p-1 text-red-400 hover:text-red-300">
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button type="submit" disabled={saving || uploadingAudio || uploadingCover} className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 rounded-lg text-sm font-medium transition-colors">
                                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                            {audiobookForm.id ? 'Update' : 'Create'}
                                        </button>
                                        {audiobookForm.id && (
                                            <button type="button" onClick={() => { setAudiobookForm(emptyAudiobook); setArchiveUrl(''); setAudioSourceMode('upload'); }} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">Cancel</button>
                                        )}
                                    </div>
                                </form>
                            )}
                        </section>

                        <aside className="lg:col-span-2 space-y-4">
                            <h2 className="text-lg font-semibold">
                                {activeTab === 'resources' ? `Resources (${resources.length})` : activeTab === 'concepts' ? `Concepts (${concepts.length})` : activeTab === 'audiobooks' ? `Audiobooks (${audiobooks.length})` : `Milestones (${milestones.length})`}
                            </h2>

                            <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
                                {activeTab === 'resources' && resources.map((item) => (
                                    <div key={item.id} className="border border-gray-700 rounded-lg p-3 bg-[#0F1118]">
                                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{item.type}{item.is_featured ? ' • Featured' : ''}</p>
                                        <h3 className="font-medium text-sm text-white mb-1">{item.title}</h3>
                                        <p className="text-xs text-gray-400 line-clamp-2 mb-3">{item.excerpt || 'No excerpt'}</p>
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => setResourceForm({ ...item, digital_library_book_id: item.digital_library_book_id || '' })} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded-md"><Pencil size={13} /> Edit</button>
                                            <button type="button" onClick={() => handleDeleteResource(item.id)} disabled={deleting} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-red-900/60 hover:bg-red-900 rounded-md disabled:opacity-60"><Trash2 size={13} /> Delete</button>
                                        </div>
                                    </div>
                                ))}

                                {activeTab === 'concepts' && concepts.map((item) => {
                                    const IconComp = ICON_MAP[item.icon_name] || BookOpen;
                                    return (
                                        <div key={item.id} className="border border-gray-700 rounded-lg p-3 bg-[#0F1118]">
                                            <div className="flex items-center gap-2 mb-1">
                                                <IconComp size={14} className="text-red-400" />
                                                <h3 className="font-medium text-sm text-white">{item.term}</h3>
                                                {item.chinese_term && <span className="text-xs text-gray-500">{item.chinese_term}</span>}
                                            </div>
                                            <p className="text-xs text-gray-400 line-clamp-2 mb-3">{item.explanation}</p>
                                            <div className="flex gap-2">
                                                <button type="button" onClick={() => setConceptForm(item)} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded-md"><Pencil size={13} /> Edit</button>
                                                <button type="button" onClick={() => handleDeleteConcept(item.id)} disabled={deleting} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-red-900/60 hover:bg-red-900 rounded-md disabled:opacity-60"><Trash2 size={13} /> Delete</button>
                                            </div>
                                        </div>
                                    );
                                })}

                                {activeTab === 'milestones' && milestones.map((item) => {
                                    const linkedResource = resources.find((r) => r.id === item.resource_id);
                                    return (
                                        <div key={item.id} className="border border-gray-700 rounded-lg p-3 bg-[#0F1118]">
                                            <h3 className="font-medium text-sm text-white mb-1">{item.title}</h3>
                                            {item.chinese_title && <p className="text-xs text-gray-500 mb-1">{item.chinese_title}</p>}
                                            {linkedResource && <p className="text-xs text-sky-400 mb-1">Linked: {linkedResource.title}</p>}
                                            <p className="text-xs text-gray-400 line-clamp-2 mb-3">{item.description || 'No description'}</p>
                                            <div className="flex gap-2">
                                                <button type="button" onClick={() => setMilestoneForm({ ...item, resource_id: item.resource_id || '' })} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded-md"><Pencil size={13} /> Edit</button>
                                                <button type="button" onClick={() => handleDeleteMilestone(item.id)} disabled={deleting} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-red-900/60 hover:bg-red-900 rounded-md disabled:opacity-60"><Trash2 size={13} /> Delete</button>
                                            </div>
                                        </div>
                                    );
                                })}

                                {activeTab === 'audiobooks' && audiobooks.map((item) => (
                                    <div key={item.id} className="border border-gray-700 rounded-lg p-3 bg-[#0F1118]">
                                        <div className="flex items-center gap-3 mb-2">
                                            {item.cover_url ? (
                                                <img src={item.cover_url} alt={item.title} className="w-10 h-10 rounded object-cover border border-white/10 flex-shrink-0" />
                                            ) : (
                                                <div className="w-10 h-10 rounded bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                                                    <Headphones size={14} className="text-purple-400" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs uppercase tracking-wide text-gray-500 mb-0.5">{item.category || 'Uncategorized'}{item.is_featured ? ' • Featured' : ''}</p>
                                                <h3 className="font-medium text-sm text-white truncate">{item.title}</h3>
                                                {item.author && <p className="text-xs text-gray-500 truncate">{item.author}</p>}
                                            </div>
                                        </div>
                                        {item.chapters && item.chapters.length > 0 && (
                                            <p className="text-[10px] text-gray-500 mb-2">{item.chapters.length} chapter{item.chapters.length !== 1 ? 's' : ''}</p>
                                        )}
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => setAudiobookForm({ ...item, duration_seconds: item.duration_seconds || '', chapters: item.chapters || [] })} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded-md"><Pencil size={13} /> Edit</button>
                                            <button type="button" onClick={() => handleDeleteAudiobook(item.id)} disabled={deleting} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-red-900/60 hover:bg-red-900 rounded-md disabled:opacity-60"><Trash2 size={13} /> Delete</button>
                                        </div>
                                    </div>
                                ))}

                                {activeTab === 'resources' && resources.length === 0 && <p className="text-gray-400 text-sm">No resources yet.</p>}
                                {activeTab === 'concepts' && concepts.length === 0 && <p className="text-gray-400 text-sm">No concepts yet.</p>}
                                {activeTab === 'milestones' && milestones.length === 0 && <p className="text-gray-400 text-sm">No milestones yet.</p>}
                                {activeTab === 'audiobooks' && audiobooks.length === 0 && <p className="text-gray-400 text-sm">No audiobooks yet.</p>}
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudyAdminPage;
