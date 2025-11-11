// Import các thư viện và component cần thiết
import React, { useState } from 'react'; // Dùng để tạo component và quản lý state
import { Link, useNavigate } from 'react-router-dom'; // Dùng để điều hướng và tạo liên kết
import { useAuth } from '../context/AuthContext'; // Hook để truy cập context xác thực
import '../styles/login.css'; // Import file CSS cho giao diện

// Định nghĩa component Login
const Login = () => {
  // State để lưu trữ dữ liệu từ form (email, password, rememberMe)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  // Hàm xử lý khi người dùng thay đổi giá trị trong các ô input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target; // Lấy thông tin từ event
    // Cập nhật state formData
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value // Nếu là checkbox thì lấy `checked`, ngược lại lấy `value`
    }));
  };

  // Hàm xử lý khi người dùng nhấn nút submit form
  const handleSubmit = (e) => {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của form (tải lại trang)
    setLoading(true); // Bắt đầu hiển thị trạng thái loading
    setError(null); // Xóa các lỗi cũ

    // Gọi API backend để đăng nhập
    fetch('/api/auth/login', {
      method: 'POST', // Phương thức POST
      headers: { 'Content-Type': 'application/json' }, // Khai báo kiểu nội dung là JSON
      body: JSON.stringify({ email: formData.email, password: formData.password }) // Gửi email và password
    }).then(async res => {
      // Nếu kết quả trả về không thành công (status code không phải 2xx)
      if (!res.ok) {
        const txt = await res.text(); // Đọc nội dung lỗi
        throw new Error(txt || 'Login failed'); // Ném lỗi
      }
      return res.json(); // Nếu thành công, chuyển đổi response sang JSON
    }).then(data => {
      // Sau khi nhận được dữ liệu từ backend
      auth.login(data.token); // Gọi hàm login từ AuthContext để lưu token

      // Chuyển hướng người dùng dựa trên vai trò (role) trong token
      try {
        const parts = data.token.split('.'); // Tách token JWT thành 3 phần
        if (parts.length >= 2) {
          const payload = JSON.parse(atob(parts[1])); // Giải mã phần payload của token
          const roles = payload.roles || []; // Lấy danh sách vai trò
          // Kiểm tra vai trò và điều hướng tương ứng
          if (roles.includes('Admin')) {
            navigate('/admin');
            return;
          }
          if (roles.includes('Provider') && roles.includes('Consumer')) {
            navigate('/dashboard');
            return;
          } else if (roles.includes('Provider')) {
            navigate('/provider');
            return;
          } else if (roles.includes('Consumer')) {
            navigate('/consumer');
            return;
          }
        }
      } catch (e) {
        console.warn('Failed to parse JWT for roles', e); // Log if JWT decode error
      }
      // If no specific role, navigate to home page
      navigate('/');
    }).catch(err => {
      // Handle fetch errors
      console.error('Login error', err);
      setError('Login failed. Please check your email/password.'); // Display error to user
    }).finally(() => setLoading(false)); // End loading state
  };

  // Các state cục bộ cho UI
  const [loading, setLoading] = useState(false); // State cho trạng thái loading
  const [error, setError] = useState(null); // State để lưu thông báo lỗi
  const navigate = useNavigate(); // Hook để thực hiện điều hướng
  const auth = useAuth(); // Lấy context xác thực

  // Giao diện của component
  return (
    <main className="login-layout">
      {/* Cột bên trái */}
      <section className="login-left-panel">
        <div className="background-circle circle-1"></div>
        <div className="background-circle circle-2"></div>
        <div className="background-circle circle-3"></div>

        <div className="login-brand-box">
          <div className="logo-login">
            <svg viewBox="0 0 24 24" className="logo-icon">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11C5.84 5 5.28 5.42 5.08 6.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
          </div>
          <h1 className="login-brand-title">EV Data Analytics</h1>
          <h2 className="login-brand-subtitle">Marketplace</h2>
          <p className="login-brand-description">Nền tảng kết nối dữ liệu và phân tích xe điện toàn cầu</p>
        </div>

        <div className="illustration">
          <svg viewBox="0 0 24 24" className="illustration-icon">
            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm2-8H3v2h2V9zm4-6v2h2V3H9zM5 21h14c1.1 0 2-.9 2-2v-3H3v3c0 1.1.9 2 2 2zM3 10h18V8c0-1.1-.9-2-2-2h-4V4c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2v2H5c-1.1 0-2 .9-2 2v2z"/>
          </svg>
        </div>
      </section>

      {/* Cột bên phải */}
      <section className="login-right-panel">
        <div className="login-page-box">
          <h2 className="login-title">Đăng nhập tài khoản</h2>
          <p className="login-subtitle">Chào mừng bạn quay trở lại!</p>
          
          {/* Social Login */}
          <div className="social-login">
            <button className="social-btn google-btn">
              <svg className="social-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Đăng nhập với Google
            </button>

            <div className="social-group">
              <button className="social-btn linkedin-btn">
                <svg className="social-icon" viewBox="0 0 24 24" fill="#0077B5">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </button>

              <button className="social-btn github-btn">
                <svg className="social-icon" viewBox="0 0 24 24" fill="#333">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </button>
            </div>

            <div className="divider">
              <span>Hoặc đăng nhập bằng email</span>
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="email" className="form-label">Email / Tên đăng nhập</label>
            <input 
              id="email"
              name="email"
              type="email" 
              className="form-input" 
              placeholder="Nhập email hoặc tên đăng nhập"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label htmlFor="password" className="form-label">Mật khẩu</label>
            <input 
              id="password"
              name="password"
              type="password" 
              className="form-input" 
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <div className="form-options">
              <label>
                <input 
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                /> 
                Ghi nhớ đăng nhập
              </label>
              <a href="#" className="forgot-link">Quên mật khẩu?</a>
            </div>

            <button type="submit" className="login-button" disabled={loading}>{loading ? 'Đang xử lý...' : 'Đăng nhập'}</button>
            {error && <div className="form-error" role="alert">{error}</div>}

            <p className="register-text">
              Chưa có tài khoản? <Link to="/register" className="register-link">Đăng ký ngay</Link>
            </p>
          </form>
        </div>

      </section>
    </main>
  );
};

export default Login;
