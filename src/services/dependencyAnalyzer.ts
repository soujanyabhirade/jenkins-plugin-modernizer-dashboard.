import { type ScoredPlugin, type RiskLevel } from './pluginScoring';

export interface DependencyRisk {
    pluginName: string;
    dependencyName: string;
    dependencyVersion?: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface AnalyzedPlugin extends ScoredPlugin {
    overallDependencyRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    dependencyRisks: DependencyRisk[];
}

export const analyzeDependencies = (plugins: ScoredPlugin[]): AnalyzedPlugin[] => {
    // 1. Build an O(1) lookup dictionary of plugin Name -> Modernization Score.
    // Also include 'title' as a fallback just in case the dependencies references that instead.
    const scoreMap = new Map<string, number>();
    const riskMap = new Map<string, RiskLevel>();

    plugins.forEach(p => {
        scoreMap.set(p.name, p.modernizationScore);
        riskMap.set(p.name, p.riskLevel);
        if (p.title) {
            scoreMap.set(p.title, p.modernizationScore);
            riskMap.set(p.title, p.riskLevel);
        }
    });

    // 2. Iterate through every plugin and evaluate its nested dependencies
    return plugins.map(plugin => {
        const analyzedDeps: DependencyRisk[] = [];
        let highestRiskIndicator: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

        if (plugin.dependencies && Array.isArray(plugin.dependencies)) {
            plugin.dependencies.forEach(dep => {
                // If the dependency exists in our global map, grab its score.
                // If it doesn't exist (e.g. system level or missing), default safely to 100/LOW.
                const depScore = scoreMap.has(dep.name) ? scoreMap.get(dep.name) as number : 100;

                let depRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

                // Risk Rules:
                if (depScore < 40) {
                    depRiskLevel = 'HIGH';
                    highestRiskIndicator = 'HIGH';
                } else if (depScore >= 40 && depScore <= 70) {
                    depRiskLevel = 'MEDIUM';
                    if (highestRiskIndicator !== 'HIGH') {
                        highestRiskIndicator = 'MEDIUM';
                    }
                }

                analyzedDeps.push({
                    pluginName: plugin.pluginName,
                    dependencyName: dep.name,
                    dependencyVersion: dep.version,
                    riskLevel: depRiskLevel
                });
            });
        }

        return {
            ...plugin,
            overallDependencyRisk: highestRiskIndicator,
            dependencyRisks: analyzedDeps
        };
    });
};
