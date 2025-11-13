import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8080';

const RecommendationsSection = ({ fetchWithAuth }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('for-you'); // 'for-you' or 'trending'

  // Fetch personalized recommendations
  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth(`${API_BASE}/api/recommendations/personalized?limit=10`);
      setRecommendations(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch trending datasets
  const fetchTrending = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth(`${API_BASE}/api/recommendations/trending?limit=10`);
      setTrending(data || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching trending:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === 'for-you') {
      fetchRecommendations().catch(err => {
        console.error('Failed to fetch recommendations:', err);
        // Don't block UI, just show error message
      });
    } else {
      fetchTrending().catch(err => {
        console.error('Failed to fetch trending:', err);
        // Don't block UI, just show error message
      });
    }
  }, [activeView]);

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'HYBRID':
        return '';
      case 'COLLABORATIVE':
        return '';
      case 'CONTENT_BASED':
        return '';
      case 'TRENDING':
        return '';
      default:
        return '';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return '#28a745';
    if (score >= 0.6) return '#ffc107';
    return '#17a2b8';
  };

  const renderDatasetCard = (dataset) => {
    if (!dataset) return null;
    
    return (
    <div key={dataset.datasetId} className="recommendation-card">
      <div className="card-header">
        <div className="dataset-info">
          <h3>{dataset.datasetName || 'Unnamed Dataset'}</h3>
          {dataset.category && <span className="category-badge">{dataset.category}</span>}
        </div>
        {dataset.recommendationScore != null && (
          <div className="recommendation-score" style={{ backgroundColor: getScoreColor(dataset.recommendationScore) }}>
            {(dataset.recommendationScore * 100).toFixed(0)}%
          </div>
        )}
      </div>

      {dataset.description && <p className="dataset-description">{dataset.description}</p>}

      <div className="recommendation-meta">
        {dataset.reason && (
          <div className="meta-item">
            <span className="meta-icon">{getRecommendationIcon(dataset.recommendationType)}</span>
            <span className="meta-text">{dataset.reason}</span>
          </div>
        )}
        {dataset.purchaseCount && (
          <div className="meta-item">
            <span className="meta-text">{dataset.purchaseCount} purchases</span>
          </div>
        )}
      </div>

      <div className="card-footer">
        <span className="price">${dataset.price?.toFixed(2) || '0.00'}</span>
        <button className="consumer-btn consumer-btn-primary consumer-btn-sm">
          View Details
        </button>
      </div>
    </div>
    );
  };

  return (
    <div className="recommendations-section">
      <div className="section-header">
        <h2>Dataset Recommendations</h2>
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${activeView === 'for-you' ? 'active' : ''}`}
            onClick={() => setActiveView('for-you')}
          >
            For You
          </button>
          <button 
            className={`toggle-btn ${activeView === 'trending' ? 'active' : ''}`}
            onClick={() => setActiveView('trending')}
          >
            Trending
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading recommendations...</p>
        </div>
      )}

      <div className="recommendations-grid">
        {activeView === 'for-you' && recommendations.map(renderDatasetCard)}
        {activeView === 'trending' && trending.map(renderDatasetCard)}
      </div>

      {!loading && (activeView === 'for-you' ? recommendations : trending).length === 0 && (
        <div className="empty-state">
          <p>
            {activeView === 'for-you' 
              ? 'No personalized recommendations yet. Purchase some datasets to get started!' 
              : 'No trending datasets at the moment.'}
          </p>
        </div>
      )}

      <style jsx>{`
        .recommendations-section {
          padding: 20px;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 15px;
        }
        .section-header h2 {
          margin: 0;
        }
        .view-toggle {
          display: flex;
          gap: 10px;
        }
        .toggle-btn {
          padding: 10px 20px;
          border: 2px solid #ddd;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s;
        }
        .toggle-btn.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }
        .recommendations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }
        .recommendation-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 16px;
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex;
          flex-direction: column;
          min-height: 300px;
          overflow: hidden;
        }
        .recommendation-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          gap: 10px;
        }
        .dataset-info {
          flex: 1;
          min-width: 0;
        }
        .dataset-info h3 {
          margin: 0 0 6px 0;
          font-size: 16px;
          color: #333;
          word-wrap: break-word;
          overflow-wrap: break-word;
          line-height: 1.3;
        }
        .category-badge {
          display: inline-block;
          padding: 3px 8px;
          background: #e9ecef;
          border-radius: 4px;
          font-size: 11px;
          color: #666;
          white-space: nowrap;
        }
        .recommendation-score {
          padding: 6px 10px;
          border-radius: 8px;
          color: white;
          font-weight: bold;
          font-size: 14px;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .dataset-description {
          color: #666;
          font-size: 13px;
          margin-bottom: 12px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .recommendation-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 12px;
          padding-top: 12px;
          border-top: 1px solid #eee;
          flex-grow: 1;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #666;
        }
        .meta-icon {
          font-size: 16px;
          flex-shrink: 0;
        }
        .meta-text {
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid #eee;
          margin-top: auto;
          gap: 10px;
        }
        .price {
          font-size: 18px;
          font-weight: bold;
          color: #28a745;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .consumer-btn-sm {
          font-size: 0.8125rem;
          padding: 0.5rem 0.875rem;
          white-space: nowrap;
          flex-shrink: 0;
          min-width: fit-content;
        }
        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
        }
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }
        .alert {
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .alert-danger {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        
        @media (max-width: 768px) {
          .recommendations-grid {
            grid-template-columns: 1fr;
          }
          .section-header {
            flex-direction: column;
            align-items: stretch;
          }
          .view-toggle {
            width: 100%;
          }
          .toggle-btn {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default RecommendationsSection;
