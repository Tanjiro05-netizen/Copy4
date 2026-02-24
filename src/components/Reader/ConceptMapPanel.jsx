import React, { useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const nodeColor = (node) => {
  if (node.type === 'heading') return '#f97316';
  return '#ef4444';
};

const ConceptMapPanel = ({ graphData, onNodeClick }) => {
  const safeGraphData = useMemo(() => {
    if (!graphData?.nodes?.length) return { nodes: [], links: [] };
    return graphData;
  }, [graphData]);

  if (!safeGraphData.nodes.length) {
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 h-[340px] flex items-center justify-center">
        <p className="text-sm text-gray-400">No concept graph data available for this text.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-2 h-[340px] no-pdf">
      <ForceGraph2D
        graphData={safeGraphData}
        backgroundColor="rgba(0,0,0,0)"
        nodeRelSize={6}
        linkWidth={(link) => Math.max(0.6, link.value || 1)}
        nodeColor={nodeColor}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.label || '';
          const fontSize = Math.max(8, 12 / globalScale);
          ctx.beginPath();
          ctx.fillStyle = nodeColor(node);
          ctx.arc(node.x, node.y, Math.max(3, (node.val || 6) / 2), 0, 2 * Math.PI, false);
          ctx.fill();
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = '#f5f5f5';
          ctx.fillText(label, node.x + 5, node.y + 4);
        }}
        onNodeClick={(node) => onNodeClick?.(node)}
        cooldownTicks={120}
      />
    </div>
  );
};

export default ConceptMapPanel;
