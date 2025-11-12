import React, { useState, useEffect, useMemo } from 'react';
import '../styles/index.css';
import '../styles/admin.css';

const Admin = () => {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
      const [analyticsRes, usersRes, pendingRes, transactionsRes, revenueRes, apiKeyRes, paymentStatsRes, payoutsRes] = await Promise.all([
        fetchWithAuth('/api/admin/analytics/overview'),
        fetchWithAuth('/api/admin/users'),
        fetchWithAuth('/api/admin/provider-datasets/pending'),
        fetchWithAuth('/api/admin/orders').catch(() => []),
        fetchWithAuth('/api/admin/payments/revenue-share').catch(() => ({})),
        fetchWithAuth('/api/admin/security/apikeys').catch(() => []),
        fetchWithAuth('/api/admin/payments/revenue-stats').catch(() => null),
        fetchWithAuth('/api/admin/payments/provider-payouts').catch(() => [])
      ]);
      setAnalytics(analyticsRes);
      setUsers(usersRes || []);
      setPendingDatasets(pendingRes || []);
      setTransactions(transactionsRes || []);
      setRevenueShare(revenueRes || {});
      setApiKeys(apiKeyRes || []);
      setPaymentStats(paymentStatsRes);
      setProviderPayouts(payoutsRes || []);
    } catch (err) {
      setError(err.message || 'Unable to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, statusFilter, users.length]);

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

  const revokeKey = async (id) => {
    try {
      await fetchWithAuth(`/api/admin/security/apikeys/${id}/revoke`, { method: 'PUT' });
      refreshAll();
    } catch (err) {
      setError(`Unable to revoke API key: ${err.message}`);
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
  const addNewUser = () => {
    alert('User added (demo)');
    closeAddUserModal();
  };

  const openAPIKeyModal = () => setShowAPIKeyModal(true);
  const closeAPIKeyModal = () => setShowAPIKeyModal(false);
  const createAPIKey = () => {
    alert('API key generated (demo)');
    closeAPIKeyModal();
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

  const providerUsers = users.filter((u) => hasRole(u, 'Provider'));
  const consumerUsers = users.filter((u) => hasRole(u, 'Consumer'));
  const partnerUsers = users.filter((u) => hasRole(u, 'Partner'));
  const pendingProviders = providerUsers.filter((u) => !u.providerApproved);
  const totalUsers = analytics?.totalUsers ?? users.length;
  const totalProviders = analytics?.providers ?? providerUsers.length;
  const totalConsumers = analytics?.consumers ?? consumerUsers.length;
  const pendingProducts = analytics?.pendingProducts ?? pendingDatasets.length;
  const pendingProviderDatasets = analytics?.pendingProviderDatasets ?? pendingDatasets.length;
  const approvedProviderDatasets = analytics?.approvedProviderDatasets ?? 0;
  const publishedProducts = analytics?.publishedProducts ?? approvedProviderDatasets;
  const numberFrom = (value) => {
    if (value == null) return 0;
    if (typeof value === 'number') return value;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  };
  const totalRevenue = transactions.reduce((sum, t) => sum + numberFrom(t.amount), 0);
  const totalPayout = transactions.reduce((sum, t) => sum + numberFrom(t.providerRevenue), 0);
  const platformRevenue = transactions.reduce((sum, t) => sum + numberFrom(t.platformRevenue), 0);
  const formatNumber = (value) => new Intl.NumberFormat().format(Math.round(value || 0));
  const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
  const totalTransactions = transactions.length;
  const successfulTransactions = transactions.filter((t) => (t?.status || '').toLowerCase() === 'approved').length;
  const revenueShareEntries = Object.entries(revenueShare || {});
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = a?.orderDate ? new Date(a.orderDate).getTime() : 0;
    const dateB = b?.orderDate ? new Date(b.orderDate).getTime() : 0;
    return dateB - dateA;
  });
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
  const activeApiKeyCount = apiKeys.reduce((total, key) => {
    const status = apiKeyStatus(key);
    return status.label === 'Active' ? total + 1 : total;
  }, 0);
  const initialsFor = (user) => {
    if (!user?.name) return 'NA';
    return user.name.split(' ').map((p) => p[0]).join('').substring(0, 2).toUpperCase();
  };

  const processedUsers = useMemo(() => {
    const decorated = users.map((user) => {
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
      };
    });

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
        <div id="users" className="tab-content">
          <section className="admin-section">
            <div className="dashboard-header">
              <h2>User Management Dashboard</h2>
              <div className="header-actions">
                <button className="admin-btn admin-btn-primary" onClick={openAddUserModal}>
                  <svg className="btn-icon" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                  Add New User
                </button>
              </div>
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
                      const { user, roleBadgeClass, primaryRole, statusClass, statusLabel, isProvider, dataSubmissions } = entry;
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
                          <td>-</td>
                          <td><span className={`status-badge ${statusClass}`}>{statusLabel}</span></td>
                          <td>{isProvider ? dataSubmissions : '-'}</td>
                          <td>
                            <div className="action-buttons">
                              {isProvider && !user.providerApproved && (
                                <button className="btn-icon success" title="Approve" onClick={() => approveProvider(user.id)}>
                                  <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                </button>
                              )}
                              <button className="btn-icon" title="Edit" onClick={() => openEditUserModal(user)}>
                                <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                              </button>
                              <button className="btn-icon" title="View" onClick={noopAlert(`View ${user.email}`)}>
                                <svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
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
                {pageNumbers.map((page) => (
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
              {pendingDatasets.length === 0 && (
                <div className="empty-state">Không có bộ dữ liệu nào cần phê duyệt.</div>
              )}
              {pendingDatasets.map((dataset) => {
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

        {/* Payments Tab (simplified for JSX correctness) */}
        <div id="payments" className="tab-content">
          <section className="admin-section">
            <div className="dashboard-header">
              <h2>Revenue Overview</h2>
              <div className="header-actions">
                <select id="timePeriod" defaultValue="week">
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
                <button className="admin-btn admin-btn-outline" onClick={noopAlert('Export report')}>
                  <svg className="btn-icon" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                  Export Report
                </button>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h3>{paymentStats ? formatCurrency(paymentStats.totalRevenue || 0) : formatCurrency(totalRevenue)}</h3>
                  <p>Total Revenue</p>
                  <span className="stat-change neutral">Live</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🧾</div>
                <div className="stat-content">
                  <h3>{paymentStats ? formatNumber(paymentStats.totalTransactions || 0) : formatNumber(totalTransactions)}</h3>
                  <p>Transactions</p>
                  <span className="stat-change neutral">{paymentStats ? formatNumber(paymentStats.totalTransactions || 0) : formatNumber(successfulTransactions)} completed</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💸</div>
                <div className="stat-content">
                  <h3>{paymentStats ? formatCurrency(paymentStats.providerPayouts || 0) : formatCurrency(totalPayout)}</h3>
                  <p>Provider Payouts</p>
                  <span className="stat-change neutral">{paymentStats ? formatNumber(paymentStats.pendingPayouts || 0) : '0'} pending</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-content">
                  <h3>{paymentStats ? formatCurrency(paymentStats.platformCommissions || 0) : formatCurrency(platformRevenue)}</h3>
                  <p>Platform Revenue ({paymentStats?.commissionRate || '20%'})</p>
                  <span className="stat-change neutral">Commission</span>
                </div>
              </div>
            </div>

            <div className="chart-container">
              <div className="chart-header"><h3>Revenue Trends</h3></div>
              <div className="chart-placeholder">(Revenue chart placeholder)</div>
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
                      {sortedTransactions.map((tx) => (
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
                      ))}
                      {sortedTransactions.length === 0 && (
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
                {providerPayouts.length === 0 && revenueShareEntries.length === 0 && (
                  <div className="empty-state">No revenue share data for providers yet.</div>
                )}
                {providerPayouts.map((payout) => (
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
                ))}
                {/* Fallback to old revenue share data if new API not available */}
                {providerPayouts.length === 0 && revenueShareEntries.map(([providerId, amount]) => (
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
                ))}
              </div>
            </section>
          </section>
        </div>

        {/* Security Tab - copied from template and adapted */}
        <div id="security" className="tab-content">
          <section className="admin-section">
            <div className="dashboard-header">
              <h2>Security Overview</h2>
              <div className="header-actions">
                <button className="admin-btn admin-btn-primary" onClick={noopAlert('Security scan initiated (demo)')}>
                  <svg className="btn-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                  Run Security Scan
                </button>
                <button className="admin-btn admin-btn-outline" onClick={noopAlert('Export logs (demo)')}>
                  <svg className="btn-icon" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                  Export Logs
                </button>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card"><div className="stat-icon security"><svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg></div><div className="stat-content"><h3>98.2%</h3><p>System Uptime</p><span className="stat-change positive">+2.1%</span></div></div>
              <div className="stat-card"><div className="stat-icon security"><svg viewBox="0 0 24 24"><path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM8.9 6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2H8.9V6z"/></svg></div><div className="stat-content"><h3>{formatNumber(activeApiKeyCount)}</h3><p>Active API Keys</p><span className="stat-change neutral">Live</span></div></div>
              <div className="stat-card"><div className="stat-icon security"><svg viewBox="0 0 24 24"><path d="M20 8h-3V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg></div><div className="stat-content"><h3>3</h3><p>Security Alerts</p><span className="stat-change negative">+1</span></div></div>
              <div className="stat-card"><div className="stat-icon security"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 8c0 1.1-.9 2-2 2h-2v2h4v2H9v-4c0-1.1.9-2 2-2h2V9H9V7h4c1.1 0 2 .9 2 2v2z"/></svg></div><div className="stat-content"><h3>100%</h3><p>GDPR Compliance</p><span className="stat-change positive">+5%</span></div></div>
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
                      {apiKeys.map((key) => {
                        const status = apiKeyStatus(key);
                        return (
                          <tr key={key.id}>
                            <td><code className="api-key">{key.key}</code></td>
                            <td>{key.consumerId ? shortId(key.consumerId) : '—'}</td>
                            <td>
                              <div className="permissions-tags">
                                {(key.scopes || []).length === 0 && <span className="permission-tag">default</span>}
                                {(key.scopes || []).map((scope) => (
                                  <span className="permission-tag" key={scope}>{scope}</span>
                                ))}
                              </div>
                            </td>
                            <td>{rateLimitLabel(key.rateLimit)}</td>
                            <td>{formatDateTime(key.expiresAt)}</td>
                            <td><span className={`status-badge ${status.className}`}>{status.label}</span></td>
                            <td>
                              <div className="action-buttons">
                                <button className="btn-icon danger" title="Revoke" onClick={() => revokeKey(key.id)}>
                                  <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {apiKeys.length === 0 && (
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
              <h2>Data Access Logs</h2>
              <div className="table-container">
                <div className="table-header"><h3>Recent Access Events</h3><div className="table-filters"><select id="logType"><option value="">All Events</option><option value="login">Login</option><option value="data_access">Data Access</option><option value="api_call">API Call</option><option value="export">Data Export</option></select><select id="logStatus"><option value="">All Status</option><option value="success">Success</option><option value="failed">Failed</option></select></div></div>
                <div className="table-wrapper"><table className="user-table"><thead><tr><th>Timestamp</th><th>User</th><th>Event Type</th><th>IP Address</th><th>Resource</th><th>Status</th><th>Details</th></tr></thead><tbody><tr><td>2024-03-15 14:30:15</td><td><div className="user-info"><div className="user-avatar">JD</div><div><div className="user-name">John Doe</div></div></div></td><td><span className="event-badge data_access">Data Access</span></td><td>192.168.1.100</td><td>/api/v1/datasets/7842</td><td><span className="status-badge completed">Success</span></td><td><button className="admin-btn admin-btn-outline" onClick={noopAlert('View log details 1')}>View Details</button></td></tr><tr><td>2024-03-15 14:28:03</td><td><div className="user-info"><div className="user-avatar">SJ</div><div><div className="user-name">Sarah Johnson</div></div></div></td><td><span className="event-badge api_call">API Call</span></td><td>203.0.113.45</td><td>/api/v1/analytics/battery-health</td><td><span className="status-badge completed">Success</span></td><td><button className="admin-btn admin-btn-outline" onClick={noopAlert('View log details 2')}>View Details</button></td></tr><tr><td>2024-03-15 14:25:47</td><td><div className="user-info"><div className="user-avatar">-</div><div><div className="user-name">Unknown</div></div></div></td><td><span className="event-badge login">Login</span></td><td>198.51.100.23</td><td>/login</td><td><span className="status-badge failed">Failed</span></td><td><button className="admin-btn admin-btn-outline" onClick={noopAlert('View log details 3')}>View Details</button></td></tr></tbody></table></div>
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

        {/* Analytics Tab (simplified for JSX correctness) */}
        <div id="analytics" className="tab-content">
          <section className="admin-section">
            <div className="dashboard-header">
              <h2>Platform Performance</h2>
              <div className="header-actions">
                <select id="analyticsPeriod">
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="quarter">Last 90 Days</option>
                  <option value="year">Last 12 Months</option>
                </select>
                <button className="admin-btn admin-btn-outline" onClick={noopAlert('Export analytics')}>
                  <svg className="btn-icon" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                  Export Report
                </button>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-content"><h3>1,247</h3><p>Active Users</p><span className="stat-change positive">+15.3%</span></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content"><h3>568</h3><p>Datasets Available</p><span className="stat-change positive">+8.7%</span></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-content"><h3>$42,850</h3><p>Monthly Revenue</p><span className="stat-change positive">+12.5%</span></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🔌</div>
                <div className="stat-content"><h3>3,842</h3><p>API Requests</p><span className="stat-change positive">+22.1%</span></div>
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
                  <div className="pie-chart">
                    <div className="pie-segment" style={{ ['--percentage']: 35, ['--color']: '#64FFDA' }} />
                    <div className="pie-segment" style={{ ['--percentage']: 25, ['--color']: '#3B82F6' }} />
                    <div className="pie-segment" style={{ ['--percentage']: 20, ['--color']: '#10B981' }} />
                    <div className="pie-segment" style={{ ['--percentage']: 15, ['--color']: '#F59E0B' }} />
                    <div className="pie-segment" style={{ ['--percentage']: 5, ['--color']: '#EF4444' }} />
                  </div>
                  <div className="pie-legend">
                    <div className="legend-item"><div className="legend-color" style={{background: '#64FFDA'}} /> <span>Battery Data (35%)</span></div>
                    <div className="legend-item"><div className="legend-color" style={{background: '#3B82F6'}} /> <span>Charging (25%)</span></div>
                    <div className="legend-item"><div className="legend-color" style={{background: '#10B981'}} /> <span>Driving (20%)</span></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="admin-section">
            <h2>Most Popular Datasets</h2>
            <div className="table-container">
              <div className="table-header"><h3>Top Performing Datasets</h3></div>
              <div className="table-wrapper">
                <table className="user-table">
                  <thead>
                    <tr><th>Dataset</th><th>Category</th><th>Provider</th><th>Downloads</th><th>Revenue</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Battery Health (SOH)</td><td>Battery Data</td><td>Sarah Johnson</td><td>247</td><td>$7,410</td></tr>
                    <tr><td>Charging Behavior</td><td>Charging Data</td><td>EV Research Lab</td><td>189</td><td>$5,670</td></tr>
                    <tr><td>Driving Patterns</td><td>Driving Data</td><td>Mike Rodriguez</td><td>156</td><td>$4,680</td></tr>
                  </tbody>
                </table>
              </div>
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
                    <input type="checkbox" checked={editForm.roles.includes(role)} onChange={() => toggleEditRole(role)} />
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
                <div className="form-group"><label htmlFor="userName">Full Name</label><input type="text" id="userName" required/></div>
                <div className="form-group"><label htmlFor="userEmail">Email</label><input type="email" id="userEmail" required/></div>
                <div className="form-group"><label htmlFor="userRole">Role</label><select id="userRole" required><option value="">Select Role</option><option value="consumer">Data Consumer</option><option value="provider">Data Provider</option><option value="partner">Partner</option><option value="admin">Admin</option></select></div>
                <div className="form-group"><label>Permissions</label><div className="permissions-grid"><label className="permission-checkbox"><input type="checkbox" name="permissions" value="data_view"/>View Data</label><label className="permission-checkbox"><input type="checkbox" name="permissions" value="data_upload"/>Upload Data</label><label className="permission-checkbox"><input type="checkbox" name="permissions" value="data_download"/>Download Data</label><label className="permission-checkbox"><input type="checkbox" name="permissions" value="api_access"/>API Access</label></div></div>
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
                <div className="form-group"><label htmlFor="keyOwner">Owner</label><select id="keyOwner" required><option value="">Select User</option><option value="1">John Doe (john.doe@company.com)</option><option value="2">Sarah Johnson (sarah@evresearch.org)</option></select></div>
                <div className="form-group"><label>Permissions</label><div className="permissions-grid"><label className="permission-checkbox"><input type="checkbox" name="keyPermissions" value="data_read"/>Read Data</label><label className="permission-checkbox"><input type="checkbox" name="keyPermissions" value="data_write"/>Write Data</label><label className="permission-checkbox"><input type="checkbox" name="keyPermissions" value="analytics"/>Analytics Access</label><label className="permission-checkbox"><input type="checkbox" name="keyPermissions" value="export"/>Data Export</label></div></div>
                <div className="form-group"><label htmlFor="rateLimit">Rate Limit (requests/hour)</label><input type="number" id="rateLimit" defaultValue={1000} min={100} max={10000}/></div>
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
