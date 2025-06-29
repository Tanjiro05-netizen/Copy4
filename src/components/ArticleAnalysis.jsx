import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { Loader2 } from 'lucide-react';
import { Pack } from '@visx/hierarchy';
import { hierarchy } from '@visx/hierarchy';
import { scaleOrdinal } from '@visx/scale';
import { schemeCategory10 } from 'd3-scale-chromatic';

const ArticleAnalysis = ({ articleId }) => {
    const [keywords, setKeywords] = useState([]);
    const [selectedWord, setSelectedWord] = useState(null);
    const [concordance, setConcordance] = useState({ word: '', sentences: [] });
    const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);
    const [isLoadingConcordance, setIsLoadingConcordance] = useState(false);
    const [error, setError] = useState('');
    const [hoveredBubble, setHoveredBubble] = useState(null);

    // Fetch keywords when the component mounts or articleId changes
    useEffect(() => {
        const fetchKeywords = async () => {
            if (!articleId) return;
            setIsLoadingKeywords(true);
            setError('');
            setKeywords([]);
            setSelectedWord(null);
            setConcordance({ word: '', sentences: [] });

            try {
                const { data, error } = await supabase.functions.invoke('text-analysis', {
                    body: { article_id: articleId, mode: 'keywords' },
                });
                if (error) throw new Error(error.message);
                setKeywords(data || []);
            } catch (err) {
                console.error('Error fetching keywords:', err);
                setError('Failed to load keyword analysis.');
            } finally {
                setIsLoadingKeywords(false);
            }
        };
        fetchKeywords();
    }, [articleId]);

    // Fetch concordance when a word is selected
    useEffect(() => {
        const fetchConcordance = async () => {
            if (!selectedWord || !articleId) return;

            setIsLoadingConcordance(true);
            setError('');
            try {
                const { data, error } = await supabase.functions.invoke('text-analysis', {
                    body: { article_id: articleId, mode: 'concordance', keyword: selectedWord },
                });
                if (error) throw new Error(error.message);
                setConcordance({ word: selectedWord, sentences: data || [] });
            } catch (err) {
                console.error('Error fetching concordance:', err);
                setError(`Failed to load concordance for "${selectedWord}".`);
            } finally {
                setIsLoadingConcordance(false);
            }
        };
        fetchConcordance();
    }, [selectedWord, articleId]);

    const colorScale = useMemo(() => scaleOrdinal({
        domain: keywords.map(k => k.text),
        range: schemeCategory10,
    }), [keywords]);

    const packData = useMemo(() => {
        if (keywords.length === 0) return null;
        const root = hierarchy({
            name: 'root',
            children: keywords,
        }).sum(d => d.value);
        return root;
    }, [keywords]);

    return (
        <div className="p-4 bg-gray-900/50 rounded-lg text-white">
            <h3 className="text-xl font-bold mb-4 text-red-400">Textual Analysis</h3>
            {error && <p className="text-red-500 bg-red-900/50 p-3 rounded-md mb-4">{error}</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Bubble Chart */}
                <div>
                    <h4 className="text-lg font-semibold mb-2">Keyword Graph</h4>
                    <p className="text-sm text-gray-400 mb-4">Most frequent words. Bubble size indicates frequency. Click a bubble to see its context.</p>
                    <div className="bg-black/20 rounded-lg p-2 h-[400px] w-full relative">
                        {isLoadingKeywords ? (
                            <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8" /></div>
                        ) : packData ? (
                            <svg width="100%" height="100%">
                                <Pack root={packData} size={[500, 400]} padding={5}>
                                    {pack => (
                                        <g>
                                            {pack.descendants().slice(1).map((circle, i) => (
                                                <g
                                                   key={`circle-${i}`}
                                                   transform={`translate(${circle.x}, ${circle.y}) scale(${hoveredBubble === i ? 1.05 : 1})`}
                                                   className="cursor-pointer transition-transform duration-300"
                                                   onClick={() => setSelectedWord(circle.data.text)}
                                                   onMouseEnter={() => setHoveredBubble(i)}
                                                   onMouseLeave={() => setHoveredBubble(null)}>

                                                    <circle
                                                        r={circle.r}
                                                        fill={colorScale(circle.data.text)}
                                                        stroke={selectedWord === circle.data.text ? '#ef4444' : '#fff'}
                                                        strokeWidth={selectedWord === circle.data.text ? 3 : 1}
                                                        fillOpacity={0.8}
                                                    />
                                                    <text
                                                        dy=".3em"
                                                        textAnchor="middle"
                                                        fontSize={`${Math.max(8, circle.r / 3)}px`}
                                                        fill="white"
                                                        className="pointer-events-none font-sans"
                                                    >
                                                        {circle.data.text}
                                                    </text>
                                                </g>
                                            ))}
                                        </g>
                                    )}
                                </Pack>
                            </svg>
                        ) : (
                            <div className="flex justify-center items-center h-full"><p>No keywords to display.</p></div>
                        )}
                    </div>
                </div>

                {/* Right Column: Concordance */}
                <div>
                    <h4 className="text-lg font-semibold mb-2">Concordance (Keywords in Context)</h4>
                    <div className="bg-black/20 p-4 rounded-lg h-[400px]">
                        {isLoadingConcordance ? (
                            <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin h-8 w-8" /></div>
                        ) : selectedWord ? (
                            <div>
                                <p className="text-sm text-gray-400 mb-4">Showing sentences containing "<span className='font-bold text-red-400'>{concordance.word}</span>".</p>
                                <ul className="space-y-3 pl-4 list-disc list-inside max-h-[320px] overflow-y-auto pr-2">
                                    {concordance.sentences.length > 0 ? (
                                        concordance.sentences.map((sentence, i) => (
                                            <li key={i} className="text-gray-300" dangerouslySetInnerHTML={{ __html: sentence.replace(new RegExp(`\b(${concordance.word})\b`, 'gi'), '<strong class="text-red-400 font-bold">$1</strong>') }}></li>
                                        ))
                                    ) : (
                                        <p className="text-gray-400">No context sentences found for this word.</p>
                                    )}
                                </ul>
                            </div>
                        ) : (
                            <div className="flex justify-center items-center h-full">
                                <p className="text-gray-400">Click a word in the graph to see its usage in context.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleAnalysis;
