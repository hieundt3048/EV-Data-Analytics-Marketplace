// Import các thư viện cần thiết từ React
import React, { createContext, useContext, useState, useEffect } from 'react';

// Tạo một Context mới cho việc xác thực
const AuthContext = createContext(null);

// Component Provider: Cung cấp dữ liệu xác thực cho các component con
export const AuthProvider = ({ children }) => {
  // State để lưu thông tin người dùng (lấy từ token)
  const [user, setUser] = useState(null);
  // State để kiểm tra xem quá trình khởi tạo đã hoàn tất chưa
  const [isInitialized, setIsInitialized] = useState(false);

  // useEffect sẽ chạy một lần khi component được mount
  useEffect(() => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        // Nếu có token, giải mã nó để lấy thông tin người dùng
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Cập nhật state `user` với thông tin từ token
        setUser({ 
          name: payload.name, // Lấy tên người dùng (nếu có)
          email: payload.sub, // `sub` thường là email hoặc user id
          roles: payload.roles, // Lấy vai trò
        });
      } catch (e) {
        // Nếu token không hợp lệ, xóa nó khỏi localStorage
        console.error("Invalid token found", e);
        localStorage.removeItem('authToken');
      }
    }
    // Đánh dấu là đã khởi tạo xong
    setIsInitialized(true);
  }, []); // Mảng rỗng `[]` đảm bảo useEffect chỉ chạy 1 lần

  // Hàm xử lý đăng nhập
  const login = (token) => {
    // Lưu token vào localStorage
    localStorage.setItem('authToken', token);
    try {
      // Giải mã token để lấy thông tin người dùng
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Cập nhật state `user`
      setUser({ 
        name: payload.name, 
        email: payload.sub, 
        roles: payload.roles,
      });
    } catch (e) {
      console.error("Failed to parse token on login", e);
    }
  };

  // Hàm xử lý đăng xuất
  const logout = () => {
    // Xóa token khỏi localStorage
    localStorage.removeItem('authToken');
    // Reset state `user` về null
    setUser(null);
  };

  // Tạo giá trị để cung cấp cho context
  const value = {
    user,         // Thông tin người dùng hiện tại
    login,        // Hàm để đăng nhập
    logout,       // Hàm để đăng xuất
    isInitialized // Trạng thái đã khởi tạo xong chưa
  };

  // Cung cấp `value` cho tất cả các component con thông qua Provider
  // Chỉ render children khi đã khởi tạo xong để tránh các hiệu ứng không mong muốn
  return (
    <AuthContext.Provider value={value}>
      {isInitialized ? children : null}
    </AuthContext.Provider>
  );
};

// Custom Hook: `useAuth` để các component con có thể dễ dàng truy cập context
export const useAuth = () => {
  return useContext(AuthContext);
};
