// Import các thư viện và component cần thiết
import React, { useState } from 'react'; // Dùng để tạo component và quản lý state
import { useNavigate } from 'react-router-dom'; // Dùng để điều hướng
import { useAuth } from '../context/AuthContext'; // Hook để truy cập context xác thực
import '../styles/login.css'; // Import file CSS cho giao diện

// Định nghĩa component AdminLogin
const AdminLogin = () => {
  // State để lưu trữ dữ liệu từ form (email, password)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Hàm xử lý khi người dùng thay đổi giá trị trong các ô input
  const handleChange = (e) => {
    const { name, value } = e.target; // Lấy tên và giá trị từ input
    // Cập nhật state formData
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Hàm xử lý khi admin nhấn nút submit form
  const handleSubmit = (e) => {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của form
    setLoading(true); // Bắt đầu hiển thị trạng thái loading
    setError(null); // Xóa các lỗi cũ

    // Gọi API backend dành riêng cho admin để đăng nhập
    fetch('/api/admin/login', {
      method: 'POST', // Phương thức POST
      headers: { 'Content-Type': 'application/json' }, // Khai báo kiểu nội dung là JSON
      body: JSON.stringify({ email: formData.email, password: formData.password }) // Gửi email và password
    }).then(async res => {
      // Nếu kết quả trả về không thành công
      if (!res.ok) {
        const txt = await res.text(); // Đọc nội dung lỗi
        throw new Error(txt || 'Login failed'); // Ném lỗi
      }
      return res.json(); // Nếu thành công, chuyển đổi response sang JSON
    }).then(data => {
      // Sau khi nhận được dữ liệu từ backend
      auth.login(data.token); // Gọi hàm login từ AuthContext để lưu token
      navigate('/admin'); // Chuyển hướng thẳng đến trang admin
    }).catch(err => {
      // Xử lý nếu có lỗi trong quá trình fetch
      console.error('Admin Login error', err);
      setError('Đăng nhập thất bại. Vui lòng kiểm tra email/mật khẩu.'); // Hiển thị lỗi cho người dùng
    }).finally(() => setLoading(false)); // Kết thúc trạng thái loading
  };

  // Các state cục bộ cho UI
  const [loading, setLoading] = useState(false); // State cho trạng thái loading
  const [error, setError] = useState(null); // State để lưu thông báo lỗi
  const navigate = useNavigate(); // Hook để thực hiện điều hướng
  const auth = useAuth(); // Lấy context xác thực

  // Giao diện của component (tương tự trang Login)
  return (
    <main className="login-layout">
      {/* Left Column */}
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

      {/* Right Column */}
      <section className="login-right-panel">
        <div className="login-page-box">
          <h2 className="login-title">Admin Portal Login</h2>
          <p className="login-subtitle">Chào mừng bạn quay trở lại!</p>
          
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
          </form>
        </div>

      </section>
    </main>
  );
};

export default AdminLogin;
