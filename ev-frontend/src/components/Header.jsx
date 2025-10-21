import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => (
  <header className="header-area header-sticky">
    <img className="logo" src="/static/images/LogoEV.png" alt="EV Data Analytics Marketplace logo" />
    <div className="search-container">
      <i className="fas fa-search" />
      <input type="text" placeholder="Search EV data, models, analytics..." />
      <img className="search-icon" src="/static/images/search.png" alt="Search" />
    </div>
    <nav className="main-nav">
      <ul className="nav">
        <li className="scroll-to-section"><a href="/" className="active">Home</a></li>
        <li><a href="/Admin">ADMIN</a></li>
        <li><a href="/Consumer">Consumer</a></li>
        <li><a href="/Provider">Provider</a></li>
        <li className="scroll-to-section"><a href="#testimonials">Testimonials</a></li>
        <li><a href="/contact-us">Contact Support</a></li>
        <li>
          <button className="btn" title="Thông báo" id="bell">
            <img
              src="https://cdn-icons-png.flaticon.com/512/5035/5035563.png"
              alt="Chuông"
            />
          <div className="badge">5</div>
          </button>
        </li>

        <li className="avatar-wrap">
          <button className="btn" title="Tài khoản" id="avatar">
            <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4S_5ry3E2lLzggdtbW44nzJlrAlxwRdZY4ITnBh1TnefMqLl4zgOvOjPls7LgzCg8VpU&usqp=CAU"
            alt="Avatar người dùng"
            />
          </button>
          <div className="login-menu">
            <Link to="/login" className="login-link-btn">Đăng nhập</Link>
            <Link to="/register" className="login-link-btn">Đăng ký</Link>
          </div>
        </li>
      </ul>
    </nav>
  </header>
);

export default Header;
