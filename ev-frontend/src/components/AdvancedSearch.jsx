import React, { useState } from 'react';

const API_BASE = 'http://localhost:8080';

const AdvancedSearch = ({ fetchWithAuth, onSearchResults, categories }) => {
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    region: '',
    vehicleType: '',
    batteryType: '',
    dataFormat: '',
    timeRange: '',
    sortBy: 'relevance'
  });
  const [searching, setSearching] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    
    try {
      // Build query params
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const url = `${API_BASE}/api/datasets/search?${params.toString()}`;
      const data = await fetchWithAuth(url);
      
      if (onSearchResults) {
        onSearchResults(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Search error:', error);
      if (onSearchResults) {
        onSearchResults([]);
      }
      alert('Search failed: ' + error.message);
    } finally {
      setSearching(false);
    }
  };

  const handleReset = () => {
    setSearchParams({
      keyword: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      region: '',
      vehicleType: '',
      batteryType: '',
      dataFormat: '',
      timeRange: '',
      sortBy: 'relevance'
    });
    if (onSearchResults) {
      onSearchResults(null); // Reset to show all datasets
    }
  };

  return (
    <div className="advanced-search">
      <form onSubmit={handleSearch}>
        {/* Basic Search */}
        <div className="search-basic">
          <div className="search-input-group">
            <input
              type="text"
              name="keyword"
              value={searchParams.keyword}
              onChange={handleChange}
              placeholder="Search datasets by name, description, or tags..."
              className="search-input"
            />
            <button type="submit" className="btn-search" disabled={searching}>
              {searching ? '🔄 Searching...' : '🔍 Search'}
            </button>
          </div>
          
          <button
            type="button"
            className="btn-toggle-advanced"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? '▲ Hide Filters' : '▼ Advanced Filters'}
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="search-advanced">
            <div className="filters-grid">
              {/* Category Filter */}
              <div className="filter-group">
                <label>Category</label>
                <select name="category" value={searchParams.category} onChange={handleChange}>
                  <option value="">All Categories</option>
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat.name || cat}>{cat.name || cat}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="filter-group">
                <label>Min Price ($)</label>
                <input
                  type="number"
                  name="minPrice"
                  value={searchParams.minPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <div className="filter-group">
                <label>Max Price ($)</label>
                <input
                  type="number"
                  name="maxPrice"
                  value={searchParams.maxPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="1000.00"
                />
              </div>

              {/* Region */}
              <div className="filter-group">
                <label>Region</label>
                <select name="region" value={searchParams.region} onChange={handleChange}>
                  <option value="">All Regions</option>
                  <option value="North America">North America</option>
                  <option value="Europe">Europe</option>
                  <option value="Asia">Asia</option>
                  <option value="South America">South America</option>
                  <option value="Africa">Africa</option>
                  <option value="Oceania">Oceania</option>
                </select>
              </div>

              {/* Vehicle Type */}
              <div className="filter-group">
                <label>Vehicle Type</label>
                <select name="vehicleType" value={searchParams.vehicleType} onChange={handleChange}>
                  <option value="">All Types</option>
                  <option value="Sedan">Sedan</option>
                  <option value="SUV">SUV</option>
                  <option value="Truck">Truck</option>
                  <option value="Bus">Bus</option>
                  <option value="Two-Wheeler">Two-Wheeler</option>
                </select>
              </div>

              {/* Battery Type */}
              <div className="filter-group">
                <label>Battery Type</label>
                <select name="batteryType" value={searchParams.batteryType} onChange={handleChange}>
                  <option value="">All Types</option>
                  <option value="Lithium-ion">Lithium-ion</option>
                  <option value="NMC">NMC</option>
                  <option value="LFP">LFP</option>
                  <option value="Solid-state">Solid-state</option>
                </select>
              </div>

              {/* Data Format */}
              <div className="filter-group">
                <label>Data Format</label>
                <select name="dataFormat" value={searchParams.dataFormat} onChange={handleChange}>
                  <option value="">All Formats</option>
                  <option value="CSV">CSV</option>
                  <option value="JSON">JSON</option>
                  <option value="XML">XML</option>
                  <option value="Parquet">Parquet</option>
                </select>
              </div>

              {/* Time Range */}
              <div className="filter-group">
                <label>Time Range</label>
                <select name="timeRange" value={searchParams.timeRange} onChange={handleChange}>
                  <option value="">All Time</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                  <option value="2021">2021</option>
                  <option value="2020">2020</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="filter-group">
                <label>Sort By</label>
                <select name="sortBy" value={searchParams.sortBy} onChange={handleChange}>
                  <option value="relevance">Relevance</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Name: A to Z</option>
                  <option value="name_desc">Name: Z to A</option>
                  <option value="date_desc">Newest First</option>
                  <option value="date_asc">Oldest First</option>
                </select>
              </div>
            </div>

            <div className="search-actions">
              <button type="button" className="btn-reset" onClick={handleReset}>
                🔄 Reset Filters
              </button>
              <button type="submit" className="btn-apply" disabled={searching}>
                {searching ? 'Searching...' : '✓ Apply Filters'}
              </button>
            </div>
          </div>
        )}
      </form>

      <style jsx>{`
        .advanced-search {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        
        .search-basic {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        
        .search-input-group {
          flex: 1;
          display: flex;
          gap: 12px;
          min-width: 300px;
        }
        
        .search-input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .btn-search {
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          white-space: nowrap;
        }
        
        .btn-search:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .btn-search:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .btn-toggle-advanced {
          padding: 12px 20px;
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          white-space: nowrap;
        }
        
        .btn-toggle-advanced:hover {
          background: #f7fafc;
        }
        
        .search-advanced {
          border-top: 1px solid #e2e8f0;
          padding-top: 20px;
          animation: slideDown 0.3s ease-out;
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }
        
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .filter-group label {
          font-size: 13px;
          font-weight: 600;
          color: #4a5568;
        }
        
        .filter-group input,
        .filter-group select {
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.3s;
        }
        
        .filter-group input:focus,
        .filter-group select:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .search-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        
        .btn-reset,
        .btn-apply {
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 14px;
          border: none;
        }
        
        .btn-reset {
          background: #f7fafc;
          color: #4a5568;
        }
        
        .btn-reset:hover {
          background: #edf2f7;
        }
        
        .btn-apply {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .btn-apply:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .btn-apply:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        @media (max-width: 768px) {
          .search-basic {
            flex-direction: column;
          }
          
          .search-input-group {
            width: 100%;
            min-width: 0;
          }
          
          .filters-grid {
            grid-template-columns: 1fr;
          }
          
          .search-actions {
            flex-direction: column;
          }
          
          .btn-reset,
          .btn-apply {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AdvancedSearch;
