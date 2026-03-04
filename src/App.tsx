import { useState, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { usePlugins } from './hooks/usePlugins'
import { type AnalyzedPlugin } from './services/dependencyAnalyzer'
import './App.css'

function App() {
  const { data: plugins, loading, error } = usePlugins();
  const [searchQuery, setSearchQuery] = useState('');
  const [dependencyFilter, setDependencyFilter] = useState('ALL');

  // Side Panel State
  const [selectedPlugin, setSelectedPlugin] = useState<AnalyzedPlugin | null>(null);

  // KPIs
  const totalPlugins = plugins.length;
  const popularCount = plugins.filter(p => (p.popularity || 0) > 500).length;
  const nicheCount = plugins.filter(p => (p.popularity || 0) <= 500).length;

  // Chart 1: Modernization Health
  const modernizationHealthOption = useMemo(() => {
    let healthy = 0, needsAttention = 0, outdated = 0;

    plugins.forEach(p => {
      if (p.riskLevel === 'HEALTHY') healthy++;
      else if (p.riskLevel === 'NEEDS ATTENTION') needsAttention++;
      else if (p.riskLevel === 'OUTDATED') outdated++;
    });

    return {
      title: { text: 'Plugin Modernization Health', left: 'center', textStyle: { color: '#e0e0e0', fontWeight: 'bold' } },
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
            { value: healthy, name: 'Healthy', itemStyle: { color: '#238636' } },              // GREEN
            { value: needsAttention, name: 'Needs Attention', itemStyle: { color: '#d29922' } },// YELLOW
            { value: outdated, name: 'Outdated', itemStyle: { color: '#da3633' } }              // RED
          ]
        }
      ]
    };
  }, [plugins]);

  // Chart 2: Dependency Risk Health
  const dependencyHealthOption = useMemo(() => {
    let low = 0, medium = 0, high = 0;

    plugins.forEach(p => {
      if (p.overallDependencyRisk === 'LOW') low++;
      else if (p.overallDependencyRisk === 'MEDIUM') medium++;
      else if (p.overallDependencyRisk === 'HIGH') high++;
    });

    return {
      title: { text: 'Plugin Dependency Health', left: 'center', textStyle: { color: '#e0e0e0', fontWeight: 'bold' } },
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
            { value: low, name: 'Low Risk', itemStyle: { color: '#238636' } },
            { value: medium, name: 'Medium Risk', itemStyle: { color: '#d29922' } },
            { value: high, name: 'High Risk', itemStyle: { color: '#da3633' } }
          ]
        }
      ]
    };
  }, [plugins]);

  const filteredPlugins = useMemo(() => {
    return plugins.filter(p => {
      const searchLower = searchQuery.toLowerCase();
      const matchName = (p.name || '').toLowerCase().includes(searchLower);
      const matchTitle = (p.title || '').toLowerCase().includes(searchLower);

      const matchesSearch = matchName || matchTitle;
      const matchesDepFilter = dependencyFilter === 'ALL' || p.overallDependencyRisk === dependencyFilter;

      return matchesSearch && matchesDepFilter;
    }).slice(0, 100);
  }, [plugins, searchQuery, dependencyFilter]);

  const getRiskIcon = (risk: string) => {
    if (risk === 'LOW') return '✅';
    if (risk === 'MEDIUM') return '⚠️';
    if (risk === 'HIGH') return '🔴';
    return '';
  };

  const getRiskColorClass = (risk: string) => {
    if (risk === 'LOW') return 'badge-healthy';
    if (risk === 'MEDIUM') return 'badge-needs-attention';
    if (risk === 'HIGH') return 'badge-outdated';
    return '';
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Jenkins Plugin Modernizer</h1>
        <p>Live insights on Jenkins plugin popularity and ecosystem health.</p>
      </header>

      <section className="dashboard-section">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Fetching plugins from Jenkins...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <h3>⚠️ Live Jenkins plugin data could not be loaded. Please try again later.</h3>
            <p className="text-muted">{error}</p>
          </div>
        ) : (
          <>
            <div className="kpi-grid">
              <div className="kpi-card">
                <h3>Total Plugins</h3>
                <div className="kpi-value text-blue">{totalPlugins}</div>
              </div>
              <div className="kpi-card">
                <h3>High Popularity</h3>
                <div className="kpi-value text-success">{popularCount}</div>
              </div>
              <div className="kpi-card">
                <h3>Standard / Niche</h3>
                <div className="kpi-value" style={{ color: '#d29922' }}>{nicheCount}</div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <ReactECharts option={modernizationHealthOption} style={{ height: '350px' }} />
              </div>
              <div className="chart-card">
                <ReactECharts option={dependencyHealthOption} style={{ height: '350px' }} />
              </div>
            </div>

            <div className="table-section">
              <div className="table-header-row">
                <h3>Jenkins Plugins Directory</h3>
                <div className="table-controls">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search by plugin name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <select
                    className="risk-filter search-input"
                    value={dependencyFilter}
                    onChange={(e) => setDependencyFilter(e.target.value)}
                  >
                    <option value="ALL">All Dependencies</option>
                    <option value="LOW">✅ Low Risk Only</option>
                    <option value="MEDIUM">⚠️ Medium Risk Only</option>
                    <option value="HIGH">🔴 High Risk Only</option>
                  </select>
                </div>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Plugin Name</th>
                      <th>Version</th>
                      <th>Modernization Score</th>
                      <th>Maintenance Risk</th>
                      <th>Dependency Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlugins.map((plugin, i) => {
                      const riskLower = (plugin.riskLevel || '').toLowerCase().replace(' ', '-');
                      return (
                        <tr key={plugin.name || i} onClick={() => setSelectedPlugin(plugin)}>
                          <td>
                            <div className="font-medium">{plugin.title || plugin.name}</div>
                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>{plugin.name}</div>
                          </td>
                          <td>{plugin.version}</td>
                          <td>
                            <strong>{plugin.modernizationScore}/100</strong>
                          </td>
                          <td>
                            <span className={`status-badge badge-${riskLower}`}>
                              {plugin.riskLevel}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${getRiskColorClass(plugin.overallDependencyRisk)}`}>
                              <span className="risk-icon">{getRiskIcon(plugin.overallDependencyRisk)}</span>
                              {plugin.overallDependencyRisk}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredPlugins.length === 0 && (
                      <tr>
                        <td colSpan={5}>
                          <div className="empty-state">No plugins match your search.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Side Panel Overlay */}
            <div
              className={`side-panel-overlay ${selectedPlugin ? 'open' : ''}`}
              onClick={() => setSelectedPlugin(null)}
            ></div>

            {/* Side Panel */}
            <div className={`side-panel ${selectedPlugin ? 'open' : ''}`}>
              {selectedPlugin && (
                <>
                  <div className="side-panel-header">
                    <div>
                      <h3 className="side-panel-title">{selectedPlugin.title || selectedPlugin.name}</h3>
                      <p className="side-panel-subtitle">Version: {selectedPlugin.version}</p>
                    </div>
                    <button className="close-btn" onClick={() => setSelectedPlugin(null)}>×</button>
                  </div>

                  <div className="side-panel-content">
                    <h4 style={{ marginTop: 0, marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                      Dependencies ({selectedPlugin.dependencyRisks.length})
                    </h4>

                    {selectedPlugin.dependencyRisks.length === 0 ? (
                      <p className="text-muted">No dependencies found.</p>
                    ) : (
                      <div className="dependency-list">
                        {selectedPlugin.dependencyRisks.map((dep, idx) => (
                          <div className="dependency-card" key={idx}>
                            <div className="dependency-info">
                              <h4>{dep.dependencyName}</h4>
                              <p>Version: {dep.dependencyVersion || 'Unknown'}</p>
                            </div>
                            <div className="dependency-status">
                              <span className={`status-badge ${getRiskColorClass(dep.riskLevel)}`}>
                                <span className="risk-icon">{getRiskIcon(dep.riskLevel)}</span>
                                {dep.riskLevel}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

          </>
        )}
      </section>
    </div>
  )
}

export default App