import React, { useState } from 'react';
import { BarChart3, LineChart, PieChart, Download, Filter, Calendar, RefreshCcw } from 'lucide-react';
import { countries } from '../../data/countries';

const EconomicVisualization = () => {
    const [chartType, setChartType] = useState('line');
    const [timeRange, setTimeRange] = useState('1y');
    const [metric, setMetric] = useState('gdp');
    const [selectedCountry, setSelectedCountry] = useState('US');

    // Remove the countries array and use the imported one
    
    const metrics = [
        { id: 'gdp', name: 'GDP Growth' },
        { id: 'inflation', name: 'Inflation Rate' },
        { id: 'unemployment', name: 'Unemployment Rate' },
        { id: 'wages', name: 'Real Wages' },
        { id: 'inequality', name: 'Income Inequality' }
    ];

    const timeRanges = [
        { id: '1y', name: '1 Year' },
        { id: '5y', name: '5 Years' },
        { id: '10y', name: '10 Years' },
        { id: 'all', name: 'All Time' }
    ];

    return (
        <div className="h-full flex flex-col p-4">
            {/* Control Panel */}
            <div className="flex flex-wrap gap-4 mb-6 p-4 bg-black/20 rounded-none">
                {/* Add Country Selector before Chart Type Selector */}
                <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="bg-black/30 text-gray-300 rounded px-3 py-2 border border-gray-800 max-h-[40px] overflow-y-auto"
                    style={{ scrollbarWidth: 'thin' }}
                >
                    {countries.map(country => (
                        <option 
                            key={country.id} 
                            value={country.id}
                            className="py-1"
                        >
                            {country.name}
                        </option>
                    ))}
                </select>

                {/* Chart Type Selector */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setChartType('line')}
                        className={`p-2 rounded ${chartType === 'line' ? 'bg-red-900/30 text-red-400' : 'text-gray-400'}`}
                    >
                        <LineChart className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setChartType('bar')}
                        className={`p-2 rounded ${chartType === 'bar' ? 'bg-red-900/30 text-red-400' : 'text-gray-400'}`}
                    >
                        <BarChart3 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setChartType('pie')}
                        className={`p-2 rounded ${chartType === 'pie' ? 'bg-red-900/30 text-red-400' : 'text-gray-400'}`}
                    >
                        <PieChart className="w-5 h-5" />
                    </button>
                </div>

                {/* Metric Selector */}
                <select
                    value={metric}
                    onChange={(e) => setMetric(e.target.value)}
                    className="bg-black/30 text-gray-300 rounded px-3 py-2 border border-gray-800"
                >
                    {metrics.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>

                {/* Time Range Selector */}
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="bg-black/30 text-gray-300 rounded px-3 py-2 border border-gray-800"
                >
                    {timeRanges.map(tr => (
                        <option key={tr.id} value={tr.id}>{tr.name}</option>
                    ))}
                </select>

                {/* Action Buttons */}
                <div className="flex gap-2 ml-auto">
                    <button className="p-2 text-gray-400 hover:text-red-400" title="Filter Data">
                        <Filter className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-400" title="Custom Date Range">
                        <Calendar className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-400" title="Refresh Data">
                        <RefreshCcw className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-400" title="Download Data">
                        <Download className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Visualization Area */}
            <div className="flex-1 bg-black/20 rounded-none p-6">
                <div className="h-full flex items-center justify-center">
                    <div className="text-gray-400">
                        Chart visualization will be implemented here using D3.js or Chart.js
                    </div>
                </div>
            </div>

            {/* Data Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-black/20 p-4 rounded-none">
                    <div className="text-sm text-gray-400">Current Value</div>
                    <div className="text-xl text-white mt-1">$24.5T</div>
                </div>
                <div className="bg-black/20 p-4 rounded-none">
                    <div className="text-sm text-gray-400">YoY Change</div>
                    <div className="text-xl text-red-400 mt-1">-2.3%</div>
                </div>
                <div className="bg-black/20 p-4 rounded-none">
                    <div className="text-sm text-gray-400">5Y Average</div>
                    <div className="text-xl text-white mt-1">1.8%</div>
                </div>
            </div>
        </div>
    );
};

export default EconomicVisualization;