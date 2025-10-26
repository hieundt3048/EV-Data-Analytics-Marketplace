import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
      <div>
        <Link to="/" style={{ textDecoration: 'none', color: '#212529', fontWeight: 'bold' }}>EV Marketplace</Link>
      </div>
      <nav>
        {user ? (
          <>
            <span style={{ marginRight: '1rem' }}>Welcome, {user.name || user.email}</span>
            {user.roles && user.roles.includes('Admin') && <Link to="/admin" style={{ marginRight: '1rem' }}>Admin</Link>}
            {user.roles && user.roles.includes('Provider') && <Link to="/Provider" style={{ marginRight: '1rem' }}>Provider</Link>}
            {user.roles && user.roles.includes('Consumer') && <Link to="/consumer" style={{ marginRight: '1rem' }}>Consumer</Link>}
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
