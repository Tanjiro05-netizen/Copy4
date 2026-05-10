import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';

const WealthInequalityChart = ({ data, countries }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Enhanced tooltip with more detailed information
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-slate-900 border border-slate-700 p-4 rounded-lg shadow-lg">
          <p className="text-white font-semibold mb-2">{`Year: ${label}`}</p>
          <div className="space-y-1">
            {payload.map((entry, index) => (
              <div 
                key={`item-${index}`} 
                className="flex items-center gap-2"
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <p style={{ color: entry.color }}>
                  {`${entry.name}: ${entry.value.toFixed(2)}`}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">*Higher GINI values indicate greater inequality</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      className="bg-gradient-to-r from-slate-900/80 via-gray-900/70 to-black/60 p-6 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl border border-slate-800 hover:border-slate-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.01 }}
    >
      <h3 className="text-xl font-bold text-white mb-4">Wealth Inequality Trends</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart 
          data={data}
          onMouseMove={(e) => {
            if (e.activePayload) {
              setHoveredPoint(e.activePayload[0].payload);
            }
          }}
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <XAxis 
            dataKey="year" 
            stroke="#6b7280"
            tick={{ fill: '#9ca3af' }}
          />
          <YAxis 
            stroke="#6b7280"
            tick={{ fill: '#9ca3af' }}
            label={{ 
              value: 'GINI Index', 
              angle: -90, 
              position: 'insideLeft',
              style: { fill: '#9ca3af' }
            }}
          />
          <Tooltip 
            content={<CustomTooltip />} 
          />
          <Legend 
            iconType="circle"
            wrapperStyle={{ paddingTop: 10 }}
          />
          <ReferenceLine
            y={40}
            stroke="#ef4444"
            strokeDasharray="3 3"
            label={{ 
              value: "High Inequality", 
              position: "insideTopRight",
              fill: "#ef4444",
              fontSize: 12
            }}
          />
          {countries.map((country, index) => (
            <Line
              key={country}
              type="monotone"
              dataKey={country}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ 
                r: 8, 
                stroke: "white", 
                strokeWidth: 2, 
                fill: COLORS[index % COLORS.length] 
              }}
              animationDuration={1500}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      {hoveredPoint && (
        <div className="mt-4 p-3 bg-slate-800/50 rounded-md">
          <p className="text-sm text-white">
            <span className="font-semibold">Year {hoveredPoint.year}:</span> {" "}
            Average GINI index across selected countries: {
              (Object.entries(hoveredPoint)
                .filter(([key]) => countries.includes(key))
                .reduce((sum, [_, value]) => sum + value, 0) / countries.length)
                .toFixed(2)
            }
          </p>
        </div>
      )}
    </motion.div>
  );
};

// A consistent color palette
const COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export default WealthInequalityChart;
