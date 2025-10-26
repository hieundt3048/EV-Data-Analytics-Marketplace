import React, { useEffect, useState } from 'react';
import '../styles/index.css';
import '../styles/consumer.css';

const Consumer = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  useEffect(() => {
    // sync tab active classes for CSS (keeps existing styles intact)
    document.querySelectorAll('.tab-content').forEach((t) => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    const btn = document.querySelector(`.tab-btn[data-tab="${activeTab}"]`);
    const content = document.getElementById(activeTab);
    if (btn) btn.classList.add('active');
    if (content) content.classList.add('active');
  }, [activeTab]);

  // Demo actions (replace with real API calls when available)
  const downloadDataset = (id) => alert(`Downloading dataset: ${id}`);
  const viewDatasetAnalytics = (id) => alert(`Viewing analytics for dataset: ${id}`);
  const viewPurchaseHistory = () => alert('Opening purchase history...');
  const searchDatasets = () => alert('Search functionality would be implemented here');

  return (
    <>
      <section className="page-heading">
        <div className="container">
          <div className="header-text">
            <h2>Data Consumer Portal</h2>
            <div className="div-dec" />
          </div>
        </div>
      </section>

      <div className="consumer-tabs">
        <div className="container">
          <div className="tabs-container">
            <button className="tab-btn" data-tab="dashboard" onClick={() => setActiveTab('dashboard')}>Consumer Dashboard</button>
            <button className="tab-btn" data-tab="data-discovery" onClick={() => setActiveTab('data-discovery')}>Data Discovery</button>
            <button className="tab-btn" data-tab="analytics" onClick={() => setActiveTab('analytics')}>Analytics Dashboard</button>
            <button className="tab-btn" data-tab="api" onClick={() => setActiveTab('api')}>API Documentation</button>
          </div>
        </div>
      </div>

      <main className="consumer-container">
        {/* Consumer Dashboard */}
        <div id="dashboard" className="tab-content">
          <section className="consumer-section">
            <h2>My Consumer Dashboard</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
                </div>
                <div className="stat-content"><h3>24</h3><p>Datasets Purchased</p><span className="stat-change positive">+5 this month</span></div>
              </div>

              <div className="stat-card">
                <div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.78-1.18 2.73-3.12 3.16z"/></svg></div>
                <div className="stat-content"><h3>$2,450</h3><p>Total Spending</p><span className="stat-change positive">+$320 this month</span></div>
              </div>

              <div className="stat-card">
                <div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>
                <div className="stat-content"><h3>156</h3><p>API Calls Today</p><span className="stat-change positive">+12% from yesterday</span></div>
              </div>

              <div className="stat-card">
                <div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></div>
                <div className="stat-content"><h3>98%</h3><p>Data Quality Score</p><span className="stat-change positive">+2% improvement</span></div>
              </div>
            </div>

            {/* Quick Actions */}
            <section className="consumer-section">
              <h2>Quick Actions</h2>
              <div className="quick-actions-grid">
                <div className="consumer-card">
                  <div className="card-body">
                    <h5>Discover Data</h5>
                    <p>Browse EV datasets for driving behavior, battery performance, charging usage, and V2G transactions</p>
                    <button className="consumer-btn consumer-btn-primary" onClick={() => setActiveTab('data-discovery')}>Explore Datasets</button>
                  </div>
                </div>

                <div className="consumer-card">
                  <div className="card-body">
                    <h5>Analytics Tools</h5>
                    <p>Access interactive dashboards for SoC/SoH battery metrics, charging frequency, and CO₂ savings analysis</p>
                    <button className="consumer-btn consumer-btn-success" onClick={() => setActiveTab('analytics')}>View Analytics</button>
                  </div>
                </div>

                <div className="consumer-card">
                  <div className="card-body">
                    <h5>API Integration</h5>
                    <p>Integrate EV data into third-party systems (insurance, smart city, fleet management)</p>
                    <button className="consumer-btn consumer-btn-info" onClick={() => setActiveTab('api')}>API Documentation</button>
                  </div>
                </div>

                <div className="consumer-card">
                  <div className="card-body">
                    <h5>Purchase History</h5>
                    <p>View your data purchases, subscriptions, and download history</p>
                    <button className="consumer-btn consumer-btn-warning" onClick={viewPurchaseHistory}>View History</button>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Activity / Purchases */}
            <section className="consumer-section">
              <h2>Recent Data Purchases</h2>
              <div className="table-container">
                <div className="table-header">
                  <h3>Your Recent Activity</h3>
                  <div className="header-actions">
                    <button className="consumer-btn consumer-btn-outline" onClick={() => alert('Exporting history (demo)')}>
                      <svg className="btn-icon" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                      Export History
                    </button>
                  </div>
                </div>

                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Dataset</th>
                        <th>Category</th>
                        <th>Type</th>
                        <th>Purchase Date</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div className="dataset-info">
                            <div className="dataset-icon"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg></div>
                            <div>
                              <div className="dataset-name">Battery Performance Data</div>
                              <div className="dataset-desc">Raw battery metrics and SOH analysis</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="category-badge battery">Battery Data</span></td>
                        <td><span className="type-badge raw">Raw Data</span></td>
                        <td>2024-03-15</td>
                        <td>$299</td>
                        <td><span className="status-badge completed">Downloaded</span></td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-icon" title="Download Again" onClick={() => downloadDataset(1)}>
                              <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                            </button>
                            <button className="btn-icon" title="View Analytics" onClick={() => viewDatasetAnalytics(1)}>
                              <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className="dataset-info">
                            <div className="dataset-icon"><svg viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>
                            <div>
                              <div className="dataset-name">Charging Behavior Analysis</div>
                              <div className="dataset-desc">Analyzed charging patterns and station usage</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="category-badge charging">Charging Data</span></td>
                        <td><span className="type-badge analyzed">Analyzed Data</span></td>
                        <td>2024-03-10</td>
                        <td>$249</td>
                        <td><span className="status-badge completed">Downloaded</span></td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-icon" title="Download Again" onClick={() => downloadDataset(2)}>
                              <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                            </button>
                            <button className="btn-icon" title="View Analytics" onClick={() => viewDatasetAnalytics(2)}>
                              <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </section>
        </div>

        {/* Data Discovery */}
        <div id="data-discovery" className="tab-content">
          <section className="consumer-section">
            <h2>1. Search & Discover Data</h2>
            <div className="consumer-card">
              <div className="card-body">
                <h5>Find the EV Data You Need</h5>
                <p className="section-description">Browse comprehensive EV datasets including driving behavior, battery performance, charging station usage, and V2G transactions.</p>

                <div className="search-filters">
                  <div className="filter-group"><label htmlFor="data-category">Data Category</label><select id="data-category"><option value="">All Categories</option><option value="driving-behavior">Driving Behavior</option><option value="battery-performance">Battery Performance</option><option value="charging-usage">Charging Station Usage</option><option value="v2g-transactions">V2G Transactions</option><option value="vehicle-telemetry">Vehicle Telemetry</option><option value="energy-consumption">Energy Consumption</option></select></div>
                  <div className="filter-group"><label htmlFor="time-range">Time Range</label><select id="time-range"><option value="">Any Time</option><option value="last-7-days">Last 7 Days</option><option value="last-30-days">Last 30 Days</option><option value="last-6-months">Last 6 Months</option><option value="last-year">Last Year</option><option value="custom">Custom Range</option></select></div>
                  <div className="filter-group"><label htmlFor="region">Region</label><select id="region"><option value="">All Regions</option><option value="north-america">North America</option><option value="europe">Europe</option><option value="asia">Asia</option><option value="global">Global</option></select></div>
                  <div className="filter-group"><label htmlFor="vehicle-type">Vehicle Type</label><select id="vehicle-type"><option value="">All Types</option><option value="sedan">Sedan</option><option value="suv">SUV</option><option value="truck">Truck</option><option value="commercial">Commercial</option></select></div>
                  <div className="filter-group"><label htmlFor="battery-type">Battery Type</label><select id="battery-type"><option value="">All Types</option><option value="lithium-ion">Lithium-ion</option><option value="solid-state">Solid State</option><option value="lifepo4">LiFePO4</option></select></div>
                  <div className="filter-group"><label htmlFor="data-format">Data Format</label><select id="data-format"><option value="">All Formats</option><option value="raw">Raw Data</option><option value="analyzed">Analyzed Data</option><option value="api">API Access</option></select></div>
                </div>

                <button className="consumer-btn consumer-btn-primary" onClick={searchDatasets}><svg className="btn-icon" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>Search Datasets</button>
              </div>
            </div>

            {/* Pricing & Plans */}
            <section className="consumer-section">
              <h2>2. Purchase & Subscription Plans</h2>
              <div className="consumer-card">
                <div className="card-body">
                  <h5>Flexible Data Access Options</h5>
                  <p className="section-description">Choose from pay-per-download, subscription plans, or API access for raw data or analyzed insights.</p>

                  <div className="pricing-options">
                    <div className="pricing-card">
                      <h4>Pay-per-Download</h4>
                      <div className="price">$50 - $500</div>
                      <p>One-time purchase of specific datasets</p>
                      <ul>
                        <li>Immediate access to selected data</li>
                        <li>CSV, JSON, or XML formats</li>
                        <li>Full ownership rights</li>
                        <li>Raw or analyzed data options</li>
                      </ul>
                      <button className="consumer-btn consumer-btn-outline">Select Plan</button>
                    </div>
                    <div className="pricing-card featured">
                      <h4>Subscription</h4>
                      <div className="price">$199<span>/month</span></div>
                      <p>Unlimited access to all standard datasets</p>
                      <ul>
                        <li>Monthly data updates</li>
                        <li>Dashboard access included</li>
                        <li>Priority support</li>
                        <li>Both raw and analyzed data</li>
                      </ul>
                      <button className="consumer-btn consumer-btn-primary">Select Plan</button>
                    </div>
                    <div className="pricing-card">
                      <h4>API Access</h4>
                      <div className="price">Custom</div>
                      <p>Real-time data integration</p>
                      <ul>
                        <li>REST API endpoints</li>
                        <li>Real-time data streams</li>
                        <li>Custom integration support</li>
                        <li>Webhook notifications</li>
                      </ul>
                      <button className="consumer-btn consumer-btn-outline">Contact Sales</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Featured datasets */}
            <section className="consumer-section">
              <h2>Popular Datasets</h2>
              <div className="datasets-grid">
                <div className="dataset-card">
                  <div className="dataset-icon"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg></div>
                  <h4>Battery Health (SOH)</h4>
                  <p>State of Health metrics from 5,000+ EVs across multiple manufacturers with detailed degradation analysis</p>
                  <div className="dataset-meta"><span className="size">2.4 GB</span><span className="records">250K records</span><span className="format raw">Raw Data</span></div>
                  <div className="dataset-price">$299</div>
                  <button className="consumer-btn consumer-btn-outline">View Details & Purchase</button>
                </div>

                <div className="dataset-card">
                  <div className="dataset-icon"><svg viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>
                  <h4>Charging Behavior</h4>
                  <p>Charging session data including duration, energy consumed, and charger types for smart city planning.</p>
                  <div className="dataset-meta"><span className="size">1.8 GB</span><span className="records">180K records</span><span className="format analyzed">Analyzed Data</span></div>
                  <div className="dataset-price">$249</div>
                  <button className="consumer-btn consumer-btn-outline">View Details & Purchase</button>
                </div>

                <div className="dataset-card">
                  <div className="dataset-icon"><svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>
                  <h4>Driving Patterns</h4>
                  <p>Daily mileage, speed profiles, route efficiency and regenerative braking usage analytics</p>
                  <div className="dataset-meta"><span className="size">3.2 GB</span><span className="records">320K records</span><span className="format raw">Raw Data</span></div>
                  <div className="dataset-price">$349</div>
                  <button className="consumer-btn consumer-btn-outline">View Details & Purchase</button>
                </div>

                <div className="dataset-card">
                  <div className="dataset-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div>
                  <h4>V2G Transactions</h4>
                  <p>Vehicle-to-Grid energy transactions, pricing data, and grid stabilization metrics</p>
                  <div className="dataset-meta"><span className="size">1.5 GB</span><span className="records">150K records</span><span className="format analyzed">Analyzed Data</span></div>
                  <div className="dataset-price">$199</div>
                  <button className="consumer-btn consumer-btn-outline">View Details & Purchase</button>
                </div>
              </div>
            </section>
          </section>
        </div>

        {/* Analytics Dashboard */}
        <div id="analytics" className="tab-content">
          <section className="consumer-section">
            <div className="dashboard-header">
              <h2>Analytics Dashboard</h2>
              <div className="header-actions">
                <select id="timeRange" defaultValue="30d">
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="1y">Last Year</option>
                </select>
                <button className="consumer-btn consumer-btn-outline" onClick={() => alert('Export Report (demo)')}>
                  <svg className="btn-icon" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                  Export Report
                </button>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card"><div className="stat-icon"/><div className="stat-content"><h3>2.4M</h3><p>Data Points Analyzed</p><span className="stat-change positive">+18.3%</span></div></div>
              <div className="stat-card"><div className="stat-icon"/><div className="stat-content"><h3>84.2%</h3><p>Average Battery Efficiency</p><span className="stat-change positive">+2.1%</span></div></div>
              <div className="stat-card"><div className="stat-icon"/><div className="stat-content"><h3>156km</h3><p>Average Daily Range</p><span className="stat-change positive">+5.7%</span></div></div>
              <div className="stat-card"><div className="stat-icon"/><div className="stat-content"><h3>12.4t</h3><p>CO₂ Savings</p><span className="stat-change positive">+15.2%</span></div></div>
            </div>

            <div className="charts-grid">
              <div className="chart-card large">
                <div className="chart-header">
                  <h4>Battery Health Trends (SoC/SoH)</h4>
                  <div className="chart-legend">
                    <div className="legend-item"><div className="legend-color primary"></div><span>State of Health</span></div>
                    <div className="legend-item"><div className="legend-color secondary"></div><span>State of Charge</span></div>
                  </div>
                </div>
                <div className="chart-placeholder">
                  <div className="line-chart">
                    <div className="chart-line primary" style={{ height: '85%' }}></div>
                    <div className="chart-line secondary" style={{ height: '65%' }}></div>
                    <div className="chart-points">
                      <span>Jan</span>
                      <span>Feb</span>
                      <span>Mar</span>
                      <span>Apr</span>
                      <span>May</span>
                      <span>Jun</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header"><h4>Charging Frequency Analysis</h4></div>
                <div className="chart-placeholder">
                  <div className="pie-chart">
                    <div className="pie-segment" style={{ ['--percentage']: 45, ['--color']: '#64FFDA' }}></div>
                    <div className="pie-segment" style={{ ['--percentage']: 30, ['--color']: '#3B82F6' }}></div>
                    <div className="pie-segment" style={{ ['--percentage']: 15, ['--color']: '#10B981' }}></div>
                    <div className="pie-segment" style={{ ['--percentage']: 10, ['--color']: '#F59E0B' }}></div>
                  </div>
                  <div className="pie-legend">
                    <div className="legend-item"><div className="legend-color" style={{ background: '#64FFDA' }}></div><span>Home (45%)</span></div>
                    <div className="legend-item"><div className="legend-color" style={{ background: '#3B82F6' }}></div><span>Work (30%)</span></div>
                    <div className="legend-item"><div className="legend-color" style={{ background: '#10B981' }}></div><span>Public (15%)</span></div>
                    <div className="legend-item"><div className="legend-color" style={{ background: '#F59E0B' }}></div><span>Fast (10%)</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <section className="consumer-section">
              <h2>AI-Powered Insights & Trend Analysis</h2>
              <div className="insights-grid">
                <div className="insight-card">
                  <div className="insight-header"><h4>Battery Optimization Trends</h4><span className="insight-confidence high">High</span></div>
                  <div className="insight-content">
                    <p>Analysis shows optimal charging habits across your dataset. Continue avoiding frequent fast charging to maintain current health levels with 98.2% efficiency.</p>
                    <div className="insight-metrics">
                      <div className="metric"><span className="metric-value">98.2%</span><span className="metric-label">Health Score</span></div>
                      <div className="metric"><span className="metric-value">0.8%</span><span className="metric-label">Monthly Degradation</span></div>
                    </div>
                  </div>
                  <div className="insight-actions"><button className="consumer-btn consumer-btn-outline">View Detailed Report</button></div>
                </div>

                <div className="insight-card">
                  <div className="insight-header"><h4>Charging Infrastructure Demand</h4><span className="insight-confidence medium">Medium</span></div>
                  <div className="insight-content">
                    <p>Consider shifting 15% of home charging to off-peak hours (10 PM - 6 AM) to reduce electricity costs by approximately $45 monthly and optimize grid load.</p>
                    <div className="insight-metrics">
                      <div className="metric"><span className="metric-value">67%</span><span className="metric-label">Peak Usage</span></div>
                      <div className="metric"><span className="metric-value">$45</span><span className="metric-label">Potential Savings</span></div>
                    </div>
                  </div>
                  <div className="insight-actions"><button className="consumer-btn consumer-btn-outline">Optimize Schedule</button></div>
                </div>

                <div className="insight-card">
                  <div className="insight-header"><h4>Consumption Pattern Forecast</h4><span className="insight-confidence high">High</span></div>
                  <div className="insight-content"><p>Weekend driving patterns show increased EV usage for family trips, suggesting range anxiety is decreasing with improved charging infrastructure.</p>
                    <div className="insight-metrics">
                      <div className="metric"><span className="metric-value">+45%</span><span className="metric-label">Weekend Mileage</span></div>
                      <div className="metric"><span className="metric-value">18%</span><span className="metric-label">Long-distance Trips</span></div>
                    </div>
                  </div>
                  <div className="insight-actions"><button className="consumer-btn consumer-btn-outline">View Forecast Details</button></div>
                </div>
              </div>
            </section>

            {/* Additional Analytics Tools */}
            <section className="consumer-section">
              <h2>Additional Analytics Tools</h2>
              <div className="analytics-tools-grid">
                <div className="tool-card"><div className="tool-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg></div><h4>Route Efficiency Analysis</h4><p>Analyze driving routes for optimal energy consumption and charging stops</p><button className="consumer-btn consumer-btn-outline">Launch Tool</button></div>
                <div className="tool-card"><div className="tool-icon"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg></div><h4>Battery Degradation Model</h4><p>Predict battery lifespan based on usage patterns and charging behavior</p><button className="consumer-btn consumer-btn-outline">Launch Tool</button></div>
                <div className="tool-card"><div className="tool-icon"><svg viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div><h4>Charging Cost Calculator</h4><p>Calculate optimal charging times and locations for cost efficiency</p><button className="consumer-btn consumer-btn-outline">Launch Tool</button></div>
              </div>
            </section>
          </section>
        </div>

        {/* API Documentation */}
        <div id="api" className="tab-content">
          <section className="consumer-section">
            <div className="dashboard-header">
              <h2>API Documentation & Integration</h2>
              <div className="header-actions">
                <button className="consumer-btn consumer-btn-primary" onClick={() => setShowApiKeyModal(true)}>
                  <svg className="btn-icon" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                  Generate API Key
                </button>
                <button className="consumer-btn consumer-btn-outline" onClick={() => alert('Downloading SDK (demo)')}>
                  <svg className="btn-icon" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                  Download SDK
                </button>
              </div>
            </div>

            {/* Quick Start */}
            <div className="api-quickstart">
              <h3>Quick Start Guide</h3>
              <div className="quickstart-steps">
                <div className="step"><div className="step-number">1</div><div className="step-content"><h4>Get Your API Key</h4><p>Generate an API key from your dashboard with appropriate permissions for third-party integration</p></div></div>
                <div className="step"><div className="step-number">2</div><div className="step-content"><h4>Make Your First Request</h4><p>Use the API key to authenticate and make requests to our endpoints</p></div></div>
                <div className="step"><div className="step-number">3</div><div className="step-content"><h4>Integrate & Scale</h4><p>Implement the API in your applications and scale as needed with real-time data streams</p></div></div>
              </div>
            </div>

            {/* Core Endpoints */}
            <div className="api-section">
              <h3>Core API Endpoints</h3>
              <div className="api-card">
                <div className="api-header"><h4>Get Battery Health Data</h4><span className="api-method get">GET</span></div>
                <div className="api-content">
                  <div className="endpoint-url"><code>GET /api/v1/battery/health</code></div>
                  <p>Retrieve battery state of health (SoH) and state of charge (SoC) data for insurance and fleet management applications.</p>
                </div>
              </div>

              <div className="api-card">
                <div className="api-header"><h4>Get Charging Sessions</h4><span className="api-method get">GET</span></div>
                <div className="api-content">
                  <div className="endpoint-url"><code>GET /api/v1/charging/sessions</code></div>
                  <p>Retrieve detailed charging session data including duration, energy consumed, and charger types for smart city planning.</p>
                </div>
              </div>

              <div className="api-card">
                <div className="api-header"><h4>Get Driving Patterns</h4><span className="api-method get">GET</span></div>
                <div className="api-content">
                  <div className="endpoint-url"><code>GET /api/v1/driving/patterns</code></div>
                  <p>Access driving pattern data including mileage, speed profiles, and route efficiency for insurance risk assessment.</p>
                </div>
              </div>
            </div>

            {/* Integration Examples */}
            <div className="api-section">
              <h3>Integration Examples</h3>
              <div className="integration-examples">
                <div className="integration-card"><h4>Insurance Companies</h4><p>Integrate EV data for usage-based insurance models, risk assessment, and personalized premiums.</p><ul><li>Driving behavior analysis</li><li>Battery health monitoring</li><li>Charging pattern assessment</li></ul></div>
                <div className="integration-card"><h4>Smart City Planning</h4><p>Utilize EV data for infrastructure planning, traffic management, and energy grid optimization.</p><ul><li>Charging station demand analysis</li><li>Traffic flow optimization</li><li>Energy consumption forecasting</li></ul></div>
                <div className="integration-card"><h4>Fleet Management</h4><p>Optimize EV fleet operations with real-time data on vehicle performance and charging needs.</p><ul><li>Route optimization</li><li>Maintenance scheduling</li><li>Charging infrastructure planning</li></ul></div>
              </div>
            </div>

            {/* SDKs & Libraries */}
            <div className="api-section">
              <h3>SDKs & Libraries</h3>
              <div className="sdks-grid">
                <div className="sdk-card"><div className="sdk-icon"><svg viewBox="0 0 24 24"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4z"/></svg></div><h4>JavaScript</h4><p>Official JavaScript SDK for browser and Node.js applications with real-time data streaming</p><div className="sdk-actions"><button className="consumer-btn consumer-btn-outline">View Docs</button><button className="consumer-btn consumer-btn-primary">Install</button></div></div>
<div className="sdk-card"><div className="sdk-icon"><svg viewBox="0 0 24 24"><path d="M3 3h18v18H3V3zm4.73 15.04c.4.85 1.2 1.55 2.45 1.55 1.57 0 2.53-.8 2.53-2.55v-5.78h-1.7V17c0 .86-.35 1.08-.9 1.08-.58 0-.82-.4-.82-.87l-1.19.83z"/></svg></div><h4>Python</h4><p>Python client library for data analysis and integration with pandas and numpy support</p><div className="sdk-actions"><button className="consumer-btn consumer-btn-outline">View Docs</button><button className="consumer-btn consumer-btn-primary">Install</button></div></div>
                <div className="sdk-card"><div className="sdk-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></div><h4>Java</h4><p>Java library for enterprise applications and Android with built-in authentication</p><div className="sdk-actions"><button className="consumer-btn consumer-btn-outline">View Docs</button><button className="consumer-btn consumer-btn-primary">Install</button></div></div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div id="apiKeyModal" className="modal" onClick={(e) => { if (e.target.id === 'apiKeyModal') setShowApiKeyModal(false); }}>
          <div className="modal-content">
            <div className="modal-header"><h3>Generate New API Key</h3><button className="modal-close" onClick={() => setShowApiKeyModal(false)}>&times;</button></div>
            <div className="modal-body">
              <form className="api-key-form">
                <div className="form-group"><label htmlFor="keyName">Key Name</label><input type="text" id="keyName" placeholder="e.g., Insurance App Integration" required/></div>
                <div className="form-group"><label htmlFor="integrationType">Integration Type</label><select id="integrationType"><option value="insurance">Insurance System</option><option value="smart-city">Smart City Platform</option><option value="fleet-management">Fleet Management</option><option value="research">Research & Analysis</option><option value="custom">Custom Integration</option></select></div>
                <div className="form-group"><label htmlFor="keyPermissions">Permissions</label><div className="permissions-grid"><label className="permission-checkbox"><input type="checkbox" name="keyPermissions" value="data_read" defaultChecked/>Read EV Data</label><label className="permission-checkbox"><input type="checkbox" name="keyPermissions" value="analytics"/>Access Analytics</label><label className="permission-checkbox"><input type="checkbox" name="keyPermissions" value="realtime"/>Real-time Streams</label><label className="permission-checkbox"><input type="checkbox" name="keyPermissions" value="export"/>Data Export</label></div></div>
                <div className="form-group"><label htmlFor="rateLimit">Rate Limit (requests/hour)</label><input type="number" id="rateLimit" defaultValue={1000} min={100} max={10000}/></div>
              </form>
            </div>
            <div className="modal-footer"><button className="consumer-btn consumer-btn-outline" onClick={() => setShowApiKeyModal(false)}>Cancel</button><button className="consumer-btn consumer-btn-primary" onClick={() => { alert('API key generated (demo)'); setShowApiKeyModal(false); }}>Generate Key</button></div>
          </div>
        </div>
      )}
    </>
  );
};

export default Consumer;

