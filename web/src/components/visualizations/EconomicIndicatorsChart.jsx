import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { INDICATOR_LABELS, INDICATOR_COLORS } from '../../services/api/imf';

// Add console logs to debug data flow
const EconomicIndicatorsChart = ({ 
    data,
    selectedCountries,
    selectedIndicators,
    timeRange,
    className
}) => {
    const [chartData, setChartData] = useState([]);
    
    useEffect(() => {
        console.log('Raw Data:', data);
        console.log('Selected Countries:', selectedCountries);
        console.log('Selected Indicators:', selectedIndicators);
        
        if (!data || Object.keys(data).length === 0) {
            console.log('No data available');
            return;
        }
        
        // Transform data for the chart
        const transformedData = [];
        const years = new Set();
        
        // Collect all years from all indicators
        selectedIndicators.forEach(indicator => {
            console.log(`Processing indicator: ${indicator}`);
            if (!data[indicator]) {
                console.log(`No data for indicator: ${indicator}`);
                return;
            }
            
            Object.values(data[indicator].values || {}).forEach(countryData => {
                Object.keys(countryData).forEach(year => {
                    const numYear = parseInt(year);
                    if (numYear >= timeRange.start && numYear <= timeRange.end) {
                        years.add(numYear);
                    }
                });
            });
        });
        
        console.log('Years collected:', Array.from(years));
        
        // Create data points for each year
        Array.from(years).sort().forEach(year => {
            const yearData = { year };
            
            selectedIndicators.forEach(indicator => {
                if (!data[indicator]) return;
                
                selectedCountries.forEach(country => {
                    const countryData = data[indicator].values?.[country];
                    if (countryData) {
                        const value = parseFloat(countryData[year]) || 0;
                        yearData[`${indicator}_${country}`] = value;
                    }
                });
            });
            
            transformedData.push(yearData);
        });
        
        console.log('Transformed Data:', transformedData);
        setChartData(transformedData);
    }, [data, selectedCountries, selectedIndicators, timeRange]);
    
    if (!data || chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">No data available</p>
            </div>
        );
    }
    
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={className}
        >
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                        dataKey="year"
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af' }}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '0.375rem'
                        }}
                        labelStyle={{ color: '#f3f4f6' }}
                        itemStyle={{ color: '#f3f4f6' }}
                    />
                    <Legend
                        wrapperStyle={{
                            paddingTop: '1rem',
                            color: '#f3f4f6'
                        }}
                    />
                    {selectedIndicators.map(indicator => 
                        selectedCountries.map(country => (
                            <Line
                                key={`${indicator}_${country}`}
                                type="monotone"
                                dataKey={`${indicator}_${country}`}
                                name={`${INDICATOR_LABELS[indicator]} - ${country}`}
                                stroke={INDICATOR_COLORS[indicator]}
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                        ))
                    )}
                </LineChart>
            </ResponsiveContainer>
        </motion.div>
    );
};

export default EconomicIndicatorsChart;
