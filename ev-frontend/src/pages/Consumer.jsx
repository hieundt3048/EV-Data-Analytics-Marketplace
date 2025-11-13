import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/index.css';
import '../styles/consumer.css';
import ApiKeyManagement from '../components/ApiKeyManagement';
import RecommendationsSection from '../components/RecommendationsSection';
import ErrorBoundary from '../components/ErrorBoundary';
import ConsumerProfile from './ConsumerProfile';

// Chỉ dùng để hiển thị trong documentation UI
const API_BASE = 'http://localhost:8080';

const Consumer = () => {
  const navigate = useNavigate();
  const redirectingRef = useRef(false); // Flag để tránh redirect nhiều lần
  const [activeTab, setActiveTab] = useState('data-discovery');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const apiKeyRef = useRef(null);
  
  const [datasets, setDatasets] = useState([]);
  const [filteredDatasets, setFilteredDatasets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [previewDataset, setPreviewDataset] = useState(null);
  const [showReceipt, setShowReceipt] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [filters, setFilters] = useState({
    category: '',
    timeRange: '',
    region: '',
    vehicleType: '',
    batteryType: '',
    dataFormat: '',
    pricingType: '',
    minPrice: '',
    maxPrice: '',
    searchQuery: ''
  });

  const [categoriesError, setCategoriesError] = useState(null);
  const [datasetsError, setDatasetsError] = useState(null);
  const [purchaseError, setPurchaseError] = useState(null);
  const [dashboardError, setDashboardError] = useState(null);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [aiSuggestionsError, setAiSuggestionsError] = useState(null);
  const [apiKeyError, setApiKeyError] = useState(null);

  const [aiSummary, setAiSummary] = useState('');
  const [aiConfidence, setAiConfidence] = useState(null);
  const [aiGeneratedAt, setAiGeneratedAt] = useState('');

  // Simplified fetchWithAuth like Admin component
  const fetchWithAuth = useCallback(async (url, opts = {}) => {
    const token = localStorage.getItem('authToken');
    
    // Nếu không có token, redirect về login
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
        // Nếu lỗi 401 (Unauthorized), token có thể đã hết hạn
        if (response.status === 401) {
          if (!redirectingRef.current) {
            redirectingRef.current = true;
            console.warn('Token expired or invalid, redirecting to login');
            localStorage.removeItem('authToken');
            navigate('/login');
          }
          throw new Error('Session expired. Please login again.');
        }
        // Đọc response text để lấy thông báo lỗi
        const errorText = await response.text();
        throw new Error(errorText || `Request failed with status ${response.status}`);
      }
      
      if (response.status === 204) return null;
      
      // Parse JSON response
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }, [navigate]);

  // Fetch data functions
  const fetchCategories = useCallback(async () => {
    setCategoriesError(null);
    try {
      const data = await fetchWithAuth('/api/categories');
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories([]);
        setCategoriesError('Unable to load data categories.');
      }
    } catch (error) {
      setCategories([]);
      setCategoriesError(error.message || 'Unable to load data categories.');
    }
  }, [fetchWithAuth]);

  const fetchAnalyticsData = useCallback(async (datasetId) => {
    if (!datasetId) return;
    setAnalyticsError(null);
    try {
      const data = await fetchWithAuth(`/api/dashboards/${datasetId}`);
      if (data) {
        setAnalyticsData(data);
      } else {
        setAnalyticsData(null);
        setAnalyticsError('No analytics data available for this dataset.');
      }
    } catch (error) {
      setAnalyticsData(null);
      setAnalyticsError(error.message || 'Unable to load analytics data.');
      throw error;
    }
  }, [fetchWithAuth]);

  const fetchAiSuggestions = useCallback(async (datasetId) => {
    setAiSuggestionsError(null);
    if (!datasetId) {
      setAiSuggestions([]);
      setAiSummary('');
      setAiConfidence(null);
      setAiGeneratedAt('');
      return;
    }

    try {
      const params = new URLSearchParams({
        datasetId: datasetId.toString(),
        analysisType: 'general'
      });
      const data = await fetchWithAuth(`/api/analytics/ai-suggestions?${params.toString()}`);
      if (data) {
        setAiSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
        setAiSummary(data.analysisSummary || '');
        setAiConfidence(data.confidenceScore ?? null);
        setAiGeneratedAt(data.generatedAt || '');
      } else {
        setAiSuggestions([]);
        setAiSummary('');
        setAiConfidence(null);
        setAiGeneratedAt('');
        setAiSuggestionsError('No AI suggestions available for this dataset.');
      }
    } catch (error) {
      setAiSuggestions([]);
      setAiSummary('');
      setAiConfidence(null);
      setAiGeneratedAt('');
      setAiSuggestionsError(error.message || 'Unable to load AI suggestions.');
      throw error;
    }
  }, [fetchWithAuth]);

  const fetchApprovedDatasets = useCallback(async () => {
    setDatasetsError(null);
    setLoading(true);
    try {
      const response = await fetchWithAuth('/api/consumers/datasets/approved');

      if (Array.isArray(response)) {
        setDatasets(response);
        setFilteredDatasets(response);
        if (response.length > 0) {
          setSelectedDatasetId((current) => current ?? String(response[0].id));
        }
      } else if (response === null) {
        // Empty or non-JSON response
        setDatasets([]);
        setFilteredDatasets([]);
        setDatasetsError('No datasets found.');
      } else {
        setDatasets([]);
        setFilteredDatasets([]);
        setDatasetsError('Invalid dataset list received from server.');
      }
    } catch (error) {
      console.error('Error fetching approved datasets:', error);
      setDatasets([]);
      setFilteredDatasets([]);
      // Display clear error message
      const errorMsg = error.message || 'Unable to load dataset list.';
      setDatasetsError(errorMsg.includes('JSON') 
        ? 'Invalid data format from server. Please try again later.' 
        : errorMsg);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  const fetchPurchaseHistory = useCallback(async () => {
    setPurchaseError(null);
    try {
      console.log('[fetchPurchaseHistory] Fetching from /api/orders/history...');
      const data = await fetchWithAuth('/api/orders/history');
      console.log('[fetchPurchaseHistory] Received data:', data);
      if (Array.isArray(data)) {
        setPurchaseHistory(data);
        console.log('[fetchPurchaseHistory] Set purchaseHistory with', data.length, 'items');
      } else {
        setPurchaseHistory([]);
        setPurchaseError('No purchase history available.');
        console.warn('[fetchPurchaseHistory] Data is not an array:', data);
      }
    } catch (error) {
      setPurchaseHistory([]);
      setPurchaseError(error.message || 'Unable to load purchase history.');
      console.error('[fetchPurchaseHistory] Error:', error);
    }
  }, [fetchWithAuth]);

  const fetchDashboard = useCallback(async () => {
    setDashboardError(null);
    try {
      const data = await fetchWithAuth('/api/consumer/dashboard');
      if (data) {
        setDashboardData(data);
      } else {
        setDashboardData(null);
        setDashboardError('No dashboard data available.');
      }
    } catch (error) {
      setDashboardData(null);
      setDashboardError(error.message || 'Unable to load dashboard data.');
    }
  }, [fetchWithAuth]);

  // Filter functions
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const applyFilters = (currentFilters) => {
    let filtered = [...datasets];

    // Filter by search query
    if (currentFilters.searchQuery) {
      const query = currentFilters.searchQuery.toLowerCase();
      filtered = filtered.filter(ds => 
        ds.name?.toLowerCase().includes(query) || 
        ds.description?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (currentFilters.category) {
      filtered = filtered.filter(ds => {
        const datasetCategory = (ds.category || '').toString().toLowerCase().trim();
        const filterCategory = currentFilters.category.toLowerCase().trim();
        return datasetCategory === filterCategory;
      });
    }

    // Filter by region
    if (currentFilters.region) {
      filtered = filtered.filter(ds => {
        const datasetRegion = (ds.region || '').toString().toLowerCase().trim();
        const filterRegion = currentFilters.region.toLowerCase().trim();
        return datasetRegion === filterRegion;
      });
    }

    // Filter by vehicle type
    if (currentFilters.vehicleType) {
      filtered = filtered.filter(ds => {
        const datasetVehicleType = (ds.vehicleType || '').toString().toLowerCase().trim();
        const filterVehicleType = currentFilters.vehicleType.toLowerCase().trim();
        return datasetVehicleType === filterVehicleType;
      });
    }

    // Filter by battery type
    if (currentFilters.batteryType) {
      filtered = filtered.filter(ds => {
        const datasetBatteryType = (ds.batteryType || '').toString().toLowerCase().trim();
        const filterBatteryType = currentFilters.batteryType.toLowerCase().trim();
        return datasetBatteryType === filterBatteryType;
      });
    }

    // Filter by data format
    if (currentFilters.dataFormat) {
      filtered = filtered.filter(ds => {
        const datasetDataFormat = (ds.dataFormat || '').toString().toLowerCase().trim();
        const filterDataFormat = currentFilters.dataFormat.toLowerCase().trim();
        return datasetDataFormat === filterDataFormat;
      });
    }

    // Filter by pricing type
    if (currentFilters.pricingType) {
      filtered = filtered.filter(ds => {
        const datasetPricingType = (ds.pricingType || '').toString().toLowerCase().trim();
        const filterPricingType = currentFilters.pricingType.toLowerCase().trim();
        return datasetPricingType === filterPricingType;
      });
    }

    // Filter by price range
    if (currentFilters.minPrice) {
      filtered = filtered.filter(ds => ds.price >= parseFloat(currentFilters.minPrice));
    }
    if (currentFilters.maxPrice) {
      filtered = filtered.filter(ds => ds.price <= parseFloat(currentFilters.maxPrice));
    }

    setFilteredDatasets(filtered);
  };
 
  const searchDatasets = () => {
    applyFilters(filters);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      timeRange: '',
      region: '',
      vehicleType: '',
      batteryType: '',
      dataFormat: '',
      pricingType: '',
      minPrice: '',
      maxPrice: '',
      searchQuery: ''
    });
    setFilteredDatasets(datasets);
  };

  // API Key functions
  const generateApiKey = async () => {
    setApiKeyError(null);
    try {
      const data = await fetchWithAuth('/api/apikeys/generate', {
        method: 'POST',
        body: JSON.stringify({ name: 'web-ui' })
      });
      if (data?.key) {
        setApiKey(data.key);
        alert('API key generated successfully!');
      } else {
        const message = data?.message || 'Server did not return API key.';
        setApiKey('');
        setApiKeyError(message);
        alert(message);
      }
    } catch (e) {
      const message = e.message || 'Unable to generate API key.';
      setApiKey('');
      setApiKeyError(message);
      alert(message);
    }
  };

  const copyApiKey = async () => {
    if (!apiKey) {
      alert('No API key to copy');
      return;
    }
    try {
      await navigator.clipboard.writeText(apiKey);
      alert('API key copied to clipboard!');
      if (apiKeyRef.current) {
        apiKeyRef.current.classList.add('copied');
        setTimeout(() => {
          apiKeyRef.current.classList.remove('copied');
        }, 1000);
      }
    } catch (e) {
      console.error('Copy failed', e);
      alert('Copy failed - please select and copy manually');
    }
  };

  // Purchase functions
  const purchaseDataset = async (dataset) => {
    if (!dataset?.id) {
      alert('Unable to identify dataset to purchase.');
      return;
    }

    const priceLabel = dataset?.price === null || dataset?.price === undefined
      ? '—'
      : formatPurchaseAmount(dataset.price);

    if (!window.confirm(`Are you sure you want to purchase "${dataset.name || 'Dataset'}" for ${priceLabel}?`)) {
      return;
    }

    try {
      const response = await fetchWithAuth('/api/orders/checkout', {
        method: 'POST',
        body: JSON.stringify({ datasetId: dataset.id })
      });
      
      if (response && response.status === 'success') {
        alert('Dataset purchased successfully!');
        fetchPurchaseHistory();
      } else {
        const errorMsg = response?.message || 'Unknown error from server.';
        alert('Error: ' + errorMsg);
      }
    } catch (e) {
      const message = e.message || 'Unable to complete transaction.';
      console.error('Purchase error:', e);
      alert('Error: ' + message);
    }
  };

  const downloadDataset = async (id) => {
    if (!id) {
      alert('Dataset ID not found for download.');
      return;
    }

    try {
      // Use relative URL for Vite proxy
      window.open(`/api/datasets/${id}/download`, '_blank');
    } catch (e) {
      alert('Unable to start dataset download.');
    }
  };

  const deletePurchase = async (purchaseId) => {
    if (!purchaseId) {
      alert('Transaction ID not found for deletion.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) return;

    try {
      const res = await fetchWithAuth(`/api/orders/${purchaseId}`, { method: 'DELETE' });
      // Some servers return null for 204, so treat as success if no exception was thrown
      // Refresh local history
      fetchPurchaseHistory();
      alert('Transaction deleted successfully.');
    } catch (e) {
      console.error('Delete purchase error', e);
      alert('Unable to delete transaction: ' + (e.message || e));
    }
  };

  // Utility functions
  const formatCurrency = (value) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value || 0);

  const normalizeNumber = (value) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      return Number.isNaN(parsed) ? NaN : parsed;
    }
    if (typeof value === 'bigint') return Number(value);
    const parsed = Number(value);
    return Number.isNaN(parsed) ? NaN : parsed;
  };

  const formatNumberValue = (value) => {
    if (value === null || value === undefined) return '—';
    const numeric = normalizeNumber(value);
    if (Number.isNaN(numeric)) return value;
    return new Intl.NumberFormat().format(numeric);
  };

  const formatPercentageValue = (value) => {
    if (value === null || value === undefined) return '—';
    const numeric = normalizeNumber(value);
    if (Number.isNaN(numeric)) return value;
    return `${numeric.toFixed(2)}%`;
  };

  const formatPurchaseAmount = (value) => {
    if (value === null || value === undefined) return '—';
    const numeric = normalizeNumber(value);
    if (Number.isNaN(numeric)) return value;
    return formatCurrency(numeric);
  };

  const formatLabel = (text) => {
    if (!text) return '—';
    return text.toString().replace(/_/g, ' ');
  };

  const getStatusClass = (status) => {
    const normalized = (status || '').toString().toLowerCase();
    if (['paid', 'completed', 'success'].includes(normalized)) return 'completed';
    if (normalized === 'failed' || normalized === 'cancelled' || normalized === 'canceled') return 'failed';
    if (normalized === 'pending' || normalized === 'processing') return 'pending';
    return 'info';
  };

  const formatBytes = (bytes) => {
    const value = Number(bytes);
    if (!value || Number.isNaN(value)) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
    const scaled = value / (1024 ** index);
    return `${scaled.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
  };

  const formatDateTime = (value) => {
    if (!value) return '—';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return typeof value === 'string' ? value : '—';
    }
    try {
      return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
    } catch (error) {
      return date.toLocaleString();
    }
  };

  const renderErrorBanner = (message) => {
    if (!message) return null;
    return (
      <div className="consumer-error-message" role="alert">
        {message}
      </div>
    );
  };

  const totalSpending = useMemo(() => purchaseHistory.reduce((total, order) => {
    const amount = normalizeNumber(order?.amount);
    return Number.isNaN(amount) ? total : total + amount;
  }, 0), [purchaseHistory]);

  const successfulPurchases = useMemo(() => purchaseHistory.filter((order) => {
    const status = (order?.status || '').toString().toLowerCase();
    return ['paid', 'completed', 'success'].includes(status);
  }).length, [purchaseHistory]);

  // Tính số dataset duy nhất đã mua (unique dataset IDs)
  const uniqueDatasetsPurchased = useMemo(() => {
    const uniqueIds = new Set(purchaseHistory.map(order => order.datasetId).filter(id => id));
    return uniqueIds.size;
  }, [purchaseHistory]);

  const selectedDataset = useMemo(
    () => datasets.find((dataset) => String(dataset.id) === String(selectedDatasetId)),
    [datasets, selectedDatasetId]
  );

  const datasetOptions = useMemo(() => datasets.map((dataset) => ({
    value: String(dataset.id),
    label: dataset.name || `Dataset #${dataset.id}`
  })), [datasets]);

  const summaryMetricsConfig = [
    { key: 'totalRevenue', label: 'Total Revenue', formatter: formatPurchaseAmount },
    { key: 'totalOrders', label: 'Paid Orders', formatter: formatNumberValue },
    { key: 'averageOrderValue', label: 'Avg Order Value', formatter: formatPurchaseAmount },
    { key: 'conversionRate', label: 'Conversion Rate', formatter: formatPercentageValue },
    { key: 'activeUsers', label: 'Active Users', formatter: formatNumberValue }
  ];

  // Modal handlers
  const openPreview = (dataset) => setPreviewDataset(dataset);
  const closePreview = () => setPreviewDataset(null);
  const openReceipt = (order) => setShowReceipt(order);
  const closeReceipt = () => setShowReceipt(null);

  // Tab switching effect
  useEffect(() => {
    document.querySelectorAll('.tab-content').forEach((el) => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));

    const activeEl = document.getElementById(activeTab);
    const btn = document.querySelector(`.tab-btn[data-tab="${activeTab}"]`);

    if (activeEl) activeEl.classList.add('active');
    if (btn) btn.classList.add('active');

    if (activeTab === 'data-discovery') {
      fetchCategories();
      if (!datasets.length) {
        fetchApprovedDatasets();
      }
    } else if (activeTab === 'purchases') {
      fetchPurchaseHistory();
    } else if (activeTab === 'analytics') {
      if (!datasets.length) {
        fetchApprovedDatasets();
      }
    }
  }, [activeTab, fetchCategories, fetchApprovedDatasets, fetchPurchaseHistory, fetchDashboard, datasets.length]);

  // Initial load
  useEffect(() => {
    fetchCategories();
    fetchApprovedDatasets();
    fetchPurchaseHistory();
    fetchDashboard();
  }, [fetchCategories, fetchApprovedDatasets, fetchPurchaseHistory, fetchDashboard]);

  useEffect(() => {
    if (datasets.length > 0 && !selectedDatasetId) {
      setSelectedDatasetId(String(datasets[0].id));
    }
  }, [datasets, selectedDatasetId]);

  const loadDatasetAnalytics = useCallback(async (datasetId) => {
    if (!datasetId) return;
    setAnalyticsLoading(true);
    try {
      await Promise.all([
        fetchAnalyticsData(datasetId),
        fetchAiSuggestions(datasetId)
      ]);
    } catch (error) {
      // errors handled in individual fetches
    } finally {
      setAnalyticsLoading(false);
    }
  }, [fetchAnalyticsData, fetchAiSuggestions]);

  useEffect(() => {
    if (activeTab !== 'analytics' || !selectedDatasetId) return;
    const targetDataset = datasets.find((item) => String(item.id) === String(selectedDatasetId));
    if (targetDataset) {
      loadDatasetAnalytics(targetDataset.id);
    }
  }, [activeTab, selectedDatasetId, datasets, loadDatasetAnalytics]);

  return (
    <>
      <section className="page-heading">
        <div className="container">
          <div className="header-text">
            <h2>Data Consumer Portal</h2>
            <div className="div-dec" />
          </div>
        </div>
      </section>

      <div className="consumer-tabs">
        <div className="container">
          <div className="tabs-container">
            <button className="tab-btn" data-tab="data-discovery" onClick={() => setActiveTab('data-discovery')}>Data Discovery</button>
            <button className="tab-btn" data-tab="purchases" onClick={() => setActiveTab('purchases')}>Purchase History</button>
            <button className="tab-btn" data-tab="analytics" onClick={() => setActiveTab('analytics')}>Analytics Dashboard</button>
            <button className="tab-btn" data-tab="api" onClick={() => setActiveTab('api')}>API Documentation</button>
            <button className="tab-btn" data-tab="profile" onClick={() => setActiveTab('profile')}>My Profile</button>
          </div>
        </div>
      </div>

      <main className="consumer-container">
        {/* Data Discovery */}
        <div id="data-discovery" className="tab-content">
          <section className="consumer-section">
            <h2>Search & Discover Data</h2>
            <div className="consumer-card filter-card">
              <div className="card-body">
                <div className="filter-header">
                  <div className="filter-header-content">
                    <div className="filter-icon-badge">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                      </svg>
                    </div>
                    <div>
                      <h5 className="filter-title">Find the EV Data You Need</h5>
                      <p className="section-description">Browse comprehensive EV datasets including driving behavior, battery performance, charging station usage, and V2G transactions.</p>
                    </div>
                  </div>
                </div>
                
                {renderErrorBanner(categoriesError)}

                <div className="search-filters">
                  <div className="filter-group">
                    <label htmlFor="data-category">
                      <svg className="filter-label-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                      </svg>
                      Data Category
                    </label>
                    <select 
                      id="data-category"
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                      <option value="">All Categories</option>
                      <option value="charging_behavior"> Charging Behavior</option>
                      <option value="battery_health"> Battery Health</option>
                      <option value="route_optimization"> Route Optimization</option>
                      <option value="energy_consumption"> Energy Consumption</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label htmlFor="time-range">
                      <svg className="filter-label-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                      </svg>
                      Time Range
                    </label>
                    <select 
                      id="time-range"
                      value={filters.timeRange}
                      onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                    >
                      <option value="">Any Time</option>
                      <option value="2020-2021"> 2020-2021</option>
                      <option value="2021-2022"> 2021-2022</option>
                      <option value="2022-2023"> 2022-2023</option>
                      <option value="2023-2024"> 2023-2024</option>
                      <option value="2024-present"> 2024-Present</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label htmlFor="region">
                      <svg className="filter-label-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      Region
                    </label>
                    <select 
                      id="region"
                      value={filters.region}
                      onChange={(e) => handleFilterChange('region', e.target.value)}
                    >
                      <option value="">All Regions</option>
                      <option value="north_america">🇺🇸 North America</option>
                      <option value="europe">🇪🇺 Europe</option>
                      <option value="asia"> Asia</option>
                      <option value="australia">🇦🇺 Australia</option>
                      <option value="africa"> Africa</option>
                      <option value="south_america"> South America</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label htmlFor="vehicle-type">
                      <svg className="filter-label-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                      </svg>
                      Vehicle Type
                    </label>
                    <select 
                      id="vehicle-type"
                      value={filters.vehicleType}
                      onChange={(e) => handleFilterChange('vehicleType', e.target.value)}
                    >
                      <option value="">All Types</option>
                      <option value="sedan"> Sedan</option>
                      <option value="suv"> SUV</option>
                      <option value="truck"> Truck</option>
                      <option value="bus"> Bus</option>
                      <option value="motorcycle"> Motorcycle</option>
                      <option value="other"> Other</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label htmlFor="battery-type">
                      <svg className="filter-label-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/>
                      </svg>
                      Battery Type
                    </label>
                    <select 
                      id="battery-type"
                      value={filters.batteryType}
                      onChange={(e) => handleFilterChange('batteryType', e.target.value)}
                    >
                      <option value="">All Types</option>
                      <option value="lithium_ion"> Lithium-Ion</option>
                      <option value="solid_state"> Solid-State</option>
                      <option value="nickel_metal_hydride"> Nickel-Metal Hydride</option>
                      <option value="lead_acid"> Lead-Acid</option>
                      <option value="other"> Other</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label htmlFor="data-format">
                      <svg className="filter-label-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                      </svg>
                      Data Format
                    </label>
                    <select 
                      id="data-format"
                      value={filters.dataFormat}
                      onChange={(e) => handleFilterChange('dataFormat', e.target.value)}
                    >
                      <option value="">All Formats</option>
                      <option value="CSV"> CSV</option>
                      <option value="JSON"> JSON</option>
                      <option value="XML"> XML</option>
                      <option value="Parquet"> Parquet</option>
                      <option value="Excel"> Excel</option>
                      <option value="other"> Other</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label htmlFor="pricing-type">
                      <svg className="filter-label-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                      </svg>
                      Pricing Model
                    </label>
                    <select 
                      id="pricing-type"
                      value={filters.pricingType}
                      onChange={(e) => handleFilterChange('pricingType', e.target.value)}
                    >
                      <option value="">All Models</option>
                      <option value="per_request"> Pay per Download</option>
                      <option value="subscription"> Subscription</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label htmlFor="min-price">
                      <svg className="filter-label-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 10l5 5 5-5z"/>
                      </svg>
                      Min Price ($)
                    </label>
                    <input 
                      id="min-price"
                      type="number" 
                      min="0" 
                      step="0.01"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    />
                  </div>

                  <div className="filter-group">
                    <label htmlFor="max-price">
                      <svg className="filter-label-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 14l5-5 5 5z"/>
                      </svg>
                      Max Price ($)
                    </label>
                    <input 
                      id="max-price"
                      type="number" 
                      min="0" 
                      step="0.01"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    />
                  </div>

                  <div className="filter-group full-width">
                    <label htmlFor="searchQuery">
                      <svg className="filter-label-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                      </svg>
                      Search Datasets
                    </label>
                    <input 
                      id="searchQuery"
                      type="text" 
                      placeholder="Search by name or description..."
                      value={filters.searchQuery}
                      onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                    />
                  </div>
                </div>

                <div className="filter-actions">
                  <button className="consumer-btn consumer-btn-primary" onClick={searchDatasets} disabled={loading}>
                    <svg className="btn-icon" viewBox="0 0 24 24">
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                    {loading ? 'Searching...' : 'Search Datasets'}
                  </button>
                  <button className="consumer-btn consumer-btn-primary" onClick={clearFilters} disabled={loading}>
                    <svg className="btn-icon" viewBox="0 0 24 24">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Search Results */}
            <section className="consumer-section">
              <div className="section-header">
                <h2>Available Datasets ({filteredDatasets.length})</h2>
              </div>

              {renderErrorBanner(datasetsError)}

              {loading ? (
                <div className="loading-state">
                  <p>Loading datasets...</p>
                </div>
              ) : filteredDatasets.length === 0 ? (
                <div className="consumer-card">
                  <div className="card-body empty-state">
                    <h5>No datasets found</h5>
                    <p>Try adjusting your search filters or browse all available datasets.</p>
                    <button className="consumer-btn consumer-btn-primary" onClick={clearFilters}>
                      Clear Filters & View All
                    </button>
                  </div>
                </div>
              ) : (
                <div className="datasets-grid">
                  {filteredDatasets.map((dataset) => (
                    <div className="dataset-card" key={dataset.id}>
                      <div className="dataset-icon">
                        <svg viewBox="0 0 24 24">
                          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                        </svg>
                      </div>
                      <h4>{dataset.name || `Dataset #${dataset.id}`}</h4>
                      <p>{dataset.description || 'No description available'}</p>
                      
                      <div className="dataset-tags">
                        {dataset.category && <span className="tag tag-category">{formatLabel(dataset.category)}</span>}
                        {dataset.region && <span className="tag tag-region">{formatLabel(dataset.region)}</span>}
                        {dataset.vehicleType && <span className="tag tag-vehicle">{formatLabel(dataset.vehicleType)}</span>}
                        {dataset.batteryType && <span className="tag tag-battery">{formatLabel(dataset.batteryType)}</span>}
                        {dataset.timeRange && <span className="tag tag-time">{dataset.timeRange}</span>}
                        {dataset.dataFormat && <span className="tag tag-format">{formatLabel(dataset.dataFormat)}</span>}
                      </div>
                      
                      <div className="dataset-meta">
                        <span className="size">{formatBytes(dataset.sizeBytes)}</span>
                        <span className={`format ${(dataset.pricingType || '').toString().toLowerCase()}`}>
                          {dataset.pricingType ? formatLabel(dataset.pricingType) : '—'}
                        </span>
                      </div>
                      <div className="dataset-price">{formatPurchaseAmount(dataset.price)}</div>
                      <div className="dataset-actions">
                        <button 
                          className="consumer-btn consumer-btn-primary" 
                          onClick={() => purchaseDataset(dataset)}
                        >
                          Purchase Dataset
                        </button>
                        <button 
                          className="consumer-btn consumer-btn-outline" 
                          onClick={() => openPreview(dataset)}
                        >
                          Preview
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* AI Recommendations */}
            <ErrorBoundary>
              <RecommendationsSection fetchWithAuth={fetchWithAuth} />
            </ErrorBoundary>
          </section>
        </div>

        {/* Purchase History */}
        <div id="purchases" className="tab-content">
          <section className="consumer-section">
            <div className="section-header-enhanced">
              <div className="section-header-content">
                <div className="section-icon-badge purchases">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="section-title-enhanced">Purchase History</h2>
                  <p className="section-description">Track all your dataset purchases and transactions</p>
                </div>
              </div>
              <div className="header-actions">
                <button
                  className="consumer-btn consumer-btn-outline"
                  onClick={() => alert('Tính năng xuất báo cáo sẽ sớm được bổ sung.')}
                >
                  <svg className="btn-icon" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                  Export History
                </button>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
                </div>
                <div className="stat-content">
                  <h3>{uniqueDatasetsPurchased}</h3>
                  <p>Datasets Purchased</p>
                  <span className="stat-change neutral">Tổng số dataset đã mua</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.78-1.18 2.73-3.12 3.16z"/></svg></div>
                <div className="stat-content">
                  <h3>{purchaseHistory.length}</h3>
                  <p>Total Purchases</p>
                  <span className="stat-change neutral">{successfulPurchases} giao dịch thành công</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>
                <div className="stat-content">
                  <h3>{formatPurchaseAmount(totalSpending)}</h3>
                  <p>Total Spending</p>
                  <span className="stat-change neutral">Dựa trên lịch sử mua</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></div>
                <div className="stat-content">
                  <h3>{apiKey ? 1 : 0}</h3>
                  <p>Active API Keys</p>
                  <span className="stat-change neutral">Thống kê từ dashboard</span>
                </div>
              </div>
            </div>

            {renderErrorBanner(purchaseError)}

            {/* Purchase History Table */}
            <section className="consumer-section">
              <h3>Your Dataset Purchases</h3>
              <div className="table-container">
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Dataset</th>
                        <th>Category</th>
                        <th>Type</th>
                        <th>Purchase Date</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseHistory.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="empty-state">
                            <div className="empty-state-content">
                              <h5>No purchases yet</h5>
                              <p>Start exploring datasets to make your first purchase.</p>
                              <button className="consumer-btn consumer-btn-primary" onClick={() => setActiveTab('data-discovery')}>
                                Browse Datasets
                              </button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        purchaseHistory.map((purchase) => {
                          const title = purchase.itemTitle || purchase.datasetTitle || 'Dataset';
                          const amount = formatPurchaseAmount(purchase.amount);
                          const purchaseDate = formatDateTime(purchase.purchaseDate || purchase.timestamp);
                          const statusLabel = purchase.status || 'UNKNOWN';
                          return (
                            <tr key={purchase.id}>
                              <td>
                                <div className="dataset-info">
                                  <div className="dataset-icon">
                                    <svg viewBox="0 0 24 24">
                                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                                    </svg>
                                  </div>
                                  <div>
                                    <div className="dataset-name">{title}</div>
                                    <div className="dataset-desc">Purchase ID: {purchase.id}</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span className="category-badge">
                                  {purchase.category 
                                    ? purchase.category.split('_').map(word => 
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                      ).join(' ')
                                    : '—'}
                                </span>
                              </td>
                              <td>
                                <span className="type-badge">
                                  {purchase.pricingType === 'per_request' 
                                    ? 'Pay per Download' 
                                    : purchase.pricingType === 'subscription' 
                                    ? 'Subscription' 
                                    : purchase.pricingType || '—'}
                                </span>
                              </td>
                              <td>{purchaseDate}</td>
                              <td>{amount}</td>
                              <td><span className={`status-badge ${getStatusClass(statusLabel)}`}>{statusLabel}</span></td>
                              <td>
                                <div className="action-buttons">
                                  <button className="btn-icon" title="Download Again" onClick={() => downloadDataset(purchase.datasetId)} disabled={!purchase.datasetId}>
                                    <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                                  </button>
                                  <button className="btn-icon" title="View Receipt" onClick={() => openReceipt(purchase)}>
                                    <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
                                  </button>
                                  <button className="btn-icon" title="Delete Purchase" onClick={() => deletePurchase(purchase.id)}>
                                    <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </section>
        </div>

        {/* Analytics Dashboard */}
        <div id="analytics" className="tab-content">
          <section className="consumer-section">
            <div className="section-header-enhanced">
              <div className="section-header-content">
                <div className="section-icon-badge analytics">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="section-title-enhanced">Analytics Dashboard</h2>
                  <p className="section-description">Visualize and analyze your EV data with AI-powered insights</p>
                </div>
              </div>
              <div className="header-actions">
                <button
                  className="consumer-btn consumer-btn-outline"
                  onClick={() => selectedDataset && loadDatasetAnalytics(selectedDataset.id)}
                  disabled={!selectedDataset}
                >
                  <svg className="btn-icon" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                  Refresh Data
                </button>
              </div>
            </div>

            <div className="consumer-card">
              <div className="card-body">
                <h4>Select Dataset</h4>
                <p>Choose a purchased dataset to view live revenue metrics and AI-generated insights.</p>
                <select
                  value={selectedDatasetId || ''}
                  onChange={(e) => setSelectedDatasetId(e.target.value || null)}
                >
                  <option value="">-- Chọn dataset --</option>
                  {datasetOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {renderErrorBanner(analyticsError)}
            {renderErrorBanner(aiSuggestionsError)}

            {analyticsLoading ? (
              <div className="loading-state">
                <p>Đang tải dữ liệu phân tích...</p>
              </div>
            ) : analyticsData ? (
              <>
                <div className="stats-grid">
                  {summaryMetricsConfig.map(({ key, label, formatter }) => (
                    <div className="stat-card" key={key}>
                      <div className="stat-icon" />
                      <div className="stat-content">
                        <h3>{formatter(analyticsData.summaryMetrics?.[key])}</h3>
                        <p>{label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {analyticsData.insights && Object.keys(analyticsData.insights).length > 0 && (
                  <div className="consumer-card insights-card">
                    <div className="card-body">
                      <div className="card-header-with-icon">
                        <div className="icon-badge primary">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </div>
                        <div>
                          <h4>Key Insights</h4>
                          <p className="card-subtitle">Important metrics and patterns from your data</p>
                        </div>
                      </div>
                      <ul className="insights-list enhanced">
                        {Object.entries(analyticsData.insights).map(([insightKey, insightValue]) => (
                          <li key={insightKey} className="insight-item">
                            <span className="insight-icon"></span>
                            <div className="insight-content">
                              <strong className="insight-label">{formatLabel(insightKey)}:</strong>
                              <span className="insight-value">
                                {Array.isArray(insightValue) ? insightValue.join(', ') : (insightValue ?? '—')}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="consumer-card">
                <div className="card-body">
                  <h4>Không có dữ liệu phân tích</h4>
                  <p>Chọn dataset đã có giao dịch để xem thống kê hoặc quay lại sau.</p>
                </div>
              </div>
            )}

            {aiSummary && (
              <div className="consumer-card ai-summary-card">
                <div className="card-body">
                  <div className="card-header-with-icon">
                    <div className="icon-badge success">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/>
                      </svg>
                    </div>
                    <div>
                      <h4>AI Analysis Summary</h4>
                      <p className="card-subtitle">Automated insights powered by machine learning</p>
                    </div>
                  </div>
                  <div className="ai-summary-content">
                    <p className="summary-text">{aiSummary}</p>
                    <div className="insight-meta enhanced">
                      {aiConfidence !== null && (
                        <span className="meta-badge confidence">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/>
                          </svg>
                          Confidence: {formatPercentageValue(aiConfidence * 100)}
                        </span>
                      )}
                      {aiGeneratedAt && (
                        <span className="meta-badge timestamp">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                          </svg>
                          Generated: {formatDateTime(aiGeneratedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {aiSuggestions.length > 0 && (
            <section className="consumer-section ai-suggestions-section">
              <div className="section-header">
                <div className="section-title-with-icon">
                  <div className="icon-badge warning">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <div>
                    <h2>AI Suggestions</h2>
                    <p className="section-subtitle">Actionable recommendations to optimize your data usage</p>
                  </div>
                </div>
              </div>
              <div className="insights-grid enhanced">
                {aiSuggestions.map((suggestion, index) => {
                  const confidenceLabel = suggestion.confidence != null ? formatPercentageValue(suggestion.confidence * 100) : null;
                  const impactLevel = (suggestion.impact || '').toLowerCase();
                  const impactColor = impactLevel === 'high' ? 'error' : impactLevel === 'medium' ? 'warning' : 'info';
                  
                  return (
                    <div className={`insight-card enhanced ${impactLevel}-impact`} key={`${suggestion.type}-${index}`}>
                      <div className="insight-header">
                        <div className="header-content">
                          <h4>{suggestion.title || formatLabel(suggestion.type)}</h4>
                          {confidenceLabel && (
                            <span className={`insight-confidence ${impactColor}`}>
                              {confidenceLabel}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="insight-content">
                        <p className="suggestion-description">{suggestion.description || '—'}</p>
                        {suggestion.actions && suggestion.actions.length > 0 && (
                          <div className="action-items">
                            <strong className="action-title">Recommended Actions:</strong>
                            <ul className="action-list">
                              {suggestion.actions.map((action, actionIdx) => (
                                <li key={actionIdx}>
                                  <span className="action-bullet">→</span>
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {suggestion.impact && (
                          <div className="impact-badge-container">
                            <span className={`impact-badge ${impactColor}`}>
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                              </svg>
                              Impact: {formatLabel(suggestion.impact)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* API Documentation */}
        <div id="api" className="tab-content">
          <ErrorBoundary>
            <ApiKeyManagement fetchWithAuth={fetchWithAuth} />
          </ErrorBoundary>
        </div>

        {/* My Profile */}
        <div id="profile" className="tab-content">
          <ErrorBoundary>
            <ConsumerProfile fetchWithAuth={fetchWithAuth} />
          </ErrorBoundary>
        </div>
      </main>

      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="modal" onClick={(e) => { if (e.target.className === 'modal') setShowApiKeyModal(false); }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Generate New API Key</h3>
              <button className="modal-close" onClick={() => setShowApiKeyModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form className="api-key-form">
                <div className="form-group">
                  <label htmlFor="keyName">Key Name</label>
                  <input type="text" id="keyName" placeholder="e.g., Insurance App Integration" required/>
                </div>
                <div className="form-group">
                  <label htmlFor="integrationType">Integration Type</label>
                  <select id="integrationType">
                    <option value="insurance">Insurance System</option>
                    <option value="smart-city">Smart City Platform</option>
                    <option value="fleet-management">Fleet Management</option>
                    <option value="research">Research & Analysis</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Permissions</label>
                  <div className="permissions-grid">
                    <label className="permission-checkbox">
                      <input type="checkbox" name="keyPermissions" value="data_read" defaultChecked/>
                      Read EV Data
                    </label>
                    <label className="permission-checkbox">
                      <input type="checkbox" name="keyPermissions" value="analytics"/>
                      Access Analytics
                    </label>
                    <label className="permission-checkbox">
                      <input type="checkbox" name="keyPermissions" value="realtime"/>
                      Real-time Streams
                    </label>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="consumer-btn consumer-btn-outline" onClick={() => setShowApiKeyModal(false)}>Cancel</button>
              <button className="consumer-btn consumer-btn-primary" onClick={() => { generateApiKey(); setShowApiKeyModal(false); }}>Generate Key</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDataset && (
        <div className="modal" onClick={closePreview}>
          <div className="modal-content" onClick={(e)=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>Preview: {previewDataset.name}</h3>
              <button className="modal-close" onClick={closePreview}>×</button>
            </div>
            <div className="modal-body">
              <p>{previewDataset.description}</p>
              <div className="preview-details">
                <p><strong>Size:</strong> {formatBytes(previewDataset.sizeBytes)}</p>
                <p><strong>Price:</strong> {formatCurrency(previewDataset.price)}</p>
                <p><strong>Format:</strong> {previewDataset.dataFormat}</p>
                <p><strong>Category:</strong> {previewDataset.category?.replace('_', ' ')}</p>
              </div>
              <div className="modal-actions">
                <button className="consumer-btn consumer-btn-primary" onClick={() => purchaseDataset(previewDataset)}>Purchase</button>
                <button className="consumer-btn consumer-btn-outline" onClick={closePreview}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="modal" onClick={closeReceipt}>
          <div className="modal-content" onClick={(e)=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>Receipt: {showReceipt.id}</h3>
              <button className="modal-close" onClick={closeReceipt}>×</button>
            </div>
            <div className="modal-body">
              <div className="receipt-details">
                <p><strong>Item:</strong> {showReceipt.itemTitle}</p>
                <p><strong>Amount:</strong> {showReceipt.amount}</p>
                <p><strong>Date:</strong> {showReceipt.purchaseDate}</p>
                <p><strong>Status:</strong> {showReceipt.status}</p>
              </div>
              <div className="modal-actions">
                <button className="consumer-btn" onClick={() => alert('Download invoice feature coming soon')}>Download Invoice</button>
                <button className="consumer-btn consumer-btn-outline" onClick={closeReceipt}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Consumer;