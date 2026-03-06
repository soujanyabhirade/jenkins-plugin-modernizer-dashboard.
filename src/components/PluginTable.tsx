import { useState, useMemo } from 'react';
import type { AnalyzedPlugin } from '../services/dependencyAnalyzer';
import { ChevronUp, ChevronDown, CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react';

interface PluginTableProps {
    plugins: AnalyzedPlugin[];
    onRowClick: (plugin: AnalyzedPlugin) => void;
}

type SortField = 'name' | 'version' | 'popularity' | 'modernizationScore' | 'riskLevel' | 'overallDependencyRisk';
type SortOrder = 'asc' | 'desc';

export const PluginTable = ({ plugins, onRowClick }: PluginTableProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [dependencyFilter, setDependencyFilter] = useState('ALL');
    const [sortField, setSortField] = useState<SortField>('modernizationScore');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const filteredAndSortedPlugins = useMemo(() => {
        let result = plugins.filter(p => {
            const searchLower = searchQuery.toLowerCase();
            const matchName = (p.name || '').toLowerCase().includes(searchLower);
            const matchTitle = (p.title || '').toLowerCase().includes(searchLower);
            const matchesSearch = matchName || matchTitle;
            const matchesDepFilter = dependencyFilter === 'ALL' || p.overallDependencyRisk === dependencyFilter;
            return matchesSearch && matchesDepFilter;
        });

        result.sort((a, b) => {
            let aVal: any = a[sortField];
            let bVal: any = b[sortField];

            if (sortField === 'name') {
                aVal = a.title || a.name;
                bVal = b.title || b.name;
            }

            // Handle risk levels mappings for sorting
            if (sortField === 'riskLevel') {
                const order = { 'HEALTHY': 3, 'NEEDS ATTENTION': 2, 'OUTDATED': 1 };
                aVal = order[a.riskLevel];
                bVal = order[b.riskLevel];
            }
            if (sortField === 'overallDependencyRisk') {
                const order = { 'LOW': 3, 'MEDIUM': 2, 'HIGH': 1 };
                aVal = order[a.overallDependencyRisk];
                bVal = order[b.overallDependencyRisk];
            }

            if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [plugins, searchQuery, dependencyFilter, sortField, sortOrder]);

    const totalPages = Math.ceil(filteredAndSortedPlugins.length / itemsPerPage);
    const paginatedPlugins = filteredAndSortedPlugins.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <span className="sort-icon-placeholder" />;
        return sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
    };

    return (
        <div className="table-section kpi-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="table-header-row">
                <h3 style={{ margin: 0 }}>Plugin Analysis</h3>
                <div className="table-controls">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by plugin name..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                    <select
                        className="risk-filter search-input"
                        value={dependencyFilter}
                        onChange={(e) => {
                            setDependencyFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="ALL">All Dependencies</option>
                        <option value="LOW">✅ Low Risk Only</option>
                        <option value="MEDIUM">⚠️ Medium Risk Only</option>
                        <option value="HIGH">🔴 High Risk Only</option>
                    </select>
                </div>
            </div>

            <div className="table-container" style={{ flexGrow: 1, overflowX: 'auto' }}>
                <table style={{ minWidth: '800px' }}>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('name')} className="sortable-th">
                                Plugin Name <SortIcon field="name" />
                            </th>
                            <th onClick={() => handleSort('version')} className="sortable-th">
                                Version <SortIcon field="version" />
                            </th>
                            <th onClick={() => handleSort('popularity')} className="sortable-th">
                                Popularity <SortIcon field="popularity" />
                            </th>
                            <th onClick={() => handleSort('modernizationScore')} className="sortable-th">
                                Score <SortIcon field="modernizationScore" />
                            </th>
                            <th onClick={() => handleSort('riskLevel')} className="sortable-th">
                                Health/Maintenance <SortIcon field="riskLevel" />
                            </th>
                            <th onClick={() => handleSort('overallDependencyRisk')} className="sortable-th">
                                Dependency Risk <SortIcon field="overallDependencyRisk" />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedPlugins.map((plugin, i) => {
                            return (
                                <tr key={plugin.name || i} onClick={() => onRowClick(plugin)} className="clickable-row">
                                    <td>
                                        <div className="font-medium">{plugin.title || plugin.name}</div>
                                        <div className="text-muted" style={{ fontSize: '0.8rem' }}>{plugin.name}</div>
                                    </td>
                                    <td>{plugin.version}</td>
                                    <td>{plugin.popularity || 0}</td>
                                    <td>
                                        <strong>{plugin.modernizationScore}/100</strong>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getRiskColorClass(plugin.riskLevel)}`}>
                                            {getRiskIcon(plugin.riskLevel)} {plugin.riskLevel}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getRiskColorClass(plugin.overallDependencyRisk)}`}>
                                            {getRiskIcon(plugin.overallDependencyRisk)} {plugin.overallDependencyRisk}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                        {paginatedPlugins.length === 0 && (
                            <tr>
                                <td colSpan={6}>
                                    <div className="empty-state">No plugins match your search.</div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className="btn btn-secondary"
                    >
                        Previous
                    </button>
                    <span className="page-indicator">Page {currentPage} of {totalPages}</span>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className="btn btn-secondary"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};
