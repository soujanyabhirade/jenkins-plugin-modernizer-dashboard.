import type { Plugin } from '../models/plugin';

export type RiskLevel = 'HEALTHY' | 'NEEDS ATTENTION' | 'OUTDATED';

export interface ScoredPlugin extends Plugin {
    pluginName: string;
    modernizationScore: number;
    riskLevel: RiskLevel;
}

// Ensure version parser can handle mixed strings like "1.0", "1.0-beta", "0.9.1"
const getMajorVersion = (version: string): number => {
    if (!version) return 0;
    // Match the first sequence of numbers
    const match = version.match(/^(\d+)/);
    if (match) {
        return parseInt(match[1], 10);
    }
    return 0; // Fallback if no numeric start
};

export const calculatePluginScore = (plugin: Plugin): ScoredPlugin => {
    let score = 100;

    const popularity = plugin.popularity || 0;

    // Rule 1: popularity < 0.01 -> subtract 20 (Note: The API popularity is usually an integer representation or percentage string, but following the literal rule)
    // Converting popularity to a float context assuming the user's rule refers to a relative metric; if popularity is raw install count, checking < 0.01 is mathematically fine but logically catches all 0s. 
    if (popularity < 0.01) {
        score -= 20;
    }

    // Rule 2: no recent activity -> subtract 20
    // "Recent" will be defined as within the last 2 years. If buildDate is missing entirely, penalize.
    if (!plugin.buildDate) {
        score -= 20;
    } else {
        const buildTime = new Date(plugin.buildDate).getTime();
        const twoYearsAgo = Date.now() - (2 * 365 * 24 * 60 * 60 * 1000);
        if (buildTime < twoYearsAgo) {
            score -= 20;
        }
    }

    // Rule 3: version looks outdated (major version < 1) -> subtract 15
    const majorVersion = getMajorVersion(plugin.version);
    if (majorVersion < 1) {
        score -= 15;
    }

    // Rule 4: popularity > 0.05 -> add 10
    if (popularity > 0.05) {
        score += 10;
    }

    // Bound score between 0 and 100
    score = Math.max(0, Math.min(100, score));

    let riskLevel: RiskLevel = 'HEALTHY';
    if (score < 50) {
        riskLevel = 'OUTDATED';
    } else if (score < 80) {
        riskLevel = 'NEEDS ATTENTION';
    }

    return {
        ...plugin,
        pluginName: plugin.name || plugin.title || 'Unknown',
        modernizationScore: score,
        riskLevel
    };
};
