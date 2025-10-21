import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: '',
    terms: false
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp';
    }

    // Validate terms
    if (!formData.terms) {
      newErrors.terms = 'Bạn phải đồng ý với điều khoản';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // TODO: Implement registration logic
    console.log('Registration attempt:', formData);
  };

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
          <p className="site-desc">Tham gia cộng đồng dữ liệu xe điện hàng đầu thế giới</p>

          <div className="features-box">
            <svg className="feature-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <ul className="feature-list">
              <li>✓ Truy cập dữ liệu toàn cầu</li>
              <li>✓ Phân tích chuyên sâu</li>
              <li>✓ Kết nối đối tác</li>
            </ul>
          </div>
        </div>
      </section>

      {/* RIGHT PANEL */}
      <section className="register-right-panel">
        <div className="form-container">
          <div id="step1" className="form-step">
            <h2 className="form-title">Tạo tài khoản mới</h2>

            <form id="signupForm" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="fullName">Họ và tên *</label>
                <input 
                  type="text" 
                  id="fullName" 
                  name="fullName"
                  placeholder="Nhập họ và tên đầy đủ"
                  value={formData.fullName}
                  onChange={handleChange}
                />
                {errors.fullName && <small className="error">{errors.fullName}</small>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  placeholder="Nhập địa chỉ email"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <small className="error">{errors.email}</small>}
                {success.email && <small className="success">✓ Email khả dụng</small>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Mật khẩu *</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password"
                  placeholder="Tạo mật khẩu mạnh"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && <small className="error">{errors.password}</small>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword"
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && <small className="error">{errors.confirmPassword}</small>}
                {formData.confirmPassword && formData.password === formData.confirmPassword && 
                  <small className="success">✓ Mật khẩu khớp</small>
                }
              </div>

              <div className="form-group">
                <label htmlFor="userType">Loại người dùng</label>
                <select 
                  id="userType" 
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                >
                  <option value="">Chọn loại người dùng</option>
                  <option value="data-provider">Nhà cung cấp dữ liệu</option>
                  <option value="data-analyst">Nhà phân tích / Doanh nghiệp</option>
                </select>
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
                  Tôi đồng ý với <a href="#">Điều khoản</a> và <a href="#">Chính sách</a>
                </label>
              </div>
              {errors.terms && <small className="error">{errors.terms}</small>}

              <button type="submit" className="submit-btn">Đăng ký ngay</button>

              <p className="login-prompt">
                Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
              </p>
            </form>
          </div>
        </div>

        <footer className="footer">
          <p>&copy; 2025 EV Data Analytics Marketplace</p>
          <a href="#">Điều khoản</a> • <a href="#">Chính sách bảo mật</a>
        </footer>
      </section>
    </main>
  );
};

export default Register;
