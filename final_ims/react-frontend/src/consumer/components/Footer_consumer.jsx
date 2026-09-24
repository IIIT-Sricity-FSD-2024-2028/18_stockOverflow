/**
 * Footer_consumer.jsx - Standard Footer for Consumer Portal
 * 
 * IN LAYMAN'S TERMS:
 * The bottom footer with copyright and help links.
 */

import React from 'react';

export default function Footer_consumer({ companyName = 'StockOverflow', year = 2026 }) {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <p className="footer-copyright">
          © {year} {companyName} — Inventory Lifecycle & Consumer Marketplace
        </p>
        <div className="footer-links">
          <a href="#privacy" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
          <span className="dot">•</span>
          <a href="#terms" onClick={(e) => e.preventDefault()}>Terms of Service</a>
          <span className="dot">•</span>
          <a href="#support" onClick={(e) => e.preventDefault()}>Support Center</a>
        </div>
      </div>
    </footer>
  );
}
