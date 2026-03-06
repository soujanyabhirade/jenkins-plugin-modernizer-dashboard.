import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { AnalyzedPlugin } from '../services/dependencyAnalyzer';

interface ChartsSectionProps {
    plugins: AnalyzedPlugin[];
}

export const ChartsSection = ({ plugins }: ChartsSectionProps) => {

    const modernizationHealthOption = useMemo(() => {
        let healthy = 0, needsAttention = 0, outdated = 0;
        plugins.forEach(p => {
            if (p.riskLevel === 'HEALTHY') healthy++;
            else if (p.riskLevel === 'NEEDS ATTENTION') needsAttention++;
            else if (p.riskLevel === 'OUTDATED') outdated++;
        });

        return {
            title: { text: 'Plugin Health Distribution', left: 'center', textStyle: { color: '#e0e0e0', fontWeight: 'bold' } },
            tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
            legend: { bottom: '0', textStyle: { color: '#a0a0a0' } },
            series: [
                {
                    name: 'Health',
                    type: 'pie',
                    radius: '60%',
                    itemStyle: { borderRadius: 5, borderColor: '#161b22', borderWidth: 2 },
                    label: { show: false, position: 'center' },
                    emphasis: { label: { show: true, fontSize: '18', fontWeight: 'bold', color: '#fff' } },
                    data: [
                        { value: healthy, name: 'Healthy', itemStyle: { color: '#238636' } },
                        { value: needsAttention, name: 'Needs Attention', itemStyle: { color: '#d29922' } },
                        { value: outdated, name: 'High Risk', itemStyle: { color: '#da3633' } } // Name changed to High Risk for UI matching
                    ]
                }
            ]
        };
    }, [plugins]);

    const dependencyHealthOption = useMemo(() => {
        let low = 0, medium = 0, high = 0;
        plugins.forEach(p => {
            if (p.overallDependencyRisk === 'LOW') low++;
            else if (p.overallDependencyRisk === 'MEDIUM') medium++;
            else if (p.overallDependencyRisk === 'HIGH') high++;
        });

        return {
            title: { text: 'Dependency Risk Distribution', left: 'center', textStyle: { color: '#e0e0e0', fontWeight: 'bold' } },
            tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
            legend: { bottom: '0', textStyle: { color: '#a0a0a0' } },
            series: [
                {
                    name: 'Dependency Risk',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    itemStyle: { borderRadius: 5, borderColor: '#161b22', borderWidth: 2 },
                    label: { show: false, position: 'center' },
                    emphasis: { label: { show: true, fontSize: '18', fontWeight: 'bold', color: '#fff' } },
                    data: [
                        { value: low, name: 'Low', itemStyle: { color: '#238636' } },
                        { value: medium, name: 'Medium', itemStyle: { color: '#d29922' } },
                        { value: high, name: 'High', itemStyle: { color: '#da3633' } }
                    ]
                }
            ]
        };
    }, [plugins]);

    const modernizationScoreOption = useMemo(() => {
        const bins = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
        plugins.forEach(p => {
            const s = p.modernizationScore;
            if (s <= 20) bins['0-20']++;
            else if (s <= 40) bins['21-40']++;
            else if (s <= 60) bins['41-60']++;
            else if (s <= 80) bins['61-80']++;
            else bins['81-100']++;
        });

        return {
            title: { text: 'Modernization Score Distribution', left: 'center', textStyle: { color: '#e0e0e0', fontWeight: 'bold' } },
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            xAxis: { type: 'category', data: Object.keys(bins), axisLabel: { color: '#a0a0a0' } },
            yAxis: { type: 'value', axisLabel: { color: '#a0a0a0' }, splitLine: { lineStyle: { color: '#30363d' } } },
            series: [
                {
                    data: Object.values(bins),
                    type: 'bar',
                    itemStyle: { color: '#58a6ff', borderRadius: [4, 4, 0, 0] }
                }
            ]
        };
    }, [plugins]);

    const dependencyRiskBreakdownOption = useMemo(() => {
        // "Bar chart showing number of plugins affected by risky dependencies"
        // Let's count plugins that have at least one HIGH or at least one MEDIUM
        let highRiskDeps = 0;
        let mediumRiskDeps = 0;
        let lowRiskDeps = 0;
        let noDeps = 0;

        plugins.forEach(p => {
            if (p.dependencyRisks.length === 0) {
                noDeps++;
            } else {
                const hasHigh = p.dependencyRisks.some(d => d.riskLevel === 'HIGH');
                const hasMedium = p.dependencyRisks.some(d => d.riskLevel === 'MEDIUM');

                if (hasHigh) highRiskDeps++;
                else if (hasMedium) mediumRiskDeps++;
                else lowRiskDeps++;
            }
        });

        return {
            title: { text: 'Plugins by Highest Dependency Risk', left: 'center', textStyle: { color: '#e0e0e0', fontWeight: 'bold' } },
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            xAxis: { type: 'category', data: ['High Risk Dep', 'Medium Risk Dep', 'Low Risk Dep', 'No Deps'], axisLabel: { color: '#a0a0a0', interval: 0, rotate: 15 } },
            yAxis: { type: 'value', axisLabel: { color: '#a0a0a0' }, splitLine: { lineStyle: { color: '#30363d' } } },
            series: [
                {
                    data: [
                        { value: highRiskDeps, itemStyle: { color: '#da3633' } },
                        { value: mediumRiskDeps, itemStyle: { color: '#d29922' } },
                        { value: lowRiskDeps, itemStyle: { color: '#238636' } },
                        { value: noDeps, itemStyle: { color: '#8b949e' } }
                    ],
                    type: 'bar',
                    itemStyle: { borderRadius: [4, 4, 0, 0] }
                }
            ]
        };
    }, [plugins]);

    // "Maintenance Risk Distribution - Pie chart showing: Low, Medium, High" -> Since we use 'riskLevel' for Maintenance risk? Let's check scoring. riskLevel = 'HEALTHY' | 'NEEDS ATTENTION' | 'OUTDATED'. Wait, the req asked for "Plugin Health", "Maintenance Risk", "Dependency Risk", "Modernization Score".
    // Let's create `Plugin Health` pie chart based on score. (Healthy > 80, Needs Attention 50-80, High Risk < 50)
    // And `Maintenance Risk` pie chart based on build date/popularity maybe? 
    // Let's treat riskLevel as "Plugin Health" because it maps exactly to Healthy, Needs Attention, Outdated(High Risk).
    // Actually, Let's re-use the exact wording.
    // The first chart `modernizationHealthOption` uses `p.riskLevel`. I renamed it to `Plugin Health Distribution`.

    return (
        <>
            <div className="charts-row">
                <div className="chart-card">
                    <ReactECharts option={modernizationHealthOption} style={{ height: '320px' }} />
                </div>
                <div className="chart-card">
                    {/* Maintenance Risk Distribution - For now we use the same risk level as a proxy if we haven't explicit maintenance risk properties, 
              or let's build a specific one based on buildDate = Maintenance Risk */}
                    <ReactECharts option={{
                        title: { text: 'Maintenance Risk', left: 'center', textStyle: { color: '#e0e0e0', fontWeight: 'bold' } },
                        tooltip: { trigger: 'item' },
                        legend: { bottom: '0', textStyle: { color: '#a0a0a0' } },
                        series: [
                            {
                                name: 'Maintenance Risk', type: 'pie', radius: '60%', itemStyle: { borderRadius: 5, borderColor: '#161b22', borderWidth: 2 },
                                label: { show: false }, emphasis: { label: { show: true, fontSize: '18', fontWeight: 'bold', color: '#fff' } },
                                data: [
                                    { value: plugins.filter(p => p.buildDate && new Date(p.buildDate).getTime() > Date.now() - 365 * 24 * 60 * 60 * 1000).length, name: 'Low', itemStyle: { color: '#238636' } },
                                    { value: plugins.filter(p => !p.buildDate || (p.buildDate && new Date(p.buildDate).getTime() < Date.now() - 365 * 24 * 60 * 60 * 1000 && new Date(p.buildDate).getTime() > Date.now() - 2 * 365 * 24 * 60 * 60 * 1000)).length, name: 'Medium', itemStyle: { color: '#d29922' } },
                                    { value: plugins.filter(p => p.buildDate && new Date(p.buildDate).getTime() < Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).length, name: 'High', itemStyle: { color: '#da3633' } }
                                ]
                            }
                        ]
                    }} style={{ height: '320px' }} />
                </div>
            </div>
            <div className="charts-row">
                <div className="chart-card">
                    <ReactECharts option={dependencyHealthOption} style={{ height: '320px' }} />
                </div>
                <div className="chart-card">
                    <ReactECharts option={modernizationScoreOption} style={{ height: '320px' }} />
                </div>
            </div>
            <div className="charts-row">
                <div className="chart-card" style={{ width: '100%' }}>
                    <ReactECharts option={dependencyRiskBreakdownOption} style={{ height: '320px' }} />
                </div>
            </div>
        </>
    );
};
