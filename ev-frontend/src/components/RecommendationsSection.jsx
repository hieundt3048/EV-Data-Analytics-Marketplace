import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8080';

const RecommendationsSection = ({ fetchWithAuth, onViewDataset }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [trending, setTrending] = useState([]);
  const [forYou, setForYou] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('for-you'); // 'for-you', 'personalized', or 'trending'

  // Fetch "For You" recommendations (combines multiple algorithms)
  const fetchForYou = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth(`${API_BASE}/api/recommendations/for-you?limit=12`);
      setForYou(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching for-you recommendations:', err);
      setForYou([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch personalized recommendations
  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth(`${API_BASE}/api/recommendations/personalized?limit=12`);
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching recommendations:', err);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch trending datasets
  const fetchTrending = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWithAuth(`${API_BASE}/api/recommendations/trending?limit=12`);
      setTrending(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching trending:', err);
      setTrending([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === 'for-you') {
      fetchForYou().catch(err => {
        console.error('Failed to fetch for-you recommendations:', err);
      });
    } else if (activeView === 'personalized') {
      fetchRecommendations().catch(err => {
        console.error('Failed to fetch recommendations:', err);
      });
    } else {
      fetchTrending().catch(err => {
        console.error('Failed to fetch trending:', err);
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
    <div key={dataset.datasetId || dataset.id} className="recommendation-card">
      <div className="card-header">
        <div className="dataset-info">
          <h3>{dataset.datasetName || dataset.name || 'Unnamed Dataset'}</h3>
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
            <span className="meta-text">{dataset.reason}</span>
          </div>
        )}
        {dataset.purchaseCount != null && (
          <div className="meta-item">
            <span className="meta-text">{dataset.purchaseCount} purchases</span>
          </div>
        )}
        {dataset.avgRating != null && (
          <div className="meta-item">
            <span className="meta-text">{dataset.avgRating.toFixed(1)} rating</span>
          </div>
        )}
      </div>

      <div className="card-footer">
        <span className="price">${dataset.price?.toFixed(2) || '0.00'}</span>
        <button 
          className="consumer-btn consumer-btn-primary consumer-btn-sm"
          onClick={() => onViewDataset && onViewDataset(dataset.datasetId || dataset.id)}
        >
          View Details
        </button>
      </div>
    </div>
    );
  };

  const getCurrentData = () => {
    switch (activeView) {
      case 'for-you':
        return forYou;
      case 'personalized':
        return recommendations;
      case 'trending':
        return trending;
      default:
        return [];
    }
  };

  return (
    <div className="recommendations-section">
      <div className="section-header">
        <h2>Dataset Recommendations</h2>
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${activeView === 'for-you' ? 'active' : ''}`}
            onClick={() => setActiveView('for-you')}
            title="AI-powered recommendations based on your preferences"
          >
            For You
          </button>
          <button 
            className={`toggle-btn ${activeView === 'personalized' ? 'active' : ''}`}
            onClick={() => setActiveView('personalized')}
            title="Based on your purchase history"
          >
            Personalized
          </button>
          <button 
            className={`toggle-btn ${activeView === 'trending' ? 'active' : ''}`}
            onClick={() => setActiveView('trending')}
            title="Most popular datasets right now"
          >
            Trending
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading recommendations...</p>
        </div>
      )}

      {!loading && (
        <>
          <div className="recommendations-grid">
            {getCurrentData().map(renderDatasetCard)}
          </div>

          {getCurrentData().length === 0 && (
            <div className="empty-state">
              <h3>No {activeView === 'trending' ? 'Trending' : 'Recommended'} Datasets</h3>
              <p>
                {activeView === 'for-you' && 'Purchase some datasets to get personalized recommendations!'}
                {activeView === 'personalized' && 'Your personalized recommendations will appear here after your first purchase.'}
                {activeView === 'trending' && 'No trending datasets at the moment. Check back later!'}
              </p>
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .recommendations-section {
          padding: 20px;
          background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
          border-radius: 12px;
          margin-bottom: 30px;
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
          color: #2c3e50;
          font-size: 24px;
          font-weight: 700;
        }
        .view-toggle {
          display: flex;
          gap: 10px;
          background: white;
          padding: 4px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .toggle-btn {
          padding: 10px 18px;
          border: none;
          background: transparent;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6c757d;
        }
        .toggle-btn .icon {
          font-size: 16px;
        }
        .toggle-btn:hover {
          background: #f8f9fa;
          color: #495057;
        }
        .toggle-btn.active {
          background: linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%);
          color: #1a1a1a;
          box-shadow: 0 4px 12px rgba(132, 250, 176, 0.4);
        }
        .recommendations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }
        .recommendation-card {
          background: white;
          border: 1px solid #e9ecef;
          border-radius: 24px !important;
          padding: 20px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          min-height: 320px;
          overflow: hidden !important;
          position: relative;
        }
        .recommendation-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%);
          transform: scaleX(0);
          transition: transform 0.3s;
        }
        .recommendation-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.15);
          border-color: #84fab0;
        }
        .recommendation-card:hover::before {
          transform: scaleX(1);
        }
        .card-header {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 14px;
        }
        .dataset-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .dataset-info h3 {
          margin: 0 0 8px 0;
          font-size: 17px;
          font-weight: 700;
          color: #2c3e50;
          word-wrap: break-word;
          overflow-wrap: break-word;
          line-height: 1.4;
        }
        .category-badge {
          display: inline-block;
          padding: 4px 10px;
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          color: #1976d2;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .recommendation-score {
          padding: 6px 12px;
          border-radius: 10px;
          color: white;
          font-weight: 700;
          font-size: 13px;
          white-space: nowrap;
          align-self: flex-start;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .dataset-description {
          color: #6c757d;
          font-size: 14px;
          margin-bottom: 14px;
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .recommendation-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 14px;
          padding-top: 14px;
          border-top: 1px solid #f1f3f5;
          flex-grow: 1;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #6c757d;
          padding: 4px 0;
        }
        .meta-icon {
          font-size: 16px;
          flex-shrink: 0;
        }
        .meta-text {
          word-wrap: break-word;
          overflow-wrap: break-word;
          line-height: 1.4;
        }
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 14px;
          border-top: 1px solid #f1f3f5;
          margin-top: auto;
          gap: 12px;
        }
        .price {
          font-size: 22px;
          font-weight: 700;
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .consumer-btn-sm {
          font-size: 13px;
          padding: 8px 16px;
          white-space: nowrap;
          flex-shrink: 0;
          min-width: fit-content;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s;
        }
        .consumer-btn-primary {
          background: linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%);
          border: none;
          color: #1a1a1a;
        }
        .consumer-btn-primary:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(132, 250, 176, 0.5);
        }
        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
        }
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #84fab0;
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
        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: white;
          border-radius: 12px;
        }
        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
          opacity: 0.5;
        }
        .empty-state h3 {
          color: #2c3e50;
          margin-bottom: 8px;
          font-size: 20px;
        }
        .empty-state p {
          color: #6c757d;
          font-size: 14px;
          max-width: 400px;
          margin: 0 auto;
          line-height: 1.6;
        }
        .alert {
          padding: 16px 20px;
          border-radius: 10px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: slideIn 0.3s;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .alert-danger {
          background: #fff5f5;
          color: #c53030;
          border: 1px solid #feb2b2;
        }
        
        @media (max-width: 992px) {
          .recommendations-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          }
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
            flex-direction: column;
          }
          .toggle-btn {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default RecommendationsSection;
