import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImg from '../images/LogoEV.png';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-brand">
        <Link to="/" className="header-logo">
          <img src={logoImg} alt="EV Marketplace Logo" className="header-logo-img" />
          <span>EV Marketplace</span>
        </Link>
      </div>
      <nav className="header-nav">
        {user ? (
          <>
            <span className="header-welcome">Welcome, {user.name || user.email}</span>
            {user.roles && user.roles.includes('Admin') && (
              <Link to="/admin" className="header-link">Admin</Link>
            )}
            {user.roles && user.roles.includes('Provider') && (
              <Link to="/Provider" className="header-link">Provider</Link>
            )}
            {user.roles && user.roles.includes('Consumer') && (
              <Link to="/consumer" className="header-link">Consumer</Link>
            )}
            <button type="button" className="header-button" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="header-link">Login</Link>
            <Link to="/register" className="header-button header-button-outline">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
