import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/register.css';

const initialFormState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  userType: '',
  organization: '',
  terms: false,
};

const Register = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const wantsProvider = useMemo(() => formData.userType === 'data-provider', [formData.userType]);
  const wantsConsumer = useMemo(() => formData.userType !== 'data-provider', [formData.userType]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'Please enter your full name.';
    }
    if (!formData.email.trim()) {
      nextErrors.email = 'Please enter your email.';
    }
    if (!formData.password) {
      nextErrors.password = 'Please enter a password.';
    }
    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.';
    }
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }
    if (!formData.terms) {
      nextErrors.terms = 'You must agree to the terms and conditions.';
    }

    return nextErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);

    const nextErrors = validate();
    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setLoading(false);
      return;
    }

    const registrationData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      organization: formData.organization.trim() || null,
      wantsConsumer,
      wantsProvider,
    };

    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData),
    })
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || 'Registration failed');
        }
        return res.text();
      })
      .then(() => {
        setFormData(initialFormState);
        setFieldErrors({});
        navigate('/login');
      })
      .catch((err) => {
        console.error('Registration error', err);
        setSubmitError('Registration failed. Email may already exist.');
      })
      .finally(() => setLoading(false));
  };

  // Giao diện của component
  return (
    <main className="register-layout">
      {/* LEFT PANEL */}
      <section className="register-left-panel">
        <div className="left-decor decor-green floating"></div>
        <div className="left-decor decor-white floating delay-2"></div>
        <div className="left-decor decor-small floating delay-4"></div>

        <div className="register-left-content">
          <div className="logo-wrapper">
            <div className="logo-circle pulse-green">
              <svg className="logo-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            </div>
          </div>
          <h1 className="site-title">EV Data Analytics</h1>
          <h2 className="site-subtitle">Marketplace</h2>
          <p className="site-desc">Join the world's leading EV data community</p>

          <div className="features-box">
            <svg className="feature-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <ul className="feature-list">
              <li>✓ Global data access</li>
              <li>✓ In-depth analytics</li>
              <li>✓ Partner connections</li>
            </ul>
          </div>
        </div>
      </section>

      {/* RIGHT PANEL */}
      <section className="register-right-panel">
        <div className="form-container">
          <div id="step1" className="form-step">
            <h2 className="form-title">Create New Account</h2>

            <form id="signupForm" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input 
                  type="text" 
                  id="fullName" 
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {fieldErrors.name && <small className="error">{fieldErrors.name}</small>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                />
                {fieldErrors.email && <small className="error">{fieldErrors.email}</small>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {fieldErrors.password && <small className="error">{fieldErrors.password}</small>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {fieldErrors.confirmPassword && <small className="error">{fieldErrors.confirmPassword}</small>}
              </div>

              <div className="form-group">
                <label htmlFor="userType">User Type</label>
                <select 
                  id="userType" 
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                >
                  <option value="">Select user type</option>
                  <option value="data-provider">Data Provider</option>
                  <option value="data-analyst">Analyst / Business</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="organization">Organization (optional)</label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  placeholder="Organization name"
                  value={formData.organization || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="form-check">
                <input 
                  type="checkbox" 
                  id="terms" 
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                />
                <label htmlFor="terms">
                  I agree to the <a href="#">Terms</a> and <a href="#">Privacy Policy</a>
                </label>
              </div>
              {fieldErrors.terms && <small className="error">{fieldErrors.terms}</small>}

              <button type="submit" className="submit-btn">Sign Up Now</button>
              {loading && <div className="info">Submitting...</div>}
              {submitError && <div className="error">{submitError}</div>}

              <p className="login-prompt">
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </form>
          </div>
        </div>

      </section>
    </main>
  );
};

export default Register;
