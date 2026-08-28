import React from 'react';

/**
 * Footer Component
 * 
 * Props:
 * - companyName: string
 * - year: number
 */
export default function Footer({ companyName = 'StockOverflow', year = 2026 }) {
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
