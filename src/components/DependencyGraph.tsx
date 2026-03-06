import { useMemo, useCallback, useEffect } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    type Connection,
    type Edge,
    type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { AnalyzedPlugin } from '../services/dependencyAnalyzer';

interface DependencyGraphProps {
    plugins: AnalyzedPlugin[];
}

export const DependencyGraph = ({ plugins }: DependencyGraphProps) => {
    // Let's create nodes and edges from top plugins (e.g. limit to 50 for performance and legibility)
    const initialData = useMemo(() => {
        const nodes: Node[] = [];
        const edges: Edge[] = [];
        const addedNodes = new Set<string>();

        const getRiskColor = (risk: string) => {
            if (risk === 'HEALTHY' || risk === 'LOW') return '#238636'; // Green
            if (risk === 'NEEDS ATTENTION' || risk === 'MEDIUM') return '#d29922'; // Yellow
            if (risk === 'OUTDATED' || risk === 'HIGH') return '#da3633'; // Red
            return '#8b949e'; // Gray
        };

        // Sort plugins by popularity and get top 30 to keep graph clean
        const topPlugins = [...plugins].sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 30);

        // Create Nodes
        topPlugins.forEach((p) => {
            if (!addedNodes.has(p.name)) {
                nodes.push({
                    id: p.name,
                    position: {
                        x: Math.random() * 800,
                        y: Math.random() * 600
                    },
                    data: { label: p.title || p.name },
                    style: {
                        background: '#161b22',
                        color: '#c9d1d9',
                        border: `2px solid ${getRiskColor(p.riskLevel)}`,
                        borderRadius: '8px',
                        padding: 10,
                        fontSize: 12,
                        fontWeight: 'bold',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                        width: 150,
                    }
                });
                addedNodes.add(p.name);
            }

            // Create Edges for Dependencies
            p.dependencyRisks.forEach((dep) => {
                // Only add edge if the target node is also in our top plugins graph
                if (topPlugins.some(tp => tp.name === dep.dependencyName)) {
                    edges.push({
                        id: `e-${p.name}-${dep.dependencyName}`,
                        source: p.name,
                        target: dep.dependencyName,
                        animated: dep.riskLevel === 'HIGH' || dep.riskLevel === 'MEDIUM', // Animate risky dependencies
                        style: {
                            stroke: getRiskColor(dep.riskLevel),
                            strokeWidth: dep.riskLevel === 'HIGH' ? 2 : 1
                        },
                    });
                }
            });
        });

        return { nodes, edges };
    }, [plugins]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialData.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialData.edges);

    // Sync nodes and edges when initialData changes (e.g. after loading)
    useEffect(() => {
        setNodes(initialData.nodes);
        setEdges(initialData.edges);
    }, [initialData, setNodes, setEdges]);

    const onConnect = useCallback(
        (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    return (
        <div className="table-section dependency-graph-container" style={{ width: '100%', marginTop: '20px' }}>
            <div className="table-header-row" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Ecosystem Dependency Graph (Top 30 Plugins)</h3>
                <span className="badge text-muted">Scroll to zoom, drag to pan</span>
            </div>
            <div style={{ height: '600px', width: '100%', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                {nodes.length === 0 ? (
                    <div className="empty-state" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        No dependency data available for the top plugins.
                    </div>
                ) : (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        fitView
                        attributionPosition="bottom-right"
                    >
                        <MiniMap
                            nodeColor={(node) => {
                                return node.style?.borderColor as string || '#eee';
                            }}
                            nodeStrokeWidth={3}
                            zoomable
                            style={{ backgroundColor: '#0d1117' }}
                            maskColor="rgba(0,0,0,0.4)"
                        />
                        <Controls style={{ backgroundColor: '#0d1117', color: '#fff', border: '1px solid #30363d' }} />
                        <Background color="#30363d" gap={16} size={1} />
                    </ReactFlow>
                )}
            </div>
        </div>
    );
};
