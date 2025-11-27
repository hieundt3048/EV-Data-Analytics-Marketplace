import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/index.css';
import '../styles/consumer.css';
import ApiKeyManagement from '../components/ApiKeyManagement';
import RecommendationsSection from '../components/RecommendationsSection';
import AdvancedAnalytics from '../components/AdvancedAnalytics';
import SubscriptionManagement from '../components/SubscriptionManagement';
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
  const [filteredDatasets, setFilteredDatasets] = useState([]); // hiển thị ở lưới available datasets
  const [searchResults, setSearchResults] = useState(null); // nằm ở trang Data Discovery có tác dụng hiển thị kết quả tìm kiếm
  const [loading, setLoading] = useState(false); // nằm ở trang Data Discovery có tác dụng hiển thị loading khi fetch datasets
  const [categories, setCategories] = useState([]); // data categories nằm ở trang Data Discovery
  const [purchaseHistory, setPurchaseHistory] = useState([]); // nằm ở trang Purchase History có tác dụng hiển thị lịch sử mua hàng
  const [dashboardData, setDashboardData] = useState(null); // nằm ở trang Consumer Dashboard có tác dụng hiển thị dữ liệu dashboard
  const [previewDataset, setPreviewDataset] = useState(null); // nằm ở trang Data Discovery có tác dụng hiển thị modal preview dataset
  const [showReceipt, setShowReceipt] = useState(null); // nằm ở trang Data Discovery có tác dụng hiển thị modal receipt
  const [confirmPurchase, setConfirmPurchase] = useState(null); // nằm ở trang Data Discovery có tác dụng hiển thị modal confirm purchase
  const [paymentProcessing, setPaymentProcessing] = useState(false); // nằm ở trang Data Discovery có tác dụng hiển thị trạng thái xử lý thanh toán
  const [paymentError, setPaymentError] = useState(null); // nằm ở trang Data Discovery có tác dụng hiển thị lỗi thanh toán
  const [analyticsData, setAnalyticsData] = useState(null); // nằm ở trang Analytics Dashboard có tác dụng hiển thị dữ liệu phân tích
  const [selectedDatasetId, setSelectedDatasetId] = useState(null); // nằm ở trang Analytics Dashboard có tác dụng chọn dataset để hiển thị phân tích
  const [analyticsLoading, setAnalyticsLoading] = useState(false); // nằm ở trang Analytics Dashboard có tác dụng hiển thị loading khi fetch dữ liệu phân tích

  const [filters, setFilters] = useState({ // nằm ở trang Data Discovery có tác dụng lưu trữ các bộ lọc
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

  const [categoriesError, setCategoriesError] = useState(null); // nằm ở trang Data Discovery có tác dụng hiển thị lỗi khi fetch categories
  const [datasetsError, setDatasetsError] = useState(null); // nằm ở trang Data Discovery có tác dụng hiển thị lỗi khi fetch datasets
  const [purchaseError, setPurchaseError] = useState(null); // nằm ở trang Purchase History có tác dụng hiển thị lỗi khi fetch purchase history
  const [dashboardError, setDashboardError] = useState(null); // nằm ở trang Consumer Dashboard có tác dụng hiển thị lỗi khi fetch dashboard data
  const [analyticsError, setAnalyticsError] = useState(null);// nằm ở trang Analytics Dashboard có tác dụng hiển thị lỗi khi fetch analytics data
  const [apiKeyError, setApiKeyError] = useState(null); // nằm ở trang API Documentation có tác dụng hiển thị lỗi khi generate API key

// có tác dụng định nghĩa các trạng thái thành công cho đơn hàng
  const SUCCESS_STATUSES = ['approved', 'payout_completed'];

  // Hàm fetch với xử lý authentication và token expiration
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

  // hàm này dùng để fetch categories cho bộ lọc ở trang Data Discovery
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


  // hàm này dùng để fetch dữ liệu phân tích cho trang Analytics Dashboard
  const fetchAnalyticsData = useCallback(async (datasetId) => {
    if (!datasetId) return;
    setAnalyticsError(null);
    try {
      const data = await fetchWithAuth(`/api/dashboards/${datasetId}`);
      console.log('[fetchAnalyticsData] Response for dataset', datasetId, ':', data);
      if (data) {
        console.log('[fetchAnalyticsData] Summary metrics:', data.summaryMetrics);
        setAnalyticsData(data);
      } else {
        setAnalyticsData(null);
        setAnalyticsError('No analytics data available for this dataset.');
      }
    } catch (error) {
      console.error('[fetchAnalyticsData] Error:', error);
      setAnalyticsData(null);
      setAnalyticsError(error.message || 'Unable to load analytics data.');
      throw error;
    }
  }, [fetchWithAuth]);

  // hàm này dùng để fetch danh sách datasets được phê duyệt cho trang Data Discovery
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


  // hàm này dùng để fetch lịch sử mua hàng cho trang Purchase History
  const fetchPurchaseHistory = useCallback(async () => {
    setPurchaseError(null);
    try {
      console.log('[fetchPurchaseHistory] Fetching from /api/orders/history...'); 
      const data = await fetchWithAuth('/api/orders/history'); // Gọi API để lấy lịch sử mua hàng
      console.log('[fetchPurchaseHistory] Received data:', data); // Ghi log dữ liệu nhận được

      if (Array.isArray(data)) { // Kiểm tra nếu dữ liệu là một mảng
        setPurchaseHistory(data);
        console.log('[fetchPurchaseHistory] Set purchaseHistory with', data.length, 'items');
      } else { // Nếu dữ liệu không phải mảng, đặt lỗi và mảng rỗng
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


  // hàm này dùng để fetch dữ liệu dashboard cho trang Consumer Dashboard
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

  // hàm này dùng để xử lý thay đổi bộ lọc ở trang Data Discovery
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const applyFilters = (currentFilters) => {
    let filtered = [...datasets];

    // tìm kiếm theo từ khóa
    if (currentFilters.searchQuery) {
      const query = currentFilters.searchQuery.toLowerCase();
      filtered = filtered.filter(ds => 
        ds.name?.toLowerCase().includes(query) || 
        ds.description?.toLowerCase().includes(query)
      );
    }

    // tìm kiếm theo category
    if (currentFilters.category) {
      filtered = filtered.filter(ds => {
        const datasetCategory = (ds.category || '').toString().toLowerCase().trim();
        const filterCategory = currentFilters.category.toLowerCase().trim();
        return datasetCategory === filterCategory;
      });
    }

    // tìm kiếm theo time range
    if (currentFilters.region) {
      filtered = filtered.filter(ds => {
        const datasetRegion = (ds.region || '').toString().toLowerCase().trim();
        const filterRegion = currentFilters.region.toLowerCase().trim();
        return datasetRegion === filterRegion;
      });
    }

    // tìm kiếm theo vehicle type
    if (currentFilters.vehicleType) {
      filtered = filtered.filter(ds => {
        const datasetVehicleType = (ds.vehicleType || '').toString().toLowerCase().trim();
        const filterVehicleType = currentFilters.vehicleType.toLowerCase().trim();
        return datasetVehicleType === filterVehicleType;
      });
    }

    // tìm kiếm theo battery type
    if (currentFilters.batteryType) {
      filtered = filtered.filter(ds => {
        const datasetBatteryType = (ds.batteryType || '').toString().toLowerCase().trim();
        const filterBatteryType = currentFilters.batteryType.toLowerCase().trim();
        return datasetBatteryType === filterBatteryType;
      });
    }

    // tìm kiếm theo data format
    if (currentFilters.dataFormat) {
      filtered = filtered.filter(ds => {
        const datasetDataFormat = (ds.dataFormat || '').toString().toLowerCase().trim();
        const filterDataFormat = currentFilters.dataFormat.toLowerCase().trim();
        return datasetDataFormat === filterDataFormat;
      });
    }

    // tìm kiếm theo pricing type
    if (currentFilters.pricingType) {
      filtered = filtered.filter(ds => {
        const datasetPricingType = (ds.pricingType || '').toString().toLowerCase().trim();
        const filterPricingType = currentFilters.pricingType.toLowerCase().trim();
        return datasetPricingType === filterPricingType;
      });
    }

    // tìm  kiếm theo khoảng giá
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

  const clearFilters = () => { // hàm này dùng để xóa tất cả bộ lọc ở trang Data Discovery
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

  // hàm này dùng để generate API key ở trang API Documentation
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


  // hàm này dùng để xử lý mua dataset ở trang Data Discovery
  const purchaseDataset = async (dataset) => {
    if (!dataset?.id) {
      alert('Unable to identify dataset to purchase.');
      return;
    }

    // Reset any previous payment state and open modal
    setPaymentError(null);
    setConfirmPurchase(dataset);
  };

  // hàm này dùng để xác nhận và xử lý thanh toán mua dataset ở trang Data Discovery
  const confirmAndProcessPurchase = async (dataset, paymentMethod = 'card') => {
    if (!dataset || !dataset.id) return;
    setPaymentProcessing(true);
    setPaymentError(null);
    try {
      const response = await fetchWithAuth('/api/orders/checkout', {
        method: 'POST',
        body: JSON.stringify({ datasetId: dataset.id, paymentMethod })
      });
      // dùng để xây dựng receipt tạm thời từ phản hồi
      let receipt = null;
      if (response) {
        const hasOrderLikeFields = response.order || response.id || response.amount || response.datasetId; // Kiểm tra các trường liên quan đến đơn hàng
        const raw = response.order || response;  // Lấy đối tượng order nếu có, nếu không thì lấy toàn bộ response
        if (hasOrderLikeFields) {
          const base = raw.order ? raw.order : raw; // Lấy đối tượng cơ sở từ order hoặc toàn bộ response
          receipt = {
            id: base.id || `temp-${Date.now()}`,
            datasetId: base.datasetId || dataset.id,
            itemTitle: base.itemTitle || base.datasetTitle || dataset.name,
            amount: base.amount || dataset.price,
            purchaseDate: base.purchaseDate || base.timestamp || base.createdAt || new Date().toISOString(),
            status: 'PENDING',
            pricingType: base.pricingType || dataset.pricingType,
            paymentMethod,
          }; // hiểu đơn giản hàm này dùng để tạo một biên nhận tạm thời từ phản hồi của server
        } else {
          // Minimal response, still create PENDING receipt
          receipt = {
            id: `temp-${Date.now()}`,
            datasetId: dataset.id,
            itemTitle: dataset.name,
            amount: dataset.price,
            purchaseDate: new Date().toISOString(),
            status: 'PENDING',
            pricingType: dataset.pricingType,
            paymentMethod,
          };
        }
      }

      if (receipt) {
        setShowReceipt(receipt);
        fetchPurchaseHistory();
      } else {
        const errorMsg = response?.message || 'Unknown error from server.';
        setPaymentError(errorMsg);
      }
    } catch (e) {
      console.error('Purchase error:', e);
      setPaymentError(e.message || 'Unable to complete transaction.');
    } finally {
      setPaymentProcessing(false);
      setConfirmPurchase(null);
    }
  };

  // hàm này dùng để download dataset đã mua ở trang Purchase History
  const downloadDataset = async (id) => {
    if (!id) {
      alert('Dataset ID not found for download.');
      return;
    }

    try {
      const token = localStorage.getItem('authToken'); // Lấy token từ localStorage
      const response = await fetch(`http://localhost:8080/api/datasets/${id}/download`, { // Gọi API để download dataset
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      // lấy tên tệp từ header Content-Disposition nếu có
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `dataset_${id}.zip`;
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      // dùng để tạo một liên kết tạm thời để tải xuống tệp
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('Dataset download started successfully!');
    } catch (e) {
      console.error('Download error:', e);
      
      // dùng để xử lý lỗi 404 riêng biệt
      if (e.message.includes('404')) {
        alert('Dataset not found. This dataset may have been removed from the system.');
      } else {
        alert('Unable to download dataset. Error: ' + e.message);
      }
    }
  };
 

  // hàm này dùng để xóa giao dịch mua hàng ở trang Purchase History
  const deletePurchase = async (purchaseId) => {
    if (!purchaseId) {
      alert('Transaction ID not found for deletion.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) return;

    try {
      const res = await fetchWithAuth(`/api/orders/${purchaseId}`, { method: 'DELETE' }); // Gọi API để xóa giao dịch mua hàng
      // dùng để làm mới lại lịch sử mua hàng sau khi xóa
      fetchPurchaseHistory();
      alert('Transaction deleted successfully.'); 
    } catch (e) {
      console.error('Delete purchase error', e);
      alert('Unable to delete transaction: ' + (e.message || e));
    }
  };

  // dùng để định dạng tiền tệ
  const formatCurrency = (value) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value || 0);

  // dùng để chuẩn hóa giá trị số
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

  // dùng để định dạng giá trị số
  const formatNumberValue = (value) => {
    if (value === null || value === undefined) return '—';
    const numeric = normalizeNumber(value);
    if (Number.isNaN(numeric)) return value;
    return new Intl.NumberFormat().format(numeric);
  };

  // dùng để định dạng giá trị phần trăm
  const formatPercentageValue = (value) => {
    if (value === null || value === undefined) return '—';
    const numeric = normalizeNumber(value);
    if (Number.isNaN(numeric)) return value;
    return `${numeric.toFixed(2)}%`;
  };

  // dùng để định dạng số tiền mua hàng
  const formatPurchaseAmount = (value) => {
    if (value === null || value === undefined) return '—';
    const numeric = normalizeNumber(value);
    if (Number.isNaN(numeric)) return value;
    return formatCurrency(numeric);
  };

  // dùng để định dạng nhãn hiển thị
  const formatLabel = (text) => {
    if (!text) return '—';
    return text.toString().replace(/_/g, ' ');
  };

  // dùng để lấy lớp CSS tương ứng với trạng thái đơn hàng
  const getStatusClass = (status) => {
    const normalized = (status || '').toString().toLowerCase();
    if (SUCCESS_STATUSES.includes(normalized)) return 'completed';
    if (normalized === 'pending' || normalized === 'processing') return 'pending';
    if (normalized === 'failed' || normalized === 'cancelled' || normalized === 'canceled') return 'failed';
    // Legacy statuses treated as informational
    if (['paid', 'completed', 'success'].includes(normalized)) return 'info';
    return 'info';
  };

  // dùng để định dạng kích thước tệp
  const formatBytes = (bytes) => {
    const value = Number(bytes);
    if (!value || Number.isNaN(value)) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
    const scaled = value / (1024 ** index);
    return `${scaled.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
  };

  // dùng để định dạng ngày giờ
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

  // dùng để hiển thị banner lỗi
  const renderErrorBanner = (message) => {
    if (!message) return null;
    return (
      <div className="consumer-error-message" role="alert">
        {message}
      </div>
    );
  };

  // Tính tổng chi tiêu từ lịch sử mua hàng
  const totalSpending = useMemo(() => purchaseHistory.reduce((total, order) => {
    const amount = normalizeNumber(order?.amount);
    return Number.isNaN(amount) ? total : total + amount;
  }, 0), [purchaseHistory]);

  // Tính số đơn hàng thành công từ lịch sử mua hàng
  const successfulPurchases = useMemo(() => purchaseHistory.filter((order) => {
    const status = (order?.status || '').toString().toLowerCase();
    return SUCCESS_STATUSES.includes(status);
  }).length, [purchaseHistory, SUCCESS_STATUSES]);

  // Tính số dataset duy nhất đã mua (unique dataset IDs)
  const uniqueDatasetsPurchased = useMemo(() => {
    // Count only datasets for successful purchases per new business rule
    const successfulIds = purchaseHistory
      .filter(order => SUCCESS_STATUSES.includes((order?.status || '').toString().toLowerCase()))
      .map(order => order.datasetId)
      .filter(id => id);
    const uniqueIds = new Set(successfulIds);
    return uniqueIds.size;
  }, [purchaseHistory, SUCCESS_STATUSES]);

  const selectedDataset = useMemo(
    () => datasets.find((dataset) => String(dataset.id) === String(selectedDatasetId)),
    [datasets, selectedDatasetId]
  );

  // Lấy danh sách datasets đã mua (loại trừ PENDING) cho Analytics Dashboard
  const purchasedDatasets = useMemo(() => {
    console.log('[purchasedDatasets] Purchase history:', purchaseHistory);
    console.log('[purchasedDatasets] All datasets:', datasets);
    
    // Lấy danh sách datasetId từ purchase history (loại trừ PENDING)
    const purchasedDatasetIds = purchaseHistory
      .filter(order => {
        const isPending = order.status && order.status.toUpperCase() === 'PENDING';
        console.log(`[purchasedDatasets] Order ${order.id}: status=${order.status}, isPending=${isPending}`);
        return !isPending;
      })
      .map(order => order.datasetId);
    
    console.log('[purchasedDatasets] Purchased dataset IDs:', purchasedDatasetIds);
    
    // Loại bỏ duplicate IDs
    const uniqueDatasetIds = [...new Set(purchasedDatasetIds)];
    console.log('[purchasedDatasets] Unique dataset IDs:', uniqueDatasetIds);
    
    // Map về dataset objects từ datasets
    const result = uniqueDatasetIds
      .map(id => {
        const found = datasets.find(ds => ds.id === id);
        console.log(`[purchasedDatasets] Looking for dataset ID ${id}:`, found ? 'Found' : 'Not found');
        return found;
      })
      .filter(ds => ds !== undefined); // Loại bỏ undefined
    
    console.log('[purchasedDatasets] Final result:', result);
    return result;
  }, [purchaseHistory, datasets]);

  const datasetOptions = useMemo(() => purchasedDatasets.map((dataset) => ({
    value: String(dataset.id),
    label: dataset.name || `Dataset #${dataset.id}`
  })), [purchasedDatasets]);

  const summaryMetricsConfig = [
    { key: 'totalRevenue', label: 'Total Revenue', formatter: formatPurchaseAmount },
    { key: 'totalOrders', label: 'Paid Orders', formatter: formatNumberValue },
    { key: 'averageOrderValue', label: 'Avg Order Value', formatter: formatPurchaseAmount },
    { key: 'conversionRate', label: 'Conversion Rate', formatter: formatPercentageValue },
    { key: 'activeUsers', label: 'Active Users', formatter: formatNumberValue }
  ];

  // dùng để mở và đóng các modal
  const openPreview = (dataset) => setPreviewDataset(dataset);
  const closePreview = () => setPreviewDataset(null);
  const openReceipt = (order) => setShowReceipt(order);
  const closeReceipt = () => setShowReceipt(null);

  // dùng để xử lý thay đổi tab
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
      // Fetch both datasets and purchase history for analytics
      if (!datasets.length) {
        fetchApprovedDatasets();
      }
      if (!purchaseHistory.length) {
        fetchPurchaseHistory();
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
    // Auto-select first purchased dataset (không phải tất cả datasets)
    if (purchasedDatasets.length > 0 && !selectedDatasetId) {
      setSelectedDatasetId(String(purchasedDatasets[0].id));
    }
  }, [purchasedDatasets, selectedDatasetId]);

  const loadDatasetAnalytics = useCallback(async (datasetId) => {
    if (!datasetId) return;
    setAnalyticsLoading(true);
    try {
      await fetchAnalyticsData(datasetId);
    } catch (error) {
      // errors handled in individual fetches
    } finally {
      setAnalyticsLoading(false);
    }
  }, [fetchAnalyticsData]);

  useEffect(() => {
    if (activeTab !== 'analytics' || !selectedDatasetId) return;
    const targetDataset = purchasedDatasets.find((item) => String(item.id) === String(selectedDatasetId));
    if (targetDataset) {
      loadDatasetAnalytics(targetDataset.id);
    }
  }, [activeTab, selectedDatasetId, purchasedDatasets, loadDatasetAnalytics]);

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
            <button className="tab-btn" data-tab="subscriptions" onClick={() => setActiveTab('subscriptions')}>Subscriptions</button>
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
              <RecommendationsSection 
                fetchWithAuth={fetchWithAuth}
                onViewDataset={(id) => {
                  const dataset = datasets.find(d => d.id === id);
                  if (dataset) setPreviewDataset(dataset);
                }}
              />
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
                                  <button 
                                    className="btn-icon" 
                                    title={purchase.status === 'PAYOUT_COMPLETED' ? 'Download Dataset' : 'Download available after payment is completed'} 
                                    onClick={() => downloadDataset(purchase.datasetId)} 
                                    disabled={!purchase.datasetId || purchase.status !== 'PAYOUT_COMPLETED'}
                                  >
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

            {analyticsLoading ? (
              <div className="loading-state">
                <p>Đang tải dữ liệu phân tích...</p>
              </div>
            ) : analyticsData ? (
              <>
                <div className="stats-grid">
                  {summaryMetricsConfig.map(({ key, label, formatter }) => {
                    const value = analyticsData.summaryMetrics?.[key];
                    console.log(`[Analytics] Metric ${key}:`, value, 'formatted:', formatter(value));
                    return (
                      <div className="stat-card" key={key}>
                        <div className="stat-icon" />
                        <div className="stat-content">
                          <h3>{formatter(value)}</h3>
                          <p>{label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Advanced Analytics Component */}
                <ErrorBoundary>
                  <AdvancedAnalytics
                    fetchWithAuth={fetchWithAuth}
                    datasetId={selectedDatasetId}
                  />
                </ErrorBoundary>
              </>
            ) : (
              <div className="consumer-card">
                <div className="card-body">
                  <h4>Không có dữ liệu phân tích</h4>
                  <p>Chọn dataset đã có giao dịch để xem thống kê hoặc quay lại sau.</p>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* API Documentation */}
        <div id="api" className="tab-content">
          <ErrorBoundary>
            <ApiKeyManagement fetchWithAuth={fetchWithAuth} />
          </ErrorBoundary>
        </div>

        {/* Subscriptions */}
        <div id="subscriptions" className="tab-content">
          <ErrorBoundary>
            <SubscriptionManagement fetchWithAuth={fetchWithAuth} />
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
      {/* Payment Confirmation Modal */}
      {confirmPurchase && (
        <div className="modal" onClick={() => { if (!paymentProcessing) setConfirmPurchase(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Purchase</h3>
              <button className="modal-close" onClick={() => { if (!paymentProcessing) setConfirmPurchase(null); }}>×</button>
            </div>
            <div className="modal-body">
              <p>You're about to purchase the following dataset:</p>
              <div className="purchase-summary">
                <h4>{confirmPurchase.name}</h4>
                <p className="muted">{confirmPurchase.description || 'No description available'}</p>
                <div className="purchase-meta">
                  <div><strong>Size:</strong> {formatBytes(confirmPurchase.sizeBytes)}</div>
                  <div><strong>Format:</strong> {confirmPurchase.dataFormat || '—'}</div>
                  <div><strong>Pricing:</strong> {confirmPurchase.pricingType ? formatLabel(confirmPurchase.pricingType) : '—'}</div>
                </div>
                <div className="purchase-price">
                  <span className="price-label">Total</span>
                  <span className="price-value">{formatPurchaseAmount(confirmPurchase.price)}</span>
                </div>
              </div>

              <div className="payment-methods">
                <label>Payment Method</label>
                <select id="paymentMethodSelect" defaultValue="card">
                  <option value="card">Credit / Debit Card</option>
                  <option value="invoice">Invoice (For enterprise)</option>
                  <option value="wallet">Wallet / Balance</option>
                </select>
              </div>

              {paymentError && <div className="payment-error" role="alert">{paymentError}</div>}
            </div>
            <div className="modal-footer">
              <button className="consumer-btn consumer-btn-outline" onClick={() => { if (!paymentProcessing) setConfirmPurchase(null); }} disabled={paymentProcessing}>Cancel</button>
              <button
                className="consumer-btn consumer-btn-primary"
                onClick={async () => {
                  if (paymentProcessing) return;
                  const select = document.getElementById('paymentMethodSelect');
                  const method = select ? select.value : 'card';
                  await confirmAndProcessPurchase(confirmPurchase, method);
                }}
                disabled={paymentProcessing}
              >
                {paymentProcessing ? 'Processing…' : `Pay ${confirmPurchase ? formatPurchaseAmount(confirmPurchase.price) : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="modal" onClick={closeReceipt}>
          <div className="modal-content" onClick={(e)=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>Receipt</h3>
              <button className="modal-close" onClick={closeReceipt}>×</button>
            </div>
            <div className="modal-body">
              {(() => {
                const ds = datasets.find(d => String(d.id) === String(showReceipt.datasetId)) || {};
                const itemName = showReceipt.itemTitle || showReceipt.datasetTitle || ds.name || `Dataset #${showReceipt.datasetId || showReceipt.id}`;
                const amountFormatted = formatPurchaseAmount(showReceipt.amount || ds.price);
                const dateFormatted = formatDateTime(showReceipt.purchaseDate || showReceipt.timestamp || showReceipt.createdAt);
                const pricing = formatLabel(showReceipt.pricingType || ds.pricingType);
                const method = showReceipt.paymentMethod ? formatLabel(showReceipt.paymentMethod) : 'card';
                return (
                  <div className="receipt-details-grid">
                    <div className="receipt-row">
                      <span className="receipt-label">Receipt ID</span>
                      <span className="receipt-value">{showReceipt.id}</span>
                    </div>
                    <div className="receipt-row">
                      <span className="receipt-label">Dataset</span>
                      <span className="receipt-value">{itemName}</span>
                    </div>
                    <div className="receipt-row">
                      <span className="receipt-label">Dataset ID</span>
                      <span className="receipt-value">{showReceipt.datasetId || ds.id || '—'}</span>
                    </div>
                    <div className="receipt-row">
                      <span className="receipt-label">Pricing Model</span>
                      <span className="receipt-value">{pricing}</span>
                    </div>
                    <div className="receipt-row">
                      <span className="receipt-label">Payment Method</span>
                      <span className="receipt-value">{method}</span>
                    </div>
                    <div className="receipt-row">
                      <span className="receipt-label">Amount</span>
                      <span className="receipt-value amount">{amountFormatted}</span>
                    </div>
                    <div className="receipt-row">
                      <span className="receipt-label">Date</span>
                      <span className="receipt-value">{dateFormatted}</span>
                    </div>
                    <div className="receipt-row">
                      <span className="receipt-label">Status</span>
                      <span className={`receipt-status-badge ${getStatusClass(showReceipt.status)}`}>{showReceipt.status}</span>
                    </div>
                  </div>
                );
              })()}
              <div className="modal-footer">
                <button className="consumer-btn" onClick={() => alert('Download features require administrator approval')}>Download Invoice</button>
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