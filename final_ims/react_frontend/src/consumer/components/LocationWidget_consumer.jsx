/**
 * LocationWidget_consumer.jsx - Delivery Store Location Pill in Consumer Top Navbar
 * 
 * IN LAYMAN'S TERMS:
 * Displays the current delivery/pickup store (e.g. "Downtown Store") in the top navigation bar.
 * Clicking it opens the location picker modal.
 */

import React from 'react';

export default function LocationWidget_consumer({ selectedStore = 'Global', onLocationClick }) {
  return (
    <button
      type="button"
      className="nav-location-btn"
      onClick={onLocationClick}
      title="Click to switch delivery store location"
    >
      <svg
        className="nav-location-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      <div className="nav-location-text">
        <span className="nav-location-lbl">Deliver to</span>
        <span className="nav-location-val">{selectedStore}</span>
      </div>
      <svg
        className="nav-location-arrow"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
}
