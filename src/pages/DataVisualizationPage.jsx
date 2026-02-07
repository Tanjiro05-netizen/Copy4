import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { BarChart3, Users, TrendingUp, Map, BarChart, LineChart, PieChart, Sliders, SplitSquareVertical } from 'lucide-react';
import EnhancedChart from '../components/visualizations/EnhancedChart';
import WhatIfAnalysis from '../components/visualizations/WhatIfAnalysis';
import SplitView from '../components/visualizations/SplitView';
import EconomicVisualization from '../components/visualizations/EconomicVisualization';
import ClassVisualization from '../components/visualizations/ClassVisualization';
import TrendsVisualization from '../components/visualizations/TrendsVisualization';
import MovementsVisualization from '../components/visualizations/MovementsVisualization';

const DataVisualizationPage = () => {
    const [activeView, setActiveView] = useState('economic');
    const [chartType, setChartType] = useState('bar');
    const [sentiment, setSentiment] = useState('neutral');
    const [hoveredData, setHoveredData] = useState(null);
    const [showTransition, setShowTransition] = useState(false);
    const [showWhatIf, setShowWhatIf] = useState(false);
    const [viewMode, setViewMode] = useState('standard'); // 'standard', 'split'

    // Handle view change with transition animation
    const handleViewChange = (viewId) => {
        if (viewId === activeView) return;
        
        setShowTransition(true);
        
        setTimeout(() => {
            setActiveView(viewId);
            setShowTransition(false);
        }, 300);
    };
    
    // Update sentiment when data type changes
    useEffect(() => {
        // Default sentiments for each view
        const defaultSentiments = {
            economic: 'negative',
            class: 'neutral',
            trends: 'positive',
            movements: 'neutral'
        };
        
        setSentiment(defaultSentiments[activeView] || 'neutral');
    }, [activeView]);

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

    // Handle chart hover
    const handleChartHover = (data) => {
        setHoveredData(data);
    };

    // Render visualization based on active view
    const renderVisualization = () => {
        switch (activeView) {
            case 'economic':
                return <EconomicVisualization />;
            case 'class':
                return <ClassVisualization />;
            case 'trends':
                return <TrendsVisualization />;
            case 'movements':
                return <MovementsVisualization />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-full">
                        <EnhancedChart 
                            chartType={chartType}
                            dataType={activeView}
                            sentiment={sentiment}
                            enable3D={true}
                            onHover={handleChartHover}
                        />
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#12131A] relative overflow-hidden">
            <Header />
            
            <main className="container mx-auto px-4 py-16 relative z-10">
                <h1 className="text-4xl font-bold text-white mb-8">Data Visualization</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {visualizations.map((viz) => (
                        <button
                            key={viz.id}
                            onClick={() => handleViewChange(viz.id)}
                            className={`p-4 rounded-lg border transition-all duration-300
                                ${activeView === viz.id 
                                    ? 'bg-red-900/30 border-red-500/50 transform scale-105' 
                                    : 'bg-black/30 border-gray-800/50 hover:border-red-500/30 hover:transform hover:scale-102'}`}
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
                
                {/* Control Bar */}
                <div className="flex justify-between items-center mb-6">
                    {/* Chart Type Selector */}
                    <div className="bg-black/30 backdrop-blur-sm rounded-lg p-2 inline-flex space-x-2 border border-gray-800/50">
                        <button
                            onClick={() => setChartType('bar')}
                            className={`p-2 rounded ${chartType === 'bar' ? 'bg-red-900/30 text-red-400' : 'text-gray-400 hover:text-white'}`}
                            title="Bar Chart"
                        >
                            <BarChart className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setChartType('line')}
                            className={`p-2 rounded ${chartType === 'line' ? 'bg-red-900/30 text-red-400' : 'text-gray-400 hover:text-white'}`}
                            title="Line Chart"
                        >
                            <LineChart className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setChartType('pie')}
                            className={`p-2 rounded ${chartType === 'pie' ? 'bg-red-900/30 text-red-400' : 'text-gray-400 hover:text-white'}`}
                            title="Pie Chart"
                        >
                            <PieChart className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="flex gap-2">
                        {/* View Mode Toggle */}
                        <button
                            onClick={() => setViewMode(viewMode === 'standard' ? 'split' : 'standard')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                                ${viewMode === 'split' 
                                    ? 'bg-red-900/30 text-red-400 border border-red-500/50' 
                                    : 'bg-black/30 text-gray-400 border border-gray-800/50 hover:border-red-500/30'}`}
                            title={viewMode === 'standard' ? 'Switch to Split View' : 'Switch to Standard View'}
                        >
                            <SplitSquareVertical className="w-5 h-5" />
                            <span>Split View</span>
                        </button>
                        
                        {/* What-If Analysis Toggle Button - only show in standard view */}
                        {viewMode === 'standard' && (
                            <button
                                onClick={() => setShowWhatIf(!showWhatIf)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                                    ${showWhatIf 
                                        ? 'bg-red-900/30 text-red-400 border border-red-500/50' 
                                        : 'bg-black/30 text-gray-400 border border-gray-800/50 hover:border-red-500/30'}`}
                            >
                                <Sliders className="w-5 h-5" />
                                <span>What-If Analysis</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Visualization Content Area */}
                <div className={`bg-black/30 backdrop-blur-sm rounded-lg p-6 min-h-[600px] border border-gray-800/50 relative transition-opacity duration-300 ${showTransition ? 'opacity-0' : 'opacity-100'}`}>
                    {/* Split View Mode */}
                    {viewMode === 'split' ? (
                        <SplitView 
                            chartType={chartType}
                            dataType={activeView}
                            title={visualizations.find(v => v.id === activeView)?.name || 'Data Visualization'}
                            description={visualizations.find(v => v.id === activeView)?.description || 'Interactive data visualization with what-if analysis'}
                        />
                    ) : (
                        <>
                            {/* What-If Analysis Panel - Conditionally Rendered */}
                            {showWhatIf && (
                                <div className="mb-6 p-4 bg-black/40 backdrop-blur-sm rounded-lg border border-gray-700/50">
                                    <WhatIfAnalysis 
                                        dataType={activeView}
                                        onSentimentChange={setSentiment}
                                    />
                                </div>
                            )}
                            
                            {/* Data Tooltip */}
                            {hoveredData && (
                                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm p-3 rounded-lg border border-gray-700 z-50 transition-all duration-200">
                                    <h4 className="text-white text-sm font-medium">{hoveredData.label}</h4>
                                    <p className="text-gray-300 text-xs">{hoveredData.value} {hoveredData.unit || ''}</p>
                                </div>
                            )}
                            
                            {/* Visualization Content */}
                            <div className="h-full">
                                {renderVisualization()}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DataVisualizationPage;