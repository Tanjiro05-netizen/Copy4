import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import { useAuth } from '../../../context/AuthContext';

export const useAnalysisBookmarks = (textId) => {
    const { user } = useAuth();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBookmarks = useCallback(async () => {
        if (!textId || !user) {
            setBookmarks([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('analysis_text_bookmarks')
                .select('*')
                .eq('text_id', textId)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setBookmarks(data || []);
        } catch (err) {
            console.error('Error fetching bookmarks:', err);
            setError(err.message || 'Failed to load bookmarks');
        } finally {
            setLoading(false);
        }
    }, [textId, user]);

    useEffect(() => {
        fetchBookmarks();
    }, [fetchBookmarks]);

    const addBookmark = useCallback(async (sectionId, note = null) => {
        if (!user || !textId || !sectionId) {
            return { error: 'Missing required fields' };
        }

        try {
            const { data, error } = await supabase
                .from('analysis_text_bookmarks')
                .insert({
                    text_id: textId,
                    user_id: user.id,
                    section_id: sectionId,
                    note,
                })
                .select()
                .single();

            if (error) throw error;

            setBookmarks(prev => [data, ...prev]);
            return { data };
        } catch (err) {
            console.error('Error adding bookmark:', err);
            return { error: err.message || 'Failed to add bookmark' };
        }
    }, [user, textId]);

    const updateBookmark = useCallback(async (bookmarkId, note) => {
        if (!user) {
            return { error: 'Not authenticated' };
        }

        try {
            const { data, error } = await supabase
                .from('analysis_text_bookmarks')
                .update({ note })
                .eq('id', bookmarkId)
                .eq('user_id', user.id)
                .select()
                .single();

            if (error) throw error;

            setBookmarks(prev => prev.map(b => b.id === bookmarkId ? data : b));
            return { data };
        } catch (err) {
            console.error('Error updating bookmark:', err);
            return { error: err.message || 'Failed to update bookmark' };
        }
    }, [user]);

    const removeBookmark = useCallback(async (sectionId) => {
        if (!user || !textId) {
            return { error: 'Missing required fields' };
        }

        try {
            const { error } = await supabase
                .from('analysis_text_bookmarks')
                .delete()
                .eq('text_id', textId)
                .eq('user_id', user.id)
                .eq('section_id', sectionId);

            if (error) throw error;

            setBookmarks(prev => prev.filter(b => b.section_id !== sectionId));
            return { success: true };
        } catch (err) {
            console.error('Error removing bookmark:', err);
            return { error: err.message || 'Failed to remove bookmark' };
        }
    }, [user, textId]);

    const toggleBookmark = useCallback(async (sectionId, note = null) => {
        const existing = bookmarks.find(b => b.section_id === sectionId);
        if (existing) {
            return removeBookmark(sectionId);
        } else {
            return addBookmark(sectionId, note);
        }
    }, [bookmarks, addBookmark, removeBookmark]);

    const isBookmarked = useCallback((sectionId) => {
        return bookmarks.some(b => b.section_id === sectionId);
    }, [bookmarks]);

    const getBookmarkForSection = useCallback((sectionId) => {
        return bookmarks.find(b => b.section_id === sectionId);
    }, [bookmarks]);

    return {
        bookmarks,
        loading,
        error,
        addBookmark,
        updateBookmark,
        removeBookmark,
        toggleBookmark,
        isBookmarked,
        getBookmarkForSection,
        refetch: fetchBookmarks,
    };
};

export default useAnalysisBookmarks;
