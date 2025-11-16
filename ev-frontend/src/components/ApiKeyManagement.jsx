import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

const API_BASE = 'http://localhost:8080';

const ApiKeyManagement = ({ fetchWithAuth }) => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(true); // Hiển thị form ngay trong trang
  const [showKeyModal, setShowKeyModal] = useState(false); // Modal to show generated key
  const [generatedKey, setGeneratedKey] = useState(''); // Store generated key
  const [expandedStats, setExpandedStats] = useState({}); // Track which keys have expanded stats
  const [newKeyConfig, setNewKeyConfig] = useState({
    name: '',
    rateLimit: 100,
    expiryDays: 30,
    scopes: []
  });
  const [stats, setStats] = useState({});

  // Fetch API keys
  const fetchApiKeys = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(`${API_BASE}/api/apikeys/list`);
      // Backend returns { success: true, keys: [...], totalKeys: N }
      const data = response?.keys || response || [];
      const keysArray = Array.isArray(data) ? data : [];
      setApiKeys(keysArray);
      
      // Extract embedded stats from backend response (last30DaysStats)
      const embeddedStats = {};
      const autoExpand = {};
      keysArray.forEach(key => {
        if (key.last30DaysStats) {
          embeddedStats[key.id] = key.last30DaysStats;
          // Auto-expand if there are actual requests
          if (key.last30DaysStats.totalRequests > 0) {
            autoExpand[key.id] = true;
          }
        }
      });
      if (Object.keys(embeddedStats).length > 0) {
        setStats(embeddedStats);
        setExpandedStats(autoExpand);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching API keys:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate new API key
  const generateApiKey = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth(`${API_BASE}/api/apikeys/generate`, {
        method: 'POST',
        body: JSON.stringify(newKeyConfig)
      });
      // Backend returns { success, apiKey, keyId, ... }
      const apiKeyValue = response.apiKey || response.key;
      
      // Show key in modal instead of alert
      setGeneratedKey(apiKeyValue);
      setShowKeyModal(true);
      
      // Refresh list
      fetchApiKeys();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text, label = 'Text') => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${label} copied to clipboard!`);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert(`${label} copied to clipboard!`);
      } catch (e) {
        alert('Failed to copy. Please copy manually.');
      }
      document.body.removeChild(textArea);
    }
  };

  // Revoke API key
  const revokeApiKey = async (keyId) => {
    if (!confirm('Are you sure you want to revoke this API key?')) return;
    
    try {
      await fetchWithAuth(`${API_BASE}/api/apikeys/${keyId}`, {
        method: 'DELETE'
      });
      alert('API Key revoked successfully');
      fetchApiKeys();
    } catch (err) {
      alert('Failed to revoke API key: ' + err.message);
    }
  };

  // Fetch usage stats for a key
  const fetchKeyStats = async (keyId) => {
    try {
      const response = await fetchWithAuth(`${API_BASE}/api/apikeys/${keyId}/stats`);
      // Backend returns { success, statistics: {...} }
      const statsData = response?.statistics || response || {};
      setStats(prev => ({ ...prev, [keyId]: statsData }));
      setExpandedStats(prev => ({ ...prev, [keyId]: true }));
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  // Toggle stats visibility
  const toggleStats = async (keyId) => {
    if (expandedStats[keyId]) {
      // Collapse
      setExpandedStats(prev => ({ ...prev, [keyId]: false }));
    } else {
      // Expand and fetch if not loaded
      if (!stats[keyId]) {
        await fetchKeyStats(keyId);
      } else {
        setExpandedStats(prev => ({ ...prev, [keyId]: true }));
      }
    }
  };

  useEffect(() => {
    fetchApiKeys().catch(err => {
      console.error('Failed to load API keys:', err);
      // Don't block UI, just show error message
    });
  }, []);

  return (
    <div className="api-key-management">
      <div className="section-header">
        <h2>API Key Management</h2>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* API Endpoints Documentation */}
      <div style={{
        backgroundColor: '#EFF6FF',
        padding: '1.5rem',
        borderRadius: '0.75rem',
        marginBottom: '2rem',
        border: '1px solid #BFDBFE'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', color: '#1E40AF', fontWeight: '600' }}>
          Available API Endpoints
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ background: 'white', padding: '0.75rem', borderRadius: '0.5rem', borderLeft: '3px solid #3B82F6' }}>
            <code style={{ color: '#059669', fontWeight: '600' }}>GET /api/v1/datasets</code>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6B7280' }}>
              Get list of all datasets. Requires scope: <strong>read:datasets</strong>
            </p>
          </div>
          <div style={{ background: 'white', padding: '0.75rem', borderRadius: '0.5rem', borderLeft: '3px solid #3B82F6' }}>
            <code style={{ color: '#059669', fontWeight: '600' }}>GET /api/v1/datasets/{'{id}'}</code>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6B7280' }}>
              Get dataset details by ID. Requires scope: <strong>read:datasets</strong>
            </p>
          </div>
          <div style={{ background: 'white', padding: '0.75rem', borderRadius: '0.5rem', borderLeft: '3px solid #8B5CF6' }}>
            <code style={{ color: '#059669', fontWeight: '600' }}>GET /api/v1/datasets/{'{id}'}/download</code>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6B7280' }}>
              Download dataset. Requires scope: <strong>download:data</strong>
            </p>
          </div>
          <div style={{ background: 'white', padding: '0.75rem', borderRadius: '0.5rem', borderLeft: '3px solid #F59E0B' }}>
            <code style={{ color: '#059669', fontWeight: '600' }}>GET /api/v1/analytics</code>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6B7280' }}>
              Get analytics statistics. Requires scope: <strong>analytics:access</strong>
            </p>
          </div>
          <div style={{ background: 'white', padding: '0.75rem', borderRadius: '0.5rem', borderLeft: '3px solid #10B981' }}>
            <code style={{ color: '#059669', fontWeight: '600' }}>GET /api/v1/health</code>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#6B7280' }}>
              Check API health status. No authentication required.
            </p>
          </div>
        </div>
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#FEF3C7', borderRadius: '0.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400E' }}>
            <strong>Tip:</strong> All requests (except /health) require header <code>X-API-Key: your_api_key</code>
          </p>
        </div>
      </div>

      {/* Form tạo API Key hiển thị ngay trong trang */}
      {showCreateForm && (
        <div className="create-key-form-inline" style={{
          backgroundColor: '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '0.75rem',
          marginBottom: '2rem',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.375rem', color: '#0A192F', fontWeight: '600' }}>
            Generate New API Key
          </h3>
        
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
              Key Name (optional):
            </label>
            <input
              type="text"
              value={newKeyConfig.name}
              onChange={(e) => setNewKeyConfig({ ...newKeyConfig, name: e.target.value })}
              placeholder="My API Key"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', fontSize: '0.875rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                Rate Limit (requests/min):
              </label>
              <input
                type="number"
                value={newKeyConfig.rateLimit}
                onChange={(e) => setNewKeyConfig({ ...newKeyConfig, rateLimit: parseInt(e.target.value) })}
                min="1"
                max="1000"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', fontSize: '0.875rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
                Expiry (days):
              </label>
              <input
                type="number"
                value={newKeyConfig.expiryDays}
                onChange={(e) => setNewKeyConfig({ ...newKeyConfig, expiryDays: parseInt(e.target.value) })}
                min="1"
                max="365"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: '0.375rem', fontSize: '0.875rem' }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <small style={{ display: 'block', color: '#6B7280', fontSize: '0.75rem' }}>Leave as 30 for default expiration</small>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>
              Scopes:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['read:datasets', 'download:data', 'analytics:access'].map(scope => (
                <label key={scope} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newKeyConfig.scopes.includes(scope)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewKeyConfig({ 
                          ...newKeyConfig, 
                          scopes: [...newKeyConfig.scopes, scope] 
                        });
                      } else {
                        setNewKeyConfig({ 
                          ...newKeyConfig, 
                          scopes: newKeyConfig.scopes.filter(s => s !== scope) 
                        });
                      }
                    }}
                    style={{ marginRight: '0.5rem' }}
                  />
                  <span>{scope}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #E5E7EB' }}>
            <button 
              onClick={generateApiKey}
              disabled={loading}
              style={{ 
                padding: '0.625rem 1.5rem', 
                borderRadius: '0.5rem', 
                background: loading ? '#93C5FD' : '#3B82F6', 
                color: 'white', 
                border: 'none', 
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { if (!loading) e.target.style.background = '#2563EB' }}
              onMouseOut={(e) => { if (!loading) e.target.style.background = '#3B82F6' }}
            >
              {loading ? 'Generating...' : 'Generate Key'}
            </button>
          </div>
        </div>
      )}

      {loading && <div className="loading-spinner">Loading...</div>}

      <div className="api-keys-list">
        {apiKeys.length === 0 && !loading && (
          <div className="empty-state">
            <p>No API keys found. Generate your first API key to get started.</p>
          </div>
        )}

        {apiKeys.map(key => (
          <div key={key.id} className="api-key-card">
            <div className="key-header">
              <div className="key-info">
                <h3>{key.keyPrefix || 'API Key'}</h3>
                <span className={`key-status ${!key.isExpired ? 'active' : 'inactive'}`}>
                  {!key.isExpired ? 'Active' : 'Expired'}
                </span>
              </div>
              <button 
                className="btn-danger-small"
                onClick={() => revokeApiKey(key.id)}
              >
                Revoke
              </button>
            </div>
            
            <div className="key-details">
              <p><strong>Created:</strong> {new Date(key.createdAt).toLocaleDateString()}</p>
              <p><strong>Expires:</strong> {key.expiryDate ? new Date(key.expiryDate).toLocaleDateString() : 'Never'}</p>
              <p><strong>Rate Limit:</strong> {key.rateLimit || 100} requests/minute</p>
              <p><strong>Scopes:</strong> {key.scopes?.join(', ') || 'All'}</p>
            </div>

            {expandedStats[key.id] && stats[key.id] && (
              <div className="key-stats">
                <h4>Usage Statistics (Last 30 Days):</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Total Requests:</span>
                    <span className="stat-value">{stats[key.id]?.totalRequests || 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Success Rate:</span>
                    <span className="stat-value">{stats[key.id]?.successRate || 0}%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Bandwidth:</span>
                    <span className="stat-value">{stats[key.id]?.totalBandwidthMB || 0} MB</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Avg Response Time:</span>
                    <span className="stat-value">{stats[key.id]?.avgResponseTimeMs || 0} ms</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Errors:</span>
                    <span className="stat-value">{stats[key.id]?.errorCount || 0}</span>
                  </div>
                </div>
              </div>
            )}

            <button 
              className="btn-link"
              onClick={() => toggleStats(key.id)}
            >
              {expandedStats[key.id] ? '▲ Hide Stats' : '▼ View Stats'}
            </button>
          </div>
        ))}
      </div>

      {/* Generated API Key Modal - Show once after creation */}
      {showKeyModal && ReactDOM.createPortal(
        <div 
          className="api-key-success-overlay" 
          style={{ 
            zIndex: 9999999, 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setShowKeyModal(false)}
        >
          <div 
            className="api-key-success-content" 
            style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              maxWidth: '650px',
              width: '100%',
              position: 'relative',
              zIndex: 10000000,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ 
              textAlign: 'center', 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#10B981',
              margin: 0
            }}>API Key Created Successfully!</h3>
            
            <div style={{ 
              padding: '0.875rem', 
              background: '#FEF3C7', 
              borderRadius: '0.5rem', 
              border: '1px solid #FCD34D',
              fontSize: '0.813rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}>
              <strong style={{ color: '#92400E', display: 'block' }}>Important:</strong>
              <span style={{ color: '#92400E' }}>
                This is the only time you'll see this key. Copy it now and store it securely!
              </span>
            </div>

            <div style={{
              background: '#F3F4F6',
              padding: '0.875rem',
              borderRadius: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.625rem'
            }}>
              <code style={{
                display: 'block',
                wordBreak: 'break-all',
                padding: '0.625rem',
                background: '#1F2937',
                color: '#10B981',
                borderRadius: '0.375rem',
                fontFamily: 'monospace',
                fontSize: '0.813rem',
                margin: 0
              }}>{generatedKey}</code>
              <button 
                onClick={() => copyToClipboard(generatedKey, 'API Key')}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: '#3B82F6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.813rem',
                  fontWeight: '500',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#2563EB'}
                onMouseOut={(e) => e.target.style.background = '#3B82F6'}
              >
                Copy Key
              </button>
            </div>

            <div style={{ 
              padding: '0.875rem', 
              background: '#F3F4F6', 
              borderRadius: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.625rem'
            }}>
              <p style={{ 
                fontWeight: '600', 
                color: '#374151',
                fontSize: '0.813rem',
                margin: 0
              }}>Usage Example:</p>
              <pre style={{ 
                background: '#1F2937', 
                color: '#10B981', 
                padding: '0.75rem', 
                borderRadius: '0.5rem', 
                overflow: 'auto', 
                fontSize: '0.688rem',
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}>
{`curl -X GET "http://localhost:8080/api/v1/datasets" \\
  -H "X-API-Key: ${generatedKey}"`}
              </pre>
              <button 
                onClick={() => copyToClipboard(`curl -X GET "http://localhost:8080/api/v1/datasets" -H "X-API-Key: ${generatedKey}"`, 'cURL command')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3B82F6',
                  cursor: 'pointer',
                  fontSize: '0.813rem',
                  textDecoration: 'underline',
                  padding: 0,
                  textAlign: 'left'
                }}
              >
                Copy cURL Command
              </button>
            </div>

            <button 
              onClick={() => setShowKeyModal(false)}
              style={{
                width: '100%',
                padding: '0.625rem',
                background: '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#059669'}
              onMouseOut={(e) => e.target.style.background = '#10B981'}
            >
              I've Saved My Key
            </button>
          </div>
        </div>,
        document.body
      )}

      <style>{`
        .api-key-management {
          padding: 20px;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .api-keys-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .api-key-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
        }
        .key-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        .key-info h3 {
          margin: 0 0 5px 0;
          font-family: monospace;
        }
        .key-status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
        .key-status.active {
          background: #d4edda;
          color: #155724;
        }
        .key-status.inactive {
          background: #f8d7da;
          color: #721c24;
        }
        .key-details p {
          margin: 8px 0;
        }
        .key-stats {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-top: 10px;
        }
        .stat-item {
          display: flex;
          flex-direction: column;
        }
        .stat-label {
          font-size: 12px;
          color: #666;
        }
        .stat-value {
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }
        
        /* Unique modal styles for API Key Generation */
        .api-key-generation-overlay,
        .api-key-success-overlay {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          background: rgba(0, 0, 0, 0.75) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          z-index: 9999999 !important;
        }
        
        .api-key-generation-content,
        .api-key-success-content {
          background: white !important;
          border-radius: 0.75rem !important;
          padding: 2rem !important;
          max-width: 600px !important;
          width: 90% !important;
          max-height: 90vh !important;
          overflow-y: auto !important;
          position: relative !important;
          z-index: 10000000 !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3) !important;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        .form-group input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
        }
        .btn-danger-small {
          background: #dc3545;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
        }
        .btn-link {
          background: none;
          border: none;
          color: #007bff;
          cursor: pointer;
          text-decoration: underline;
        }
        .empty-state {
          text-align: center;
          padding: 40px;
          color: #666;
        }
        
        /* Success modal specific styles */
        .success-icon {
          width: 60px;
          height: 60px;
          background: #10B981;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          margin: 0 auto 1.5rem;
        }
        
        .key-display {
          background: #F3F4F6;
          padding: 1rem;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        
        .api-key-value {
          display: block;
          word-break: break-all;
          padding: 0.75rem;
          background: #1F2937;
          color: #10B981;
          border-radius: 0.375rem;
          font-family: monospace;
          font-size: 0.875rem;
          margin-bottom: 0.75rem;
        }
        
        .btn-copy {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default ApiKeyManagement;
