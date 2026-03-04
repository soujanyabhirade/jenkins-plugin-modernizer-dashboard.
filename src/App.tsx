import { useEffect, useState } from 'react'
import pluginData from './data/report.json'
import ReactECharts from 'echarts-for-react'
import './App.css'

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  // Let's log it so it can be inspected in the browser console
  useEffect(() => {
    console.log("Loaded Plugin Data:", pluginData);
  }, []);

  // Try to find the data in various shapes
  const rawData: any = pluginData;
  let migrations: any[] = [];

  if (rawData.migrations && Array.isArray(rawData.migrations)) {
    migrations = rawData.migrations;
  } else if (rawData.reports && Array.isArray(rawData.reports)) {
    migrations = rawData.reports;
  } else if (rawData.data && Array.isArray(rawData.data)) {
    migrations = rawData.data;
  } else if (rawData.migrationStatus) {
    // If it's a flat object (single migration report)
    migrations = [rawData];
  }

  const successCount = migrations.filter((m: any) => m.migrationStatus === 'success').length;
  const failCount = migrations.filter((m: any) => m.migrationStatus === 'fail').length;

  const chartOption = {
    title: { text: 'Migration Success vs Fail', left: 'center', textStyle: { color: '#fff' } },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: [
          { value: successCount, name: 'Success', itemStyle: { color: '#4caf50' } },
          { value: failCount, name: 'Fail', itemStyle: { color: '#f44336' } },
        ],
      }
    ]
  };

  const filteredMigrations = migrations.filter((m: any) =>
    (m.migrationName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '2rem', color: 'white' }}>
      <h1>{rawData.pluginName || 'Plugin'} Dashboard</h1>

      {/* If we have at least one migration, show the chart */}
      {migrations.length > 0 ? (
        <>
          <div style={{ height: '400px', margin: '2rem 0' }}>
            <ReactECharts option={chartOption} style={{ height: '100%' }} />
          </div>

          <div style={{ marginTop: '20px', marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Search migrations by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #444',
                background: '#2d2d2d',
                color: 'white',
                fontSize: '16px'
              }}
            />
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#2d2d2d', borderRadius: '8px', overflow: 'hidden' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #333' }}>
                <th style={{ textAlign: 'left', padding: '12px' }}>Migration Name</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px' }}>Link to PR</th>
              </tr>
            </thead>
            <tbody>
              {filteredMigrations.map((m, i) => {
                const isFail = m.migrationStatus === 'fail';
                return (
                  <tr key={i} style={{
                    borderBottom: '1px solid #222',
                    background: isFail ? '#1e1010' : 'transparent' // Darker red-tinted background for fails
                  }}>
                    <td style={{ padding: '12px' }}>{m.migrationName || 'Unknown Migration'}</td>
                    <td style={{
                      padding: '12px',
                      color: m.migrationStatus === 'success' ? '#4caf50' : m.migrationStatus === 'fail' ? '#f44336' : 'white',
                      fontWeight: 'bold'
                    }}>
                      {m.migrationStatus?.toUpperCase() || 'N/A'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {m.pullRequestUrl ? (
                        <a href={m.pullRequestUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3' }}>
                          View PR
                        </a>
                      ) : (
                        <span style={{ color: '#888' }}>N/A</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredMigrations.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', background: '#2d2d2d', color: '#888' }}>
              No migrations match your search.
            </div>
          )}
        </>
      ) : (
        <div style={{ marginTop: '2rem', background: '#2d2d2d', padding: '1rem', borderRadius: '8px' }}>
          <h3 style={{ color: '#ff9800' }}>⚠️ Could not parse the migration array</h3>
          <p>The migrations array is empty or the shape of the JSON isn't what we expect. Here is the raw data:</p>
          <pre style={{ background: '#000', padding: '1rem', borderRadius: '4px', overflowX: 'auto', color: '#a6e22e' }}>
            {JSON.stringify(rawData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default App