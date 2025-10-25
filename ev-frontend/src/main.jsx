import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import IndexPage from './pages/IndexPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Admin from './pages/Admin.jsx';
import Consumer from './pages/Consumer.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/consumer" element={<Consumer />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
