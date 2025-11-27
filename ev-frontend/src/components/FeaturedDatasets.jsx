import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8080';

const FeaturedDatasets = ({ fetchWithAuth, onViewDataset, onPurchaseDataset }) => {
  const [featuredDatasets, setFeaturedDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeaturedDatasets();
  }, []);

  const fetchFeaturedDatasets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth(`${API_BASE}/api/datasets/featured`);
      setFeaturedDatasets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching featured datasets:', err);
      setFeaturedDatasets([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value || 0);

  const formatBytes = (bytes) => {
    const value = Number(bytes);
    if (!value || Number.isNaN(value)) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
    const scaled = value / (1024 ** index);
    return `${scaled.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
  };

  if (loading) {
    return (
      <div className="featured-datasets">
        <h2>Featured Datasets</h2>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading featured datasets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="featured-datasets">
        <h2>Featured Datasets</h2>
        <div className="alert alert-danger">Failed to load featured datasets: {error}</div>
      </div>
    );
  }

  if (featuredDatasets.length === 0) {
    return null;
  }

  return (
    <div className="featured-datasets">
      <div className="section-header">
        <h2>Featured Datasets</h2>
        <p className="section-subtitle">Curated selection of high-quality datasets</p>
      </div>

      <div className="featured-grid">
        {featuredDatasets.map((dataset) => (
          <div key={dataset.id} className="featured-card">
            <div className="featured-badge">Featured</div>
            
            <div className="card-content">
              <h3>{dataset.name || 'Unnamed Dataset'}</h3>
              
              {dataset.category && (
                <span className="category-badge">{dataset.category}</span>
              )}
              
              <p className="description">{dataset.description || 'No description available'}</p>
              
              <div className="dataset-meta">
                {dataset.region && (
                  <div className="meta-item">
                    <span className="label">Region:</span>
                    <span>{dataset.region}</span>
                  </div>
                )}
                {dataset.vehicleType && (
                  <div className="meta-item">
                    <span className="label">Vehicle:</span>
                    <span>{dataset.vehicleType}</span>
                  </div>
                )}
                {dataset.fileSize && (
                  <div className="meta-item">
                    <span className="label">Size:</span>
                    <span>{formatBytes(dataset.fileSize)}</span>
                  </div>
                )}
                {dataset.dataFormat && (
                  <div className="meta-item">
                    <span className="label">Format:</span>
                    <span>{dataset.dataFormat}</span>
                  </div>
                )}
              </div>
              
              <div className="card-footer">
                <div className="price-section">
                  <span className="price">{formatCurrency(dataset.price)}</span>
                  {dataset.pricingType && (
                    <span className="pricing-type">{dataset.pricingType}</span>
                  )}
                </div>
                <div className="action-buttons">
                  <button
                    className="btn-secondary-sm"
                    onClick={() => onViewDataset && onViewDataset(dataset.id)}
                  >
                    View Details
                  </button>
                  <button
                    className="btn-primary-sm"
                    onClick={() => onPurchaseDataset && onPurchaseDataset(dataset)}
                  >
                    Purchase
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .featured-datasets {
          margin-bottom: 40px;
          padding: 30px;
          background: linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%);
          border-radius: 16px;
        }
        
        .section-header {
          margin-bottom: 24px;
        }
        
        .section-header h2 {
          margin: 0 0 8px 0;
          color: #1a1a1a;
          font-size: 28px;
          font-weight: 700;
        }
        
        .section-subtitle {
          margin: 0;
          color: #666;
          font-size: 14px;
        }
        
        .featured-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }
        
        .featured-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          transition: all 0.3s;
          position: relative;
        }
        
        .featured-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.15);
        }
        
        .featured-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          z-index: 1;
        }
        
        .card-content {
          padding: 20px;
        }
        
        .card-content h3 {
          margin: 0 0 12px 0;
          font-size: 18px;
          font-weight: 700;
          color: #2c3e50;
          padding-right: 80px;
        }
        
        .category-badge {
          display: inline-block;
          padding: 4px 10px;
          background: #e3f2fd;
          color: #1976d2;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
        }
        
        .description {
          color: #666;
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 16px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .dataset-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid #eee;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #666;
        }
        
        .meta-item .icon {
          font-size: 16px;
        }
        
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .price-section {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .price {
          font-size: 24px;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .pricing-type {
          font-size: 11px;
          color: #999;
          text-transform: uppercase;
        }
        
        .action-buttons {
          display: flex;
          gap: 8px;
        }
        
        .btn-primary-sm,
        .btn-secondary-sm {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
        }
        
        .btn-primary-sm {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .btn-primary-sm:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .btn-secondary-sm {
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
        }
        
        .btn-secondary-sm:hover {
          background: #667eea;
          color: white;
        }
        
        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
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
          margin-top: 16px;
        }
        
        .alert-danger {
          background: #fff5f5;
          color: #c53030;
          border: 1px solid #feb2b2;
        }
        
        @media (max-width: 768px) {
          .featured-grid {
            grid-template-columns: 1fr;
          }
          
          .card-footer {
            flex-direction: column;
            align-items: stretch;
          }
          
          .action-buttons {
            width: 100%;
          }
          
          .btn-primary-sm,
          .btn-secondary-sm {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default FeaturedDatasets;
