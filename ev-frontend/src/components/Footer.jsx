import React from 'react';

const Footer = () => (
  <footer className="footer">
    <div className="footer-container">
      <div className="footer-grid">
        <div className="footer-about">
          <h3 className="footer-title">EV-DataHub</h3>
          <p className="footer-desc">
            Empowering the future of mobility through secure, anonymized electric vehicle data analytics and insights.
          </p>
          <div className="footer-socials">
            <div className="footer-icon">youtube</div>
            <div className="footer-icon">Twitter</div>
            <div className="footer-icon">GitHub</div>
          </div>
        </div>

        <div>
          <h4 className="footer-heading">Platform</h4>
          <ul className="footer-links">
            <li><a href="/">Data Catalog</a></li>
            <li><a href="/">API Documentation</a></li>
            <li><a href="/">Pricing</a></li>
            <li><a href="/">Security</a></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-heading">Company</h4>
          <ul className="footer-links">
            <li><a href="/">About Us</a></li>
            <li><a href="/">Careers</a></li>
            <li><a href="/">Privacy Policy</a></li>
            <li><a href="/">Terms of Service</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2024 EV-DataHub. All rights reserved. | Chợ dữ liệu phân tích xe điện</p>
      </div>
    </div>
  </footer>
);

export default Footer;
