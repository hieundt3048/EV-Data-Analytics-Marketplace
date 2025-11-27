import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8080';

const SubscriptionManagement = ({ fetchWithAuth }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [purchasedDatasets, setPurchasedDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSubscription, setNewSubscription] = useState({
    datasetId: '',
    billingPlan: 'monthly',
    autoRenew: true
  });

  useEffect(() => {
    fetchSubscriptions();
    fetchPurchasedDatasets();
  }, []);

  const fetchPurchasedDatasets = async () => {
    try {
      const data = await fetchWithAuth(`${API_BASE}/api/orders/history`);
      // Get unique datasets from purchase history
      const uniqueDatasets = [];
      const datasetIds = new Set();
      
      if (Array.isArray(data)) {
        data.forEach(order => {
          if (order.datasetId && !datasetIds.has(order.datasetId)) {
            datasetIds.add(order.datasetId);
            const datasetName = order.itemTitle || order.datasetTitle || order.datasetName || `Dataset #${order.datasetId}`;
            uniqueDatasets.push({
              id: order.datasetId,
              name: datasetName,
              price: order.amount || order.price || 0,
              category: order.category || ''
            });
          }
        });
      }
      
      console.log('Fetched purchased datasets:', uniqueDatasets);
      setPurchasedDatasets(uniqueDatasets);
    } catch (err) {
      console.error('Error fetching purchased datasets:', err);
      setPurchasedDatasets([]);
    }
  };

  const fetchSubscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth(`${API_BASE}/api/subscriptions`);
      setSubscriptions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching subscriptions:', err);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async () => {
    if (!newSubscription.datasetId) {
      alert('Please select a dataset');
      return;
    }

    setLoading(true);
    try {
      // Find selected dataset details
      const selectedDataset = purchasedDatasets.find(d => d.id === parseInt(newSubscription.datasetId));
      
      // Prepare complete payload with all required fields
      const payload = {
        datasetId: parseInt(newSubscription.datasetId),
        stripePlanId: `plan_${newSubscription.billingPlan}_${newSubscription.datasetId}`,
        productName: selectedDataset?.name || `Dataset #${newSubscription.datasetId}`,
        price: selectedDataset?.price || 0
      };
      
      console.log('Creating subscription with payload:', payload);
      
      const response = await fetch(`${API_BASE}/api/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('Backend response:', data);

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to create subscription');
      }
      
      if (data.checkoutUrl) {
        // Redirect to Stripe checkout if URL provided
        window.location.href = data.checkoutUrl;
      } else {
        // Success without checkout - refresh list
        alert('Subscription created successfully!');
        setShowCreateModal(false);
        setNewSubscription({
          datasetId: '',
          billingPlan: 'monthly',
          autoRenew: true
        });
        await fetchSubscriptions(); // Wait for refresh to complete
      }
    } catch (err) {
      alert('Error creating subscription: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelSubscription = async (subscriptionId) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) throw new Error('Failed to cancel subscription');

      alert('Subscription cancelled successfully!');
      fetchSubscriptions();
    } catch (err) {
      alert('Error cancelling subscription: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteSubscription = async (subscriptionId) => {
    if (!confirm('Are you sure you want to delete this subscription record? This action cannot be undone.')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete subscription');

      alert('Subscription deleted successfully!');
      fetchSubscriptions();
    } catch (err) {
      alert('Error deleting subscription: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'ACTIVE': 'success',
      'CANCELLED': 'danger',
      'EXPIRED': 'secondary',
      'PENDING': 'warning'
    };
    return statusColors[status] || 'info';
  };

  if (loading && subscriptions.length === 0) {
    return (
      <div className="subscription-management">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="subscription-management">
      <div className="section-header">
        <div>
          <h2>Subscription Management</h2>
          <p className="section-subtitle">Manage your recurring dataset subscriptions</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          New Subscription
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {subscriptions.length === 0 && !loading ? (
        <div className="empty-state">
          <h3>No Active Subscriptions</h3>
          <p>You don't have any active subscriptions yet. Create one to get recurring access to datasets.</p>
          <button 
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            Create Your First Subscription
          </button>
        </div>
      ) : (
        <div className="subscriptions-grid">
          {subscriptions.map((sub) => {
            const purchased = purchasedDatasets.find(d => d.id === sub.datasetId);
            const displayName =
              sub.dataset?.name ||
              (sub.dataset && sub.dataset.id && `Dataset #${sub.dataset.id}`) ||
              `Dataset #${sub.datasetId || sub.id}`;

            return (
              <div key={sub.id} className="subscription-card">
                <div className="card-header">
                  <div>
                    <h3>{displayName}</h3>
                    <span className={`status-badge status-${getStatusBadge(sub.status)}`}>
                      {sub.status}
                    </span>
                  </div>
                  <div className="card-price">
                    {formatCurrency(sub.price)}
                    <span className="price-period">/month</span>
                  </div>
                </div>

                <div className="card-body">
                  <div className="info-row">
                    <span className="label">Plan:</span>
                    <span className="value">Monthly</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Start Date:</span>
                    <span className="value">{formatDate(sub.startAt)}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Next Billing:</span>
                    <span className="value">{sub.status === 'ACTIVE' ? formatDate(sub.endAt) : 'N/A'}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Auto Renew:</span>
                    <span className="value">No</span>
                  </div>
                  {sub.stripeSubscriptionId && (
                    <div className="info-row">
                      <span className="label">Stripe ID:</span>
                      <span className="value stripe-id">{sub.stripeSubscriptionId}</span>
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  {sub.status === 'ACTIVE' && (
                    <button
                      className="btn-danger-sm"
                      onClick={() => cancelSubscription(sub.id)}
                      disabled={loading}
                    >
                      Cancel Subscription
                    </button>
                  )}
                  {sub.status === 'CANCELLED' && (
                    <button 
                      className="btn-danger-sm"
                      onClick={() => deleteSubscription(sub.id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Subscription Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Subscription</h3>
              <button 
                className="close-btn"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="datasetId">Select Dataset</label>
                <select
                  id="datasetId"
                  value={newSubscription.datasetId}
                  onChange={(e) => setNewSubscription({
                    ...newSubscription,
                    datasetId: e.target.value
                  })}
                  className="dataset-select"
                >
                  <option value="">-- Select a purchased dataset --</option>
                  {purchasedDatasets.map((dataset) => (
                    <option key={dataset.id} value={dataset.id}>
                      {dataset.name} (${dataset.price?.toFixed(2)})
                    </option>
                  ))}
                </select>
                {purchasedDatasets.length === 0 && (
                  <p className="help-text">
                    You need to purchase a dataset first before creating a subscription.
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="plan">Billing Plan</label>
                <select
                  id="plan"
                  value={newSubscription.billingPlan}
                  onChange={(e) => setNewSubscription({
                    ...newSubscription,
                    billingPlan: e.target.value
                  })}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={newSubscription.autoRenew}
                    onChange={(e) => setNewSubscription({
                      ...newSubscription,
                      autoRenew: e.target.checked
                    })}
                  />
                  Auto-renew subscription
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary"
                onClick={createSubscription}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Create Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .subscription-management {
          padding: 24px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .section-header h2 {
          margin: 0 0 8px 0;
          color: #2c3e50;
          font-size: 28px;
          font-weight: 700;
        }

        .section-subtitle {
          margin: 0;
          color: #7f8c8d;
          font-size: 14px;
        }

        .subscriptions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
        }

        .subscription-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .subscription-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .card-header {
          padding: 20px;
          background: linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%);
          color: #1a1a1a;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .card-header h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
        }

        .card-price {
          text-align: right;
          font-size: 24px;
          font-weight: 700;
        }

        .price-period {
          font-size: 14px;
          font-weight: 400;
          opacity: 0.9;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-success {
          background: rgba(0, 0, 0, 0.15);
          color: #1a1a1a;
        }

        .status-danger {
          background: rgba(255, 77, 77, 0.3);
          color: white;
        }

        .status-warning {
          background: rgba(255, 193, 7, 0.3);
          color: white;
        }

        .card-body {
          padding: 20px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .info-row .label {
          color: #7f8c8d;
          font-weight: 500;
        }

        .info-row .value {
          color: #2c3e50;
          font-weight: 600;
        }

        .stripe-id {
          font-family: monospace;
          font-size: 12px;
        }

        .card-footer {
          padding: 20px;
          background: #f8f9fa;
          display: flex;
          gap: 12px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .empty-state h3 {
          margin: 0 0 12px 0;
          color: #2c3e50;
        }

        .empty-state p {
          color: #7f8c8d;
          margin-bottom: 24px;
        }

        .btn-primary, .btn-secondary, .btn-danger-sm, .btn-secondary-sm {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%);
          color: #1a1a1a;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(132, 250, 176, 0.5);
        }

        .btn-secondary {
          background: #e9ecef;
          color: #495057;
        }

        .btn-danger-sm {
          background: #dc3545;
          color: white;
          font-size: 14px;
        }

        .btn-secondary-sm {
          background: #6c757d;
          color: white;
          font-size: 14px;
        }

        .btn-primary:disabled, .btn-danger-sm:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          border-bottom: 1px solid #e9ecef;
        }

        .modal-header h3 {
          margin: 0;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: #6c757d;
        }

        .modal-body {
          padding: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #2c3e50;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }

        .form-group select.dataset-select {
          background: white;
          cursor: pointer;
        }

        .form-group .help-text {
          margin-top: 8px;
          font-size: 13px;
          color: #e74c3c;
          font-style: italic;
        }

        .form-group.checkbox label {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-group.checkbox input {
          width: auto;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 24px;
          border-top: 1px solid #e9ecef;
        }

        .loading-spinner {
          text-align: center;
          padding: 60px 20px;
        }

        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #84fab0;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .alert {
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .alert-danger {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
      `}</style>
    </div>
  );
};

export default SubscriptionManagement;
