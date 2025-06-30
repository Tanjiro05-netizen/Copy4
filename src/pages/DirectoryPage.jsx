import React, { useState } from 'react';

import Header from '../components/Header';
import { Clock, Network, BookCopy, GitFork, Book } from 'lucide-react';
import Timeline from '../components/Timeline';
import ConceptMapper from '../components/AIFeatures/ConceptMapper';
import Bibliography from '../components/AIFeatures/Bibliography';
import CrossReferences from '../components/AIFeatures/CrossReferences';
import MarxistGlossary from '../components/AIFeatures/MarxistGlossary';
import SpotifyEmbed from '../components/SpotifyEmbed';


const DirectoryPage = () => {

    const [activeTab, setActiveTab] = useState(null); // Changed from 'timeline' to null

    const tools = [
        {
            id: 'concepts',
            name: 'Concept Mapping',
            icon: Network,
            description: 'Visualize connections between key Marxist concepts.'
        },
        {
            id: 'bibliography',
            name: 'AI-Powered Bibliography',
            icon: BookCopy,
            description: 'Generate and explore bibliographies on specific topics.'
        },
        {
            id: 'references',
            name: 'Cross-Textual References',
            icon: GitFork,
            description: 'Find links and references between different texts.'
        },
        {
            id: 'glossary',
            name: 'Marxist Glossary',
            icon: Book,
            description: 'Look up definitions of key Marxist terms.'
        },
        {
            id: 'timeline',
            name: 'Historical Timeline',
            icon: Clock,
            description: 'Explore a timeline of key historical events.'
        }
    ];

    const toggleTimeline = () => {
        setActiveTab(activeTab === 'timeline' ? null : 'timeline');
    };

    return (
        <div className="min-h-screen bg-[#12131A]">
            <Header />
            
            <main className="container mx-auto px-4 pt-24 pb-16">
                <h1 className="text-4xl font-bold text-white mb-8">Research Directory</h1>
                
                <div className="flex gap-8">
                    {/* Left Side Navigation Tiles */}
                    <div className="w-80 flex flex-col h-screen sticky top-0 pt-8">
                        <div className="space-y-4">
                            {tools.filter(tool => tool.id !== 'timeline').map((tool) => (
                                <button
                                    key={tool.id}
                                    onClick={() => setActiveTab(tool.id)}
                                    className={`w-full group relative overflow-hidden rounded-lg transition-all duration-300 ease-out
                                        ${activeTab === tool.id 
                                            ? 'bg-gradient-to-r from-red-900/80 to-red-600/80 border-red-500'
                                            : 'bg-black/30 hover:bg-black/50 border-gray-800'
                                        } 
                                        border p-4 transform hover:scale-105`}
                                >
                                    <div className="absolute inset-0 bg-[radial-gradient(#ff000033_1px,transparent_1px)] [background-size:8px_8px] opacity-20"></div>
                                    <div className="relative z-10 flex items-start space-x-4">
                                        <div className={`p-2 rounded-lg ${
                                            activeTab === tool.id 
                                                ? 'bg-red-500/20' 
                                                : 'bg-gray-800/50'
                                        }`}>
                                            <tool.icon className={`w-6 h-6 ${
                                                activeTab === tool.id 
                                                    ? 'text-red-400' 
                                                    : 'text-gray-400'
                                            }`} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`font-semibold mb-1 ${
                                                activeTab === tool.id 
                                                    ? 'text-white' 
                                                    : 'text-gray-300'
                                            }`}>
                                                {tool.name}
                                            </h3>
                                            <p className="text-sm text-gray-400">{tool.description}</p>
                                        </div>
                                    </div>
                                    <div className={`absolute bottom-0 left-0 h-0.5 bg-red-500 transition-all duration-300
                                        ${activeTab === tool.id ? 'w-full' : 'w-0 group-hover:w-1/4'}`}>
                                    </div>
                                </button>
                            ))}
                            
                            {/* Timeline button */}
                            <button
                                onClick={toggleTimeline}
                                className={`w-full group relative overflow-hidden rounded-lg transition-all duration-300 ease-out
                                    ${activeTab === 'timeline' 
                                        ? 'bg-gradient-to-r from-red-900/80 to-red-600/80 border-red-500'
                                        : 'bg-black/30 hover:bg-black/50 border-gray-800'
                                    } 
                                    border p-4 transform hover:scale-105`}
                            >
                                <div className="relative z-10 flex items-center justify-center space-x-4">
                                    <Clock className={`w-6 h-6 ${
                                        activeTab === 'timeline' 
                                            ? 'text-red-400' 
                                            : 'text-gray-400'
                                    }`} />
                                    <span className={activeTab === 'timeline' ? 'text-white' : 'text-gray-300'}>
                                        {activeTab === 'timeline' ? 'Close Timeline' : 'Historical Timeline'}
                                    </span>
                                </div>
                            </button>

                            {/* Spotify Player directly under Timeline */}
                            <div className="w-full">
                                <SpotifyEmbed />
                            </div>
                        </div>
                    </div>

                    {/* Content Area remains the same */}
                    <div className="flex-1">
                        {activeTab === 'timeline' ? (
                            <div className="text-white animate-fadeIn w-full">
                                <Timeline />
                            </div>
                        ) : activeTab === 'concepts' ? (
                            <ConceptMapper />
                        ) : activeTab === 'bibliography' ? (
                            <Bibliography />
                        ) : activeTab === 'references' ? (
                            <CrossReferences />
                        ) : activeTab === 'glossary' ? (
                            <MarxistGlossary />
                        ) : (
                            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 min-h-[600px] border border-gray-800/50
                                relative overflow-hidden transition-all duration-300">
                                <div className="absolute inset-0 bg-[radial-gradient(#ff000022_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
                                <div className="relative z-10">
                                    <h2 className="text-2xl font-bold text-white mb-4">Select a Tool</h2>
                                    <p className="text-gray-400">Choose a research tool from the left to get started.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DirectoryPage;