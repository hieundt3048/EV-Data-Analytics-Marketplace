import React, { useEffect, useState, useRef } from 'react';
import '../styles/index.css';
import '../styles/provider.css';

const TITLE_MAP = {
  dashboard: 'Data Provider',
  'data-management': 'Register & Manage Data Sources',
  'policy-pricing': 'Sharing Policies & Pricing',
  'revenue-tracking': 'Data Revenue Tracking',
  'security-anonymization': 'Data Security & Anonymization',
};

const Provider = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [title, setTitle] = useState(TITLE_MAP['dashboard']);
  const [stats, setStats] = useState({ totalRevenue: '$0', downloads: '0', buyers: '0' });
  const revenueDataRef = useRef([120, 200, 180, 220, 260, 300, 280, 320, 350, 300, 340, 360]);
  const [revFilter, setRevFilter] = useState('all');
  const [miniCols, setMiniCols] = useState([]);

  // Modal promise helper
  const pendingConfirmRef = useRef(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    // init stats
    setStats({ totalRevenue: '$12,450', downloads: '1,234', buyers: '86' });
    renderMiniChart(revFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function switchTab(tabId) {
    setActiveTab(tabId);
    setTitle(TITLE_MAP[tabId] || 'Provider');
    if (tabId === 'revenue-tracking') renderMiniChart(revFilter);
  }

  function handleUpload(e) {
    e.preventDefault();
    const form = e.target;
    alert(`Dataset "${form.dataName.value || '<no name>'}" uploaded!`);
    switchTab('dashboard');
  }

  function handlePolicySubmit(e) {
    e.preventDefault();
    alert('Policy saved!');
    switchTab('dashboard');
  }

  function handleSecuritySubmit(e) {
    e.preventDefault();
    const remove = e.target.removePii?.checked;
    if (remove) {
      showConfirm().then(ok => {
        alert(ok ? 'Security settings applied (remove PII confirmed)' : 'Operation cancelled.');
        if (ok) switchTab('dashboard');
      });
    } else {
      alert('Security settings applied!');
      switchTab('dashboard');
    }
  }

  function showConfirm() {
    return new Promise(resolve => {
      pendingConfirmRef.current = resolve;
      setConfirmVisible(true);
    });
  }

  function closeConfirm(result) {
    setConfirmVisible(false);
    if (pendingConfirmRef.current) pendingConfirmRef.current(result);
    pendingConfirmRef.current = null;
  }

  function exportCsv() {
    alert('Export CSV!');
  }

  function renderMiniChart(filter = 'all') {
    const sel = filter;
    let data = [...revenueDataRef.current];
    if (sel === '6') data = data.slice(-6);
    if (sel === '3') data = data.slice(-3);
    const max = Math.max(...data, 1);
    setMiniCols(data.map(v => Math.round((v / max) * 100) + '%'));
  }

  return (
    <div className="provider-page">
      <section className="page-heading">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="header-text">
                <h2>{title}</h2>
                <div className="div-dec" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="main-tabs">
        <div className="container">
          <div className="tabs-container">
            <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => switchTab('dashboard')} data-tab="dashboard">Provider Dashboard</button>
            <button className={`tab-btn ${activeTab === 'data-management' ? 'active' : ''}`} onClick={() => switchTab('data-management')} data-tab="data-management">Data Management</button>
            <button className={`tab-btn ${activeTab === 'policy-pricing' ? 'active' : ''}`} onClick={() => switchTab('policy-pricing')} data-tab="policy-pricing">Policy & Pricing</button>
            <button className={`tab-btn ${activeTab === 'revenue-tracking' ? 'active' : ''}`} onClick={() => switchTab('revenue-tracking')} data-tab="revenue-tracking">Revenue Tracking</button>
            <button className={`tab-btn ${activeTab === 'security-anonymization' ? 'active' : ''}`} onClick={() => switchTab('security-anonymization')} data-tab="security-anonymization">Security & Anonymization</button>
          </div>
        </div>
      </div>

      <main className="main-container">
        {/* Dashboard Tab */}
        <div id="dashboard" className={`tab-content ${activeTab === 'dashboard' ? 'active' : ''}`} style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
          <section className="main-section">
            <h2>1. Register & Manage Data Sources</h2>
            <div className="main-card">
              <div className="card-body">
                <h5>Providing EV data</h5>
                <ul>
                  <li>Put battery, journey, charging, and electricity transaction data on the marketplace</li>
                  <li>Choose to share data as <strong>Raw</strong> or <strong>Analyzed</strong></li>
                  <li>Manage dataset lists that have been uploaded, edited, or deleted</li>
                </ul>
                <button className="btn btn-primary" onClick={() => switchTab('data-management')}>Register & Manage Data Sources</button>
              </div>
            </div>
          </section>

          <section className="main-section">
            <h2>2. Setting up sharing policies & pricing</h2>
            <div className="main-card">
              <div className="card-body">
                <h5>Data Policy & Pricing</h5>
                <ul>
                  <li>Data pricing by download, capacity, or subscription</li>
                  <li>Usage rights control</li>
                  <li>Free option for public data</li>
                </ul>
                <button className="btn btn-success" onClick={() => switchTab('policy-pricing')}>Setting up sharing policies & pricing</button>
              </div>
            </div>
          </section>

          <section className="main-section">
            <h2>3. Data revenue tracking</h2>
            <div className="main-card">
              <div className="card-body">
                <h5>Reports & Statistics</h5>
                <ul>
                  <li>View data downloads and revenue</li>
                  <li>Analyze customer behavior</li>
                  <li>Download detailed reports</li>
                </ul>
                <button className="btn btn-warning" onClick={() => switchTab('revenue-tracking')}>Data revenue tracking</button>
              </div>
            </div>
          </section>

          <section className="main-section">
            <h2>4. Data Security & Anonymization</h2>
            <div className="main-card">
              <div className="card-body">
                <h5>Data Protection & Privacy</h5>
                <ul>
                  <li>Remove PII before sharing</li>
                  <li>GDPR & CCPA compliant</li>
                  <li>Permission control</li>
                </ul>
                <button className="btn btn-info" onClick={() => switchTab('security-anonymization')}>Data Security & Anonymization</button>
              </div>
            </div>
          </section>
        </div>

        {/* Data Management Tab */}
        <div id="data-management" className={`tab-content ${activeTab === 'data-management' ? 'active' : ''}`} style={{ display: activeTab === 'data-management' ? 'block' : 'none' }}>
          <main className="form-mini">
            <form onSubmit={handleUpload}>
              <label>Data name:</label>
              <input name="dataName" type="text" placeholder="Enter the data name..." required />

              <label>Describe:</label>
              <textarea name="describe" placeholder="Enter a short description..." />

              <label>Data type:</label>
              <select name="dataType">
                <option>Battery</option>
                <option>Trip</option>
                <option>Charging</option>
                <option>Electricity transactions</option>
              </select>

              <label>Share mode:</label>
              <select name="shareMode">
                <option>Raw (original data)</option>
                <option>Analyzed</option>
              </select>

              <label>Data file:</label>
              <input name="dataFile" type="file" accept=".csv,.json,.xlsx" required />

              <div className="form-btn-group">
                <button type="submit" className="btn btn-primary">📤 Upload</button>
                <button type="button" className="btn-back" onClick={() => switchTab('dashboard')}>⬅ Come back</button>
              </div>
            </form>
          </main>
        </div>

        {/* Policy & Pricing Tab */}
        <div id="policy-pricing" className={`tab-content ${activeTab === 'policy-pricing' ? 'active' : ''}`} style={{ display: activeTab === 'policy-pricing' ? 'block' : 'none' }}>
          <main className="form-mini">
            <form onSubmit={handlePolicySubmit}>
              <label>Dataset (mock):</label>
              <select name="dataset">
                <option>Battery Health - 2025</option>
                <option>Charging Sessions - Q1</option>
                <option>Driving Patterns - Sample</option>
              </select>

              <label>Pricing model:</label>
              <select name="pricingModel">
                <option>Per download</option>
                <option>Subscription</option>
                <option>By data size</option>
              </select>

              <label>Price (USD):</label>
              <input name="price" type="number" min="0" step="0.01" defaultValue={99} />

              <label>License:</label>
              <select name="license">
                <option>Research / Academic</option>
                <option>Commercial</option>
                <option>Internal use only</option>
              </select>

              <label>Visibility:</label>
              <select name="visibility">
                <option>Public</option>
                <option>Restricted</option>
                <option>Private</option>
              </select>

              <label><input type="checkbox" name="freePreview" defaultChecked /> Allow free preview sample</label>

              <label>Policy description:</label>
              <textarea name="policyDesc" placeholder="Short description of policy and usage terms..." />

              <div className="form-btn-group">
                <button type="submit" className="btn btn-primary">Save Policy</button>
                <button type="button" className="btn-back" onClick={() => switchTab('dashboard')}>⬅ Come back</button>
              </div>
            </form>
          </main>
        </div>

        {/* Revenue Tracking */}
        <div id="revenue-tracking" className={`tab-content ${activeTab === 'revenue-tracking' ? 'active' : ''}`} style={{ display: activeTab === 'revenue-tracking' ? 'block' : 'none' }}>
          <div className="stat-grid" style={{ marginTop: 12 + 'px' }}>
            <div className="stat-box">
              <div className="num" id="stat-total-revenue">{stats.totalRevenue}</div>
              <div className="label">Total revenue</div>
            </div>
            <div className="stat-box">
              <div className="num" id="stat-downloads">{stats.downloads}</div>
              <div className="label">Downloads</div>
            </div>
            <div className="stat-box">
              <div className="num" id="stat-buyers">{stats.buyers}</div>
              <div className="label">Unique buyers</div>
            </div>
          </div>

          <div style={{ marginTop: 8 + 'px' }}>
            <label htmlFor="revMonth">Filter month:</label>
            <select id="revMonth" value={revFilter} onChange={e => { setRevFilter(e.target.value); renderMiniChart(e.target.value); }}>
              <option value="all">Last 12 months</option>
              <option value="6">Last 6 months</option>
              <option value="3">Last 3 months</option>
            </select>
          </div>

          <div style={{ marginTop: 12 + 'px' }} id="chartArea">
            <div className="mini-chart" id="miniChartContainer">
              {miniCols.map((h, i) => (
                <div key={i} className="col" style={{ height: h }} />
              ))}
            </div>
          </div>

          <div style={{ marginTop: 14 + 'px' }}>
            <h4>Recent downloads</h4>
            <table className="table-small">
              <thead>
                <tr><th>Dataset</th><th>User</th><th>Date</th><th>Revenue</th></tr>
              </thead>
              <tbody>
                <tr><td>Battery Health - 2025</td><td>Acme Labs</td><td>2025-09-12</td><td>$299</td></tr>
                <tr><td>Charging Sessions - Q1</td><td>GridCo</td><td>2025-09-02</td><td>$199</td></tr>
                <tr><td>Driving Patterns - Sample</td><td>DriveAI</td><td>2025-08-21</td><td>$149</td></tr>
              </tbody>
            </table>
          </div>

          <div className="form-mini" style={{ marginTop: 12 + 'px' }}>
            <div className="form-btn-group">
              <button type="button" className="btn btn-primary" onClick={exportCsv}>Export CSV</button>
              <button type="button" className="btn-back" onClick={() => switchTab('dashboard')}>⬅ Come back</button>
            </div>
          </div>
        </div>

        {/* Security & Anonymization */}
        <div id="security-anonymization" className={`tab-content ${activeTab === 'security-anonymization' ? 'active' : ''}`} style={{ display: activeTab === 'security-anonymization' ? 'block' : 'none' }}>
          <main className="form-mini">
            <form onSubmit={handleSecuritySubmit}>
              <label>Dataset (mock):</label>
              <select name="dataset">
                <option>Battery Health - 2025</option>
                <option>Charging Sessions - Q1</option>
                <option>Driving Patterns - Sample</option>
              </select>

              <label><input id="removePii" type="checkbox" name="removePii" /> Remove PII (irreversible)</label>

              <label>Anonymization method:</label>
              <select name="method">
                <option>Mask (replace sensitive fields)</option>
                <option>Hash (deterministic)</option>
                <option>Aggregate (roll-up)</option>
              </select>

              <label>Access control:</label>
              <select name="access">
                <option>Open</option>
                <option>Whitelist</option>
                <option>Approval required</option>
              </select>

              <label><input type="checkbox" name="audit" /> Enable audit logging</label>

              <label>Notes / instructions:</label>
              <textarea name="notes" placeholder="Notes for reviewers or processors..." />

              <div className="form-btn-group">
                <button type="submit" className="btn btn-primary">Apply Settings</button>
                <button type="button" className="btn-back" onClick={() => switchTab('dashboard')}>⬅ Come back</button>
              </div>
            </form>
          </main>
        </div>
      </main>

      {/* Confirm modal */}
      {confirmVisible && (
        <div id="confirmModal" className="confirm-modal" aria-hidden={!confirmVisible} style={{ display: 'flex' }}>
          <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="confirmTitle">
            <h3 id="confirmTitle">Confirm Remove PII</h3>
            <p>Removing personally identifiable information (PII) is irreversible in this operation. Are you sure you want to proceed?</p>
            <div className="actions">
              <button className="btn-back" onClick={() => closeConfirm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => closeConfirm(true)}>Yes, proceed</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Provider;
