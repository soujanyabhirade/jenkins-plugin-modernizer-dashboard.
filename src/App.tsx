import { useEffect, useState, useMemo } from 'react'
import pluginData from './data/report.json'
import ReactECharts from 'echarts-for-react'
import './App.css'

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    console.log("Loaded Plugin Data:", pluginData);
  }, []);

  const migrations = useMemo(() => {
    const rawData: any = pluginData;
    if (Array.isArray(rawData)) {
      return rawData;
    } else if (rawData.migrations && Array.isArray(rawData.migrations)) {
      return rawData.migrations;
    } else if (rawData.reports && Array.isArray(rawData.reports)) {
      return rawData.reports;
    } else if (rawData.data && Array.isArray(rawData.data)) {
      return rawData.data;
    } else if (rawData.migrationStatus) {
      return [rawData];
    }
    return [];
  }, []);

  const uniquePluginsCount = useMemo(() => {
    const plugins = new Set(migrations.map((m: any) => m.pluginName).filter(Boolean));
    return plugins.size;
  }, [migrations]);

  const successCount = migrations.filter((m: any) => m.migrationStatus === 'success').length;
  const failCount = migrations.filter((m: any) => m.migrationStatus === 'fail').length;

  const pieChartOption = useMemo(() => {
    return {
      title: { text: 'Overall Migration Status', left: 'center', textStyle: { color: '#e0e0e0', fontWeight: 'bold' } },
      tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
      legend: { orient: 'vertical', left: 'left', textStyle: { color: '#a0a0a0' } },
      series: [
        {
          name: 'Status',
          type: 'pie',
          radius: '60%',
          data: [
            { value: successCount, name: 'Success', itemStyle: { color: '#238636' } },
            { value: failCount, name: 'Fail', itemStyle: { color: '#da3633' } },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: { color: '#e0e0e0' }
        }
      ]
    };
  }, [successCount, failCount]);

  const recipeLeaderboardOption = useMemo(() => {
    const failedMigrations = migrations.filter((m: any) => m.migrationStatus === 'fail');
    const recipeCounts: Record<string, number> = {};

    failedMigrations.forEach((m: any) => {
      const recipe = m.recipeName || m.migrationName || 'Unknown Recipe';
      recipeCounts[recipe] = (recipeCounts[recipe] || 0) + 1;
    });

    const sortedRecipes = Object.entries(recipeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // ECharts horizontal bar chart expects data from bottom to top for descending order
    sortedRecipes.reverse();

    return {
      title: { text: 'Top 5 Failing Recipes', left: 'center', textStyle: { color: '#e0e0e0', fontWeight: 'bold' } },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'value', splitLine: { lineStyle: { color: '#30363d' } }, axisLabel: { color: '#a0a0a0' } },
      yAxis: {
        type: 'category',
        data: sortedRecipes.map(r => {
          // Truncate long names
          const name = r[0];
          return name.length > 30 ? name.substring(0, 30) + '...' : name;
        }),
        axisLabel: { color: '#a0a0a0' }
      },
      series: [
        {
          type: 'bar',
          data: sortedRecipes.map(r => r[1]),
          itemStyle: { color: '#da3633', borderRadius: [0, 4, 4, 0] },
          label: { show: true, position: 'right', color: '#e0e0e0' }
        }
      ]
    };
  }, [migrations]);


  const filteredMigrations = useMemo(() => {
    return migrations.filter((m: any) => {
      const pName = (m.pluginName || '').toLowerCase();
      const mName = (m.migrationName || '').toLowerCase();
      const searchLower = searchQuery.toLowerCase();

      const matchesSearch = pName.includes(searchLower) || mName.includes(searchLower);

      const statusLower = (m.migrationStatus || '').toLowerCase();
      const matchesStatus = statusFilter === 'all' || statusLower === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [migrations, searchQuery, statusFilter]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Jenkins Plugin Modernizer</h1>
        <p>Overview of plugin migration statuses and recipe effectiveness.</p>
      </header>

      {migrations.length > 0 ? (
        <>
          <div className="kpi-grid">
            <div className="kpi-card">
              <h3>Total Plugins</h3>
              <div className="kpi-value text-blue">{uniquePluginsCount}</div>
            </div>
            <div className="kpi-card">
              <h3>Total Successes</h3>
              <div className="kpi-value text-success">{successCount}</div>
            </div>
            <div className="kpi-card">
              <h3>Total Failures</h3>
              <div className="kpi-value text-danger">{failCount}</div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <ReactECharts option={pieChartOption} style={{ height: '350px' }} />
            </div>
            <div className="chart-card">
              <ReactECharts option={recipeLeaderboardOption} style={{ height: '350px' }} />
            </div>
          </div>

          <div className="table-section">
            <div className="table-controls">
              <input
                type="text"
                className="search-input"
                placeholder="Search by plugin or migration name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="success">Success</option>
                <option value="fail">Fail</option>
              </select>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Plugin Name</th>
                    <th>Migration / Recipe Name</th>
                    <th>Status</th>
                    <th>Link to PR</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMigrations.map((m: any, i: number) => {
                    const statusLower = (m.migrationStatus || '').toLowerCase();
                    return (
                      <tr key={i} className={`row-${statusLower}`}>
                        <td className="font-medium">{m.pluginName || 'Unknown Plugin'}</td>
                        <td>{m.migrationName || m.recipeName || 'Unknown Migration'}</td>
                        <td>
                          <span className={`status-badge badge-${statusLower}`}>
                            {m.migrationStatus?.toUpperCase() || 'N/A'}
                          </span>
                        </td>
                        <td>
                          {m.pullRequestUrl ? (
                            <a href={m.pullRequestUrl} target="_blank" rel="noopener noreferrer" className="pr-link">
                              View PR
                            </a>
                          ) : (
                            <span className="text-muted">N/A</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredMigrations.length === 0 && (
                <div className="empty-state">
                  No migrations match your filters.
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="error-state">
          <h3>⚠️ Could not parse the migration array</h3>
          <p>The migrations array is empty or the shape of the JSON isn't what we expect. Please check the data source.</p>
        </div>
      )}
    </div>
  )
}

export default App