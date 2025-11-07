import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/index.css';
import '../styles/consumer.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const Consumer = () => {
  const navigate = useNavigate();
  const redirectingRef = useRef(false); // Flag để tránh redirect nhiều lần
  const [activeTab, setActiveTab] = useState('dashboard');
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
  const [subscriptions, setSubscriptions] = useState([]);
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
  const [subscriptionsError, setSubscriptionsError] = useState(null);
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
      const response = await fetch(`${API_BASE}${url}`, { ...opts, headers });
      
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
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = `Request failed with status ${response.status}`;
        }
        throw new Error(errorText || `Request failed with status ${response.status}`);
      }
      
      if (response.status === 204) return null;
      
      // Kiểm tra content-type trước
      const contentType = response.headers.get('content-type') || '';
      
      // Đọc response text một lần duy nhất
      const responseText = await response.text();
      
      // Nếu response rỗng, trả về null
      if (!responseText || responseText.trim() === '') {
        return null;
      }
      
      // Thử parse JSON (một số API không set content-type đúng)
      try {
        const parsed = JSON.parse(responseText);
        return parsed;
      } catch (parseError) {
        // Nếu parse thất bại, log chi tiết để debug
        console.error('JSON Parse Error for URL:', url);
        console.error('Parse Error:', parseError.message);
        console.error('Content-Type:', contentType);
        console.error('Response text (first 500 chars):', responseText.substring(0, 500));
        
        // Nếu content-type là JSON nhưng parse thất bại, đây là lỗi nghiêm trọng
        if (contentType.includes('application/json')) {
          throw new Error(`Invalid JSON response from server. ${parseError.message}. Response preview: ${responseText.substring(0, 200)}...`);
        }
        
        // Nếu không phải JSON, trả về null
        console.warn('Response is not valid JSON, returning null');
        return null;
      }
    } catch (error) {
      console.error('API Error:', error);
      // Nếu là lỗi network, không throw lại để tránh crash
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection.');
      }
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
        setCategoriesError('Không thể lấy danh mục dữ liệu.');
      }
    } catch (error) {
      setCategories([]);
      setCategoriesError(error.message || 'Không thể lấy danh mục dữ liệu.');
    }
  }, [fetchWithAuth]);

  const fetchSubscriptions = useCallback(async () => {
    setSubscriptionsError(null);
    try {
      const data = await fetchWithAuth('/api/subscriptions');
      if (Array.isArray(data)) {
        setSubscriptions(data);
      } else {
        setSubscriptions([]);
        setSubscriptionsError('Không tìm thấy subscription nào.');
      }
    } catch (error) {
      setSubscriptions([]);
      setSubscriptionsError(error.message || 'Không thể tải danh sách subscription.');
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
        setAnalyticsError('Không có dữ liệu phân tích cho bộ dữ liệu này.');
      }
    } catch (error) {
      setAnalyticsData(null);
      setAnalyticsError(error.message || 'Không thể tải dữ liệu phân tích.');
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
        setAiSuggestionsError('Không có gợi ý AI cho bộ dữ liệu này.');
      }
    } catch (error) {
      setAiSuggestions([]);
      setAiSummary('');
      setAiConfidence(null);
      setAiGeneratedAt('');
      setAiSuggestionsError(error.message || 'Không thể tải gợi ý AI.');
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
        // Response rỗng hoặc không phải JSON
        setDatasets([]);
        setFilteredDatasets([]);
        setDatasetsError('Không có dataset nào được tìm thấy.');
      } else {
        setDatasets([]);
        setFilteredDatasets([]);
        setDatasetsError('Không nhận được danh sách dataset hợp lệ từ server.');
      }
    } catch (error) {
      console.error('Error fetching approved datasets:', error);
      setDatasets([]);
      setFilteredDatasets([]);
      // Hiển thị error message rõ ràng hơn
      const errorMsg = error.message || 'Không thể tải danh sách dataset.';
      setDatasetsError(errorMsg.includes('JSON') 
        ? 'Lỗi định dạng dữ liệu từ server. Vui lòng thử lại sau.' 
        : errorMsg);
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  const fetchPurchaseHistory = useCallback(async () => {
    setPurchaseError(null);
    try {
      const data = await fetchWithAuth('/api/orders/history');
      if (Array.isArray(data)) {
        setPurchaseHistory(data);
      } else {
        setPurchaseHistory([]);
        setPurchaseError('Không có lịch sử mua hàng.');
      }
    } catch (error) {
      setPurchaseHistory([]);
      setPurchaseError(error.message || 'Không thể tải lịch sử mua hàng.');
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
        setDashboardError('Không có dữ liệu dashboard.');
      }
    } catch (error) {
      setDashboardData(null);
      setDashboardError(error.message || 'Không thể tải dữ liệu dashboard.');
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
        const message = data?.message || 'Máy chủ không trả về API key.';
        setApiKey('');
        setApiKeyError(message);
        alert(message);
      }
    } catch (e) {
      const message = e.message || 'Không thể tạo API key.';
      setApiKey('');
      setApiKeyError(message);
      alert(message);
    }
  };

  const copyApiKey = async () => {
    if (!apiKey) {
      alert('Không có API key để sao chép');
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
      alert('Không xác định được dataset để mua.');
      return;
    }

    const priceLabel = dataset?.price === null || dataset?.price === undefined
      ? '—'
      : formatPurchaseAmount(dataset.price);

    if (!window.confirm(`Bạn có chắc muốn mua "${dataset.name || 'Dataset'}" với giá ${priceLabel}?`)) {
      return;
    }

    try {
      await fetchWithAuth('/api/orders/checkout', {
        method: 'POST',
        body: JSON.stringify({ datasetId: dataset.id })
      });
      alert('Mua dataset thành công!');
      fetchPurchaseHistory();
    } catch (e) {
      const message = e.message || 'Không thể hoàn tất giao dịch.';
      alert(message);
    }
  };

  const downloadDataset = async (id) => {
    if (!id) {
      alert('Không tìm thấy mã dataset để tải.');
      return;
    }

    try {
      window.open(`${API_BASE}/api/datasets/${id}/download`, '_blank');
    } catch (e) {
      alert('Không thể bắt đầu tải dataset.');
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
      fetchSubscriptions();
    } else if (activeTab === 'dashboard') {
      fetchDashboard();
      fetchSubscriptions();
    } else if (activeTab === 'analytics') {
      if (!datasets.length) {
        fetchApprovedDatasets();
      }
    }
  }, [activeTab, fetchCategories, fetchApprovedDatasets, fetchPurchaseHistory, fetchSubscriptions, fetchDashboard, datasets.length]);

  // Initial load
  useEffect(() => {
    fetchCategories();
    fetchApprovedDatasets();
    fetchPurchaseHistory();
    fetchDashboard();
    fetchSubscriptions();
  }, [fetchCategories, fetchApprovedDatasets, fetchPurchaseHistory, fetchDashboard, fetchSubscriptions]);

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
            <button className="tab-btn" data-tab="dashboard" onClick={() => setActiveTab('dashboard')}>Consumer Dashboard</button>
            <button className="tab-btn" data-tab="data-discovery" onClick={() => setActiveTab('data-discovery')}>Data Discovery</button>
            <button className="tab-btn" data-tab="purchases" onClick={() => setActiveTab('purchases')}>Purchase History</button>
            <button className="tab-btn" data-tab="analytics" onClick={() => setActiveTab('analytics')}>Analytics Dashboard</button>
            <button className="tab-btn" data-tab="api" onClick={() => setActiveTab('api')}>API Documentation</button>
          </div>
        </div>
      </div>

      <main className="consumer-container">
        {/* Consumer Dashboard */}
        <div id="dashboard" className="tab-content">
          <section className="consumer-section">
            <h2>My Consumer Dashboard</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
                </div>
                <div className="stat-content">
                  <h3>{formatNumberValue(dashboardData?.totalDatasets ?? datasets.length)}</h3>
                  <p>Datasets Purchased</p>
                  <span className="stat-change neutral">Tổng số dataset đã mua</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.78-1.18 2.73-3.12 3.16z"/></svg></div>
                <div className="stat-content">
                  <h3>{formatNumberValue(dashboardData?.totalPurchases ?? purchaseHistory.length)}</h3>
                  <p>Total Purchases</p>
                  <span className="stat-change neutral">{formatNumberValue(successfulPurchases)} giao dịch thành công</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div>
                <div className="stat-content">
                  <h3>{formatPurchaseAmount(dashboardData?.totalSpending ?? totalSpending)}</h3>
                  <p>Total Spending</p>
                  <span className="stat-change neutral">Dựa trên lịch sử mua</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></div>
                <div className="stat-content">
                  <h3>{formatNumberValue(dashboardData?.activeApiKeys ?? (apiKey ? 1 : 0))}</h3>
                  <p>Active API Keys</p>
                  <span className="stat-change neutral">Thống kê từ dashboard</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <section className="consumer-section">
              <h2>Quick Actions</h2>
              <div className="quick-actions-grid">
                <div className="consumer-card">
                  <div className="card-body">
                    <h5>Discover Data</h5>
                    <p>Browse EV datasets for driving behavior, battery performance, charging usage, and V2G transactions</p>
                    <button className="consumer-btn consumer-btn-primary" onClick={() => setActiveTab('data-discovery')}>Explore Datasets</button>
                  </div>
                </div>

                <div className="consumer-card">
                  <div className="card-body">
                    <h5>Analytics Tools</h5>
                    <p>Access interactive dashboards for SoC/SoH battery metrics, charging frequency, and CO₂ savings analysis</p>
                    <button className="consumer-btn consumer-btn-success" onClick={() => setActiveTab('analytics')}>View Analytics</button>
                  </div>
                </div>

                <div className="consumer-card">
                  <div className="card-body">
                    <h5>API Integration</h5>
                    <p>Integrate EV data into third-party systems (insurance, smart city, fleet management)</p>
                    <button className="consumer-btn consumer-btn-info" onClick={() => setActiveTab('api')}>API Documentation</button>
                  </div>
                </div>

                <div className="consumer-card">
                  <div className="card-body">
                    <h5>Purchase History</h5>
                    <p>View your data purchases, subscriptions, and download history</p>
                    <button className="consumer-btn consumer-btn-warning" onClick={() => setActiveTab('purchases')}>View History</button>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            <section className="consumer-section">
              <h2>Recent Data Purchases</h2>
              {renderErrorBanner(purchaseError)}
              <div className="table-container">
                <div className="table-header">
                  <h3>Your Recent Activity</h3>
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
                      {purchaseHistory.slice(0, 5).map((purchase) => {
                        const title = purchase.itemTitle || purchase.datasetTitle || 'Dataset';
                        const amount = formatPurchaseAmount(purchase.amount);
                        const purchaseDate = formatDateTime(purchase.purchaseDate || purchase.timestamp);
                        const statusLabel = purchase.status || 'UNKNOWN';
                        return (
                          <tr key={purchase.id}>
                            <td>
                              <div className="dataset-info">
                                <div className="dataset-icon"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg></div>
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
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </section>
        </div>

        {/* Data Discovery */}
        <div id="data-discovery" className="tab-content">
          <section className="consumer-section">
            <h2>Search & Discover Data</h2>
            <div className="consumer-card">
              <div className="card-body">
                <h5>Find the EV Data You Need</h5>
                <p className="section-description">Browse comprehensive EV datasets including driving behavior, battery performance, charging station usage, and V2G transactions.</p>
                {renderErrorBanner(categoriesError)}

                <div className="search-filters">
                  <div className="filter-group">
                    <label htmlFor="data-category">Data Category</label>
                    <select 
                      id="data-category"
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                      <option value="">All Categories</option>
                      <option value="charging_behavior">Charging Behavior</option>
                      <option value="battery_health">Battery Health</option>
                      <option value="route_optimization">Route Optimization</option>
                      <option value="energy_consumption">Energy Consumption</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label htmlFor="time-range">Time Range</label>
                    <select 
                      id="time-range"
                      value={filters.timeRange}
                      onChange={(e) => handleFilterChange('timeRange', e.target.value)}
                    >
                      <option value="">Any Time</option>
                      <option value="2020-2021">2020-2021</option>
                      <option value="2021-2022">2021-2022</option>
                      <option value="2022-2023">2022-2023</option>
                      <option value="2023-2024">2023-2024</option>
                      <option value="2024-present">2024-Present</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label htmlFor="region">Region</label>
                    <select 
                      id="region"
                      value={filters.region}
                      onChange={(e) => handleFilterChange('region', e.target.value)}
                    >
                      <option value="">All Regions</option>
                      <option value="north_america">North America</option>
                      <option value="europe">Europe</option>
                      <option value="asia">Asia</option>
                      <option value="australia">Australia</option>
                      <option value="africa">Africa</option>
                      <option value="south_america">South America</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label htmlFor="vehicle-type">Vehicle Type</label>
                    <select 
                      id="vehicle-type"
                      value={filters.vehicleType}
                      onChange={(e) => handleFilterChange('vehicleType', e.target.value)}
                    >
                      <option value="">All Types</option>
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                      <option value="truck">Truck</option>
                      <option value="bus">Bus</option>
                      <option value="motorcycle">Motorcycle</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label htmlFor="battery-type">Battery Type</label>
                    <select 
                      id="battery-type"
                      value={filters.batteryType}
                      onChange={(e) => handleFilterChange('batteryType', e.target.value)}
                    >
                      <option value="">All Types</option>
                      <option value="lithium_ion">Lithium-Ion</option>
                      <option value="solid_state">Solid-State</option>
                      <option value="nickel_metal_hydride">Nickel-Metal Hydride</option>
                      <option value="lead_acid">Lead-Acid</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="filter-group">
                    <label htmlFor="data-format">Data Format</label>
                    <select 
                      id="data-format"
                      value={filters.dataFormat}
                      onChange={(e) => handleFilterChange('dataFormat', e.target.value)}
                    >
                      <option value="">All Formats</option>
                      <option value="CSV">CSV</option>
                      <option value="JSON">JSON</option>
                      <option value="XML">XML</option>
                      <option value="Parquet">Parquet</option>
                      <option value="Excel">Excel</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label htmlFor="pricing-type">Pricing Model</label>
                    <select 
                      id="pricing-type"
                      value={filters.pricingType}
                      onChange={(e) => handleFilterChange('pricingType', e.target.value)}
                    >
                      <option value="">All Models</option>
                      <option value="per_request">Pay per Download</option>
                      <option value="subscription">Subscription</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label htmlFor="min-price">Min Price ($)</label>
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
                    <label htmlFor="max-price">Max Price ($)</label>
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
                    <label htmlFor="searchQuery">Search Datasets</label>
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
                  <button className="consumer-btn consumer-btn-outline" onClick={clearFilters} disabled={loading}>
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
          </section>
        </div>

        {/* Purchase History */}
        <div id="purchases" className="tab-content">
          <section className="consumer-section">
            <div className="dashboard-header">
              <h2>Purchase History & Subscriptions</h2>
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

            {renderErrorBanner(subscriptionsError)}
            {renderErrorBanner(purchaseError)}

            {/* Subscriptions Section */}
            {subscriptions && subscriptions.length > 0 && (
              <section className="consumer-section">
                <h3>Active Subscriptions</h3>
                <div className="subscriptions-grid">
                  {subscriptions.map((subscription) => (
                    <div className="subscription-card" key={subscription.id}>
                      <div className="subscription-header">
                        <h4>{subscription.name || 'EV Data Subscription'}</h4>
                        <span className={`subscription-status ${subscription.status?.toLowerCase()}`}>
                          {subscription.status || 'ACTIVE'}
                        </span>
                      </div>
                      <div className="subscription-details">
                        <p><strong>Plan:</strong> {subscription.planType || 'Monthly'}</p>
                        <p><strong>Price:</strong> {formatCurrency(subscription.price || 49)}</p>
                        <p><strong>Next Billing:</strong> {subscription.nextBillingDate || '2024-04-15'}</p>
                        <p><strong>Data Access:</strong> {subscription.dataAccess || 'Unlimited'}</p>
                      </div>
                      <div className="subscription-actions">
                        <button
                          className="consumer-btn consumer-btn-outline"
                          onClick={() => alert('Tính năng quản lý subscription đang được phát triển.')}
                        >
                          Manage
                        </button>
                        <button
                          className="consumer-btn consumer-btn-danger"
                          onClick={() => alert('Tính năng hủy subscription đang được phát triển.')}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Purchase History Table */}
            <section className="consumer-section">
              <h3>Data Purchase History</h3>
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
            <div className="dashboard-header">
              <h2>Analytics Dashboard</h2>
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
                  <div className="consumer-card">
                    <div className="card-body">
                      <h4>Key Insights</h4>
                      <ul className="insights-list">
                        {Object.entries(analyticsData.insights).map(([insightKey, insightValue]) => (
                          <li key={insightKey}>
                            <strong>{formatLabel(insightKey)}:</strong>{' '}
                            {Array.isArray(insightValue) ? insightValue.join(', ') : (insightValue ?? '—')}
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
              <div className="consumer-card">
                <div className="card-body">
                  <h4>AI Analysis Summary</h4>
                  <p>{aiSummary}</p>
                  <div className="insight-meta">
                    {aiConfidence !== null && <span>Confidence: {formatPercentageValue(aiConfidence * 100)}</span>}
                    {aiGeneratedAt && <span>Generated: {formatDateTime(aiGeneratedAt)}</span>}
                  </div>
                </div>
              </div>
            )}
          </section>

          {aiSuggestions.length > 0 && (
            <section className="consumer-section">
              <h2>AI Suggestions</h2>
              <div className="insights-grid">
                {aiSuggestions.map((suggestion, index) => {
                  const confidenceLabel = suggestion.confidence != null ? formatPercentageValue(suggestion.confidence * 100) : null;
                  return (
                    <div className="insight-card" key={`${suggestion.type}-${index}`}>
                      <div className="insight-header">
                        <h4>{suggestion.title || formatLabel(suggestion.type)}</h4>
                        {confidenceLabel && (
                          <span className={`insight-confidence ${(suggestion.impact || '').toLowerCase()}`}>
                            {confidenceLabel}
                          </span>
                        )}
                      </div>
                      <div className="insight-content">
                        <p>{suggestion.description || '—'}</p>
                        {suggestion.actions && suggestion.actions.length > 0 && (
                          <ul>
                            {suggestion.actions.map((action, actionIdx) => (
                              <li key={actionIdx}>{action}</li>
                            ))}
                          </ul>
                        )}
                        {suggestion.impact && (
                          <p><strong>Impact:</strong> {formatLabel(suggestion.impact)}</p>
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
          <section className="consumer-section">
            <div className="dashboard-header">
              <h2>API Documentation & Integration</h2>
              <div className="header-actions">
                <button className="consumer-btn consumer-btn-primary" onClick={() => setShowApiKeyModal(true)}>
                  <svg className="btn-icon" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                  Generate API Key
                </button>
                <button
                  className="consumer-btn consumer-btn-outline"
                  onClick={() => alert('Gói SDK sẽ sớm được cung cấp.')}
                >
                  <svg className="btn-icon" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                  Download SDK
                </button>
              </div>
            </div>

            {renderErrorBanner(apiKeyError)}

            {/* API Key display */}
            {apiKey && (
              <div className="consumer-card" style={{ marginBottom: '20px' }}>
                <div className="card-body">
                  <h5>Your API Key</h5>
                  <div className="api-key-display">
                    <div className="api-key-box" ref={apiKeyRef}>
                      <strong>Key:</strong> {apiKey}
                    </div>
                    <button className="consumer-btn consumer-btn-outline" onClick={copyApiKey}>
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="api-quickstart">
              <h3>Quick Start Guide</h3>
              <div className="quickstart-steps">
                <div className="step"><div className="step-number">1</div><div className="step-content"><h4>Get Your API Key</h4><p>Generate an API key from your dashboard with appropriate permissions for third-party integration</p></div></div>
                <div className="step"><div className="step-number">2</div><div className="step-content"><h4>Make Your First Request</h4><p>Use the API key to authenticate and make requests to our endpoints</p></div></div>
                <div className="step"><div className="step-number">3</div><div className="step-content"><h4>Integrate & Scale</h4><p>Implement the API in your applications and scale as needed with real-time data streams</p></div></div>
              </div>
            </div>

            <div className="api-section">
              <h3>Core API Endpoints</h3>
              <div className="api-card">
                <div className="api-header"><h4>Get Battery Health Data</h4><span className="api-method get">GET</span></div>
                <div className="api-content">
                  <div className="endpoint-url"><code>GET {API_BASE}/api/v1/battery/health</code></div>
                  <p>Retrieve battery state of health (SoH) and state of charge (SoC) data for insurance and fleet management applications.</p>
                </div>
              </div>

              <div className="api-card">
                <div className="api-header"><h4>Get Charging Sessions</h4><span className="api-method get">GET</span></div>
                <div className="api-content">
                  <div className="endpoint-url"><code>GET {API_BASE}/api/v1/charging/sessions</code></div>
                  <p>Retrieve detailed charging session data including duration, energy consumed, and charger types for smart city planning.</p>
                </div>
              </div>

              <div className="api-card">
                <div className="api-header"><h4>Get Driving Patterns</h4><span className="api-method get">GET</span></div>
                <div className="api-content">
                  <div className="endpoint-url"><code>GET {API_BASE}/api/v1/driving/patterns</code></div>
                  <p>Access driving pattern data including mileage, speed profiles, and route efficiency for insurance risk assessment.</p>
                </div>
              </div>
            </div>
          </section>
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