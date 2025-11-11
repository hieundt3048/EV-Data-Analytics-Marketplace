import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8080';

const ApiKeyManagement = ({ fetchWithAuth }) => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
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
      setShowCreateModal(false);
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
        <button 
          className="consumer-btn consumer-btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Generate New Key
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

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

      {/* Create API Key Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Generate New API Key</h3>
            
            <div className="form-group">
              <label>Key Name (optional):</label>
              <input
                type="text"
                value={newKeyConfig.name}
                onChange={(e) => setNewKeyConfig({ ...newKeyConfig, name: e.target.value })}
                placeholder="My API Key"
              />
            </div>

            <div className="form-group">
              <label>Rate Limit (requests/minute):</label>
              <input
                type="number"
                value={newKeyConfig.rateLimit}
                onChange={(e) => setNewKeyConfig({ ...newKeyConfig, rateLimit: parseInt(e.target.value) })}
                min="1"
                max="1000"
              />
            </div>

            <div className="form-group">
              <label>Expiry (days):</label>
              <input
                type="number"
                value={newKeyConfig.expiryDays}
                onChange={(e) => setNewKeyConfig({ ...newKeyConfig, expiryDays: parseInt(e.target.value) })}
                min="1"
                max="365"
              />
              <small>Leave as 0 for no expiration</small>
            </div>

            <div className="form-group">
              <label>Scopes:</label>
              <div className="checkbox-group">
                {['read:datasets', 'download:data', 'analytics:access'].map(scope => (
                  <label key={scope}>
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
                    />
                    {scope}
                  </label>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="consumer-btn consumer-btn-secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button 
                className="consumer-btn consumer-btn-primary"
                onClick={generateApiKey}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Key'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated API Key Modal - Show once after creation */}
      {showKeyModal && (
        <div className="modal-overlay" onClick={() => setShowKeyModal(false)}>
          <div className="modal-content modal-success" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon">✓</div>
            <h3>API Key Created Successfully!</h3>
            
            <div className="alert alert-warning" style={{ marginBottom: '1rem', padding: '1rem', background: '#FEF3C7', borderRadius: '0.5rem', border: '1px solid #FCD34D' }}>
              <strong>⚠️ Important:</strong> This is the only time you'll see this key. Copy it now and store it securely!
            </div>

            <div className="key-display">
              <code className="api-key-value">{generatedKey}</code>
              <button 
                className="consumer-btn consumer-btn-primary btn-copy"
                onClick={() => copyToClipboard(generatedKey, 'API Key')}
              >
                📋 Copy Key
              </button>
            </div>

            <div className="usage-example" style={{ marginTop: '1.5rem', padding: '1rem', background: '#F3F4F6', borderRadius: '0.5rem' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Usage Example:</p>
              <pre style={{ background: '#1F2937', color: '#10B981', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', fontSize: '0.875rem' }}>
{`curl -X GET "http://localhost:8080/api/datasets" \\
  -H "X-API-Key: ${generatedKey}"`}
              </pre>
              <button 
                className="btn-link"
                onClick={() => copyToClipboard(`curl -X GET "http://localhost:8080/api/datasets" -H "X-API-Key: ${generatedKey}"`, 'cURL command')}
                style={{ marginTop: '0.5rem' }}
              >
                📋 Copy cURL Command
              </button>
            </div>

            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button 
                className="consumer-btn consumer-btn-primary"
                onClick={() => setShowKeyModal(false)}
                style={{ width: '100%' }}
              >
                I've Saved My Key
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
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
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          border-radius: 8px;
          padding: 30px;
          max-width: 500px;
          width: 90%;
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
      `}</style>
    </div>
  );
};

export default ApiKeyManagement;
