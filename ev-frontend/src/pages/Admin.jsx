import React, { useState, useEffect, useMemo } from 'react';
import '../styles/index.css';
import '../styles/admin.css';

const Admin = () => {
  // Initialize ALL state with safe defaults and add guards
  const [activeTab, setActiveTab] = useState('users');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAPIKeyModal, setShowAPIKeyModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', organization: '', providerApproved: false, roles: [] });
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [pendingDatasets, setPendingDatasets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [revenueShare, setRevenueShare] = useState({});
  const [apiKeys, setApiKeys] = useState([]);
  const [paymentStats, setPaymentStats] = useState(null);
  const [providerPayouts, setProviderPayouts] = useState([]);
  const [marketStats, setMarketStats] = useState(null);
  const [loading, setLoading] = useState(true); // Start as true to prevent premature rendering
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false); // Track initialization
  
  const roleOptions = ['Admin', 'Provider', 'Consumer', 'Partner'];
  const USERS_PER_PAGE = 5;
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // mirror the template's behavior by toggling classes for CSS that relies on .active
    document.querySelectorAll('.tab-content').forEach((el) => el.classList.remove('active'));
    const activeContent = document.getElementById(activeTab);
    if (activeContent) activeContent.classList.add('active');
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    const btn = document.querySelector(`.tab-btn[data-tab="${activeTab}"]`);
    if (btn) btn.classList.add('active');
  }, [activeTab]);

  const hasRole = (user, roleName) => user?.roles?.some((r) => r.name === roleName);

  const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('authToken');
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || response.statusText);
    }
    if (response.status === 204) return null;
    return response.json();
  };

  const refreshAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [analyticsRes, usersRes, pendingRes, transactionsRes, revenueRes, apiKeyRes, paymentStatsRes, payoutsRes, marketStatsRes] = await Promise.all([
        fetchWithAuth('/api/admin/analytics/overview').catch((e) => { console.error('Analytics error:', e); return null; }),
        fetchWithAuth('/api/admin/users').catch((e) => { console.error('Users error:', e); return []; }),
        fetchWithAuth('/api/admin/provider-datasets/pending').catch((e) => { console.error('Pending datasets error:', e); return []; }),
        fetchWithAuth('/api/admin/orders').catch((e) => { console.error('Orders error:', e); return []; }),
        fetchWithAuth('/api/admin/payments/revenue-share').catch((e) => { console.error('Revenue share error:', e); return {}; }),
        fetchWithAuth('/api/admin/security/apikeys').catch((e) => { console.error('API keys error:', e); return { keys: [] }; }),
        fetchWithAuth('/api/admin/payments/revenue-stats').catch((e) => { console.error('Payment stats error:', e); return null; }),
        fetchWithAuth('/api/admin/payments/provider-payouts').catch((e) => { console.error('Payouts error:', e); return []; }),
        fetchWithAuth('/api/admin/analytics/market-statistics').catch((e) => { console.error('Market stats error:', e); return null; })
      ]);
      console.log('Analytics response:', analyticsRes);
      console.log('Market stats response:', marketStatsRes);
      setAnalytics(analyticsRes);
      setUsers(Array.isArray(usersRes) ? usersRes : []);
      setPendingDatasets(Array.isArray(pendingRes) ? pendingRes : []);
      setTransactions(Array.isArray(transactionsRes) ? transactionsRes : []);
      setRevenueShare(revenueRes && typeof revenueRes === 'object' ? revenueRes : {});
      // Backend now returns { success, keys, total }
      setApiKeys(Array.isArray(apiKeyRes?.keys) ? apiKeyRes.keys : (Array.isArray(apiKeyRes) ? apiKeyRes : []));
      setPaymentStats(paymentStatsRes);
      setProviderPayouts(Array.isArray(payoutsRes) ? payoutsRes : []);
      setMarketStats(marketStatsRes);
      setInitialized(true); // Mark as initialized after first successful load
    } catch (err) {
      console.error('RefreshAll error:', err);
      setError(err.message || 'Unable to load admin data');
      // Still initialize with empty arrays on error
      setUsers([]);
      setPendingDatasets([]);
      setTransactions([]);
      setRevenueShare({});
      setApiKeys([]);
      setProviderPayouts([]);
      setInitialized(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, statusFilter, Array.isArray(users) ? users.length : 0]);

  // Select All checkbox: toggle row checkboxes
  useEffect(() => {
    const selectAll = document.getElementById('selectAll');
    if (!selectAll) return;
    const handler = function () {
      const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
      checkboxes.forEach((cb) => {
        cb.checked = this.checked;
      });
    };
    selectAll.addEventListener('change', handler);
    return () => selectAll.removeEventListener('change', handler);
  }, []);

  const approveProvider = async (userId) => {
    try {
      await fetchWithAuth(`/api/admin/providers/${userId}/approve`, { method: 'POST' });
      refreshAll();
    } catch (err) {
      setError(`Unable to approve provider: ${err.message}`);
    }
  };

  const approveDataset = async (id) => {
    try {
      await fetchWithAuth(`/api/admin/provider-datasets/${id}/approve`, { method: 'PUT' });
      refreshAll();
    } catch (err) {
      setError(`Unable to approve dataset: ${err.message}`);
    }
  };

  const rejectDataset = async (id) => {
    const reason = window.prompt('Rejection reason (optional):');
    try {
      await fetchWithAuth(`/api/admin/provider-datasets/${id}/reject`, { 
        method: 'PUT',
        body: JSON.stringify({ reason: reason || '' })
      });
      refreshAll();
    } catch (err) {
      setError(`Unable to reject dataset: ${err.message}`);
    }
  };

  const revokeKey = async (keyId) => {
    if (!window.confirm('Are you sure you want to revoke this API key? This will expire it but keep it in the database.')) {
      return;
    }
    
    try {
      await fetchWithAuth(`/api/admin/security/apikeys/${keyId}/revoke`, {
        method: 'PUT'
      });
      
      alert('API key revoked successfully');
      refreshAll();
    } catch (err) {
      console.error('Revoke API key error:', err);
      alert(`Failed to revoke API key:\n${err.message}`);
    }
  };

  const deleteKey = async (keyId) => {
    if (!window.confirm('WARNING: This will PERMANENTLY DELETE the API key from the database. This action CANNOT be undone. Are you absolutely sure?')) {
      return;
    }
    
    try {
      await fetchWithAuth(`/api/admin/security/apikeys/${keyId}`, {
        method: 'DELETE'
      });
      
      alert('API key permanently deleted');
      refreshAll();
    } catch (err) {
      console.error('Delete API key error:', err);
      alert(`Failed to delete API key:\n${err.message}`);
    }
  };

  const processPayout = async (providerId) => {
    if (!window.confirm(`Process payout for Provider ${providerId}? This will mark all pending orders as paid.`)) return;
    try {
      const result = await fetchWithAuth(`/api/admin/payments/provider/${providerId}/process`, { method: 'POST' });
      alert(result.message || 'Payout processed successfully');
      refreshAll();
    } catch (err) {
      setError(`Unable to process payout: ${err.message}`);
    }
  };

  const openEditUserModal = (user) => {
    if (!user) return;
    const userRoles = (user.roles || []).map((r) => r.name);
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      organization: user.organization || '',
      providerApproved: Boolean(user.providerApproved),
      roles: userRoles.length > 0 ? userRoles : ['Consumer']
    });
    setShowEditUserModal(true);
  };

  const closeEditUserModal = () => {
    setShowEditUserModal(false);
    setEditingUser(null);
  };

  const handleEditField = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleEditRole = (role) => {
    setEditForm((prev) => {
      if (!prev || !Array.isArray(prev.roles)) {
        return { ...prev, roles: [role] };
      }
      const hasRole = prev.roles.includes(role);
      const roles = hasRole ? prev.roles.filter((r) => r !== role) : [...prev.roles, role];
      return { ...prev, roles };
    });
  };

  const saveUserEdits = async () => {
    if (!editingUser) return;
    try {
      await fetchWithAuth(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editForm.name,
          organization: editForm.organization,
          providerApproved: editForm.providerApproved,
          roles: editForm.roles
        })
      });
      closeEditUserModal();
      refreshAll();
    } catch (err) {
      setError(`Unable to update user: ${err.message}`);
    }
  };

  const deleteUser = async (user) => {
    if (!user) return;
    if (!window.confirm(`Are you sure you want to delete ${user.email}?`)) return;
    try {
      await fetchWithAuth(`/api/admin/users/${user.id}`, { method: 'DELETE' });
      refreshAll();
    } catch (err) {
      setError(`Unable to delete user: ${err.message}`);
    }
  };

  // simple handlers to replace inline scripts from the template
  const openAddUserModal = () => setShowAddUserModal(true);
  const closeAddUserModal = () => setShowAddUserModal(false);
  
  const addNewUser = async () => {
    try {
      const form = document.getElementById('addUserForm');
      const name = document.getElementById('userName').value.trim();
      const email = document.getElementById('userEmail').value.trim();
      const password = document.getElementById('userPassword').value.trim();
      const organization = document.getElementById('userOrganization')?.value?.trim() || '';
      const roleSelect = document.getElementById('userRole').value;

      if (!name || !email || !password) {
        alert('Please fill in all required fields');
        return;
      }

      // Map role value to role name
      const roleMapping = {
        'consumer': 'Consumer',
        'provider': 'Provider',
        'partner': 'Partner',
        'admin': 'Admin'
      };

      const payload = {
        name,
        email,
        password,
        organization,
        roles: roleSelect ? [roleMapping[roleSelect]] : ['Consumer'] // Default to Consumer
      };

      await fetchWithAuth('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      alert('User created successfully!');
      closeAddUserModal();
      form.reset();
      await refreshAll(); // Refresh user list
    } catch (err) {
      alert('Failed to create user: ' + err.message);
    }
  };

  const openAPIKeyModal = () => setShowAPIKeyModal(true);
  const closeAPIKeyModal = () => setShowAPIKeyModal(false);
  
  const createAPIKey = async () => {
    try {
      const form = document.getElementById('apiKeyForm');
      const formData = new FormData(form);
      const ownerId = document.getElementById('keyOwner').value;
      const rateLimit = document.getElementById('rateLimit').value;
      const expiryDays = document.getElementById('expiryDays')?.value || 365;
      
      if (!ownerId) {
        alert('Please select an owner for the API key');
        return;
      }
      
      const permissions = [];
      const checkboxes = form.querySelectorAll('input[name="keyPermissions"]:checked');
      checkboxes.forEach(cb => permissions.push(cb.value));
      
      if (permissions.length === 0) {
        alert('Please select at least one permission');
        return;
      }
      
      const payload = {
        userId: parseInt(ownerId),
        scopes: permissions,
        rateLimit: parseInt(rateLimit) || 100,
        expiresInDays: parseInt(expiryDays)
      };
      
      const result = await fetchWithAuth('/api/admin/security/apikeys', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      // Show the key in a more prominent way
      const keyDisplay = result.key || result.apiKey;
      alert(`API Key Created Successfully!\n\nKey: ${keyDisplay}\n\nIMPORTANT: Please save this key securely.\nIt won't be shown again for security reasons.`);
      
      closeAPIKeyModal();
      refreshAll();
    } catch (err) {
      console.error('Create API key error:', err);
      alert(`Failed to create API key:\n${err.message}`);
    }
  };

  // small helpers used by action buttons in the template
  const noopAlert = (msg) => () => alert(msg);

  const approveTransaction = async (orderId) => {
    if (!window.confirm(`Approve transaction #${orderId}? This will split revenue: 70% provider, 30% platform.`)) return;
    try {
      const result = await fetchWithAuth(`/api/admin/transactions/${orderId}/approve`, { method: 'POST' });
      alert(`Transaction approved successfully!\nTotal: $${result.totalAmount}\nProvider gets: $${result.providerRevenue} (70%)\nPlatform gets: $${result.platformRevenue} (30%)`);
      refreshAll();
    } catch (err) {
      setError(`Unable to approve transaction: ${err.message}`);
    }
  };

  // Wrap all computed values in useMemo for safety and performance
  const providerUsers = useMemo(() => 
    Array.isArray(users) ? users.filter((u) => hasRole(u, 'Provider')) : []
  , [users]);
  
  const consumerUsers = useMemo(() => 
    Array.isArray(users) ? users.filter((u) => hasRole(u, 'Consumer')) : []
  , [users]);
  
  const partnerUsers = useMemo(() => 
    Array.isArray(users) ? users.filter((u) => hasRole(u, 'Partner')) : []
  , [users]);
  
  const pendingProviders = useMemo(() => 
    Array.isArray(providerUsers) ? providerUsers.filter((u) => !u.providerApproved) : []
  , [providerUsers]);
  
  const totalUsers = useMemo(() => 
    analytics?.totalUsers ?? (Array.isArray(users) ? users.length : 0)
  , [analytics, users]);
  
  const totalProviders = useMemo(() => 
    analytics?.providers ?? (Array.isArray(providerUsers) ? providerUsers.length : 0)
  , [analytics, providerUsers]);
  
  const totalConsumers = useMemo(() => 
    analytics?.consumers ?? (Array.isArray(consumerUsers) ? consumerUsers.length : 0)
  , [analytics, consumerUsers]);
  
  const pendingProducts = useMemo(() => 
    analytics?.pendingProducts ?? (Array.isArray(pendingDatasets) ? pendingDatasets.length : 0)
  , [analytics, pendingDatasets]);
  
  const pendingProviderDatasets = useMemo(() => 
    analytics?.pendingProviderDatasets ?? (Array.isArray(pendingDatasets) ? pendingDatasets.length : 0)
  , [analytics, pendingDatasets]);
  
  const approvedProviderDatasets = useMemo(() => 
    analytics?.approvedProviderDatasets ?? 0
  , [analytics]);
  
  const publishedProducts = useMemo(() => 
    analytics?.publishedProducts ?? approvedProviderDatasets
  , [analytics, approvedProviderDatasets]);
  
  const numberFrom = (value) => {
    if (value == null) return 0;
    if (typeof value === 'number') return value;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  };
  
  const totalRevenue = useMemo(() => 
    Array.isArray(transactions) ? transactions.reduce((sum, t) => sum + numberFrom(t.amount), 0) : 0
  , [transactions]);
  
  const totalPayout = useMemo(() => 
    Array.isArray(transactions) ? transactions.reduce((sum, t) => sum + numberFrom(t.providerRevenue), 0) : 0
  , [transactions]);
  
  const platformRevenue = useMemo(() => 
    Array.isArray(transactions) ? transactions.reduce((sum, t) => sum + numberFrom(t.platformRevenue), 0) : 0
  , [transactions]);
  
  const formatNumber = (value) => new Intl.NumberFormat().format(Math.round(value || 0));
  const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
  
  const totalTransactions = useMemo(() => 
    Array.isArray(transactions) ? transactions.length : 0
  , [transactions]);
  
  const successfulTransactions = useMemo(() => 
    Array.isArray(transactions) ? transactions.filter((t) => (t?.status || '').toLowerCase() === 'approved').length : 0
  , [transactions]);
  
  const revenueShareEntries = useMemo(() => 
    Object.entries(revenueShare || {})
  , [revenueShare]);
  
  const sortedTransactions = useMemo(() => 
    Array.isArray(transactions) ? [...transactions].sort((a, b) => {
      const dateA = a?.orderDate ? new Date(a.orderDate).getTime() : 0;
      const dateB = b?.orderDate ? new Date(b.orderDate).getTime() : 0;
      return dateB - dateA;
    }) : []
  , [transactions]);
  
  const formatDateTime = (value) => {
    if (!value) return '-';
    try {
      const date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime())) return '-';
      return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
    } catch (e) {
      return '-';
    }
  };
  const formatBytes = (bytes) => {
    const value = Number(bytes);
    if (!value || Number.isNaN(value)) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
    const scaled = value / (1024 ** index);
    return `${scaled.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
  };
  const shortId = (value, length = 8) => {
    if (!value) return '—';
    const str = String(value);
    return str.length <= length ? str : `${str.slice(0, length)}…`;
  };
  const paymentStatusClass = (status) => {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'success') return 'completed';
    if (normalized === 'failed') return 'failed';
    if (normalized === 'pending') return 'pending';
    if (normalized === 'refunded') return 'pending';
    return 'pending';
  };
  const paymentStatusLabel = (status) => {
    if (!status) return 'Unknown';
    const normalized = String(status).toLowerCase();
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };
  const paymentMethodLabel = (method) => {
    if (!method) return '—';
    const normalized = String(method).toLowerCase().replace(/_/g, ' ');
    return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
  };
  const apiKeyStatus = (key) => {
    if (!key || !key.expiresAt) {
      return { label: 'Active', className: 'active' };
    }
    const expires = new Date(key.expiresAt);
    if (Number.isNaN(expires.getTime())) {
      return { label: 'Active', className: 'active' };
    }
    return expires.getTime() > Date.now()
      ? { label: 'Active', className: 'active' }
      : { label: 'Expired', className: 'failed' };
  };
  const rateLimitLabel = (rate) => {
    const numeric = Number(rate);
    if (!numeric || Number.isNaN(numeric) || numeric <= 0) return 'Unlimited';
    return `${numeric.toLocaleString()}/hr`;
  };
  
  const activeApiKeyCount = useMemo(() => 
    Array.isArray(apiKeys) ? apiKeys.reduce((total, key) => {
      try {
        const status = apiKeyStatus(key);
        return status.label === 'Active' ? total + 1 : total;
      } catch (e) {
        console.error('Error calculating active API key count:', e, key);
        return total;
      }
    }, 0) : 0
  , [apiKeys]);
  
  const initialsFor = (user) => {
    if (!user?.name) return 'NA';
    return user.name.split(' ').map((p) => p[0]).join('').substring(0, 2).toUpperCase();
  };

  const processedUsers = useMemo(() => {
    if (!Array.isArray(users) || users.length === 0) {
      return [];
    }
    
    try {
      const decorated = users.map((user) => {
        if (!user) return null;
        
        const roleNames = (user.roles || []).map((r) => (r?.name || '').trim());
        const normalizedRoles = roleNames.map((r) => r.toLowerCase());
        const primaryRole = roleNames[0] || 'Consumer';
        const primaryRoleLower = primaryRole.toLowerCase();
        const isProvider = normalizedRoles.includes('provider');
        const explicitStatus = (user.status || '').toLowerCase();
        const computedStatusKey = explicitStatus || (isProvider && !user.providerApproved ? 'pending' : 'active');
        const statusLabel = computedStatusKey === 'pending' ? 'Pending Approval' : computedStatusKey === 'suspended' ? 'Suspended' : 'Active';
        const statusClass = computedStatusKey === 'pending' ? 'pending' : computedStatusKey === 'suspended' ? 'failed' : 'active';
        const roleBadgeClass = primaryRoleLower.includes('provider')
          ? 'provider'
          : primaryRoleLower.includes('partner')
            ? 'partner'
            : 'consumer';
        
        // Format registration date
        const registrationDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : '-';
        
        return {
          user,
          primaryRole,
          primaryRoleLower,
          normalizedRoles,
          roleBadgeClass,
          statusKey: computedStatusKey,
          statusLabel,
          statusClass,
          isProvider,
          dataSubmissions: isProvider ? (user.datasetsPublished || 0) : 0,
          registrationDate,
        };
      }).filter(entry => entry !== null);

      const filtered = decorated.filter((entry) => {
        if (roleFilter) {
          if (!entry.normalizedRoles.includes(roleFilter.toLowerCase())) {
            return false;
          }
        }
        if (statusFilter) {
          if ((entry.statusKey || '') !== statusFilter.toLowerCase()) {
            return false;
          }
        }
        return true;
      });

      const sorted = [...filtered].sort((a, b) => {
        const direction = sortConfig.direction === 'asc' ? 1 : -1;
        const compareText = (valA, valB) => {
          const aVal = (valA || '').toString().toLowerCase();
          const bVal = (valB || '').toString().toLowerCase();
          if (aVal < bVal) return -1 * direction;
          if (aVal > bVal) return 1 * direction;
          return 0;
        };
        if (sortConfig.key === 'role') {
          return compareText(a.primaryRoleLower, b.primaryRoleLower);
        }
        if (sortConfig.key === 'status') {
          return compareText(a.statusLabel, b.statusLabel);
        }
        if (sortConfig.key === 'dataSubmissions') {
          const diff = (a.dataSubmissions || 0) - (b.dataSubmissions || 0);
          return diff === 0 ? compareText(a.user.name, b.user.name) : diff * direction;
        }
        if (sortConfig.key === 'email') {
          return compareText(a.user.email, b.user.email);
        }
        return compareText(a.user.name, b.user.name);
      });

      return sorted;
    } catch (err) {
      console.error('Error processing users:', err);
      return [];
    }
  }, [users, roleFilter, statusFilter, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(processedUsers.length / USERS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * USERS_PER_PAGE;
  const paginatedUsers = processedUsers.slice(pageStart, pageStart + USERS_PER_PAGE);
  const pageNumbers = Array.from({ length: totalPages }, (_, idx) => idx + 1);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleSort = (columnKey) => {
    setSortConfig((prev) => {
      if (prev.key === columnKey) {
        return { key: columnKey, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key: columnKey, direction: 'asc' };
    });
    setCurrentPage(1);
  };

  const renderSortIndicator = (columnKey) => {
    if (sortConfig.key !== columnKey) return null;
    return <span className={`sort-indicator ${sortConfig.direction}`} aria-hidden="true" />;
  };

  const getAriaSort = (columnKey) => {
    if (sortConfig.key !== columnKey) return 'none';
    return sortConfig.direction === 'asc' ? 'ascending' : 'descending';
  };

  // Early return if not initialized to prevent rendering with invalid state
  if (!initialized) {
    return (
      <div className="admin-banner info-banner">
        Đang khởi tạo trang quản trị...
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div className="admin-banner info-banner">Đang tải dữ liệu quản trị...</div>
      )}
      {error && (
        <div className="admin-banner error-banner">{error}</div>
      )}

      <section className="page-heading">
        <div className="container">
          <div className="header-text">
            <h2>Admin Dashboard</h2>
            <div className="div-dec" />
          </div>
        </div>
      </section>

      <div className="admin-tabs">
        <div className="container">
          <div className="tabs-container">
            <button className="tab-btn" data-tab="users" onClick={() => setActiveTab('users')}>User Management</button>
            <button className="tab-btn" data-tab="payments" onClick={() => setActiveTab('payments')}>Payments</button>
            <button className="tab-btn" data-tab="security" onClick={() => setActiveTab('security')}>Security</button>
            <button className="tab-btn" data-tab="analytics" onClick={() => setActiveTab('analytics')}>Analytics</button>
          </div>
        </div>
      </div>

      <main className="admin-container">
        {/* Users Tab */}
        {activeTab === 'users' && (
        <div id="users" className="tab-content active">
          <section className="admin-section">
            <div className="dashboard-header">
              <h2>User Management Dashboard</h2>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M16 7c0-2.21-1.79-4-4-4S8 4.79 8 7s1.79 4 4 4 4-1.79 4-4zm-4 7c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"/></svg></div>
                <div className="stat-content"><h3>{formatNumber(totalUsers)}</h3><p>Total Users</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div>
                <div className="stat-content"><h3>{formatNumber(totalConsumers)}</h3><p>Data Consumers</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg></div>
                <div className="stat-content"><h3>{formatNumber(totalProviders)}</h3><p>Data Providers</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg></div>
                <div className="stat-content"><h3>{formatNumber(partnerUsers.length)}</h3><p>Partners</p></div>
              </div>
            </div>

            <div className="table-container">
              <div className="table-header">
                <h3>All Users</h3>
                <div className="table-filters">
                  <button className="admin-btn admin-btn-primary" onClick={openAddUserModal}>
                    <svg className="btn-icon" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                    Add New User
                  </button>
                  <select id="roleFilter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="">All Roles</option>
                    <option value="consumer">Data Consumer</option>
                    <option value="provider">Data Provider</option>
                    <option value="partner">Partner</option>
                    <option value="admin">Admin</option>
                  </select>
                  <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <div className="table-wrapper">
                <table className="user-table">
                  <thead>
                    <tr>
                      <th><input type="checkbox" id="selectAll" /></th>
                      <th aria-sort={getAriaSort('name')}>
                        <button type="button" className="sort-button" onClick={() => handleSort('name')}>
                          User
                          {renderSortIndicator('name')}
                        </button>
                      </th>
                      <th aria-sort={getAriaSort('role')}>
                        <button type="button" className="sort-button" onClick={() => handleSort('role')}>
                          Role
                          {renderSortIndicator('role')}
                        </button>
                      </th>
                      <th>Registration Date</th>
                      <th aria-sort={getAriaSort('status')}>
                        <button type="button" className="sort-button" onClick={() => handleSort('status')}>
                          Status
                          {renderSortIndicator('status')}
                        </button>
                      </th>
                      <th aria-sort={getAriaSort('dataSubmissions')}>
                        <button type="button" className="sort-button" onClick={() => handleSort('dataSubmissions')}>
                          Data Submissions
                          {renderSortIndicator('dataSubmissions')}
                        </button>
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((entry) => {
                      const { user, roleBadgeClass, primaryRole, statusClass, statusLabel, isProvider, dataSubmissions, registrationDate } = entry;
                      return (
                        <tr key={user.id}>
                          <td><input type="checkbox" /></td>
                          <td>
                            <div className="user-info">
                              <div className="user-avatar">{initialsFor(user)}</div>
                              <div>
                                <div className="user-name">{user.name}</div>
                                <div className="user-email">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`role-badge ${roleBadgeClass}`}>
                              {primaryRole}
                            </span>
                          </td>
                          <td>{registrationDate}</td>
                          <td><span className={`status-badge ${statusClass}`}>{statusLabel}</span></td>
                          <td>{dataSubmissions}</td>
                          <td>
                            <div className="action-buttons">
                              {isProvider && !user.providerApproved && (
                                <button className="btn-icon success" title="Approve" onClick={() => approveProvider(user.id)}>
                                  <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                </button>
                              )}
                              <button className="btn-icon primary" title="Edit" onClick={() => openEditUserModal(user)}>
                                <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                              </button>
                              <button className="btn-icon danger" title="Delete" onClick={() => deleteUser(user)}>
                                <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {processedUsers.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '16px' }}>No users yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={safeCurrentPage === 1}
                  aria-label="Previous page"
                >
                  <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                </button>
                {Array.isArray(pageNumbers) && pageNumbers.map((page) => (
                  <button
                    key={page}
                    className={`pagination-btn ${page === safeCurrentPage ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                    aria-current={page === safeCurrentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                ))}
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={safeCurrentPage === totalPages}
                  aria-label="Next page"
                >
                  <svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                </button>
              </div>
            </div>
          </section>

          <section className="admin-section">
            <h2>Pending Data Approvals</h2>
            <div className="approval-grid">
              {(!pendingDatasets || pendingDatasets.length === 0) && (
                <div className="empty-state">Không có bộ dữ liệu nào cần phê duyệt.</div>
              )}
              {Array.isArray(pendingDatasets) && pendingDatasets.map((dataset) => {
                if (!dataset) return null;
                const providerLabel = dataset.providerName || `Provider #${dataset.providerId || 'N/A'}`;
                return (
                  <div className="approval-card" key={dataset.id}>
                    <div className="approval-header">
                      <h4>{dataset.name || 'Dataset chưa đặt tên'}</h4>
                      <span className="approval-badge pending">{dataset.status || 'PENDING_REVIEW'}</span>
                    </div>
                    <div className="approval-info">
                      <div className="info-item">
                        <span className="label">Provider:</span>
                        <span className="value">{providerLabel}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Description:</span>
                        <span className="value">{dataset.description || 'N/A'}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Pricing:</span>
                        <span className="value">
                          {dataset.pricingType === 'per_request' ? 'Per Request' : 'Subscription'} - 
                          {formatCurrency(dataset.price || 0)}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="label">Size:</span>
                        <span className="value">{formatBytes(dataset.sizeBytes)}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">S3 URL:</span>
                        <span className="value" style={{ fontSize: '0.85em', wordBreak: 'break-all' }}>
                          {dataset.s3Url || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="approval-actions">
                      <button className="admin-btn admin-btn-success" onClick={() => approveDataset(dataset.id)}>
                        ✓ Approve
                      </button>
                      <button 
                        className="admin-btn admin-btn-outline" 
                        onClick={() => window.open(dataset.s3Url, '_blank')}
                        disabled={!dataset.s3Url}
                      >
                        👁 Review File
                      </button>
                      <button className="admin-btn admin-btn-danger" onClick={() => rejectDataset(dataset.id)}>
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
        )}

        {/* Payments Tab (simplified for JSX correctness) */}
        {activeTab === 'payments' && (
        <div id="payments" className="tab-content active">
          <section className="admin-section">
            <div className="dashboard-header">
              <h2>Revenue Overview</h2>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg></div>
                <div className="stat-content">
                  <h3>{paymentStats ? formatCurrency(paymentStats.totalRevenue || 0) : formatCurrency(totalRevenue)}</h3>
                  <p>Total Revenue</p>
                  <span className="stat-change positive">
                    {paymentStats ? `${formatNumber(paymentStats.completedTransactions || 0)} completed` : 'Live'}
                  </span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg></div>
                <div className="stat-content">
                  <h3>{paymentStats ? formatNumber(paymentStats.completedTransactions || 0) : formatNumber(successfulTransactions)}</h3>
                  <p>Transactions</p>
                  <span className="stat-change neutral">
                    {paymentStats ? `${formatNumber(paymentStats.totalTransactions || 0)} total` : `${formatNumber(totalTransactions)} total`}
                  </span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg></div>
                <div className="stat-content">
                  <h3>{paymentStats ? formatCurrency(paymentStats.providerPayouts || 0) : formatCurrency(totalPayout)}</h3>
                  <p>Provider Payouts</p>
                  <span className="stat-change neutral">{paymentStats ? formatNumber(paymentStats.pendingPayouts || 0) : '0'} pending</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg></div>
                <div className="stat-content">
                  <h3>{paymentStats ? formatCurrency(paymentStats.platformCommissions || 0) : formatCurrency(platformRevenue)}</h3>
                  <p>Platform Revenue (30%)</p>
                  <span className="stat-change positive">Commission</span>
                </div>
              </div>
            </div>

            <section className="admin-section">
              <h2>Recent Transactions</h2>
              <div className="table-container">
                <div className="table-wrapper">
                  <table className="user-table">
                    <thead>
                      <tr>
                        <th>Transaction</th>
                        <th>Purchase / Subscription</th>
                        <th>Method</th>
                        <th>Amount</th>
                        <th>Provider Share</th>
                        <th>Platform Fee</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(sortedTransactions) && sortedTransactions.map((tx) => {
                        if (!tx) return null;
                        return (
                        <tr key={tx.id}>
                          <td>TX-{tx.id}</td>
                          <td>{tx.datasetId ? `Dataset #${tx.datasetId}` : '-'}</td>
                          <td>Direct</td>
                          <td>{formatCurrency(numberFrom(tx.amount))}</td>
                          <td>{tx.providerRevenue ? formatCurrency(numberFrom(tx.providerRevenue)) : '-'}</td>
                          <td>{tx.platformRevenue ? formatCurrency(numberFrom(tx.platformRevenue)) : '-'}</td>
                          <td>{formatDateTime(tx.orderDate)}</td>
                          <td><span className={`status-badge ${tx.status === 'APPROVED' ? 'success' : tx.status === 'PENDING' ? 'warning' : 'neutral'}`}>{tx.status}</span></td>
                          <td>
                            {tx.status === 'PENDING' && (
                              <button 
                                className="admin-btn admin-btn-primary" 
                                style={{padding: '6px 12px', fontSize: '0.875rem'}}
                                onClick={() => approveTransaction(tx.id)}
                              >
                                Approve
                              </button>
                            )}
                            {tx.status === 'APPROVED' && (
                              <span style={{color: '#10B981', fontSize: '0.875rem'}}>Approved</span>
                            )}
                          </td>
                        </tr>
                      );
                      })}
                      {(!Array.isArray(sortedTransactions) || sortedTransactions.length === 0) && (
                        <tr>
                          <td colSpan={9} style={{ textAlign: 'center', padding: '16px' }}>No transactions yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="admin-section">
              <h2>Provider Payouts</h2>
              <div className="payouts-grid">
                {(!Array.isArray(providerPayouts) || providerPayouts.length === 0) && (!Array.isArray(revenueShareEntries) || revenueShareEntries.length === 0) && (
                  <div className="empty-state">No revenue share data for providers yet.</div>
                )}
                {Array.isArray(providerPayouts) && providerPayouts.map((payout) => {
                  if (!payout) return null;
                  return (
                  <div className="payout-card" key={payout.providerId}>
                    <div className="payout-header">
                      <h4>{payout.providerName || `Provider ${shortId(payout.providerId)}`}</h4>
                      <span className="payout-amount">{formatCurrency(numberFrom(payout.totalNetPayout))}</span>
                    </div>
                    <div className="payout-info">
                      <div className="info-item"><span className="label">Provider ID:</span><span className="value">{payout.providerId}</span></div>
                      <div className="info-item"><span className="label">Email:</span><span className="value">{payout.providerEmail || '—'}</span></div>
                      <div className="info-item"><span className="label">Total Revenue:</span><span className="value">{formatCurrency(numberFrom(payout.totalRevenue))}</span></div>
                      <div className="info-item"><span className="label">Platform Commission:</span><span className="value">{formatCurrency(numberFrom(payout.totalCommission))}</span></div>
                      <div className="info-item"><span className="label">Net Payout:</span><span className="value" style={{fontWeight: 'bold', color: '#10B981'}}>{formatCurrency(numberFrom(payout.totalNetPayout))}</span></div>
                      <div className="info-item"><span className="label">Pending Orders:</span><span className="value">{numberFrom(payout.pendingPayoutsCount)}</span></div>
                    </div>
                    <div className="payout-actions">
                      <button className="admin-btn admin-btn-primary" onClick={() => processPayout(payout.providerId)}>
                        Process Payout ({formatCurrency(numberFrom(payout.totalNetPayout))})
                      </button>
                      <button className="admin-btn admin-btn-outline" onClick={noopAlert(`View payout details for ${payout.providerId}`)}>View Details</button>
                    </div>
                  </div>
                  );
                })}
                {/* Fallback to old revenue share data if new API not available */}
                {Array.isArray(providerPayouts) && providerPayouts.length === 0 && Array.isArray(revenueShareEntries) && revenueShareEntries.map(([providerId, amount]) => {
                  if (!providerId || !amount) return null;
                  return (
                  <div className="payout-card" key={providerId}>
                    <div className="payout-header">
                      <h4>{`Provider ${shortId(providerId)}`}</h4>
                      <span className="payout-amount">{formatCurrency(amount)}</span>
                    </div>
                    <div className="payout-info">
                      <div className="info-item"><span className="label">Provider ID:</span><span className="value">{providerId}</span></div>
                      <div className="info-item"><span className="label">Total Share:</span><span className="value">{formatCurrency(amount)}</span></div>
                      <div className="info-item"><span className="label">Last Updated:</span><span className="value">—</span></div>
                    </div>
                    <div className="payout-actions">
                      <button className="admin-btn admin-btn-primary" onClick={() => processPayout(providerId)}>Process Payout</button>
                      <button className="admin-btn admin-btn-outline" onClick={noopAlert(`View payout details for ${providerId}`)}>View Details</button>
                    </div>
                  </div>
                  );
                })}
              </div>
            </section>
          </section>
        </div>
        )}

        {/* Security Tab - copied from template and adapted */}
        {activeTab === 'security' && (
        <div id="security" className="tab-content active">
          <section className="admin-section">
            <div className="dashboard-header">
              <h2>Security Overview</h2>
            </div>

            <div className="stats-grid">
              <div className="stat-card"><div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg></div><div className="stat-content"><h3>98.2%</h3><p>System Uptime</p><span className="stat-change positive">+2.1%</span></div></div>
              <div className="stat-card"><div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM8.9 6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2H8.9V6z"/></svg></div><div className="stat-content"><h3>{formatNumber(activeApiKeyCount)}</h3><p>Active API Keys</p><span className="stat-change neutral">Live</span></div></div>
              <div className="stat-card"><div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M20 8h-3V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg></div><div className="stat-content"><h3>3</h3><p>Security Alerts</p><span className="stat-change negative">+1</span></div></div>
              <div className="stat-card"><div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 8c0 1.1-.9 2-2 2h-2v2h4v2H9v-4c0-1.1.9-2 2-2h2V9H9V7h4c1.1 0 2 .9 2 2v2z"/></svg></div><div className="stat-content"><h3>100%</h3><p>GDPR Compliance</p><span className="stat-change positive">+5%</span></div></div>
            </div>

            <div className="alerts-container">
              <div className="alert-header"><h3>Security Alerts</h3><span className="alert-count">3 Active Alerts</span></div>
              <div className="alerts-list">
                <div className="alert-item critical"><div className="alert-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg></div><div className="alert-content"><h4>Multiple Failed Login Attempts</h4><p>User account "john.doe@company.com" has 15 failed login attempts in the last hour</p><span className="alert-time">10 minutes ago</span></div><div className="alert-actions"><button className="admin-btn admin-btn-danger" onClick={noopAlert('Block IP 192.168.1.100')}>Block IP</button><button className="admin-btn admin-btn-outline" onClick={noopAlert('Investigate alert 1')}>Investigate</button></div></div>

                <div className="alert-item warning"><div className="alert-icon"><svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg></div><div className="alert-content"><h4>Unusual API Usage Pattern</h4><p>API key "ak_7842x" showing 300% increase in request volume</p><span className="alert-time">2 hours ago</span></div><div className="alert-actions"><button className="admin-btn admin-btn-warning" onClick={noopAlert('Throttle API ak_7842x')}>Throttle</button><button className="admin-btn admin-btn-outline" onClick={noopAlert('Review alert 2')}>Review</button></div></div>

                <div className="alert-item info"><div className="alert-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg></div><div className="alert-content"><h4>Data Export Request</h4><p>Large dataset export requested by user "sarah@evresearch.org"</p><span className="alert-time">5 hours ago</span></div><div className="alert-actions"><button className="admin-btn admin-btn-primary" onClick={noopAlert('Approve export 1')}>Approve</button><button className="admin-btn admin-btn-outline" onClick={noopAlert('Review alert 3')}>Review</button></div></div>
              </div>
            </div>

            <section className="admin-section">
              <h2>API Access Management</h2>
              <div className="table-container">
                <div className="table-header"><h3>Active API Keys</h3><div className="header-actions"><button className="admin-btn admin-btn-primary" onClick={openAPIKeyModal}><svg className="btn-icon" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>Generate New Key</button></div></div>
                <div className="table-wrapper">
                  <table className="user-table">
                    <thead>
                      <tr>
                        <th>API Key</th>
                        <th>Owner</th>
                        <th>Permissions</th>
                        <th>Rate Limit</th>
                        <th>Expires</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(apiKeys) && apiKeys.map((key) => {
                        if (!key || !key.id) return null;
                        
                        const consumer = key.consumer || null;
                        const ownerDisplay = consumer?.name || consumer?.email || (key.consumerId ? shortId(key.consumerId) : '—');
                        const statusValue = key.status || (key.expiresAt && new Date(key.expiresAt) < new Date() ? 'expired' : 'active');
                        const statusClass = statusValue === 'active' ? 'active' : (statusValue === 'expired' ? 'warning' : 'inactive');
                        const statusLabel = statusValue.charAt(0).toUpperCase() + statusValue.slice(1);
                        
                        return (
                          <tr key={key.id}>
                            <td><code className="api-key">{key.key || '—'}</code></td>
                            <td>
                              {consumer ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                  <strong>{consumer.name || '—'}</strong>
                                  <small style={{ color: '#6B7280' }}>{consumer.email || '—'}</small>
                                  {consumer.organization && <small style={{ color: '#9CA3AF' }}>{consumer.organization}</small>}
                                </div>
                              ) : (
                                <span style={{ color: '#9CA3AF' }}>{ownerDisplay}</span>
                              )}
                            </td>
                            <td>
                              <div className="permissions-tags">
                                {(!key.scopes || key.scopes.length === 0) && <span className="permission-tag">default</span>}
                                {Array.isArray(key.scopes) && key.scopes.map((scope) => (
                                  <span className="permission-tag" key={scope}>{scope}</span>
                                ))}
                              </div>
                            </td>
                            <td>{rateLimitLabel(key.rateLimit)}</td>
                            <td>{formatDateTime(key.expiresAt)}</td>
                            <td><span className={`status-badge ${statusClass}`}>{statusLabel}</span></td>
                            <td>
                              <div className="action-buttons">
                                <button 
                                  className="btn-icon warning" 
                                  title="Revoke (Expire)" 
                                  onClick={() => revokeKey(key.id)}
                                  style={{ marginRight: '8px' }}
                                >
                                  <svg viewBox="0 0 24 24" width="18" height="18">
                                    <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                                  </svg>
                                </button>
                                <button 
                                  className="btn-icon danger" 
                                  title="Delete Permanently" 
                                  onClick={() => deleteKey(key.id)}
                                >
                                  <svg viewBox="0 0 24 24" width="18" height="18">
                                    <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {(!apiKeys || apiKeys.length === 0) && (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '16px' }}>No API keys yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="admin-section">
              <h2>Compliance Status</h2>
              <div className="compliance-grid"><div className="compliance-card"><div className="compliance-header"><h4>GDPR Compliance</h4><span className="compliance-score excellent">100%</span></div><div className="compliance-progress"><div className="progress-bar"><div className="progress-fill" style={{width: '100%'}}></div></div></div><div className="compliance-details"><div className="detail-item"><span className="label">Data Anonymization:</span><span className="value compliant">Compliant</span></div><div className="detail-item"><span className="label">Right to Erasure:</span><span className="value compliant">Compliant</span></div><div className="detail-item"><span className="label">Data Portability:</span><span className="value compliant">Compliant</span></div></div></div>

                <div className="compliance-card"><div className="compliance-header"><h4>CCPA Compliance</h4><span className="compliance-score good">95%</span></div><div className="compliance-progress"><div className="progress-bar"><div className="progress-fill" style={{width: '95%'}}></div></div></div><div className="compliance-details"><div className="detail-item"><span className="label">Opt-out Mechanism:</span><span className="value compliant">Compliant</span></div><div className="detail-item"><span className="label">Data Disclosure:</span><span className="value compliant">Compliant</span></div><div className="detail-item"><span className="label">Minor Protection:</span><span className="value warning">Needs Review</span></div></div></div>
              </div>
            </section>
          </section>
        </div>
        )}

        {/* Analytics Tab (simplified for JSX correctness) */}
        {activeTab === 'analytics' && (
        <div id="analytics" className="tab-content active">
          <section className="admin-section">
            <div className="dashboard-header">
              <h2>Platform Performance</h2>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg></div>
                <div className="stat-content"><h3>{analytics?.totalUsers?.toLocaleString() || 0}</h3><p>Active Users</p><span className="stat-change positive">+15.3%</span></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg></div>
                <div className="stat-content"><h3>{analytics?.publishedProducts?.toLocaleString() || 0}</h3><p>Datasets Available</p><span className="stat-change positive">+8.7%</span></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg></div>
                <div className="stat-content"><h3>${analytics?.totalRevenue?.toLocaleString() || 0}</h3><p>Monthly Revenue</p><span className="stat-change positive">+12.5%</span></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div>
                <div className="stat-content"><h3>{analytics?.totalApiRequests?.toLocaleString() || 0}</h3><p>API Requests</p><span className="stat-change positive">+22.1%</span></div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <div className="chart-header">
                  <h4>User Growth</h4>
                  <div className="chart-legend">
                    <div className="legend-item"><div className="legend-color primary" /> <span>New Users</span></div>
                    <div className="legend-item"><div className="legend-color secondary" /> <span>Active Users</span></div>
                  </div>
                </div>
                <div className="chart-placeholder">
                  <div className="line-chart">
                    <div className="chart-line primary" style={{height: '80%'}} />
                    <div className="chart-line secondary" style={{height: '65%'}} />
                    <div className="chart-points">
                      <span>Jan</span>
                      <span>Feb</span>
                      <span>Mar</span>
                      <span>Apr</span>
                      <span>May</span>
                      <span>Jun</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header"><h4>Dataset Categories</h4></div>
                <div className="chart-placeholder">
                  {marketStats?.categoryDistribution && marketStats.categoryDistribution.length > 0 ? (
                    <>
                      <div className="pie-chart">
                        {marketStats.categoryDistribution.slice(0, 5).map((cat, idx) => {
                          const colors = ['#64FFDA', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
                          return (
                            <div 
                              key={idx} 
                              className="pie-segment" 
                              style={{ ['--percentage']: cat.percentage, ['--color']: colors[idx] }} 
                            />
                          );
                        })}
                      </div>
                      <div className="pie-legend">
                        {marketStats.categoryDistribution.slice(0, 5).map((cat, idx) => {
                          const colors = ['#64FFDA', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
                          return (
                            <div key={idx} className="legend-item">
                              <div className="legend-color" style={{background: colors[idx]}} /> 
                              <span>{cat.category} ({cat.percentage}%)</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="pie-chart">
                      <div className="pie-segment" style={{ ['--percentage']: 100, ['--color']: '#64FFDA' }} />
                      <div className="pie-legend">
                        <div className="legend-item"><div className="legend-color" style={{background: '#64FFDA'}} /> <span>No data available</span></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="admin-section">
            <h2>Top Datasets - Most Popular</h2>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Dataset Name</th>
                    <th>Category</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {marketStats?.topDatasets && marketStats.topDatasets.length > 0 ? (
                    marketStats.topDatasets.map((dataset, idx) => {
                      const categoryText = (dataset.category || 'Other').replace(/_/g, ' ');
                      console.log('Dataset category:', dataset.datasetId, dataset.category, 'Display:', categoryText);
                      return (
                      <tr key={dataset.datasetId}>
                        <td>#{idx + 1}</td>
                        <td>{dataset.datasetName}</td>
                        <td style={{color: '#3730A3', fontWeight: '600', textTransform: 'capitalize'}}>
                          {categoryText}
                        </td>
                        <td>{dataset.orderCount}</td>
                        <td>${dataset.revenue.toFixed(2)}</td>
                      </tr>
                    );})
                  ) : (
                    <tr>
                      <td colSpan="5" style={{textAlign: 'center', padding: '2rem', color: '#999'}}>
                        Chưa có dữ liệu thống kê. Cần có orders để hiển thị top datasets.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-section">
            <h2>AI-Powered Market Insights</h2>
            <div className="insights-grid">
              <div className="insight-card">
                <div className="insight-header"><h4>EV Market Trends</h4><span className="insight-confidence">92%</span></div>
                <div className="insight-content"><p>Growing demand for battery degradation data suggests increased focus on EV longevity and resale value analysis.</p></div>
              </div>
              <div className="insight-card">
                <div className="insight-header"><h4>Infrastructure Development</h4><span className="insight-confidence">87%</span></div>
                <div className="insight-content"><p>Charging behavior data indicates need for fast-charging infrastructure in suburban commercial areas.</p></div>
              </div>
              <div className="insight-card">
                <div className="insight-header"><h4>Consumer Behavior</h4><span className="insight-confidence">85%</span></div>
                <div className="insight-content"><p>Weekend driving patterns show increased EV usage for family trips, suggesting range anxiety is decreasing.</p></div>
                <div className="insight-actions"><button className="admin-btn admin-btn-outline" onClick={noopAlert('View detailed consumer behavior analysis')}>View Detailed Analysis</button></div>
              </div>
            </div>
          </section>

          <section className="admin-section">
            <h2>Geographic Distribution</h2>
            <div className="geo-grid">
              <div className="geo-card">
                <div className="geo-header"><h4>User Distribution by Region</h4></div>
                <div className="geo-content">
                  <div className="region-item"><span className="region-name">North America</span><span className="region-percent">45%</span></div>
                  <div className="region-item"><span className="region-name">Europe</span><span className="region-percent">35%</span></div>
                  <div className="region-item"><span className="region-name">Asia</span><span className="region-percent">15%</span></div>
                  <div className="region-item"><span className="region-name">Other</span><span className="region-percent">5%</span></div>
                </div>
              </div>
            </div>
          </section>
        </div>
        )}

      </main>

      {showEditUserModal && editingUser && (
        <div id="editUserModal" className="modal modal-open" onClick={(e) => { if (e.target.id === 'editUserModal') closeEditUserModal(); }}>
          <div className="modal-content">
            <div className="modal-header"><h3>Edit User</h3><button type="button" className="modal-close" onClick={closeEditUserModal}>&times;</button></div>
            <div className="modal-body">
              <form className="user-form">
                <div className="form-group"><label>Email</label><input type="email" value={editingUser.email} disabled /></div>
                <div className="form-group"><label htmlFor="editUserName">Full Name</label><input type="text" id="editUserName" value={editForm.name} onChange={(e) => handleEditField('name', e.target.value)} /></div>
                <div className="form-group"><label htmlFor="editOrganization">Organization</label><input type="text" id="editOrganization" value={editForm.organization} onChange={(e) => handleEditField('organization', e.target.value)} /></div>
                <div className="form-group"><label>Roles</label><div className="permissions-grid">{roleOptions.map((role) => (
                  <label className="permission-checkbox" key={role}>
                    <input type="checkbox" checked={Array.isArray(editForm?.roles) && editForm.roles.includes(role)} onChange={() => toggleEditRole(role)} />
                    {role}
                  </label>
                ))}</div></div>
                <div className="form-group"><label className="permission-checkbox"><input type="checkbox" checked={editForm.providerApproved} onChange={(e) => handleEditField('providerApproved', e.target.checked)} />Provider approved</label></div>
              </form>
            </div>
            <div className="modal-footer"><button type="button" className="admin-btn admin-btn-outline" onClick={closeEditUserModal}>Cancel</button><button type="button" className="admin-btn admin-btn-primary" onClick={saveUserEdits}>Save Changes</button></div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div id="addUserModal" className="modal modal-open" onClick={(e) => { if (e.target.id === 'addUserModal') closeAddUserModal(); }}>
          <div className="modal-content">
            <div className="modal-header"><h3>Add New User</h3><button className="modal-close" onClick={closeAddUserModal}>&times;</button></div>
            <div className="modal-body">
              <form className="user-form" id="addUserForm">
                <div className="form-group"><label htmlFor="userName">Full Name *</label><input type="text" id="userName" required/></div>
                <div className="form-group"><label htmlFor="userEmail">Email *</label><input type="email" id="userEmail" required/></div>
                <div className="form-group"><label htmlFor="userPassword">Password *</label><input type="password" id="userPassword" required minLength="6"/></div>
                <div className="form-group"><label htmlFor="userOrganization">Organization</label><input type="text" id="userOrganization"/></div>
                <div className="form-group"><label htmlFor="userRole">Role *</label><select id="userRole" required><option value="">Select Role</option><option value="consumer">Consumer</option><option value="provider">Provider</option><option value="partner">Partner</option><option value="admin">Admin</option></select></div>
              </form>
            </div>
            <div className="modal-footer"><button className="admin-btn admin-btn-outline" onClick={closeAddUserModal}>Cancel</button><button className="admin-btn admin-btn-primary" onClick={addNewUser}>Create User</button></div>
          </div>
        </div>
      )}

      {/* API Key Modal */}
      {showAPIKeyModal && (
        <div id="apiKeyModal" className="modal modal-open" onClick={(e) => { if (e.target.id === 'apiKeyModal') closeAPIKeyModal(); }}>
          <div className="modal-content">
            <div className="modal-header"><h3>Generate New API Key</h3><button className="modal-close" onClick={closeAPIKeyModal}>&times;</button></div>
            <div className="modal-body">
              <form className="api-key-form" id="apiKeyForm">
                <div className="form-group">
                  <label htmlFor="keyOwner">Owner (Consumer)</label>
                  <select id="keyOwner" required>
                    <option value="">Select Consumer</option>
                    {Array.isArray(consumerUsers) && consumerUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Permissions</label>
                  <div className="permissions-grid">
                    <label className="permission-checkbox">
                      <input type="checkbox" name="keyPermissions" value="read:datasets" defaultChecked/>
                      Read Datasets
                    </label>
                    <label className="permission-checkbox">
                      <input type="checkbox" name="keyPermissions" value="download:data"/>
                      Download Data
                    </label>
                    <label className="permission-checkbox">
                      <input type="checkbox" name="keyPermissions" value="analytics:access"/>
                      Analytics Access
                    </label>
                    <label className="permission-checkbox">
                      <input type="checkbox" name="keyPermissions" value="api:premium"/>
                      Premium API Features
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="rateLimit">Rate Limit (requests/hour)</label>
                  <input type="number" id="rateLimit" defaultValue={100} min={10} max={10000}/>
                </div>
                <div className="form-group">
                  <label htmlFor="expiryDays">Expires In (days)</label>
                  <select id="expiryDays">
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="180">180 days</option>
                    <option value="365">1 year</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="modal-footer"><button className="admin-btn admin-btn-outline" onClick={closeAPIKeyModal}>Cancel</button><button className="admin-btn admin-btn-primary" onClick={createAPIKey}>Generate Key</button></div>
          </div>
        </div>
      )}

    </>
  );
};

export default Admin;
