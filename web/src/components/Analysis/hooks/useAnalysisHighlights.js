import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import { useAuth } from '../../../context/AuthContext';

const HIGHLIGHT_COLORS = ['yellow', 'green', 'blue', 'pink', 'orange'];

export const useAnalysisHighlights = (textId) => {
    const { user } = useAuth();
    const [highlights, setHighlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchHighlights = useCallback(async () => {
        if (!textId || !user) {
            setHighlights([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('analysis_text_highlights')
                .select('*')
                .eq('text_id', textId)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setHighlights(data || []);
        } catch (err) {
            console.error('Error fetching highlights:', err);
            setError(err.message || 'Failed to load highlights');
        } finally {
            setLoading(false);
        }
    }, [textId, user]);

    useEffect(() => {
        fetchHighlights();
    }, [fetchHighlights]);

    const addHighlight = useCallback(async (sectionId, selectedText, serializedRange = null, note = null, color = 'yellow') => {
        if (!user || !textId || !sectionId || !selectedText) {
            return { error: 'Missing required fields' };
        }

        try {
            const { data, error } = await supabase
                .from('analysis_text_highlights')
                .insert({
                    text_id: textId,
                    user_id: user.id,
                    section_id: sectionId,
                    selected_text: selectedText,
                    serialized_range: serializedRange,
                    note,
                    color,
                })
                .select()
                .single();

            if (error) throw error;

            setHighlights(prev => [data, ...prev]);
            return { data };
        } catch (err) {
            console.error('Error adding highlight:', err);
            return { error: err.message || 'Failed to add highlight' };
        }
    }, [user, textId]);

    const updateHighlight = useCallback(async (highlightId, updates) => {
        if (!user) {
            return { error: 'Not authenticated' };
        }

        try {
            const { data, error } = await supabase
                .from('analysis_text_highlights')
                .update(updates)
                .eq('id', highlightId)
                .eq('user_id', user.id)
                .select()
                .single();

            if (error) throw error;

            setHighlights(prev => prev.map(h => h.id === highlightId ? data : h));
            return { data };
        } catch (err) {
            console.error('Error updating highlight:', err);
            return { error: err.message || 'Failed to update highlight' };
        }
    }, [user]);

    const removeHighlight = useCallback(async (highlightId) => {
        if (!user) {
            return { error: 'Not authenticated' };
        }

        try {
            const { error } = await supabase
                .from('analysis_text_highlights')
                .delete()
                .eq('id', highlightId)
                .eq('user_id', user.id);

            if (error) throw error;

            setHighlights(prev => prev.filter(h => h.id !== highlightId));
            return { success: true };
        } catch (err) {
            console.error('Error removing highlight:', err);
            return { error: err.message || 'Failed to remove highlight' };
        }
    }, [user]);

    const getHighlightsForSection = useCallback((sectionId) => {
        return highlights.filter(h => h.section_id === sectionId);
    }, [highlights]);

    return {
        highlights,
        loading,
        error,
        addHighlight,
        updateHighlight,
        removeHighlight,
        getHighlightsForSection,
        refetch: fetchHighlights,
        HIGHLIGHT_COLORS,
    };
};

export default useAnalysisHighlights;
