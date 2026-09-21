/**
 * StoreModal_consumer.jsx - Modal Dialog to Select Delivery/Pickup Store
 * 
 * IN LAYMAN'S TERMS:
 * This popup allows the customer to pick which physical store location or regional hub
 * they want to shop from or deliver from.
 */

import React from 'react';

export default function StoreModal_consumer({
  isOpen,
  currentStore,
  stores = [],
  onSelectStore,
  onClose
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Select Delivery Location</h3>
            <p className="modal-subtitle">Choose which fulfillment center or store to deliver from.</p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="stores-list">
          {stores.map((store) => {
            const isSelected = store.name === currentStore;
            return (
              <div
                key={store.id || store.name}
                className={`store-option ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  onSelectStore(store.name);
                  onClose();
                }}
              >
                <div className="store-option-icon">
                  📍
                </div>
                <div className="store-option-info">
                  <div className="store-option-name">{store.name}</div>
                  <div className="store-option-meta">{store.city || 'Regional Hub'}</div>
                </div>
                {isSelected && (
                  <span className="store-badge-active">Selected</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="modal-btn-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
