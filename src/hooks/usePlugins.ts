import { useState, useEffect } from 'react';
import type { Plugin } from '../models/plugin';
import { fetchPlugins } from '../api/jenkinsApi';
import { calculatePluginScore } from '../services/pluginScoring';
import { analyzeDependencies, type AnalyzedPlugin } from '../services/dependencyAnalyzer';

interface UsePluginsReturn {
    data: AnalyzedPlugin[];
    loading: boolean;
    error: string | null;
}

export const usePlugins = (): UsePluginsReturn => {
    const [data, setData] = useState<AnalyzedPlugin[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const responseData = await fetchPlugins();

                if (mounted) {
                    // The API returns { plugins: [...] }
                    const rawPlugins: Plugin[] = responseData.plugins || [];
                    const scoredPlugins = rawPlugins.map(plugin => calculatePluginScore(plugin));
                    const fullyAnalyzedPlugins = analyzeDependencies(scoredPlugins);

                    setData(fullyAnalyzedPlugins);
                }
            } catch (err: unknown) {
                if (mounted) {
                    if (err instanceof Error) {
                        setError(err.message || 'Failed to fetch plugins');
                    } else {
                        setError('Failed to fetch plugins');
                    }
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadData();

        return () => {
            mounted = false;
        };
    }, []);

    return { data, loading, error };
};
