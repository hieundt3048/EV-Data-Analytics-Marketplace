import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/index.css';
import '../styles/admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAPIKeyModal, setShowAPIKeyModal] = useState(false);

  useEffect(() => {
    // mirror the template's behavior by toggling classes for CSS that relies on .active
    document.querySelectorAll('.tab-content').forEach((el) => el.classList.remove('active'));
    const activeContent = document.getElementById(activeTab);
    if (activeContent) activeContent.classList.add('active');
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    const btn = document.querySelector(`.tab-btn[data-tab="${activeTab}"]`);
    if (btn) btn.classList.add('active');
  }, [activeTab]);

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

  return (
    <>
      <Header />

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
            <button className="tab-btn" data-tab="dashboard" onClick={() => setActiveTab('dashboard')}>Dashboard</button>
            <button className="tab-btn" data-tab="users" onClick={() => setActiveTab('users')}>User Management</button>
            <button className="tab-btn" data-tab="payments" onClick={() => setActiveTab('payments')}>Payments</button>
            <button className="tab-btn" data-tab="security" onClick={() => setActiveTab('security')}>Security</button>
            <button className="tab-btn" data-tab="analytics" onClick={() => setActiveTab('analytics')}>Analytics</button>
          </div>
        </div>
      </div>

      <main className="admin-container">
        {/* Dashboard Tab */}
        <div id="dashboard" className="tab-content">
          <section className="admin-section">
            <h2>Platform Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <svg viewBox="0 0 24 24"><path d="M16 7c0-2.21-1.79-4-4-4S8 4.79 8 7s1.79 4 4 4 4-1.79 4-4zm-4 7c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"/></svg>
                </div>
                <div className="stat-content"><h3>1,247</h3><p>Active Users</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
                </div>
                <div className="stat-content"><h3>568</h3><p>Datasets Available</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.78-1.18 2.73-3.12 3.16z"/></svg>
                </div>
                <div className="stat-content"><h3>$42.8K</h3><p>Monthly Revenue</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <svg viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                </div>
                <div className="stat-content"><h3>98.2%</h3><p>Platform Uptime</p></div>
              </div>
            </div>
          </section>
          
          <section className="admin-section">
            <h2>Quick Actions</h2>
            <div className="quick-actions-grid">
              <div className="admin-card">
                <div className="card-body">
                  <h5>User Management & Permissions</h5>
                  <ul>
                    <li>View and manage all registered users</li>
                    <li>Assign roles and permissions</li>
                    <li>Approve or reject data submissions</li>
                    <li>Monitor user activity and compliance</li>
                  </ul>
                  <button className="admin-btn admin-btn-primary" onClick={() => setActiveTab('users')}>Manage Users</button>
                </div>
              </div>

              <div className="admin-card">
                <div className="card-body">
                  <h5>Payment & Revenue Sharing</h5>
                  <ul>
                    <li>Monitor all payment transactions</li>
                    <li>Distribute revenue to data providers</li>
                    <li>Generate financial reports</li>
                    <li>Manage subscription billing</li>
                  </ul>
                  <button className="admin-btn admin-btn-success" onClick={() => setActiveTab('payments')}>Payment Dashboard</button>
                </div>
              </div>

              <div className="admin-card">
                <div className="card-body">
                  <h5>Security & Privacy Compliance</h5>
                  <ul>
                    <li>Monitor data encryption and security protocols</li>
                    <li>Manage API access controls</li>
                    <li>Ensure GDPR, CCPA compliance</li>
                    <li>Audit data access logs</li>
                  </ul>
                  <button className="admin-btn admin-btn-warning" onClick={() => setActiveTab('security')}>Security Center</button>
                </div>
              </div>

              <div className="admin-card">
                <div className="card-body">
                  <h5>Analytics & Market Insights</h5>
                  <ul>
                    <li>View most popular datasets and trends</li>
                    <li>AI-powered EV market development insights</li>
                    <li>Generate comprehensive market reports</li>
                    <li>Monitor platform performance metrics</li>
                  </ul>
                  <button className="admin-btn admin-btn-info" onClick={() => setActiveTab('analytics')}>View Analytics</button>
                </div>
              </div>
            </div>
          </section>
        </div>

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
                <button className="admin-btn admin-btn-outline" onClick={noopAlert('Exporting users (demo)')}>
                  <svg className="btn-icon" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                  Export Users
                </button>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M16 7c0-2.21-1.79-4-4-4S8 4.79 8 7s1.79 4 4 4 4-1.79 4-4zm-4 7c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"/></svg></div>
                <div className="stat-content"><h3>1,247</h3><p>Total Users</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg></div>
                <div className="stat-content"><h3>856</h3><p>Data Consumers</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg></div>
                <div className="stat-content"><h3>324</h3><p>Data Providers</p></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg></div>
                <div className="stat-content"><h3>67</h3><p>Partners</p></div>
              </div>
            </div>

            <div className="table-container">
              <div className="table-header">
                <h3>All Users</h3>
                <div className="table-filters">
                  <select id="roleFilter"><option value="">All Roles</option><option value="consumer">Data Consumer</option><option value="provider">Data Provider</option><option value="partner">Partner</option><option value="admin">Admin</option></select>
                  <select id="statusFilter"><option value="">All Status</option><option value="active">Active</option><option value="pending">Pending</option><option value="suspended">Suspended</option></select>
                </div>
              </div>
              <div className="table-wrapper">
                <table className="user-table">
                  <thead>
                    <tr><th><input type="checkbox" id="selectAll" /></th><th>User</th><th>Role</th><th>Registration Date</th><th>Status</th><th>Data Submissions</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><input type="checkbox"/></td>
                      <td><div className="user-info"><div className="user-avatar">JD</div><div><div className="user-name">John Doe</div><div className="user-email">john.doe@company.com</div></div></div></td>
                      <td><span className="role-badge consumer">Data Consumer</span></td>
                      <td>2024-01-15</td>
                      <td><span className="status-badge active">Active</span></td>
                      <td>0</td>
                      <td><div className="action-buttons"><button className="btn-icon" title="Edit" onClick={noopAlert('Edit user 1')}><svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></button><button className="btn-icon" title="View" onClick={noopAlert('View user 1')}><svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg></button><button className="btn-icon danger" title="Suspend" onClick={noopAlert('Suspend user 1')}><svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button></div></td>
                    </tr>
                    <tr>
                      <td><input type="checkbox"/></td>
                      <td><div className="user-info"><div className="user-avatar">SJ</div><div><div className="user-name">Sarah Johnson</div><div className="user-email">sarah@evresearch.org</div></div></div></td>
                      <td><span className="role-badge provider">Data Provider</span></td>
                      <td>2024-02-03</td>
                      <td><span className="status-badge active">Active</span></td>
                      <td>24</td>
                      <td><div className="action-buttons"><button className="btn-icon" title="Edit" onClick={noopAlert('Edit user 2')}><svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></button><button className="btn-icon" title="View" onClick={noopAlert('View user 2')}><svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg></button><button className="btn-icon danger" title="Suspend" onClick={noopAlert('Suspend user 2')}><svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button></div></td>
                    </tr>
                    <tr>
                      <td><input type="checkbox"/></td>
                      <td><div className="user-info"><div className="user-avatar">MR</div><div><div className="user-name">Mike Rodriguez</div><div className="user-email">mike@tesla.com</div></div></div></td>
                      <td><span className="role-badge partner">Partner</span></td>
                      <td>2024-01-28</td>
                      <td><span className="status-badge pending">Pending Approval</span></td>
                      <td>8</td>
                      <td><div className="action-buttons"><button className="btn-icon success" title="Approve" onClick={noopAlert('Approve user 3')}><svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></button><button className="btn-icon" title="View" onClick={noopAlert('View user 3')}><svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg></button><button className="btn-icon danger" title="Reject" onClick={noopAlert('Reject user 3')}><svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button></div></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="pagination">
                <button className="pagination-btn" disabled><svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg></button>
                <button className="pagination-btn active">1</button>
                <button className="pagination-btn">2</button>
                <button className="pagination-btn">3</button>
                <button className="pagination-btn"><svg viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg></button>
              </div>
            </div>
          </section>

          <section className="admin-section">
            <h2>Pending Data Approvals</h2>
            <div className="approval-grid">
              <div className="approval-card">
                <div className="approval-header"><h4>Battery Performance Dataset</h4><span className="approval-badge pending">Pending</span></div>
                <div className="approval-info">
                  <div className="info-item"><span className="label">Provider:</span><span className="value">Sarah Johnson</span></div>
                  <div className="info-item"><span className="label">Size:</span><span className="value">2.4 GB</span></div>
                  <div className="info-item"><span className="label">Records:</span><span className="value">250,000</span></div>
                  <div className="info-item"><span className="label">Submitted:</span><span className="value">2024-03-15</span></div>
                </div>
                <div className="approval-actions"><button className="admin-btn admin-btn-success" onClick={noopAlert('Approve dataset 1')}>Approve</button><button className="admin-btn admin-btn-outline" onClick={noopAlert('Review dataset 1')}>Review</button><button className="admin-btn admin-btn-danger" onClick={noopAlert('Reject dataset 1')}>Reject</button></div>
              </div>

              <div className="approval-card">
                <div className="approval-header"><h4>Charging Behavior Analysis</h4><span className="approval-badge pending">Pending</span></div>
                <div className="approval-info">
                  <div className="info-item"><span className="label">Provider:</span><span className="value">EV Research Lab</span></div>
                  <div className="info-item"><span className="label">Size:</span><span className="value">1.8 GB</span></div>
                  <div className="info-item"><span className="label">Records:</span><span className="value">180,000</span></div>
                  <div className="info-item"><span className="label">Submitted:</span><span className="value">2024-03-14</span></div>
                </div>
                <div className="approval-actions"><button className="admin-btn admin-btn-success" onClick={noopAlert('Approve dataset 2')}>Approve</button><button className="admin-btn admin-btn-outline" onClick={noopAlert('Review dataset 2')}>Review</button><button className="admin-btn admin-btn-danger" onClick={noopAlert('Reject dataset 2')}>Reject</button></div>
              </div>
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
              <div className="stat-card"><div className="stat-icon">💰</div><div className="stat-content"><h3>$42,850</h3><p>Total Revenue</p><span className="stat-change positive">+12.5%</span></div></div>
              <div className="stat-card"><div className="stat-icon">🧾</div><div className="stat-content"><h3>1,247</h3><p>Transactions</p><span className="stat-change positive">+8.3%</span></div></div>
              <div className="stat-card"><div className="stat-icon">💸</div><div className="stat-content"><h3>$18,240</h3><p>Provider Payouts</p><span className="stat-change positive">+15.2%</span></div></div>
              <div className="stat-card"><div className="stat-icon">📈</div><div className="stat-content"><h3>$24,610</h3><p>Platform Revenue</p><span className="stat-change positive">+10.8%</span></div></div>
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
                    <thead><tr><th>Transaction ID</th><th>User</th><th>Type</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
                    <tbody>
                      <tr><td>#TX-7842</td><td>John Doe</td><td>Data Purchase</td><td>$299.00</td><td>2024-03-15</td><td>Completed</td></tr>
                      <tr><td>#TX-7841</td><td>Sarah Johnson</td><td>Provider Payout</td><td>$1,250.00</td><td>2024-03-15</td><td>Completed</td></tr>
                      <tr><td>#TX-7840</td><td>Mike Rodriguez</td><td>Subscription</td><td>$199.00</td><td>2024-03-14</td><td>Pending</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="admin-section">
              <h2>Provider Payouts</h2>
              <div className="payouts-grid">
                <div className="payout-card">
                  <div className="payout-header"><h4>Sarah Johnson</h4><span className="payout-amount">$2,450</span></div>
                  <div className="payout-info"><div className="info-item"><span className="label">Datasets Sold:</span><span className="value">24</span></div><div className="info-item"><span className="label">Commission Rate:</span><span className="value">70%</span></div><div className="info-item"><span className="label">Next Payout:</span><span className="value">2024-03-31</span></div></div>
                  <div className="payout-actions"><button className="admin-btn admin-btn-primary" onClick={noopAlert('Process payout for Sarah Johnson')}>Process Payout</button><button className="admin-btn admin-btn-outline" onClick={noopAlert('View payout details for Sarah Johnson')}>View Details</button></div>
                </div>

                <div className="payout-card">
                  <div className="payout-header"><h4>EV Research Lab</h4><span className="payout-amount">$1,890</span></div>
                  <div className="payout-info"><div className="info-item"><span className="label">Datasets Sold:</span><span className="value">18</span></div><div className="info-item"><span className="label">Commission Rate:</span><span className="value">65%</span></div><div className="info-item"><span className="label">Next Payout:</span><span className="value">2024-03-31</span></div></div>
                  <div className="payout-actions"><button className="admin-btn admin-btn-primary" onClick={noopAlert('Process payout for EV Research Lab')}>Process Payout</button><button className="admin-btn admin-btn-outline" onClick={noopAlert('View payout details for EV Research Lab')}>View Details</button></div>
                </div>
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
              <div className="stat-card"><div className="stat-icon security"><svg viewBox="0 0 24 24"><path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM8.9 6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2H8.9V6z"/></svg></div><div className="stat-content"><h3>24</h3><p>Active API Keys</p><span className="stat-change neutral">0%</span></div></div>
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
                    <thead><tr><th>API Key</th><th>Owner</th><th>Permissions</th><th>Rate Limit</th><th>Last Used</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      <tr><td><code className="api-key">ak_78x42y19z83a</code></td><td><div className="user-info"><div className="user-avatar">JD</div><div><div className="user-name">John Doe</div><div className="user-email">john.doe@company.com</div></div></div></td><td><div className="permissions-tags"><span className="permission-tag">data_read</span><span className="permission-tag">analytics</span></div></td><td>1000/hr</td><td>2024-03-15 14:30</td><td><span className="status-badge active">Active</span></td><td><div className="action-buttons"><button className="btn-icon" title="Edit" onClick={noopAlert('Edit API key ak_78x42y19z83a')}><svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></button><button className="btn-icon danger" title="Revoke" onClick={noopAlert('Revoke API key ak_78x42y19z83a')}><svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button></div></td></tr>
                      <tr><td><code className="api-key">ak_65y29x18z74b</code></td><td><div className="user-info"><div className="user-avatar">SJ</div><div><div className="user-name">Sarah Johnson</div><div className="user-email">sarah@evresearch.org</div></div></div></td><td><div className="permissions-tags"><span className="permission-tag">data_read</span><span className="permission-tag">data_write</span><span className="permission-tag">analytics</span></div></td><td>500/hr</td><td>2024-03-15 11:15</td><td><span className="status-badge active">Active</span></td><td><div className="action-buttons"><button className="btn-icon" title="Edit" onClick={noopAlert('Edit API key ak_65y29x18z74b')}><svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></button><button className="btn-icon danger" title="Revoke" onClick={noopAlert('Revoke API key ak_65y29x18z74b')}><svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button></div></td></tr>
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

      {/* Add User Modal */}
      {showAddUserModal && (
        <div id="addUserModal" className="modal" onClick={(e) => { if (e.target.id === 'addUserModal') closeAddUserModal(); }}>
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
        <div id="apiKeyModal" className="modal" onClick={(e) => { if (e.target.id === 'apiKeyModal') closeAPIKeyModal(); }}>
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

      <Footer />
    </>
  );
};

export default Admin;
