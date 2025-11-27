import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8080';

const AdvancedAnalytics = ({ fetchWithAuth, datasetId }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (datasetId) {
      fetchAdvancedAnalytics();
    }
  }, [datasetId]);

  const fetchAdvancedAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth(`${API_BASE}/api/dashboards/${datasetId}/advanced`);
      setAnalyticsData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching advanced analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format = 'csv') => {
    setExporting(true);
    try {
      const response = await fetch(`${API_BASE}/api/dashboards/${datasetId}/export?format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_${datasetId}_${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert(`Analytics exported successfully as ${format.toUpperCase()}`);
    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const formatNumber = (value) => {
    if (value == null) return '—';
    return new Intl.NumberFormat().format(value);
  };

  const formatPercent = (value) => {
    if (value == null) return '—';
    return `${value.toFixed(2)}%`;
  };

  const formatCurrency = (value) => {
    if (value == null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  if (!datasetId) {
    return (
      <div className="advanced-analytics">
        <div className="empty-state">
          <p>Select a dataset to view advanced analytics</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="advanced-analytics">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading advanced analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="advanced-analytics">
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return null;
  }

  return (
    <div className="advanced-analytics">
      <div className="analytics-header">
        <h2>Advanced Analytics</h2>
        <div className="export-buttons">
          <button
            className="btn-export"
            onClick={() => handleExport('csv')}
            disabled={exporting}
          >
            Export CSV
          </button>
          <button
            className="btn-export"
            onClick={() => handleExport('json')}
            disabled={exporting}
          >
            Export JSON
          </button>
          <button
            className="btn-export"
            onClick={() => handleExport('pdf')}
            disabled={exporting}
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Performance Metrics */}
      {analyticsData.performanceMetrics && (
        <div className="analytics-section">
          <h3>Performance Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-value">{formatNumber(analyticsData.performanceMetrics.requestsPerSecond)}</div>
              <div className="metric-label">Requests/Second</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{formatNumber(analyticsData.performanceMetrics.avgResponseTime)}</div>
              <div className="metric-label">Avg Response Time (ms)</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{formatPercent(analyticsData.performanceMetrics.successRate)}</div>
              <div className="metric-label">Success Rate</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{formatNumber(analyticsData.performanceMetrics.totalDataPoints)}</div>
              <div className="metric-label">Total Data Points</div>
            </div>
          </div>
        </div>
      )}

      {/* Usage Statistics */}
      {analyticsData.usageStats && (
        <div className="analytics-section">
          <h3>Usage Statistics</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Downloads</span>
              <span className="stat-value">{formatNumber(analyticsData.usageStatistics.totalDownloads)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Unique Users</span>
              <span className="stat-value">{formatNumber(analyticsData.usageStatistics.uniqueUsers)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Peak Usage Time</span>
              <span className="stat-value">{analyticsData.usageStatistics.peakUsageTime || '—'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Data Transfer</span>
              <span className="stat-value">{analyticsData.usageStatistics.totalDataTransferGB} GB</span>
            </div>
          </div>
        </div>
      )}

      {/* Data Quality Metrics */}
      {analyticsData.dataQuality && (
        <div className="analytics-section">
          <h3>Data Quality Metrics</h3>
          <div className="quality-grid">
            <div className="quality-item">
              <div className="quality-bar">
                <div className="quality-fill" style={{ width: `${analyticsData.dataQuality.completeness}%` }}></div>
              </div>
              <div className="quality-info">
                <span className="quality-label">Completeness</span>
                <span className="quality-value">{formatPercent(analyticsData.dataQuality.completeness)}</span>
              </div>
            </div>
            <div className="quality-item">
              <div className="quality-bar">
                <div className="quality-fill" style={{ width: `${analyticsData.dataQuality.accuracy}%` }}></div>
              </div>
              <div className="quality-info">
                <span className="quality-label">Accuracy</span>
                <span className="quality-value">{formatPercent(analyticsData.dataQuality.accuracy)}</span>
              </div>
            </div>
            <div className="quality-item">
              <div className="quality-bar">
                <div className="quality-fill" style={{ width: `${analyticsData.dataQuality.consistency}%` }}></div>
              </div>
              <div className="quality-info">
                <span className="quality-label">Consistency</span>
                <span className="quality-value">{formatPercent(analyticsData.dataQuality.consistency)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Impact */}
      {analyticsData.revenueImpact && (
        <div className="analytics-section">
          <h3>Revenue Impact</h3>
          <div className="revenue-grid">
            <div className="revenue-card">
              <div className="revenue-label">Total Revenue</div>
              <div className="revenue-value">{formatCurrency(analyticsData.revenueImpact.totalRevenue)}</div>
            </div>
            <div className="revenue-card">
              <div className="revenue-label">Avg Transaction</div>
              <div className="revenue-value">{formatCurrency(analyticsData.revenueImpact.avgTransaction)}</div>
            </div>
            <div className="revenue-card">
              <div className="revenue-label">Growth Rate</div>
              <div className="revenue-value growth-positive">
                +{formatPercent(analyticsData.revenueImpact.growthRate)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Consumers */}
      {analyticsData.topConsumers && analyticsData.topConsumers.length > 0 && (
        <div className="analytics-section">
          <h3>Top Consumers</h3>
          <div className="table-responsive">
            <table className="consumers-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Consumer</th>
                  <th>Downloads</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.topConsumers.map((consumer, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{consumer.name}</td>
                    <td>{formatNumber(consumer.downloads)}</td>
                    <td>{formatCurrency(consumer.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style jsx>{`
        .advanced-analytics {
          padding: 24px;
          background: #f7fafc;
          border-radius: 12px;
        }
        
        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .analytics-header h2 {
          margin: 0;
          color: #1a202c;
          font-size: 28px;
          font-weight: 700;
        }
        
        .export-buttons {
          display: flex;
          gap: 12px;
        }
        
        .btn-export {
          padding: 10px 18px;
          background: white;
          border: 2px solid #667eea;
          color: #667eea;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .btn-export:hover:not(:disabled) {
          background: #667eea;
          color: white;
        }
        
        .btn-export:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .analytics-section {
          background: white;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .analytics-section h3 {
          margin: 0 0 20px 0;
          color: #2d3748;
          font-size: 20px;
          font-weight: 700;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        
        .metric-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 24px;
          border-radius: 12px;
          text-align: center;
          color: white;
        }
        
        .metric-icon {
          font-size: 32px;
          margin-bottom: 12px;
        }
        
        .metric-value {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .metric-label {
          font-size: 14px;
          opacity: 0.9;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }
        
        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #f7fafc;
          border-radius: 8px;
        }
        
        .stat-label {
          color: #718096;
          font-size: 14px;
        }
        
        .stat-value {
          color: #2d3748;
          font-weight: 700;
          font-size: 18px;
        }
        
        .quality-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .quality-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .quality-bar {
          width: 100%;
          height: 12px;
          background: #e2e8f0;
          border-radius: 6px;
          overflow: hidden;
        }
        
        .quality-fill {
          height: 100%;
          background: linear-gradient(90deg, #48bb78 0%, #38a169 100%);
          transition: width 0.3s;
        }
        
        .quality-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .quality-label {
          color: #4a5568;
          font-weight: 600;
        }
        
        .quality-value {
          color: #2d3748;
          font-weight: 700;
        }
        
        .revenue-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        
        .revenue-card {
          text-align: center;
          padding: 20px;
          background: #f7fafc;
          border-radius: 12px;
        }
        
        .revenue-label {
          color: #718096;
          font-size: 14px;
          margin-bottom: 8px;
        }
        
        .revenue-value {
          color: #2d3748;
          font-size: 28px;
          font-weight: 700;
        }
        
        .growth-positive {
          color: #38a169;
        }
        
        .table-responsive {
          overflow-x: auto;
        }
        
        .consumers-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .consumers-table th,
        .consumers-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .consumers-table th {
          background: #f7fafc;
          color: #4a5568;
          font-weight: 600;
          font-size: 14px;
        }
        
        .consumers-table td {
          color: #2d3748;
        }
        
        .loading-spinner,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
        }
        
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .alert {
          padding: 16px;
          border-radius: 8px;
        }
        
        .alert-danger {
          background: #fff5f5;
          color: #c53030;
          border: 1px solid #feb2b2;
        }
        
        @media (max-width: 768px) {
          .export-buttons {
            width: 100%;
            flex-direction: column;
          }
          
          .btn-export {
            width: 100%;
          }
          
          .metrics-grid,
          .stats-grid,
          .revenue-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdvancedAnalytics;
