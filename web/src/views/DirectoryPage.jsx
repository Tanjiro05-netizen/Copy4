import React, { useState, useEffect } from 'react';
import { useLocation } from '@/src/lib/router-shim';

import { Clock, Network, BookCopy, GitFork, Book } from 'lucide-react';
import Timeline from '../components/Timeline';
import ConceptMapper from '../components/AIFeatures/ConceptMapper';
import Bibliography from '../components/AIFeatures/Bibliography';
import CrossReferences from '../components/AIFeatures/CrossReferences';
import MarxistGlossary from '../components/AIFeatures/MarxistGlossary';
import * as s from './DirectoryPage.css.ts';

const VALID_TABS = ['concepts', 'bibliography', 'references', 'glossary', 'timeline'];

const DirectoryPage = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(() => {
        const hash = location.hash.replace('#', '');
        if (VALID_TABS.includes(hash)) return hash;
        if (location.state?.activeTab && VALID_TABS.includes(location.state.activeTab)) return location.state.activeTab;
        return null;
    });

    useEffect(() => {
        const hash = location.hash.replace('#', '');
        if (VALID_TABS.includes(hash)) {
            setActiveTab(hash);
        } else if (location.state?.activeTab && VALID_TABS.includes(location.state.activeTab)) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.hash, location.state]);

    const tools = [
        { id: 'concepts', name: 'Concept Mapping', icon: Network, description: 'Visualize connections between key Marxist concepts.' },
        { id: 'bibliography', name: 'Bibliography', icon: BookCopy, description: 'Search across glossary, study, theory, and library in one query.' },
        { id: 'references', name: 'Cross-Textual References', icon: GitFork, description: 'Find links and references between different texts.' },
        { id: 'glossary', name: 'Marxist Glossary', icon: Book, description: 'Look up definitions of key Marxist terms.' },
    ];

    const toggleTimeline = () => {
        setActiveTab(activeTab === 'timeline' ? null : 'timeline');
    };

    return (
        <div className={s.page}>
            <main className={s.main}>
                <h1 className={s.pageTitle}>Research Directory</h1>
                
                <div className={s.layout}>
                    <div className={s.sidebar}>
                        {tools.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => setActiveTab(tool.id)}
                                className={`${s.toolCard} ${activeTab === tool.id ? s.toolCardActive : ''}`}
                            >
                                <div className={s.toolRow}>
                                    <div className={`${s.toolIconWrap} ${activeTab === tool.id ? s.toolIconWrapActive : ''}`}>
                                        <tool.icon size={22} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 className={`${s.toolName} ${activeTab === tool.id ? s.toolNameActive : ''}`}>{tool.name}</h3>
                                        <p className={s.toolDesc}>{tool.description}</p>
                                    </div>
                                </div>
                                <div className={`${s.toolAccent} ${activeTab === tool.id ? s.toolAccentActive : ''}`} />
                            </button>
                        ))}
                        
                        <button
                            onClick={toggleTimeline}
                            className={`${s.timelineBtn} ${activeTab === 'timeline' ? s.timelineBtnActive : ''}`}
                        >
                            <Clock size={22} className={activeTab === 'timeline' ? s.timelineIconActive : s.timelineIcon} />
                            <span>{activeTab === 'timeline' ? 'Close Timeline' : 'Historical Timeline'}</span>
                        </button>
                    </div>

                    <div className={s.contentArea}>
                        {activeTab === 'timeline' ? (
                            <Timeline />
                        ) : activeTab === 'concepts' ? (
                            <ConceptMapper />
                        ) : activeTab === 'bibliography' ? (
                            <Bibliography />
                        ) : activeTab === 'references' ? (
                            <CrossReferences />
                        ) : activeTab === 'glossary' ? (
                            <MarxistGlossary />
                        ) : (
                            <div className={s.placeholder}>
                                <h2 className={s.placeholderTitle}>Select a Tool</h2>
                                <p className={s.placeholderText}>Choose a research tool from the left to get started.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DirectoryPage;