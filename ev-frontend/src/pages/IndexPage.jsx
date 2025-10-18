import React from 'react';

const IndexPage = () => (
  <>
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
        </ul>
      </nav>
    </header>

    <section className="hero-bg">
      <div className="data-node" style={{ top: '20%', left: '10%' }} />
      <div className="data-node" style={{ top: '30%', right: '15%', animationDelay: '0.5s' }} />
      <div className="data-node" style={{ top: '60%', left: '20%', animationDelay: '1s' }} />
      <div className="data-node" style={{ bottom: '30%', right: '25%', animationDelay: '1.5s' }} />
      <div className="data-node" style={{ bottom: '20%', left: '30%', animationDelay: '2s' }} />

      <div className="hero-content">
        <h1>The Future of Mobility,<br /><span className="highlight">Powered by Data</span></h1>
        <p>The premier marketplace for buying and selling high-quality, anonymized electric vehicle data for analytics, research, and innovation.</p>
        <div className="hero-buttons">
          <button className="btn-primary" type="button">Explore Datasets</button>
          <button className="btn-secondary" type="button">Become a Data Provider</button>
        </div>
      </div>
    </section>

    <section className="trusted-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="trusted-title">Trusted by Industry Leaders</h2>
        <div className="trusted-logos">
          <div className="trusted-logo">Tesla</div>
          <div className="trusted-logo">BMW</div>
          <div className="trusted-logo">Shell</div>
          <div className="trusted-logo">Google</div>
          <div className="trusted-logo">Microsoft</div>
          <div className="trusted-logo">Vinfast</div>
        </div>
      </div>
    </section>

    <section className="ecosystem">
      <div className="container">
        <div className="title-box">
          <h2>A Simple, Powerful Data Ecosystem</h2>
        </div>

        <div className="steps">
          <div className="step">
            <div className="icon">
              <svg viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </div>
            <h3>1. Securely Provide Data</h3>
            <p>Data sellers connect via our secure API or upload datasets directly through our encrypted platform.</p>
          </div>

          <div className="step">
            <div className="icon">
              <svg viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3>2. We Anonymize &amp; Standardize</h3>
            <p>Our platform processes, cleans, and fully anonymizes data to ensure privacy and quality standards.</p>
          </div>

          <div className="step">
            <div className="icon">
              <svg viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3>3. Discover &amp; Analyze Insights</h3>
            <p>Data buyers can easily search, filter, and purchase datasets to fuel their analytics and research.</p>
          </div>
        </div>
      </div>
    </section>

    <section className="dataset-section">
      <div className="dataset-container">
        <div className="dataset-header">
          <h2>Explore Our Exclusive Datasets</h2>
        </div>

        <div className="dataset-grid">
          <div className="dataset-card">
            <div className="icon-box">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3>Battery Health (SOH)</h3>
            <p>Analyze battery degradation, cycles, and temperature patterns for predictive maintenance.</p>
          </div>

          <div className="dataset-card">
            <div className="icon-box">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3>Charging Behavior</h3>
            <p>Data on session duration, energy consumed, and charger types (AC/DC) usage patterns.</p>
          </div>

          <div className="dataset-card">
            <div className="icon-box">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3>Driving Patterns</h3>
            <p>Insights from daily mileage, speed profiles, and regenerative braking usage analytics.</p>
          </div>

          <div className="dataset-card">
            <div className="icon-box">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3>Grid Impact</h3>
            <p>Understand the load that EV charging places on local power grids and infrastructure.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="buyers" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative buyers-illustration">
            <div className="buyers-graphic">
              <div className="buyers-graphic-inner">
                <div className="buyers-graphic-card">
                  <div className="buyers-icon-wrapper">
                    <div className="buyers-icon-circle">
                      <svg className="buyers-icon" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                    <div>
                      <div className="buyers-line-short" />
                      <div className="buyers-line-long" />
                    </div>
                  </div>
                  <div className="buyers-bars">
                    <div className="buyers-bar small" />
                    <div className="buyers-bar medium" />
                    <div className="buyers-bar large" />
                  </div>
                </div>
                <div className="buyers-text">Real-time EV Analytics Dashboard</div>
              </div>

              <div className="buyers-pulse-bg">
                <div className="buyers-pulse top-right" />
                <div className="buyers-pulse bottom-left" />
                <div className="buyers-pulse mid-right" />
              </div>
            </div>
          </div>

          <div>
            <h2 className="buyers-title">Unlock Actionable Insights for Your Business</h2>

            <div className="buyers-list">
              <div className="buyers-item">
                <div className="buyers-check">
                  <svg className="buyers-check-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="buyers-subtitle">Optimize charging network placement and operations</h3>
                  <p className="buyers-desc">Use real-world charging behavior data to identify optimal locations and predict demand patterns.</p>
                </div>
              </div>

              <div className="buyers-item">
                <div className="buyers-check">
                  <svg className="buyers-check-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="buyers-subtitle">Develop next-generation battery technology</h3>
                  <p className="buyers-desc">Access comprehensive battery health data to improve longevity and performance in future EV models.</p>
                </div>
              </div>

              <div className="buyers-item">
                <div className="buyers-check">
                  <svg className="buyers-check-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="buyers-subtitle">Build accurate financial models and insurance risk profiles</h3>
                  <p className="buyers-desc">Leverage driving pattern data to create precise risk assessments and pricing models for EV insurance.</p>
                </div>
              </div>
            </div>

            <div className="buyers-button-wrap">
              <button className="buyers-button" type="button">Start Exploring Data</button>
            </div>
          </div>
        </div>
      </div>
    </section>

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
  </>
);

export default IndexPage;
