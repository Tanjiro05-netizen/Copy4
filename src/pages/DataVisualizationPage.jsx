import React, { useState } from 'react';
import Header from '../components/Header';
import { BarChart3, Users, TrendingUp, Map, Eye, EyeOff } from 'lucide-react';
import StockMarketCrash from '../components/visualizations/StockMarketCrash';

const DataVisualizationPage = () => {
    const [activeView, setActiveView] = useState('economic');
    const [showAnimation, setShowAnimation] = useState(true);

    const visualizations = [
        {
            id: 'economic',
            name: 'Economic Analysis',
            icon: BarChart3,
            description: 'Historical economic data and trends'
        },
        {
            id: 'class',
            name: 'Class Structure',
            icon: Users,
            description: 'Interactive class relation visualizations'
        },
        {
            id: 'trends',
            name: 'Historical Trends',
            icon: TrendingUp,
            description: 'Long-term social and economic patterns'
        },
        {
            id: 'movements',
            name: 'Revolutionary Movements',
            icon: Map,
            description: 'Global mapping of revolutionary activities'
        }
    ];

    return (
        <div className="min-h-screen bg-[#12131A] relative overflow-hidden">
            {/* Background Animation */}
            <StockMarketCrash show={showAnimation} />

            {/* Background Toggle */}
            <button
                onClick={() => setShowAnimation(!showAnimation)}
                className="fixed top-20 right-4 z-50 p-2 bg-black/50 backdrop-blur-sm rounded-full border border-red-500/30 hover:border-red-500/50 transition-colors"
                title={showAnimation ? 'Disable animation' : 'Enable animation'}
            >
                {showAnimation ? (
                    <EyeOff className="w-5 h-5 text-red-400" />
                ) : (
                    <Eye className="w-5 h-5 text-red-400" />
                )}
            </button>

            <Header />
            
            <main className="container mx-auto px-4 py-16 relative z-10">
                <h1 className="text-4xl font-bold text-white mb-8">Data Visualization</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {visualizations.map((viz) => (
                        <button
                            key={viz.id}
                            onClick={() => setActiveView(viz.id)}
                            className={`p-4 rounded-lg border transition-all duration-300
                                ${activeView === viz.id 
                                    ? 'bg-red-900/30 border-red-500/50' 
                                    : 'bg-black/30 border-gray-800/50 hover:border-red-500/30'}`}
                        >
                            <div className="flex items-center space-x-3">
                                <viz.icon className={`w-6 h-6 ${
                                    activeView === viz.id ? 'text-red-400' : 'text-gray-400'
                                }`} />
                                <span className={`font-medium ${
                                    activeView === viz.id ? 'text-white' : 'text-gray-300'
                                }`}>
                                    {viz.name}
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">{viz.description}</p>
                        </button>
                    ))}
                </div>

                {/* Visualization Content Area */}
                <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 min-h-[600px] border border-gray-800/50">
                    <div className="h-full flex items-center justify-center">
                        <p className="text-gray-400">Interactive visualizations coming soon...</p>
                    </div>
                </div>
            </main>
            {/* Remove the style jsx section completely */}
        </div>
    );
};

export default DataVisualizationPage;