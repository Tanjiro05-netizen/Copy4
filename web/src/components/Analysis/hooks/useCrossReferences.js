import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import { useAuth } from '../../../context/AuthContext';

export const useCrossReferences = (textId) => {
    const { user } = useAuth();
    const [outgoingRefs, setOutgoingRefs] = useState([]);
    const [incomingRefs, setIncomingRefs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchReferences = useCallback(async () => {
        if (!textId) {
            setOutgoingRefs([]);
            setIncomingRefs([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Fetch outgoing references (from this text to others)
            const { data: outgoing, error: outError } = await supabase
                .from('analysis_cross_references')
                .select(`
                    *,
                    target:analysis_texts!target_text_id(id, slug, metadata, primary_language),
                    creator:profiles!created_by(username)
                `)
                .eq('source_text_id', textId);

            if (outError) throw outError;

            // Fetch incoming references (from other texts to this one)
            const { data: incoming, error: inError } = await supabase
                .from('analysis_cross_references')
                .select(`
                    *,
                    source:analysis_texts!source_text_id(id, slug, metadata, primary_language),
                    creator:profiles!created_by(username)
                `)
                .eq('target_text_id', textId);

            if (inError) throw inError;

            setOutgoingRefs(outgoing || []);
            setIncomingRefs(incoming || []);
        } catch (err) {
            console.error('Error fetching cross-references:', err);
            setError(err.message || 'Failed to load cross-references');
        } finally {
            setLoading(false);
        }
    }, [textId]);

    useEffect(() => {
        fetchReferences();
    }, [fetchReferences]);

    const createReference = useCallback(async (sourceSectionId, targetTextId, targetSectionId = null, note = null) => {
        if (!user || !textId) {
            return { error: 'Not authenticated or missing text ID' };
        }

        try {
            const { data, error } = await supabase
                .from('analysis_cross_references')
                .insert({
                    source_text_id: textId,
                    source_section_id: sourceSectionId,
                    target_text_id: targetTextId,
                    target_section_id: targetSectionId,
                    created_by: user.id,
                    note,
                })
                .select(`
                    *,
                    target:analysis_texts!target_text_id(id, slug, metadata, primary_language),
                    creator:profiles!created_by(username)
                `)
                .single();

            if (error) throw error;

            setOutgoingRefs(prev => [...prev, data]);
            return { data };
        } catch (err) {
            console.error('Error creating cross-reference:', err);
            return { error: err.message || 'Failed to create cross-reference' };
        }
    }, [user, textId]);

    const deleteReference = useCallback(async (referenceId) => {
        if (!user) {
            return { error: 'Not authenticated' };
        }

        try {
            const { error } = await supabase
                .from('analysis_cross_references')
                .delete()
                .eq('id', referenceId);

            if (error) throw error;

            setOutgoingRefs(prev => prev.filter(r => r.id !== referenceId));
            setIncomingRefs(prev => prev.filter(r => r.id !== referenceId));
            return { success: true };
        } catch (err) {
            console.error('Error deleting cross-reference:', err);
            return { error: err.message || 'Failed to delete cross-reference' };
        }
    }, [user]);

    const getReferencesForSection = useCallback((sectionId) => {
        return {
            outgoing: outgoingRefs.filter(r => r.source_section_id === sectionId),
            incoming: incomingRefs.filter(r => r.target_section_id === sectionId),
        };
    }, [outgoingRefs, incomingRefs]);

    return {
        outgoingRefs,
        incomingRefs,
        loading,
        error,
        createReference,
        deleteReference,
        getReferencesForSection,
        refetch: fetchReferences,
    };
};

export default useCrossReferences;
