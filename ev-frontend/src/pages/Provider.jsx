import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosConfig';
import '../styles/index.css';
import '../styles/provider.css';
import ProviderRevenueDashboard from '../components/ProviderRevenueDashboard';

const API_BASE_URL = ''; // Empty since axiosInstance already has baseURL
const API_BASE = 'http://localhost:8080';

const TITLE_MAP = {
  'data-management': 'Register & Manage Data Sources',
  'policy-pricing': 'Sharing Policies & Pricing',
  'revenue-tracking': 'Data Revenue Tracking',
  'security-anonymization': 'Data Security & Anonymization',
};

const Provider = () => {
  const navigate = useNavigate();
  const redirectingRef = useRef(false);
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

  // Block unwanted password change popups
  useEffect(() => {
    const originalAlert = window.alert;
    const originalConfirm = window.confirm;
    
    // Override alert
    window.alert = function(message) {
      // Block password-related alerts
      if (typeof message === 'string' && 
          (message.includes('Thay đổi') || 
           message.includes('mật khẩu') || 
           message.includes('Mật khẩu') ||
           message.includes('password') ||
           message.includes('ban đầu'))) {
        console.log('Blocked password popup:', message);
        return; // Don't show the alert
      }
      // Allow other alerts
      originalAlert.call(window, message);
    };
    
    // Override confirm
    window.confirm = function(message) {
      if (typeof message === 'string' && 
          (message.includes('Thay đổi') || 
           message.includes('mật khẩu') || 
           message.includes('Mật khẩu') ||
           message.includes('password') ||
           message.includes('ban đầu'))) {
        console.log('Blocked password confirm:', message);
        return false;
      }
      return originalConfirm.call(window, message);
    };

    return () => {
      window.alert = originalAlert;
      window.confirm = originalConfirm;
    };
  }, []);

  // Helper function for authenticated API calls
  const fetchWithAuth = useCallback(async (url, opts = {}) => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.warn('No auth token found, redirecting to login');
      localStorage.removeItem('authToken');
      navigate('/login');
      throw new Error('Authentication required');
    }
    
    const headers = {
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
      Authorization: `Bearer ${token}`,
    };

    try {
      const response = await fetch(url, { ...opts, headers });
      
      if (!response.ok) {
        if (response.status === 401) {
          if (!redirectingRef.current) {
            redirectingRef.current = true;
            console.warn('Token expired or invalid, redirecting to login');
            localStorage.removeItem('authToken');
            navigate('/login');
          }
          throw new Error('Session expired. Please login again.');
        }
        const errorText = await response.text();
        throw new Error(errorText || `Request failed with status ${response.status}`);
      }
      
      if (response.status === 204) return null;
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }, [navigate]);

  useEffect(() => {
    // Remove any password change modals that might appear on login
    const removePasswordModal = () => {
      // Find and remove any modals with Vietnamese text about password
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        const text = element.textContent || '';
        const innerHTML = element.innerHTML || '';
        
        // Check if element contains password-related text
        if ((text.includes('Thay đổi mật khẩu') || 
             text.includes('mật khẩu ban') ||
             text.includes('Mật khẩu ban') ||
             innerHTML.includes('Thay đổi mật khẩu')) &&
            element.offsetParent !== null) { // Only visible elements
          
          console.log('Found password modal, removing:', element);
          
          // Remove the element and its parents up to 3 levels
          let current = element;
          for (let i = 0; i < 3; i++) {
            if (current && current.parentElement && current.parentElement !== document.body) {
              const parent = current.parentElement;
              console.log('Removing parent:', parent);
              parent.style.display = 'none';
              parent.remove();
              current = parent.parentElement;
            } else {
              current.style.display = 'none';
              current.remove();
              break;
            }
          }
          
          // Also remove backdrop
          const backdrop = document.querySelector('.modal-backdrop, [class*="backdrop"], [style*="position: fixed"]');
          if (backdrop) {
            console.log('Removing backdrop:', backdrop);
            backdrop.remove();
          }
        }
      });
      
      // Also try to hide by checking all fixed position elements
      const fixedElements = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]');
      fixedElements.forEach(el => {
        if (el.textContent && 
            (el.textContent.includes('Thay đổi') || 
             el.textContent.includes('mật khẩu') ||
             el.textContent.includes('password'))) {
          console.log('Hiding fixed element:', el);
          el.style.display = 'none';
          el.remove();
        }
      });
    };

    // Remove immediately
    removePasswordModal();
    
    // Check multiple times to catch delayed modals
    const timers = [50, 100, 200, 300, 500, 800, 1000, 1500, 2000, 3000].map(delay => 
      setTimeout(removePasswordModal, delay)
    );
    
    // Use MutationObserver to watch for new modals being added
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          setTimeout(removePasswordModal, 10);
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // init stats and load data
    fetchRevenueStats();
    fetchDatasets();
    renderMiniChart(revFilter);
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
      observer.disconnect();
    };
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
      // Double confirmation for Remove PII
      const firstConfirm = window.confirm(
        'WARNING: Remove PII will PERMANENTLY ERASE this dataset!\n\n' +
        'This action:\n' +
        '- Cannot be undone\n' +
        '- Will delete all data\n' +
        '- Removes dataset from marketplace\n\n' +
        'Are you absolutely sure?'
      );
      
      if (!firstConfirm) {
        alert('Operation cancelled.');
        return;
      }
      
      // Second confirmation with custom modal
      const ok = await showConfirm();
      if (ok) {
        try {
          setLoading(true);
          await axiosInstance.delete(`/provider/datasets/${selectedDataset}/erase`);
          alert('Dataset has been permanently erased for PII compliance.');
          fetchDatasets();
          clearSecurityForm();
          switchTab('data-management');
        } catch (error) {
          console.error('Error erasing dataset:', error);
          alert('Error erasing dataset. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        alert('Operation cancelled.');
      }
    } else {
      // Apply security settings without erasing
      try {
        setLoading(true);
        
        // Get form values
        const methodValue = form.method.value;
        const accessValue = form.access.value;
        const auditEnabled = form.audit?.checked || false;
        const notes = form.notes?.value || '';
        
        // Map UI values to backend values
        const methodMap = {
          'mask': 'mask',
          'hash': 'hash',
          'aggregate': 'aggregate'
        };
        
        const accessMap = {
          'open': 'open',
          'whitelist': 'whitelist',
          'approval_required': 'approval_required'
        };
        
        const payload = {
          anonymizationMethod: methodMap[methodValue] || methodValue,
          accessControl: accessMap[accessValue] || accessValue,
          auditEnabled: auditEnabled,
          notes: notes
        };
        
        console.log('Sending security settings:', payload);
        
        await axiosInstance.put(`/provider/datasets/${selectedDataset}/security`, payload);
        alert('Security settings updated successfully!');
        fetchDatasets();
        clearSecurityForm();
        switchTab('data-management');
      } catch (error) {
        console.error('Error applying security settings:', error);
        alert('Error updating security settings. Please try again.');
      } finally {
        setLoading(false);
      }
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
      {/* Inline style to hide password modal */}
      <style>{`
        /* Hide any modal/dialog containing password change text */
        body > div[style*="position: fixed"],
        body > div[style*="z-index"] {
          display: none !important;
        }
        
        /* Show only our intended modals */
        .provider-page div[style*="position: fixed"],
        .provider-page div[style*="z-index"],
        #confirmModal {
          display: block !important;
        }
      `}</style>
      
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
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            <strong style={{ color: '#856404' }}>Pending Admin Approval:</strong>{' '}
            You have <strong>{datasets.filter(ds => ds.status === 'PENDING_REVIEW').length}</strong> dataset(s) 
            waiting for admin approval. Your datasets will be visible to consumers once approved.
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
                    <th>Security</th>
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
                          return { text: 'Pending Admin Approval', className: 'status-pending_review' };
                        case 'APPROVED':
                          return { text: 'Approved - Live', className: 'status-approved' };
                        case 'REJECTED':
                          return { text: 'Rejected', className: 'status-rejected' };
                        case 'ERASED':
                          return { text: 'Erased', className: 'status-erased' };
                        default:
                          return { text: status || 'Unknown', className: 'status-unknown' };
                      }
                    };
                    const statusInfo = getStatusInfo(ds.status);
                    
                    // Get security info
                    const getSecurityBadge = () => {
                      if (!ds.anonymizationMethod && !ds.accessControl) {
                        return (
                          <span style={{ 
                            color: '#dc3545', 
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: '#ffe6e6',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            display: 'inline-block'
                          }}>
                            Not configured
                          </span>
                        );
                      }
                      return (
                        <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
                          <div style={{ marginBottom: '3px' }}>
                            <span style={{ 
                              color: '#6c757d', 
                              fontWeight: '500',
                              marginRight: '5px'
                            }}>
                              Method:
                            </span>
                            <span style={{ 
                              color: '#2c3e50',
                              fontWeight: '600'
                            }}>
                              {ds.anonymizationMethod || 'N/A'}
                            </span>
                          </div>
                          <div style={{ marginBottom: '3px' }}>
                            <span style={{ 
                              color: '#6c757d', 
                              fontWeight: '500',
                              marginRight: '5px'
                            }}>
                              Access:
                            </span>
                            <span style={{ 
                              color: '#2c3e50',
                              fontWeight: '600'
                            }}>
                              {ds.accessControl || 'N/A'}
                            </span>
                          </div>
                          {ds.auditEnabled && (
                            <div style={{ 
                              color: '#28a745',
                              fontWeight: '500',
                              fontSize: '11px'
                            }}>
                              Audit enabled
                            </div>
                          )}
                        </div>
                      );
                    };
                    
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
                        <td>{getSecurityBadge()}</td>
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
                             Delete
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
              {/* Full width fields */}
              <div className="form-group-full">
                <label>Data name:</label>
                <input name="dataName" type="text" placeholder="Enter the data name..." required disabled={loading} />
              </div>

              <div className="form-group-full">
                <label>Description:</label>
                <textarea name="describe" placeholder="Enter a short description..." disabled={loading} rows="3" />
              </div>

              {/* Two column layout */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Category:</label>
                  <select name="category" disabled={loading}>
                    <option value="">-- Select category --</option>
                    <option value="charging_behavior">Charging Behavior</option>
                    <option value="battery_health">Battery Health</option>
                    <option value="route_optimization">Route Optimization</option>
                    <option value="energy_consumption">Energy Consumption</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Time Range:</label>
                  <select name="timeRange" disabled={loading}>
                    <option value="">-- Select time range --</option>
                    <option value="2020-2021">2020-2021</option>
                    <option value="2021-2022">2021-2022</option>
                    <option value="2022-2023">2022-2023</option>
                    <option value="2023-2024">2023-2024</option>
                    <option value="2024-present">2024-Present</option>
                  </select>
                </div>

                <div className="form-group">
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
                </div>

                <div className="form-group">
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
                </div>

                <div className="form-group">
                  <label>Battery Type:</label>
                  <select name="batteryType" disabled={loading}>
                    <option value="">-- Select battery type --</option>
                    <option value="lithium_ion">Lithium-Ion</option>
                    <option value="solid_state">Solid-State</option>
                    <option value="nickel_metal_hydride">Nickel-Metal Hydride</option>
                    <option value="lead_acid">Lead-Acid</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Data Format:</label>
                  <select name="dataFormat" disabled={loading}>
                    <option value="">-- Select format --</option>
                    <option value="CSV">CSV</option>
                    <option value="JSON">JSON</option>
                    <option value="XML">XML</option>
                    <option value="Parquet">Parquet</option>
                    <option value="Excel">Excel</option>
                  </select>
                </div>
              </div>

              {/* Full width file upload */}
              <div className="form-group-full">
                <label>Data file:</label>
                <input name="dataFile" type="file" accept=".csv,.json,.xlsx,.xml,.parquet" required disabled={loading} />
              </div>

              <div className="form-btn-group">
                <button type="submit" className="btn-p btn-primary" disabled={loading}>
                  {loading ? 'Uploading...' : 'Upload'}
                </button>
                <button type="button" className="btn-back" onClick={clearUploadForm} disabled={loading}>Clear Form</button>
              </div>
            </form>
          </main>
        </div>

        {/* Policy & Pricing Tab */}
        <div id="policy-pricing" className={`tab-content ${activeTab === 'policy-pricing' ? 'active' : ''}`} style={{ display: activeTab === 'policy-pricing' ? 'block' : 'none' }}>
          <main className="form-mini">
            <form onSubmit={handlePolicySubmit}>
              {/* Full width dataset selector */}
              <div className="form-group-full">
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
              </div>

              {/* Two column layout for pricing and license */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Pricing Model:</label>
                  <select name="pricingModel" disabled={loading}>
                    <option>Per download</option>
                    <option>Subscription</option>
                    <option>By data size</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Price (USD):</label>
                  <input name="price" type="number" min="0" step="0.01" defaultValue={99} required disabled={loading} />
                </div>

                <div className="form-group">
                  <label>License:</label>
                  <select name="license" disabled={loading}>
                    <option>Research / Academic</option>
                    <option>Commercial</option>
                    <option>Internal use only</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Visibility:</label>
                  <select name="visibility" disabled={loading}>
                    <option>Public</option>
                    <option>Restricted</option>
                    <option>Private</option>
                  </select>
                </div>
              </div>

              {/* Full width checkbox */}
              <div className="form-group-full">
                <label>
                  <input type="checkbox" name="freePreview" defaultChecked disabled={loading} style={{ width: 'auto', marginRight: '8px' }} />
                  Allow free preview sample
                </label>
              </div>

              {/* Full width policy description */}
              <div className="form-group-full">
                <label>Policy Description:</label>
                <textarea name="policyDesc" placeholder="Short description of policy and usage terms..." disabled={loading} rows="4" />
              </div>

              <div className="form-btn-group">
                <button type="submit" className="btn-p btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Policy'}
                </button>
                <button type="button" className="btn-back" onClick={clearPolicyForm} disabled={loading}>Clear Form</button>
              </div>
            </form>
          </main>
        </div>

        {/* Revenue Tracking */}
        <div id="revenue-tracking" className={`tab-content ${activeTab === 'revenue-tracking' ? 'active' : ''}`} style={{ display: activeTab === 'revenue-tracking' ? 'block' : 'none' }}>
          <ProviderRevenueDashboard fetchWithAuth={fetchWithAuth} />
        </div>

        {/* Security & Anonymization */}
        <div id="security-anonymization" className={`tab-content ${activeTab === 'security-anonymization' ? 'active' : ''}`} style={{ display: activeTab === 'security-anonymization' ? 'block' : 'none' }}>
          {/* Display current security settings */}
          {selectedDataset && datasets.find(ds => ds.id === selectedDataset) && (
            <section style={{ 
              marginBottom: '25px', 
              padding: '20px', 
              backgroundColor: '#ffffff', 
              borderRadius: '10px', 
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{ 
                marginTop: 0, 
                marginBottom: '20px',
                fontSize: '18px',
                fontWeight: '600',
                color: '#2c3e50',
                borderBottom: '2px solid #64FFDA',
                paddingBottom: '10px'
              }}>
                Current Security Settings
              </h3>
              {(() => {
                const dataset = datasets.find(ds => ds.id === selectedDataset);
                return (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '15px',
                    fontSize: '14px',
                    lineHeight: '1.8'
                  }}>
                    <div style={{ 
                      padding: '12px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px',
                      borderLeft: '3px solid #64FFDA'
                    }}>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#6c757d', 
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: '500'
                      }}>
                        Anonymization Method
                      </div>
                      <div style={{ 
                        fontSize: '15px', 
                        color: '#2c3e50',
                        fontWeight: '600'
                      }}>
                        {dataset.anonymizationMethod || 'Not set'}
                      </div>
                    </div>
                    
                    <div style={{ 
                      padding: '12px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px',
                      borderLeft: '3px solid #64FFDA'
                    }}>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#6c757d', 
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: '500'
                      }}>
                        Access Control
                      </div>
                      <div style={{ 
                        fontSize: '15px', 
                        color: '#2c3e50',
                        fontWeight: '600'
                      }}>
                        {dataset.accessControl || 'Not set'}
                      </div>
                    </div>
                    
                    <div style={{ 
                      padding: '12px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px',
                      borderLeft: '3px solid #64FFDA'
                    }}>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#6c757d', 
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: '500'
                      }}>
                        Audit Logging
                      </div>
                      <div style={{ 
                        fontSize: '15px', 
                        color: dataset.auditEnabled ? '#28a745' : '#dc3545',
                        fontWeight: '600'
                      }}>
                        {dataset.auditEnabled ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                    
                    <div style={{ 
                      gridColumn: 'span 2',
                      padding: '12px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '6px',
                      borderLeft: '3px solid #64FFDA'
                    }}>
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#6c757d', 
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontWeight: '500'
                      }}>
                        Security Notes
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#495057',
                        fontStyle: dataset.securityNotes ? 'normal' : 'italic'
                      }}>
                        {dataset.securityNotes || 'No notes'}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </section>
          )}

          <main className="form-mini">
            <form onSubmit={handleSecuritySubmit}>
              {/* Full width dataset selector */}
              <div className="form-group-full">
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
              </div>

              {/* Remove PII warning box */}
              <div style={{ 
                padding: '15px', 
                backgroundColor: '#fff3cd', 
                border: '1px solid #ffc107', 
                borderRadius: '8px', 
                marginBottom: '15px' 
              }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '12px', 
                  marginBottom: 0,
                  cursor: 'pointer'
                }}>
                  <input 
                    id="removePii" 
                    type="checkbox" 
                    name="removePii" 
                    disabled={loading} 
                    style={{ 
                      width: 'auto',
                      marginTop: '3px',
                      transform: 'scale(1.2)'
                    }} 
                  />
                  <span>
                    <strong style={{ color: '#dc3545', fontSize: '15px' }}>Remove PII (IRREVERSIBLE)</strong>
                    <br />
                    <small style={{ color: '#856404', fontSize: '13px' }}>
                      This will permanently erase the dataset. Use with extreme caution!
                    </small>
                  </span>
                </label>
              </div>

              <hr style={{ margin: '25px 0', border: 'none', borderTop: '2px solid #dee2e6' }} />
              
              <h4 style={{ 
                marginBottom: '20px', 
                color: '#2c3e50',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                Security Settings (without removing PII)
              </h4>

              {/* Two column layout for security settings */}
              <div className="form-grid-2">
                <div className="form-group">
                  <label>Anonymization Method:</label>
                  <select name="method" disabled={loading}>
                    <option value="mask" title="Replace sensitive fields with asterisks">Mask (replace sensitive fields)</option>
                    <option value="hash" title="Convert data to deterministic hash values">Hash (deterministic)</option>
                    <option value="aggregate" title="Roll up detailed data into summaries">Aggregate (roll-up)</option>
                  </select>
                  <small style={{ 
                    display: 'block', 
                    marginTop: '5px', 
                    color: '#6c757d',
                    fontSize: '12px',
                    lineHeight: '1.5',
                    paddingLeft: '8px',
                    borderLeft: '3px solid #e9ecef'
                  }}>
                    <strong>Mask:</strong> email@example.com → e***@example.com
                    <br />
                    <strong>Hash:</strong> email@example.com → 7d4e9f1a...
                    <br />
                    <strong>Aggregate:</strong> Individual → Summary
                  </small>
                </div>

                <div className="form-group">
                  <label>Access Control:</label>
                  <select name="access" disabled={loading}>
                    <option value="open" title="Anyone can see and purchase">Open</option>
                    <option value="whitelist" title="Only pre-approved consumers can access">Whitelist</option>
                    <option value="approval_required" title="Consumers must request access">Approval required</option>
                  </select>
                  <small style={{ 
                    display: 'block', 
                    marginTop: '5px', 
                    color: '#6c757d',
                    fontSize: '12px',
                    lineHeight: '1.5',
                    paddingLeft: '8px',
                    borderLeft: '3px solid #e9ecef'
                  }}>
                    <strong>Open:</strong> Public marketplace
                    <br />
                    <strong>Whitelist:</strong> Specific consumers only
                    <br />
                    <strong>Approval required:</strong> Request access
                  </small>
                </div>
              </div>

              {/* Full width audit checkbox */}
              <div className="form-group-full">
                <label>
                  <input type="checkbox" name="audit" disabled={loading} style={{ width: 'auto', marginRight: '8px' }} />
                  Enable audit logging
                </label>
                <small style={{ 
                  display: 'block', 
                  marginTop: '5px', 
                  color: '#6c757d',
                  fontSize: '13px'
                }}>
                  Track all access and changes to this dataset for compliance
                </small>
              </div>

              {/* Full width notes */}
              <div className="form-group-full">
                <label>Notes / Instructions:</label>
                <textarea 
                  name="notes" 
                  rows="4" 
                  placeholder="e.g., This dataset has been anonymized per GDPR requirements. Contact legal@company.com for commercial use." 
                  disabled={loading}
                  style={{ resize: 'vertical', minHeight: '100px' }}
                />
              </div>

              <div className="form-btn-group">
                <button type="submit" className="btn-p btn-primary" disabled={loading}>
                  {loading ? 'Processing...' : 'Apply Settings'}
                </button>
                <button type="button" className="btn-back" onClick={clearSecurityForm} disabled={loading}>Clear Form</button>
              </div>
            </form>
          </main>
        </div>
      </main>

      {/* Confirm modal */}
      {confirmVisible && (
        <div id="confirmModal" className="confirm-modal" aria-hidden={!confirmVisible} style={{ display: 'flex' }}>
          <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="confirmTitle">
            <h3 id="confirmTitle" style={{ 
              color: '#dc3545', 
              marginBottom: '20px',
              fontSize: '20px',
              fontWeight: '600',
              borderBottom: '2px solid #dc3545',
              paddingBottom: '10px'
            }}>
              Final Confirmation: Remove PII
            </h3>
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffc107', 
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p style={{ 
                margin: 0, 
                fontWeight: 'bold', 
                color: '#856404',
                fontSize: '15px'
              }}>
                This action will PERMANENTLY ERASE the selected dataset!
              </p>
            </div>
            <ul style={{ 
              textAlign: 'left', 
              marginBottom: '20px',
              paddingLeft: '25px',
              color: '#495057',
              fontSize: '14px',
              lineHeight: '2'
            }}>
              <li>Cannot be undone</li>
              <li>All data will be deleted</li>
              <li>Dataset removed from marketplace</li>
              <li>Consumers will lose access</li>
            </ul>
            <p style={{ 
              fontWeight: '600', 
              marginBottom: '15px',
              fontSize: '14px',
              color: '#2c3e50'
            }}>
              Type the word <span style={{ 
                color: '#dc3545',
                backgroundColor: '#ffe6e6',
                padding: '2px 8px',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '15px'
              }}>"DELETE"</span> to confirm:
            </p>
            <input 
              id="confirmInput" 
              type="text" 
              placeholder="Type DELETE" 
              style={{
                width: '100%',
                padding: '12px',
                marginBottom: '20px',
                border: '2px solid #dc3545',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}
            />
            <div className="actions" style={{ 
              display: 'flex', 
              gap: '10px', 
              justifyContent: 'flex-end' 
            }}>
              <button 
                className="btn-back" 
                onClick={() => closeConfirm(false)}
                style={{ padding: '10px 20px' }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                style={{ 
                  backgroundColor: '#dc3545', 
                  borderColor: '#dc3545',
                  padding: '10px 20px'
                }}
                onClick={() => {
                  const input = document.getElementById('confirmInput');
                  if (input && input.value === 'DELETE') {
                    closeConfirm(true);
                  } else {
                    alert('Please type "DELETE" to confirm.');
                  }
                }}
              >
                Yes, ERASE permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Provider;
