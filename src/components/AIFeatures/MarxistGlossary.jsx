import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Loader, BookOpen, ExternalLink } from 'lucide-react';

const MarxistGlossary = () => {
    const [glossary, setGlossary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGlossary = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('glossary')
                    .select('term, type, explanation, url')
                    .order('term', { ascending: true });

                if (error) {
                    throw error;
                }
                setGlossary(data);
            } catch (err) {
                setError(err.message);
                console.error("Error fetching glossary:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchGlossary();
    }, []);

    const groupedGlossary = glossary.reduce((acc, item) => {
        const { type } = item;
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(item);
        return acc;
    }, {});

    const groupOrder = ['person', 'organization', 'place', 'concept']; // Add other types as needed

    if (loading) {
        return (
            <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg flex items-center justify-center h-[500px]">
                <Loader className="animate-spin text-red-500" size={48} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg">
                <h2 className="text-2xl text-white mb-4">Marxist Glossary</h2>
                <div className="flex items-center justify-center h-[500px] border border-red-900/30 rounded">
                    <p className="text-red-400">Error loading glossary: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-black/30 backdrop-blur-sm p-6 rounded-lg min-h-[600px]">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                <BookOpen className="mr-3 text-red-500" />
                Marxist Glossary
            </h2>
            <div className="space-y-8">
                {groupOrder.map(group => (
                    groupedGlossary[group] && (
                        <div key={group}>
                            <h3 className="text-2xl font-semibold text-red-400 capitalize mb-4 border-b-2 border-red-500/30 pb-2">{group}s</h3>
                            <div className="space-y-4">
                                {groupedGlossary[group].map(item => (
                                    <div key={item.term} className="bg-gray-900/50 p-4 rounded-lg">
                                        <h4 className="text-xl font-bold text-white">{item.term}</h4>
                                        <p className="text-gray-300 mt-2">{item.explanation}</p>
                                        {item.url && (
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-red-400 hover:text-red-300 transition-colors duration-200 mt-2 inline-flex items-center text-sm"
                                            >
                                                Read More <ExternalLink className="ml-1.5" size={14} />
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};

export default MarxistGlossary;