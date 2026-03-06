import type { AnalyzedPlugin } from '../services/dependencyAnalyzer';
import { Activity, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface KPISectionProps {
    plugins: AnalyzedPlugin[];
}

export const KPISection = ({ plugins }: KPISectionProps) => {
    const totalPlugins = plugins.length;

    // Healthy -> HEALTHY
    const healthyCount = plugins.filter(p => p.riskLevel === 'HEALTHY').length;
    // Medium Risk -> NEEDS ATTENTION
    const mediumRiskCount = plugins.filter(p => p.riskLevel === 'NEEDS ATTENTION').length;
    // High Risk -> OUTDATED
    const highRiskCount = plugins.filter(p => p.riskLevel === 'OUTDATED').length;

    return (
        <div className="kpi-grid">
            <div className="kpi-card card-total">
                <div className="kpi-icon-wrapper text-blue">
                    <Activity size={28} />
                </div>
                <div className="kpi-content">
                    <h3>Total Plugins</h3>
                    <div className="kpi-value">{totalPlugins}</div>
                </div>
            </div>

            <div className="kpi-card card-healthy">
                <div className="kpi-icon-wrapper text-success">
                    <CheckCircle size={28} />
                </div>
                <div className="kpi-content">
                    <h3>Healthy Plugins</h3>
                    <div className="kpi-value text-success">{healthyCount}</div>
                </div>
            </div>

            <div className="kpi-card card-medium">
                <div className="kpi-icon-wrapper text-warning">
                    <AlertTriangle size={28} />
                </div>
                <div className="kpi-content">
                    <h3>Medium Risk</h3>
                    <div className="kpi-value text-warning">{mediumRiskCount}</div>
                </div>
            </div>

            <div className="kpi-card card-high">
                <div className="kpi-icon-wrapper text-danger">
                    <XCircle size={28} />
                </div>
                <div className="kpi-content">
                    <h3>High Risk</h3>
                    <div className="kpi-value text-danger">{highRiskCount}</div>
                </div>
            </div>
        </div>
    );
};
