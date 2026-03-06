import type { AnalyzedPlugin } from '../services/dependencyAnalyzer';
import { X, CheckCircle, AlertTriangle, XCircle, ExternalLink, Activity } from 'lucide-react';

interface PluginDrawerProps {
    plugin: AnalyzedPlugin | null;
    onClose: () => void;
}

export const PluginDrawer = ({ plugin, onClose }: PluginDrawerProps) => {
    if (!plugin) return null;

    const getRiskColorClass = (risk: string) => {
        if (risk === 'LOW' || risk === 'HEALTHY') return 'badge-healthy';
        if (risk === 'MEDIUM' || risk === 'NEEDS ATTENTION') return 'badge-needs-attention';
        if (risk === 'HIGH' || risk === 'OUTDATED') return 'badge-outdated';
        return '';
    };

    const getRiskIcon = (risk: string) => {
        if (risk === 'LOW' || risk === 'HEALTHY') return <CheckCircle size={14} className="risk-icon" />;
        if (risk === 'MEDIUM' || risk === 'NEEDS ATTENTION') return <AlertTriangle size={14} className="risk-icon" />;
        if (risk === 'HIGH' || risk === 'OUTDATED') return <XCircle size={14} className="risk-icon" />;
        return <Activity size={14} className="risk-icon" />;
    };

    return (
        <>
            <div className={`side-panel-overlay ${plugin ? 'open' : ''}`} onClick={onClose}></div>

            <div className={`side-panel ${plugin ? 'open' : ''}`}>
                <div className="side-panel-header">
                    <div>
                        <h3 className="side-panel-title">{plugin.title || plugin.name}</h3>
                        <p className="side-panel-subtitle" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span className="badge">v{plugin.version}</span>
                            {plugin.scm && (
                                <a href={plugin.scm} target="_blank" rel="noopener noreferrer" className="link-icon">
                                    <ExternalLink size={14} /> Repository
                                </a>
                            )}
                        </p>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                </div>

                <div className="side-panel-content">
                    <div className="drawer-stats-grid">
                        <div className="drawer-stat">
                            <span className="text-muted">Popularity</span>
                            <strong>{plugin.popularity || 0} inst.</strong>
                        </div>
                        <div className="drawer-stat">
                            <span className="text-muted">Modernization Score</span>
                            <strong>{plugin.modernizationScore}/100</strong>
                        </div>
                        <div className="drawer-stat">
                            <span className="text-muted">Health / Maintenance</span>
                            <span className={`status-badge ${getRiskColorClass(plugin.riskLevel)}`} style={{ marginTop: '0.25rem' }}>
                                {getRiskIcon(plugin.riskLevel)} {plugin.riskLevel}
                            </span>
                        </div>
                        <div className="drawer-stat">
                            <span className="text-muted">Overall Dep. Risk</span>
                            <span className={`status-badge ${getRiskColorClass(plugin.overallDependencyRisk)}`} style={{ marginTop: '0.25rem' }}>
                                {getRiskIcon(plugin.overallDependencyRisk)} {plugin.overallDependencyRisk}
                            </span>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        <h4 style={{ margin: '0 0 1rem 0', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Dependencies</span>
                            <span className="badge">{plugin.dependencyRisks.length} total</span>
                        </h4>

                        {plugin.dependencyRisks.length === 0 ? (
                            <p className="text-muted">No dependencies found.</p>
                        ) : (
                            <div className="dependency-list">
                                {plugin.dependencyRisks.map((dep, idx) => (
                                    <div className="dependency-card" key={idx}>
                                        <div className="dependency-info">
                                            <h4>{dep.dependencyName}</h4>
                                            <p>Version: {dep.dependencyVersion || 'Unknown'}</p>
                                        </div>
                                        <div className="dependency-status">
                                            <span className={`status-badge ${getRiskColorClass(dep.riskLevel)}`}>
                                                {getRiskIcon(dep.riskLevel)} {dep.riskLevel}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
