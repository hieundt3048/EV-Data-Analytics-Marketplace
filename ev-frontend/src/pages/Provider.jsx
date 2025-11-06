import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../utils/axiosConfig';
import '../styles/index.css';
import '../styles/provider.css';

const API_BASE_URL = ''; // Empty since axiosInstance already has baseURL

const TITLE_MAP = {
  'data-management': 'Register & Manage Data Sources',
  'policy-pricing': 'Sharing Policies & Pricing',
  'revenue-tracking': 'Data Revenue Tracking',
  'security-anonymization': 'Data Security & Anonymization',
};

const Provider = () => {
  const [activeTab, setActiveTab] = useState('data-management');
  const [title, setTitle] = useState(TITLE_MAP['data-management']);
  const [stats, setStats] = useState({ totalRevenue: '$0', downloads: '0', buyers: '0' });
  const revenueDataRef = useRef([120, 200, 180, 220, 260, 300, 280, 320, 350, 300, 340, 360]);
  const [revFilter, setRevFilter] = useState('all');
  const [miniCols, setMiniCols] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState(null);

  // Modal promise helper
  const pendingConfirmRef = useRef(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    // init stats and load data
    fetchRevenueStats();
    fetchDatasets();
    renderMiniChart(revFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch datasets from backend
  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/provider/datasets');
      setDatasets(response.data);
    } catch (error) {
      console.error('Error fetching datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch revenue statistics
  const fetchRevenueStats = async () => {
    try {
      // Mock providerId = 1, in production get from auth context
      const response = await axiosInstance.get('/provider/revenue/report?providerId=1');
      const data = response.data;
      setStats({
        totalRevenue: `$${data.totalRevenue?.toFixed(2) || '0.00'}`,
        downloads: data.totalOrders?.toString() || '0',
        buyers: '86' // Mock, would need separate API
      });
      
      // Update monthly revenue data
      if (data.monthlyRevenue && data.monthlyRevenue.length > 0) {
        const monthlyData = data.monthlyRevenue.map(m => m.revenue || 0);
        revenueDataRef.current = monthlyData;
        renderMiniChart(revFilter);
      }
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
      // Keep default stats on error
      setStats({ totalRevenue: '$0.00', downloads: '0', buyers: '0' });
    }
  };

  function switchTab(tabId) {
    setActiveTab(tabId);
    setTitle(TITLE_MAP[tabId] || 'Provider');
    if (tabId === 'revenue-tracking') {
      fetchRevenueStats();
      renderMiniChart(revFilter);
    }
    if (tabId === 'data-management') {
      fetchDatasets();
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    const form = e.target;
    
    // Validate file selection
    const file = form.dataFile.files[0];
    if (!file) {
      alert('Please select a file to upload');
      return;
    }
    
    let datasetId = null;
    
    try {
      setLoading(true);
      
      // Step 1: Create dataset metadata
      const datasetData = {
        name: form.dataName.value,
        description: form.describe.value,
        category: form.category.value || null,
        timeRange: form.timeRange.value || null,
        region: form.region.value || null,
        vehicleType: form.vehicleType.value || null,
        batteryType: form.batteryType.value || null,
        dataFormat: form.dataFormat.value || null,
        status: 'CREATED',
        providerId: 1 // Mock, should get from auth context
      };
      
      console.log('Creating dataset metadata...', datasetData);
      const createResponse = await axiosInstance.post('/provider/datasets', datasetData);
      datasetId = createResponse.data.id;
      console.log('Dataset created with ID:', datasetId);
      
      // Step 2: Upload file
      console.log('Uploading file:', file.name, 'Size:', file.size, 'bytes');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('anonymize', false);
      
      await axiosInstance.post(`/provider/datasets/${datasetId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000 // 60 seconds timeout for large files
      });
      
      console.log('File uploaded successfully!');
      alert(`Dataset "${form.dataName.value}" uploaded successfully!`);
      form.reset(); // Reset form after successful upload
      fetchDatasets(); // Refresh dataset list
      switchTab('data-management');
      
    } catch (error) {
      console.error('Error uploading dataset:', error);
      
      // If dataset was created but file upload failed, delete it
      if (datasetId) {
        console.log('Cleaning up failed upload, deleting dataset ID:', datasetId);
        try {
          await axiosInstance.delete(`/provider/datasets/${datasetId}`);
          console.log('Failed dataset deleted successfully');
        } catch (deleteError) {
          console.error('Failed to delete incomplete dataset:', deleteError);
        }
      }
      
      const errorMsg = error.response?.data || error.message || 'Unknown error';
      alert(`Error uploading dataset: ${errorMsg}\nPlease try again.`);
    } finally {
      setLoading(false);
    }
  }

  async function handlePolicySubmit(e) {
    e.preventDefault();
    const form = e.target;
    
    if (!selectedDataset) {
      alert('Please select a dataset first');
      return;
    }
    
    try {
      setLoading(true);
      
      const policyData = {
        pricingType: form.pricingModel.value === 'Per download' ? 'per_request' : 'subscription',
        price: parseFloat(form.price.value),
        usagePolicy: form.policyDesc.value
      };
      
      await axiosInstance.put(`/provider/datasets/${selectedDataset}/policy`, policyData);
      
      alert('Policy saved successfully!');
      fetchDatasets(); // Refresh dataset list
      switchTab('data-management');
    } catch (error) {
      console.error('Error saving policy:', error);
      alert('Error saving policy. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSecuritySubmit(e) {
    e.preventDefault();
    const form = e.target;
    const remove = form.removePii?.checked;
    
    if (!selectedDataset) {
      alert('Please select a dataset first');
      return;
    }
    
    if (remove) {
      const ok = await showConfirm();
      if (ok) {
        try {
          setLoading(true);
          await axiosInstance.delete(`/provider/datasets/${selectedDataset}/erase`);
          alert('Security settings applied (dataset erased)');
          fetchDatasets();
          switchTab('data-management');
        } catch (error) {
          console.error('Error erasing dataset:', error);
          alert('Error applying security settings. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        alert('Operation cancelled.');
      }
    } else {
      alert('Security settings applied!');
      switchTab('data-management');
    }
  }

  async function handleDeleteDataset(datasetId, datasetName) {
    if (!window.confirm(`Are you sure you want to delete "${datasetName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setLoading(true);
      await axiosInstance.delete(`/provider/datasets/${datasetId}`);
      alert(`Dataset "${datasetName}" deleted successfully!`);
      fetchDatasets();
    } catch (error) {
      console.error('Error deleting dataset:', error);
      alert('Error deleting dataset. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function clearUploadForm() {
    const form = document.querySelector('#data-management form');
    if (form) {
      form.reset();
    }
  }

  function clearPolicyForm() {
    const form = document.querySelector('#policy-pricing form');
    if (form) {
      form.reset();
      setSelectedDataset(null);
    }
  }

  function clearSecurityForm() {
    const form = document.querySelector('#security-anonymization form');
    if (form) {
      form.reset();
      setSelectedDataset(null);
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
            <button className={`tab-btn ${activeTab === 'data-management' ? 'active' : ''}`} onClick={() => switchTab('data-management')} data-tab="data-management">Data Management</button>
            <button className={`tab-btn ${activeTab === 'policy-pricing' ? 'active' : ''}`} onClick={() => switchTab('policy-pricing')} data-tab="policy-pricing">Policy & Pricing</button>
            <button className={`tab-btn ${activeTab === 'revenue-tracking' ? 'active' : ''}`} onClick={() => switchTab('revenue-tracking')} data-tab="revenue-tracking">Revenue Tracking</button>
            <button className={`tab-btn ${activeTab === 'security-anonymization' ? 'active' : ''}`} onClick={() => switchTab('security-anonymization')} data-tab="security-anonymization">Security & Anonymization</button>
          </div>
        </div>
      </div>

      {/* Info banner for pending datasets */}
      {datasets.filter(ds => ds.status === 'PENDING_REVIEW').length > 0 && (
        <div className="container" style={{ marginTop: '20px' }}>
          <div style={{ 
            padding: '15px 20px', 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffc107', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '24px' }}>⏳</span>
            <div>
              <strong>Pending Admin Approval:</strong> You have {datasets.filter(ds => ds.status === 'PENDING_REVIEW').length} dataset(s) 
              waiting for admin approval. Your datasets will be visible to consumers once approved.
            </div>
          </div>
        </div>
      )}

      <main className="main-container">{/* Data Management Tab */}
        <div id="data-management" className={`tab-content ${activeTab === 'data-management' ? 'active' : ''}`} style={{ display: activeTab === 'data-management' ? 'block' : 'none' }}>
          {/* Display existing datasets */}
          <section style={{ marginBottom: '20px' }}>
            <h3>My Datasets</h3>
            {loading ? (
              <p>Loading datasets...</p>
            ) : datasets.length > 0 ? (
              <table className="table-small">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Size</th>
                    <th>Price</th>
                    <th>Pricing Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {datasets.map((ds) => {
                    const getStatusInfo = (status) => {
                      switch(status) {
                        case 'CREATED':
                          return { text: 'Created - Upload file to submit', className: 'status-created' };
                        case 'UPLOADING':
                          return { text: 'Uploading...', className: 'status-uploading' };
                        case 'PENDING_REVIEW':
                          return { text: 'Pending Admin Approval ⏳', className: 'status-pending_review' };
                        case 'APPROVED':
                          return { text: 'Approved ✓ - Live', className: 'status-approved' };
                        case 'REJECTED':
                          return { text: 'Rejected ✗', className: 'status-rejected' };
                        case 'ERASED':
                          return { text: 'Erased', className: 'status-erased' };
                        default:
                          return { text: status || 'Unknown', className: 'status-unknown' };
                      }
                    };
                    const statusInfo = getStatusInfo(ds.status);
                    
                    return (
                      <tr key={ds.id}>
                        <td>{ds.id}</td>
                        <td>{ds.name}</td>
                        <td>{ds.description || 'N/A'}</td>
                        <td>
                          <span className={`${statusInfo.className}`} title={statusInfo.text}>
                            {statusInfo.text}
                          </span>
                        </td>
                        <td>{ds.sizeBytes ? (ds.sizeBytes / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}</td>
                        <td>{ds.price ? '$' + ds.price : 'Not set'}</td>
                        <td>{ds.pricingType || 'Not set'}</td>
                        <td>
                          <button 
                            className="btn-delete" 
                            onClick={() => handleDeleteDataset(ds.id, ds.name)}
                            disabled={loading || ds.status === 'UPLOADING'}
                            title="Delete dataset"
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p>No datasets found. Upload your first dataset below.</p>
            )}
          </section>

          {/* Upload new dataset form */}
          <h3>Upload New Dataset</h3>
          <main className="form-mini">
            <form onSubmit={handleUpload}>
              <label>Data name:</label>
              <input name="dataName" type="text" placeholder="Enter the data name..." required disabled={loading} />

              <label>Describe:</label>
              <textarea name="describe" placeholder="Enter a short description..." disabled={loading} />

              <label>Category:</label>
              <select name="category" disabled={loading}>
                <option value="">-- Select category --</option>
                <option value="charging_behavior">Charging Behavior</option>
                <option value="battery_health">Battery Health</option>
                <option value="route_optimization">Route Optimization</option>
                <option value="energy_consumption">Energy Consumption</option>
              </select>

              <label>Time Range:</label>
              <select name="timeRange" disabled={loading}>
                <option value="">-- Select time range --</option>
                <option value="2020-2021">2020-2021</option>
                <option value="2021-2022">2021-2022</option>
                <option value="2022-2023">2022-2023</option>
                <option value="2023-2024">2023-2024</option>
                <option value="2024-present">2024-Present</option>
              </select>

              <label>Region:</label>
              <select name="region" disabled={loading}>
                <option value="">-- Select region --</option>
                <option value="north_america">North America</option>
                <option value="europe">Europe</option>
                <option value="asia">Asia</option>
                <option value="australia">Australia</option>
                <option value="africa">Africa</option>
                <option value="south_america">South America</option>
              </select>

              <label>Vehicle Type:</label>
              <select name="vehicleType" disabled={loading}>
                <option value="">-- Select vehicle type --</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="truck">Truck</option>
                <option value="bus">Bus</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="other">Other</option>
              </select>

              <label>Battery Type:</label>
              <select name="batteryType" disabled={loading}>
                <option value="">-- Select battery type --</option>
                <option value="lithium_ion">Lithium-Ion</option>
                <option value="solid_state">Solid-State</option>
                <option value="nickel_metal_hydride">Nickel-Metal Hydride</option>
                <option value="lead_acid">Lead-Acid</option>
                <option value="other">Other</option>
              </select>

              <label>Data Format:</label>
              <select name="dataFormat" disabled={loading}>
                <option value="">-- Select format --</option>
                <option value="CSV">CSV</option>
                <option value="JSON">JSON</option>
                <option value="XML">XML</option>
                <option value="Parquet">Parquet</option>
                <option value="Excel">Excel</option>
              </select>

              <label>Data file:</label>
              <input name="dataFile" type="file" accept=".csv,.json,.xlsx,.xml,.parquet" required disabled={loading} />

              <div className="form-btn-group">
                <button type="submit" className="btn-p btn-primary" disabled={loading}>
                  {loading ? '⏳ Uploading...' : '📤 Upload'}
                </button>
                <button type="button" className="btn-back" onClick={clearUploadForm} disabled={loading}>🗑️ Clear Form</button>
              </div>
            </form>
          </main>
        </div>

        {/* Policy & Pricing Tab */}
        <div id="policy-pricing" className={`tab-content ${activeTab === 'policy-pricing' ? 'active' : ''}`} style={{ display: activeTab === 'policy-pricing' ? 'block' : 'none' }}>
          <main className="form-mini">
            <form onSubmit={handlePolicySubmit}>
              <label>Select Dataset:</label>
              <select 
                name="dataset" 
                value={selectedDataset || ''}
                onChange={(e) => setSelectedDataset(e.target.value ? Number(e.target.value) : null)}
                required
                disabled={loading}
              >
                <option value="">-- Select a dataset --</option>
                {datasets.map((ds) => (
                  <option key={ds.id} value={ds.id}>
                    {ds.name} (ID: {ds.id})
                  </option>
                ))}
              </select>

              <label>Pricing model:</label>
              <select name="pricingModel" disabled={loading}>
                <option>Per download</option>
                <option>Subscription</option>
                <option>By data size</option>
              </select>

              <label>Price (USD):</label>
              <input name="price" type="number" min="0" step="0.01" defaultValue={99} required disabled={loading} />

              <label>License:</label>
              <select name="license" disabled={loading}>
                <option>Research / Academic</option>
                <option>Commercial</option>
                <option>Internal use only</option>
              </select>

              <label>Visibility:</label>
              <select name="visibility" disabled={loading}>
                <option>Public</option>
                <option>Restricted</option>
                <option>Private</option>
              </select>

              <label><input type="checkbox" name="freePreview" defaultChecked disabled={loading} /> Allow free preview sample</label>

              <label>Policy description:</label>
              <textarea name="policyDesc" placeholder="Short description of policy and usage terms..." disabled={loading} />

              <div className="form-btn-group">
                <button type="submit" className="btn-p btn-primary" disabled={loading}>
                  {loading ? '⏳ Saving...' : 'Save Policy'}
                </button>
                <button type="button" className="btn-back" onClick={clearPolicyForm} disabled={loading}>🗑️ Clear Form</button>
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
              <button type="button" className="btn-p btn-primary" onClick={exportCsv}>Export CSV</button>
              <button type="button" className="btn-back" onClick={() => switchTab('data-management')}>⬅ Back to Datasets</button>
            </div>
          </div>
        </div>

        {/* Security & Anonymization */}
        <div id="security-anonymization" className={`tab-content ${activeTab === 'security-anonymization' ? 'active' : ''}`} style={{ display: activeTab === 'security-anonymization' ? 'block' : 'none' }}>
          <main className="form-mini">
            <form onSubmit={handleSecuritySubmit}>
              <label>Select Dataset:</label>
              <select 
                name="dataset"
                value={selectedDataset || ''}
                onChange={(e) => setSelectedDataset(e.target.value ? Number(e.target.value) : null)}
                required
                disabled={loading}
              >
                <option value="">-- Select a dataset --</option>
                {datasets.map((ds) => (
                  <option key={ds.id} value={ds.id}>
                    {ds.name} (ID: {ds.id})
                  </option>
                ))}
              </select>

              <label><input id="removePii" type="checkbox" name="removePii" disabled={loading} /> Remove PII (irreversible - will erase dataset)</label>

              <label>Anonymization method:</label>
              <select name="method" disabled={loading}>
                <option>Mask (replace sensitive fields)</option>
                <option>Hash (deterministic)</option>
                <option>Aggregate (roll-up)</option>
              </select>

              <label>Access control:</label>
              <select name="access" disabled={loading}>
                <option>Open</option>
                <option>Whitelist</option>
                <option>Approval required</option>
              </select>

              <label><input type="checkbox" name="audit" disabled={loading} /> Enable audit logging</label>

              <label>Notes / instructions:</label>
              <textarea name="notes" placeholder="Notes for reviewers or processors..." disabled={loading} />

              <div className="form-btn-group">
                <button type="submit" className="btn-p btn-primary" disabled={loading}>
                  {loading ? '⏳ Processing...' : 'Apply Settings'}
                </button>
                <button type="button" className="btn-back" onClick={clearSecurityForm} disabled={loading}>🗑️ Clear Form</button>
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
