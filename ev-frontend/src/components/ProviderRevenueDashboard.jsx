import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE = 'http://localhost:8080';

const ProviderRevenueDashboard = ({ fetchWithAuth }) => {
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Fetch revenue dashboard data
  const fetchRevenue = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE}/api/provider/revenue/dashboard`;
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append('startDate', dateRange.startDate + 'T00:00:00');
      if (dateRange.endDate) params.append('endDate', dateRange.endDate + 'T23:59:59');
      
      if (params.toString()) url += '?' + params.toString();
      
      const data = await fetchWithAuth(url);
      setRevenueData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  if (loading) {
    return <div className="loading-spinner">Loading revenue data...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  }

  if (!revenueData) {
    return <div>No data available</div>;
  }

  // Prepare chart data
  const trendChartData = {
    labels: revenueData.revenueTrend?.map(t => t.period) || [],
    datasets: [
      {
        label: 'Revenue ($)',
        data: revenueData.revenueTrend?.map(t => t.revenue) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      },
      {
        label: 'Orders',
        data: revenueData.revenueTrend?.map(t => t.orders) || [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  const trendChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Revenue Trend'
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Revenue ($)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Orders'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    }
  };

  const datasetChartData = {
    labels: revenueData.revenueByDataset?.slice(0, 10).map(d => d.datasetName) || [],
    datasets: [{
      label: 'Revenue by Dataset ($)',
      data: revenueData.revenueByDataset?.slice(0, 10).map(d => d.revenue) || [],
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  };

  return (
    <div className="provider-revenue-dashboard">
      <div className="dashboard-header">
        <h2>Revenue Dashboard</h2>
        <div className="date-filters">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            placeholder="Start Date"
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            placeholder="End Date"
          />
          <button className="consumer-btn consumer-btn-primary" onClick={fetchRevenue}>
            Apply Filter
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Revenue</h3>
          <p className="stat-value">${revenueData.totalRevenue?.toFixed(2)}</p>
          <span className="stat-label">All time</span>
        </div>
        <div className="summary-card">
          <h3>Monthly Revenue</h3>
          <p className="stat-value">${revenueData.monthlyRevenue?.toFixed(2)}</p>
          <span className="stat-label">Last 30 days</span>
        </div>
        <div className="summary-card">
          <h3>Total Downloads</h3>
          <p className="stat-value">{revenueData.totalDownloads}</p>
          <span className="stat-label">All time</span>
        </div>
        <div className="summary-card">
          <h3>Active Buyers</h3>
          <p className="stat-value">{revenueData.activeBuyers}</p>
          <span className="stat-label">Last 30 days</span>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="chart-section">
        <Line data={trendChartData} options={trendChartOptions} />
      </div>

      {/* Dataset Performance */}
      <div className="chart-section">
        <Bar data={datasetChartData} options={{ responsive: true, plugins: { title: { display: true, text: 'Top 10 Datasets by Revenue' }}}} />
      </div>

      {/* Buyer Demographics */}
      <div className="demographics-section">
        <h3>Buyer Demographics</h3>
        <div className="demographics-grid">
          {/* By Industry */}
          <div className="demographics-card">
            <h4>By Industry</h4>
            <div className="demographics-list">
              {Object.entries(revenueData.buyerDemographics?.byIndustry || {}).map(([industry, count]) => (
                <div key={industry} className="demographics-item">
                  <span className="demographics-label">{industry}</span>
                  <span className="demographics-value">{count} buyers</span>
                  <div className="demographics-bar">
                    <div 
                      className="demographics-bar-fill" 
                      style={{width: `${(count / Math.max(...Object.values(revenueData.buyerDemographics?.byIndustry || {}))) * 100}%`}}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Region */}
          <div className="demographics-card">
            <h4>By Region</h4>
            <div className="demographics-list">
              {Object.entries(revenueData.buyerDemographics?.byRegion || {}).map(([region, count]) => (
                <div key={region} className="demographics-item">
                  <span className="demographics-label">{region}</span>
                  <span className="demographics-value">{count} buyers</span>
                  <div className="demographics-bar">
                    <div 
                      className="demographics-bar-fill" 
                      style={{width: `${(count / Math.max(...Object.values(revenueData.buyerDemographics?.byRegion || {}))) * 100}%`}}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Organization */}
          <div className="demographics-card">
            <h4>By Organization</h4>
            <div className="demographics-list">
              {Object.entries(revenueData.buyerDemographics?.byOrganization || {})
                .slice(0, 5)
                .map(([org, count]) => (
                <div key={org} className="demographics-item">
                  <span className="demographics-label">{org}</span>
                  <span className="demographics-value">{count} buyers</span>
                  <div className="demographics-bar">
                    <div 
                      className="demographics-bar-fill" 
                      style={{width: `${(count / Math.max(...Object.values(revenueData.buyerDemographics?.byOrganization || {}))) * 100}%`}}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Buyers */}
      <div className="section">
        <h3>Top Buyers</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Buyer</th>
                <th>Organization</th>
                <th>Total Spent</th>
                <th>Purchases</th>
              </tr>
            </thead>
            <tbody>
              {revenueData.buyerDemographics?.topBuyers?.map((buyer, index) => (
                <tr key={index}>
                  <td>{buyer.buyerName}</td>
                  <td>{buyer.organization || 'N/A'}</td>
                  <td>${buyer.totalSpent?.toFixed(2)}</td>
                  <td>{buyer.purchaseCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="section">
        <h3>Recent Transactions</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Dataset</th>
                <th>Buyer</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {revenueData.recentTransactions?.map((tx) => (
                <tr key={tx.orderId}>
                  <td>#{tx.orderId}</td>
                  <td>{tx.datasetName}</td>
                  <td>{tx.buyerName}</td>
                  <td>${tx.amount?.toFixed(2)}</td>
                  <td>{new Date(tx.orderDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge status-${tx.status.toLowerCase()}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .provider-revenue-dashboard {
          padding: 20px;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        .date-filters {
          display: flex;
          gap: 10px;
        }
        .date-filters input {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .summary-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }
        .summary-card h3 {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #666;
        }
        .stat-value {
          font-size: 32px;
          font-weight: bold;
          color: #333;
          margin: 10px 0;
        }
        .stat-label {
          font-size: 12px;
          color: #999;
        }
        .chart-section {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .section {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .section h3 {
          margin-top: 0;
        }
        .table-container {
          overflow-x: auto;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        .data-table th {
          background: #f8f9fa;
          padding: 12px;
          text-align: left;
          font-weight: bold;
          border-bottom: 2px solid #dee2e6;
        }
        .data-table td {
          padding: 12px;
          border-bottom: 1px solid #dee2e6;
        }
        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
        .status-paid {
          background: #d4edda;
          color: #155724;
        }
        .status-pending {
          background: #fff3cd;
          color: #856404;
        }
        .demographics-section {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .demographics-section h3 {
          margin-top: 0;
          margin-bottom: 20px;
        }
        .demographics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
        .demographics-card {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 15px;
        }
        .demographics-card h4 {
          margin: 0 0 15px 0;
          font-size: 16px;
          color: #333;
        }
        .demographics-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .demographics-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .demographics-label {
          font-weight: 500;
          color: #333;
          font-size: 14px;
        }
        .demographics-value {
          font-size: 12px;
          color: #666;
        }
        .demographics-bar {
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }
        .demographics-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #4CAF50 0%, #45a049 100%);
          transition: width 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default ProviderRevenueDashboard;
