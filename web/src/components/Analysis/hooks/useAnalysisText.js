import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';

export const useAnalysisText = (slug) => {
    const [text, setText] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentLanguage, setCurrentLanguage] = useState(null);

    const fetchText = useCallback(async () => {
        if (!slug) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('analysis_texts')
                .select('*')
                .eq('slug', slug)
                .single();

            if (fetchError) throw fetchError;

            setText(data);
            setCurrentLanguage(data.primary_language || 'en');
        } catch (err) {
            console.error('Error fetching analysis text:', err);
            setError(err.message || 'Failed to load text');
            setText(null);
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        fetchText();
    }, [fetchText]);

    const getLocalizedMetadata = useCallback(() => {
        if (!text || !currentLanguage) return null;
        return text.metadata?.[currentLanguage] || text.metadata?.en || text.metadata;
    }, [text, currentLanguage]);

    const getLocalizedSection = useCallback((section) => {
        if (!section || !currentLanguage) return section;
        
        return {
            ...section,
            title: section.title?.[currentLanguage] || section.title?.en || section.title,
            content: section.content?.[currentLanguage] || section.content?.en || section.content,
        };
    }, [currentLanguage]);

    const getLocalizedTOC = useCallback(() => {
        if (!text || !currentLanguage) return [];
        
        const localizeItem = (item) => ({
            ...item,
            title: item.title?.[currentLanguage] || item.title?.en || item.title,
            children: item.children?.map(localizeItem),
        });

        return text.table_of_contents?.map(localizeItem) || [];
    }, [text, currentLanguage]);

    const switchLanguage = useCallback((lang) => {
        if (text?.available_languages?.includes(lang)) {
            setCurrentLanguage(lang);
        }
    }, [text]);

    return {
        text,
        loading,
        error,
        currentLanguage,
        availableLanguages: text?.available_languages || [],
        metadata: getLocalizedMetadata(),
        tableOfContents: getLocalizedTOC(),
        getLocalizedSection,
        switchLanguage,
        refetch: fetchText,
    };
};

export default useAnalysisText;
