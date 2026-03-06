import { useState } from 'react';
import { usePlugins } from './hooks/usePlugins';
import { type AnalyzedPlugin } from './services/dependencyAnalyzer';
import { KPISection } from './components/KPISection';
import { ChartsSection } from './components/ChartsSection';
import { PluginTable } from './components/PluginTable';
import { PluginDrawer } from './components/PluginDrawer';
import { DependencyGraph } from './components/DependencyGraph';
import { Download } from 'lucide-react';
import './App.css';

function App() {
  const { data: plugins, loading, error } = usePlugins();
  const [selectedPlugin, setSelectedPlugin] = useState<AnalyzedPlugin | null>(null);

  const handleExportCSV = () => {
    if (!plugins.length) return;
    const headers = ['Name', 'Title', 'Version', 'Popularity', 'Modernization Score', 'Maintenance Risk', 'Dependency Risk', 'Dependencies Count'];
    const rows = plugins.map(p => [
      p.name,
      p.title ? p.title.replace(/,/g, '') : '',
      p.version,
      p.popularity || 0,
      p.modernizationScore,
      p.riskLevel,
      p.overallDependencyRisk,
      p.dependencyRisks.length
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(',') + '\n'
      + rows.map(e => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "jenkins_plugins_ecosystem.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    if (!plugins.length) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plugins, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", "jenkins_plugins_ecosystem.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-title">
          <h1>Jenkins Plugin Modernizer</h1>
          <p>Live insights on Jenkins plugin popularity and ecosystem health.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleExportCSV} disabled={loading || plugins.length === 0}>
            <Download size={16} /> Export CSV
          </button>
          <button className="btn btn-secondary" onClick={handleExportJSON} disabled={loading || plugins.length === 0}>
            <Download size={16} /> Export JSON
          </button>
        </div>
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
          <div className="dashboard-content">
            {/* Row 1: KPI summary cards */}
            <KPISection plugins={plugins} />

            {/* Row 2 & 3: Charts */}
            <ChartsSection plugins={plugins} />

            {/* Row 4: Plugin Analysis Table */}
            <PluginTable plugins={plugins} onRowClick={setSelectedPlugin} />

            {/* Row 5: Dependency Graph */}
            <DependencyGraph plugins={plugins} />

            {/* Drawer for specific plugin details */}
            <PluginDrawer plugin={selectedPlugin} onClose={() => setSelectedPlugin(null)} />
          </div>
        )}
      </section>
    </div>
  );
}

export default App;