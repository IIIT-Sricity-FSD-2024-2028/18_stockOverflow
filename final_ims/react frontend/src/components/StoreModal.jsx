import React from 'react';

/**
 * StoreModal Component
 * 
 * Props:
 * - isOpen: boolean (whether modal is visible)
 * - currentStore: string (currently selected store name)
 * - stores: array of store objects
 * - onSelectStore: function (callback to parent with newly selected store name)
 * - onClose: function (callback to parent to dismiss modal)
 */
export default function StoreModal({
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
