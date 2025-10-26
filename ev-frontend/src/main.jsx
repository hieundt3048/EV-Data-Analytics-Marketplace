import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import IndexPage from './pages/IndexPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Admin from './pages/Admin.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminProviders from './pages/AdminProviders.jsx';
import Consumer from './pages/Consumer.jsx';
import Provider from './pages/Provider.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout><IndexPage /></Layout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/consumer" element={<Layout><Consumer /></Layout>} />
          <Route path="/provider" element={<Layout><Provider /></Layout>} />
          <Route path="/admin" element={<Layout><Admin /></Layout>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/providers" element={<Layout><AdminProviders /></Layout>} />
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
